import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { GraphQLError } from "graphql";
import neo4j from "neo4j-driver";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const {
  NEO4J_URI = "bolt://neo4j:7687",
  NEO4J_USER = "neo4j",
  NEO4J_PASSWORD,
  NEO4J_DATABASE = "neo4j",
  JWT_SECRET
} = process.env;

if (!NEO4J_PASSWORD) {
  throw new Error("La variable NEO4J_PASSWORD est obligatoire.");
}

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, "utf8") < 32) {
  throw new Error("JWT_SECRET doit contenir au moins 32 octets.");
}

// Le chemin est relatif à ce fichier, pas au dossier de lancement.
const typeDefs = await readFile(
  new URL("./schema.graphql", import.meta.url),
  "utf8"
);

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// ------------------------------------------------------------------
// Utilitaires
// ------------------------------------------------------------------

function badInput(message) {
  return new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT" }
  });
}

function invalidCredentials() {
  return new GraphQLError("Identifiants incorrects.", {
    extensions: { code: "UNAUTHENTICATED" }
  });
}

function normalizeUsername(username) {
  const normalized = username.trim();

  if (normalized.length < 3 || normalized.length > 80) {
    throw badInput(
      "Le nom d'utilisateur doit contenir entre 3 et 80 caractères."
    );
  }

  return normalized;
}

function validateNewPassword(password) {
  if (
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw badInput(
      "Le mot de passe doit contenir au moins 12 caractères " +
      "et ne pas dépasser 72 octets UTF-8."
    );
  }
}

function issueToken(user) {
  return jwt.sign(
    { roles: user.roles ?? [] },
    JWT_SECRET,
    {
      algorithm: "HS256",
      subject: user.id,
      expiresIn: "2h"
    }
  );
}

async function withSession(callback) {
  const session = driver.session({
    database: NEO4J_DATABASE
  });

  try {
    return await callback(session);
  } finally {
    await session.close();
  }
}

const dummyPasswordHash = await bcrypt.hash(randomUUID(), 12);

// ------------------------------------------------------------------
// Résolveurs d'authentification
//
// passwordHash et roles restent stockés dans Neo4j,
// sans être exposés dans le schéma GraphQL.
// ------------------------------------------------------------------

const resolvers = {
  Mutation: {
    signUp: async (_parent, { username, password }) => {
      const normalizedUsername = normalizeUsername(username);
      validateNewPassword(password);

      const id = randomUUID();
      const passwordHash = await bcrypt.hash(password, 12);

      let user;

      try {
        user = await withSession((session) =>
          session.executeWrite(async (tx) => {
            const result = await tx.run(
              `
              CREATE (u:User {
                id: $id,
                username: $username,
                passwordHash: $passwordHash,
                roles: $roles
              })
              RETURN u {
                .id,
                .username,
                .roles
              } AS user
              `,
              {
                id,
                username: normalizedUsername,
                passwordHash,
                roles: ["user"]
              }
            );

            return result.records[0].get("user");
          })
        );
      } catch (error) {
        if (
          error.code ===
          "Neo.ClientError.Schema.ConstraintValidationFailed"
        ) {
          throw badInput("Ce nom d'utilisateur est déjà utilisé.");
        }

        throw error;
      }

      return issueToken(user);
    },

    signIn: async (_parent, { username, password }) => {
      const normalizedUsername = username.trim();

      if (
        !normalizedUsername ||
        Buffer.byteLength(password, "utf8") > 72
      ) {
        throw invalidCredentials();
      }

      const user = await withSession((session) =>
        session.executeRead(async (tx) => {
          const result = await tx.run(
            `
            MATCH (u:User {username: $username})
            RETURN u {
              .id,
              .passwordHash,
              .roles
            } AS user
            `,
            { username: normalizedUsername }
          );

          return result.records[0]?.get("user") ?? null;
        })
      );

      const passwordMatches = await bcrypt.compare(
        password,
        user?.passwordHash ?? dummyPasswordHash
      );

      if (!user?.passwordHash || !passwordMatches) {
        throw invalidCredentials();
      }

      return issueToken(user);
    }
  }
};

// ------------------------------------------------------------------
// Connexion et contraintes
// ------------------------------------------------------------------

await driver.verifyConnectivity();

await withSession(async (session) => {
  await session.run(`
    CREATE CONSTRAINT user_username_unique IF NOT EXISTS
    FOR (u:User)
    REQUIRE u.username IS UNIQUE
  `);

  await session.run(`
    CREATE CONSTRAINT user_id_unique IF NOT EXISTS
    FOR (u:User)
    REQUIRE u.id IS UNIQUE
  `);
});

// ------------------------------------------------------------------
// Serveur GraphQL
// ------------------------------------------------------------------

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
  resolvers,
  features: {
    authorization: {
      key: JWT_SECRET
    }
  }
});

await neoSchema.checkNeo4jCompat();

const server = new ApolloServer({
  schema: await neoSchema.getSchema()
});

await startStandaloneServer(server, {
  listen: {
    host: "0.0.0.0",
    port: 4000
  },
  context: async ({ req }) => ({
    token: req.headers.authorization,
    sessionConfig: {
      database: NEO4J_DATABASE
    }
  })
});

console.log("API GraphQL disponible sur http://localhost:4000");

// ------------------------------------------------------------------
// Arrêt
// ------------------------------------------------------------------

let stopping = false;

async function shutdown() {
  if (stopping) return;
  stopping = true;

  try {
    await server.stop();
  } finally {
    await driver.close();
  }
}

process.once("SIGINT", () => {
  shutdown().catch(console.error);
});

process.once("SIGTERM", () => {
  shutdown().catch(console.error);
});