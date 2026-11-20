
import { graphqlRequest } from "./graphql.js";

// ============================================================
// READ
// ============================================================

const GET_TODOS = `
  query TodoItems($where: TodoItemWhere) {
    todoItems(where: $where) {
      id
      content
      done
    }
  }
`;

export function getTodos(todoListId, token) {
  const where = {
    belongsTo: {
      single: {
        id: { eq: todoListId }
      }
    }
  };

  return graphqlRequest(GET_TODOS, { where }, token)
    .then(data => data.todoItems);
}


// ============================================================
// CREATE
// ============================================================

const CREATE_TODO = `
  mutation CreateTodoItem($input: [TodoItemCreateInput!]!) {
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
  const input = [{
    content,
    done: false,
    belongsTo: {
      connect: {
        where: {
          node: {
            id: { eq: todoListId }
          }
        }
      }
    }
  }];

  return graphqlRequest(CREATE_TODO, { input }, token)
    .then(data => {
      const todo = data.createTodoItems?.todoItems?.[0];

      if (!todo) {
        throw new Error("Aucune tâche retournée après création.");
      }

      return todo;
    });
}


// ============================================================
// UPDATE
// ============================================================

const UPDATE_TODO = `
  mutation UpdateTodoItem(
    $where: TodoItemWhere,
    $update: TodoItemUpdateInput
  ) {
    updateTodoItems(where: $where, update: $update) {
      todoItems {
        id
        content
        done
      }
    }
  }
`;

export function updateTodo(id, done, token) {
  return graphqlRequest(
    UPDATE_TODO,
    {
      where: {
        id: { eq: id }
      },
      update: {
        done: { set: done }
      }
    },
    token
  ).then(data => {
    const todo = data.updateTodoItems?.todoItems?.[0];

    if (!todo) {
      throw new Error("Aucune tâche retournée après modification.");
    }

    return todo;
  });
}


// ============================================================
// DELETE
// ============================================================

const DELETE_TODO = `
  mutation DeleteTodoItem($where: TodoItemWhere) {
    deleteTodoItems(where: $where) {
      nodesDeleted
    }
  }
`;

export function deleteTodo(id, token) {
  return graphqlRequest(
    DELETE_TODO,
    {
      where: {
        id: { eq: id }
      }
    },
    token
  ).then(data => data.deleteTodoItems.nodesDeleted);
}
