---
author: François Rioult
title: Pile GraphQL-Docker-Postman
---

# Conception du container Docker

* schema `schema.graphql`

```graphql
type JWT @jwt {
  roles: [String!]!
}

type TodoItem @node @authentication {
  id: ID! @id
  content: String
  done: Boolean! @default(value: false)

  belongsTo: [TodoList!]!
    @relationship(type: "BELONGS_TO", direction: OUT)
}

extend type TodoItem @authorization(
  validate: [
    {
      when: [BEFORE, AFTER]
      where: {
        jwt: { roles: { includes: "admin" } }
      }
    }
    {
      when: [BEFORE, AFTER]
      where: {
        node: {
          belongsTo: {
            some: {
              owner: {
                some: { id: { eq: "$jwt.sub" } }
              }
            }
          }
        }
      }
    }
  ]
)

type TodoList @node @authentication {
  id: ID! @id
  title: String

  contains: [TodoItem!]!
    @relationship(type: "BELONGS_TO", direction: IN)

  owner: [User!]!
    @relationship(type: "OWNED_BY", direction: OUT)
}

extend type TodoList @authorization(
  validate: [
    {
      when: [BEFORE, AFTER]
      where: {
        jwt: { roles: { includes: "admin" } }
      }
    }
    {
      when: [BEFORE, AFTER]
      where: {
        node: {
          owner: {
            some: { id: { eq: "$jwt.sub" } }
          }
        }
      }
    }
  ]
)

type User
  @node
  @authentication
  @mutation(operations: [])
{
  id: ID! @id
  username: String!
}

extend type User @authorization(
  validate: [
    {
      when: [BEFORE, AFTER]
      where: {
        jwt: { roles: { includes: "admin" } }
      }
    }
    {
      when: [BEFORE, AFTER]
      where: {
        node: { id: { eq: "$jwt.sub" } }
      }
    }
  ]
)

type Mutation {
  signUp(username: String!, password: String!): String!
  signIn(username: String!, password: String!): String!
}
```

* `package.json` pour serveur

```json
{
  "name": "neo4j-todo-graphql-api",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@apollo/server": "^5.0.0",
    "@neo4j/graphql": "^7.0.0",
    "graphql": "^16.11.0",
    "neo4j-driver": "^5.28.0",
    "bcryptjs": "^3.0.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```


* `Dockerfile` pour image serveur

```
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js schema.graphql ./

USER node
EXPOSE 4000

CMD ["node", "server.js"]
```

* `docker-compose.yml` pour pile neo4j/graphQL

Noter les définition de mot de passe : `coursneo4j` par défaut, les transferts de ports, 

```yml
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "127.0.0.1:7474:7474"
      - "127.0.0.1:7687:7687"
    environment:
      NEO4J_AUTH: "neo4j/${NEO4J_PASSWORD:-coursneo4j}"
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
    healthcheck:
      test:
        - CMD-SHELL
        - >-
          cypher-shell -u neo4j
          -p "$${NEO4J_AUTH#neo4j/}"
          "RETURN 1" >/dev/null 2>&1
      interval: 10s
      timeout: 10s
      retries: 30
      start_period: 30s
    restart: unless-stopped

  graphql:
    build: .
    ports:
      - "127.0.0.1:4000:4000"
    environment:
      NEO4J_URI: "bolt://neo4j:7687"
      NEO4J_USER: "neo4j"
      NEO4J_PASSWORD: "${NEO4J_PASSWORD:-coursneo4j}"
      NEO4J_DATABASE: "neo4j"
      JWT_SECRET: "${JWT_SECRET:?Définir JWT_SECRET dans .env}"
    depends_on:
      neo4j:
        condition: service_healthy
    restart: unless-stopped

volumes:
  neo4j_data:
  neo4j_logs:
```

# Exécution du container

* s'il faut regénérer l'image du serveur

        docker compose up -d --build graphql

* sinon

        docker compose up -d

Attention : les containers sont toujours actifs après redémmarge.




# Configuration de Postman

## Quels trucs pour Postman

* penser à sauvegarder les requêtes (icône *save* à côté du fil d'Ariane)
* la requête doit être émise en `POST`

## Mise en place

* créer une *collection* et une requête de `signIn`
* définir un *environnement* de la collection, définir les variable `username` et `password`
* activer l'environnement avec l'icône en haut à gauche
* définissez le `signIn` :

```graphql
mutation SignIn($username: String!, $password: String!) {
  signIn(username: $username, password: $password)
}
```

Avec les variables dynamiques :

```json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

* lui ajouter le script suivant après obtention de la réponse :

```js
const body = pm.response.json();
const token = body.data?.signIn;

// Évite de conserver un ancien jeton si la connexion échoue.
pm.environment.unset("token");

pm.test("Connexion réussie et jeton reçu", function () {
    pm.response.to.have.status(200);
    pm.expect(body.errors).to.be.undefined;
    pm.expect(token).to.be.a("string").and.not.empty;
});

if (!body.errors && typeof token === "string" && token.length > 0) {
    pm.environment.set("token", token);
}
```

* ce script enregistre le token dans l'environnement
* dans la section `Authorization` de la collection, choisir *Bearer Token* et saisir `{{token}}` dans le champ
