
import * as dockerSign from "./docker/sign.js";
import * as dockerTodo from "./docker/todo.js";
import * as dockerTodoList from "./docker/todoList.js";

import * as unicaenSign from "./unicaen/sign.js";
import * as unicaenTodo from "./unicaen/todo.js";
import * as unicaenTodoList from "./unicaen/todoList.js";

// Choix du fournisseur
const provider = "unicaen"; // ou "docker"

const api = provider === "docker"
    ? {
        ...dockerSign,
        ...dockerTodo,
        ...dockerTodoList
      }
    : {
        ...unicaenSign,
        ...unicaenTodo,
        ...unicaenTodoList
      };

// Interface commune
export const signIn = api.signIn;
export const signUp = api.signUp;

export const getTodos = api.getTodos;
export const createTodo = api.createTodo;
export const updateTodo = api.updateTodo;
export const deleteTodo = api.deleteTodo;

export const getTodoLists = api.getTodoLists;
export const createTodoList = api.createTodoList;
export const deleteTodoList = api.deleteTodoList;
