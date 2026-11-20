import { graphqlRequest } from "./graphql.js";

// Lecture des tâches d'une liste

const GET_TODOS = `
    query Todos($where: TodoWhere) {
        todos(where: $where) {
            id
            content
            done
        }
    }
`;

export function getTodos(todoListId, token) {
    const where = {
        belongsTo: {
            id: todoListId
        }
    };

    return graphqlRequest(GET_TODOS, { where }, token)
        .then(data => data.todos);
}


// Création d'une tâche

const CREATE_TODO = `
    mutation CreateTodo($input: [TodoCreateInput!]!) {
        createTodos(input: $input) {
            todos {
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
                    id: todoListId
                }
            }
        }
    }];

    return graphqlRequest(CREATE_TODO, { input }, token)
        .then(data => data.createTodos.todos[0]);
}


// Modification d'une tâche

const UPDATE_TODO = `
    mutation UpdateTodo(
        $where: TodoWhere,
        $update: TodoUpdateInput
    ) {
        updateTodos(where: $where, update: $update) {
            todos {
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
            where: { id },
            update: { done }
        },
        token
    ).then(data => data.updateTodos.todos[0]);
}


// Suppression d'une tâche

const DELETE_TODO = `
    mutation DeleteTodo($where: TodoWhere) {
        deleteTodos(where: $where) {
            nodesDeleted
        }
    }
`;

export function deleteTodo(id, token) {
    return graphqlRequest(
        DELETE_TODO,
        { where: { id } },
        token
    ).then(data => data.deleteTodos.nodesDeleted);
}