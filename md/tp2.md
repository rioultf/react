---
author:
- François Rioult
lang: fr
title: Mise en place de signIn / signUp
---

# Conception des écrans

* ajouter des écrans `SignUpScreen` et `SignInScreen`. Pour l'instant, ces écrans contiennent un simple texte type "Hello World !"
* dans ces écrans, ajouter des états pour gérer les `username` et `password`
* ajouter des champs de saisie texte en consultant la documentation <https://reactnative.dev/docs/textinput>
* programmez les vérifications nécessaires des informations saisies par l'utilisateur
* ajoutez le contexte d'autorisation pour gérer globalement `username` et `password`
* sur la page d'accueil, affichez un message de bienvenue à `username`
* lorsque les informations sont correctes dans `SignUpScreen`, simulez l'obtention d'un jeton factice (une chaîne de caractères quelconques) et effectuez la procédure de *login*
* effectuez les mêmes opérations pour l'écran `SignInScreen`

# Connexion à l'API

* rendez vous sur une VDI Linux permettant de faire tourner `Docker`
* mettez en place la pile de container faisant tourner le endpoint Neo4j avec GraphQL décrite dans [ce post](docker.md)
* dans le projet React, copier [le code d'accès à l'API](https://github.com/rioultf/react/tree/main/api/js)
* réaliser l'interface entre les écrans `SignUpScreen`, `SignInScreen` et l'API
* mettre en place une navigation conditionnée par l'existence ou non du jeton :
  * sans jeton, la navigation contient uniquement `SignUpScreen`, `SignInScreen`
  * avec jeton, la navigation contient `HomeScreen`, `TodoScreen` et `AboutScreen`



