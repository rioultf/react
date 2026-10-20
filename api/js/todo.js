import { graphqlRequest } from "./graphql.js";

const CREATE_TODO = `
  mutation CreateTodoItems($input: [TodoItemCreateInput!]!) {
    createTodoItems(input: $input) {
      todoItems {
        id
        content
        done
      }
    }
  }
`;

export function createTodo(content, todoListId, token) {
  if (!token) {
    return Promise.reject(new Error("Connexion requise."));
  }

  if (!todoListId) {
    return Promise.reject(
      new Error("Identifiant de liste requis.")
    );
  }

  return graphqlRequest(
    CREATE_TODO,
    {
      input: [
        {
          content,
          belongsTo: {
            connect: [
              {
                where: {
                  node: {
                    id: { eq: todoListId }
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
    const todo = data.createTodoItems?.todoItems?.[0];

    if (!todo) {
      throw new Error("Aucune tâche retournée après création.");
    }

    return todo;
  });
}