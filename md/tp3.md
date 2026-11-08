---
author:
- François Rioult
lang: fr
title: Navigation dynamique et connexion à l'API
---

# Connexion à l'API

## Avec `Docker`

* rendez vous sur une VDI Linux permettant de faire tourner `Docker`
* ou utilisez votre propre machine pour faire tourner `Docker` mettez en place la pile de container faisant tourner le endpoint Neo4j avec GraphQL décrite dans [ce post](docker.md)

## Sans `Docker` mais sur le réseau `unicaen`

Vous avec directement accès au endpoint situé à <graphql.unicaen.fr:4000>.

# Code JS pour API

* dans le projet React, copier [le code d'accès à l'API](https://github.com/rioultf/react/tree/main/api/js)
* si besoin, éditer le fichier `apiUrl.js` pour préciser l'adresse du endpoint

# Menu dynamique

* réaliser l'interface entre les écrans `SignUpScreen`, `SignInScreen` et l'API
* mettre en place une navigation conditionnée par l'existence ou non du jeton :
  * sans jeton, la navigation contient uniquement `SignUpScreen`, `SignInScreen`
  * avec jeton, la navigation contient `HomeScreen`, `TodoScreen` et `LogoutScreen`
* remplacer l'écran `AboutScreen` pour un écran `LogoutScreen` de déconnexion

# Complétion de l'API

Dans son état initial, le code de l'API ne permet que la création des entités (le C de CRUD).

* Complétez le code de l'API pour qu'elle permette la lecture (R) des listes et items.
* Ajoutez les fonctionnalités permettant de switcher le `done` d'une tâche.

# Chargement des `TodoList` et `TodoItem`

* mettre en place le `useEffect` dans l'écran `TodoListsScreen` pour charger les `TodoList`
* concevoir le `StackNavigator` qui permet d'enchaîner `TodoListsScreen` et `TodoItemsScreen`
* un clic sur une `TodoList` doit empiler l'écran `TodoItemsScreen` avec les paramètres corrects
* mettre en place le `useEffect` dans l'écran `TodoItemsScreen` pour charger les `TodoItem` correspondants





# Amélioration de l'interface

Mettre en place différents éléments d'interface qui permettent :

* `checkAll` : valider toutes les tâches
* `checkNone` : dévalider toutes les tâches
* `showDone` : n'afficher que les tâches effectuées
* `showNotDone` : n'afficher que les tâches non effectuées


# Notes

npm install @react-navigation/native-stack
npm install react-native-progress --save

F12 / Network / GPRS pour visualiser l'attente