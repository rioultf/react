
import * as dockerSign from "./docker/sign.js";
import * as dockerTodoList from "./docker/todoList.js";
import * as dockerTodo from "./docker/todo.js";

import * as unicaenSign from "./unicaen/sign.js";
import * as unicaenTodoList from "./unicaen/todoList.js";
import * as unicaenTodo from "./unicaen/todo.js";

const providers = {
  docker: {
    signIn: dockerSign.signIn,
    createTodoList: dockerTodoList.createTodoList,
    createTodo: dockerTodo.createTodo
  },
  unicaen: {
    signIn: unicaenSign.signIn,
    createTodoList: unicaenTodoList.createTodoList,
    createTodo: unicaenTodo.createTodo
  }
};

const provider = process.env.API_PROVIDER || "unicaen";
const api = providers[provider];

function run() {
  if (!api) {
    return Promise.reject(
      new Error(`Fournisseur inconnu : ${provider}. Choisir docker ou unicaen.`)
    );
  }

  const username = process.env.API_USERNAME;
  const password = process.env.API_PASSWORD;

  if (!username || !password) {
    return Promise.reject(
      new Error("Définir API_USERNAME et API_PASSWORD.")
    );
  }

  console.log(`API sélectionnée : ${provider}`);

  return api.signIn(username, password)
    .then(token => {
      if (!token) {
        throw new Error("Authentification sans jeton.");
      }

      return api.createTodoList(
        username,
        `Liste pour ${username}`,
        token
      ).then(todoList => {
        console.log("Liste créée :", todoList);

        if (!todoList?.id) {
          throw new Error("La liste créée ne possède pas d'identifiant.");
        }

        return api.createTodo("Todo item 1", todoList.id, token);
      });
    })
    .then(todo => {
      console.log("Tâche créée :", todo);
    });
}

run().catch(error => {
  console.error("Erreur :", error.message);
  process.exitCode = 1;
});
