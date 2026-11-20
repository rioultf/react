
import { graphqlRequest } from "./graphql.js";

// ============================================================
// CREATE
// ============================================================

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
            connect: {
              where: {
                username: username.trim()
              }
            }
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


// ============================================================
// READ
// ============================================================

const GET_TODOLISTS = `
  query GetTodoLists($where: TodoListWhere) {
    todoLists(where: $where) {
      id
      title
      owner {
        id
        username
      }
    }
  }
`;

export function getTodoLists(username, token) {
  if (!token) {
    return Promise.reject(new Error("Connexion requise."));
  }

  if (!username?.trim()) {
    return Promise.reject(
      new Error("Nom du propriétaire requis.")
    );
  }

  return graphqlRequest(
    GET_TODOLISTS,
    {
      where: {
        owner: {
          username: username.trim()
        }
      }
    },
    token
  ).then(data => data.todoLists);
}


// ============================================================
// UPDATE
// ============================================================

const UPDATE_TODOLIST = `
  mutation UpdateTodoLists(
    $where: TodoListWhere,
    $update: TodoListUpdateInput
  ) {
    updateTodoLists(where: $where, update: $update) {
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

export function updateTodoList(id, title, token) {
  if (!token) {
    return Promise.reject(new Error("Connexion requise."));
  }

  if (!id) {
    return Promise.reject(
      new Error("Identifiant de liste requis.")
    );
  }

  return graphqlRequest(
    UPDATE_TODOLIST,
    {
      where: { id },
      update: { title }
    },
    token
  ).then(data => {
    const todoList = data.updateTodoLists?.todoLists?.[0];

    if (!todoList) {
      throw new Error("Aucune liste retournée après modification.");
    }

    return todoList;
  });
}


// ============================================================
// DELETE
// ============================================================

const DELETE_TODOLIST = `
  mutation DeleteTodoLists($where: TodoListWhere) {
    deleteTodoLists(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`;

export function deleteTodoList(id, token) {
  if (!token) {
    return Promise.reject(new Error("Connexion requise."));
  }

  if (!id) {
    return Promise.reject(
      new Error("Identifiant de liste requis.")
    );
  }

  return graphqlRequest(
    DELETE_TODOLIST,
    {
      where: { id }
    },
    token
  ).then(data => data.deleteTodoLists.nodesDeleted);
}
