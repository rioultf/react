import { graphqlRequest } from "./graphql.js";

const CREATE_TODOLIST = `
  mutation CreateTodoLists($input: [TodoListCreateInput!]!) {
    createTodoLists(input: $input) {
      todoLists {
        id
        title
        owner {
          id
          username
        }
      }
    }
  }
`;

export function createTodoList(username, title, token) {
  if (!token) {
    return Promise.reject(new Error("Connexion requise."));
  }

  if (!username?.trim()) {
    return Promise.reject(
      new Error("Nom du propriétaire requis.")
    );
  }

  return graphqlRequest(
    CREATE_TODOLIST,
    {
      input: [
        {
          title,
          owner: {
            connect: [
              {
                where: {
                  node: {
                    username: { eq: username.trim() }
                  }
                }
              }
            ]
          }
        }
      ]
    },
    token
  ).then(data => {
    const todoList = data.createTodoLists?.todoLists?.[0];

    if (!todoList) {
      throw new Error("Aucune liste retournée après création.");
    }

    return todoList;
  });
}