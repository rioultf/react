---
title: React Native - Séance 0
author: Cours de François Rioult <francois.rioult@unicaen.fr>
---

# Méthode de travail

* éditeur évolué : `codium`. Inerdits : `gedit`, `nano`
* on se sert d'un terminal pour les manipulations de fichier et lancer le serveur (2 onglets de terminal) : pas de F12 ou terminal `codium`
* régler le navigateur pour un display `smartphone` et la console de débug en colonne
* faites des `console.log("key", value)`, la clé est aussi un label.


# Debug

* commencez par vérifier la console du serveur
* si vous travaillez sur le NTFS (`~/.Documents/...`), les liens symboliques sont interdits. Utiliser le cannevas fourni pour démarrer, qui est suffisant en terme de module




# Code pourri

```js
import FlatList from react-native;

function TodoList(){
    return
     ...
}

export function TodoList(){
    return
     ...
}

export default function TodoList(){
    return
       <FlatList ...
    ...
}



re

```
