import { graphqlRequest } from "./graphql.js";

const SIGN_IN = `
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password)
  }
`;

const SIGN_UP = `
  mutation SignUp($username: String!, $password: String!) {
    signUp(username: $username, password: $password)
  }
`;

export function signIn(username, password) {
  return graphqlRequest(SIGN_IN, { username, password })
    .then(data => {
      if (!data.signIn) {
        throw new Error("Connexion sans jeton retourné.");
      }

      return data.signIn;
    });
}

export function signUp(username, password) {
  return graphqlRequest(SIGN_UP, { username, password })
    .then(data => {
      if (!data.signUp) {
        throw new Error("Inscription sans jeton retourné.");
      }

      return data.signUp;
    });
}