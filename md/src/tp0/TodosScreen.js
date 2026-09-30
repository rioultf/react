import { useReducer } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";

import TodoItem from "../components/TodoItem";
import {
  initialTodos,
  todosReducer,
} from "../model/todos";

export default function TodosScreen() {
  const [todos, dispatch] =
    useReducer(todosReducer, initialTodos);

  const done = todos.filter(todo => todo.done).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {done} / {todos.length}
      </Text>

      <FlatList
        data={todos}
        keyExtractor={todo => todo.id.toString()}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            dispatch={dispatch}
          />
        )}
      />

      <Button
        title="Tout cocher"
        onPress={() =>
          dispatch({ type: "allCompleted" })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});