import { signIn } from "./sign.js";
import { createTodoList } from "./todoList.js";
import { createTodo } from "./todo.js";

function run() {
  const username = process.env.API_USERNAME;
  const password = process.env.API_PASSWORD;

  if (!username || !password) {
    return Promise.reject(
      new Error("Définir API_USERNAME et API_PASSWORD.")
    );
  }

  return signIn(username, password)
    .then(token => {
      return createTodoList(
        username,
        `Liste pour ${username}`,
        token
      ).then(todoList => {
        console.log("Liste créée :", todoList);

        return createTodo("Todo item 1", todoList.id, token);
      });
    })
    .then(todo => {
      console.log("Tâche créée :", todo);
    });
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});