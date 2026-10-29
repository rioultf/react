---
author:
- François Rioult
lang: fr
title: Bases de données avancées
subtitle: Bréviaire des commandes
---

# Containers `Docker`

## Gestion des containers

-   démarrer une pile de containers (en mode *détaché* pour récupérer la main sur le terminal)\ :

```
$ docker-compose -f stack.yml up -d
```

-   arrêter les containers :

```
$ docker-compose -f stack.yml down
```

On peut connaître la liste des containers en usage par

```
$ docker ps -a
```

On peut tuer un container par
```
$ docker rm -f <containerId>
```
Connaître ses logs :
```
docker logs -f <id>
```
On peut obtenir un terminal à l'intérieur d'un container :
```
$ docker exec -it <container> bash
```
Pour supprimer tous les containers inutilisés et nettoyer le système :
```
$ docker system prune -a
```

## Paramétrage d'une pile de containers

* on peut fixer le nom d'un container (par défaut, il a le nom du répertoire où a été lancé la pile, suivi du nom de l'image : il faut utiliser `docker ps` pour obtenir le nom précis)

        container_name: mongo-dev

* on peut définir un volume (`<adresse sur l'hôte>:<adresse container>`)

```
volumes:
      - mongodata:/data/db
```

* on peut définir des transferts de port :
```
    ports:
      - 27017:27017
```

* des réseaux sont définis pour communiquer entre les containers. Ils portent le nom du container. Par exemple, le container `mongo` sera joignable par le container `graphQL` à l'url `http://mongo/...`. Il est possible de fournir d'autre noms avec la directive `links`\ :

```
    links:
      - "mongo:mongodb"
```

Ici, le réseau du service `mongo` pourra être appelé `http://mongodb/...`
        

# Que faire en cas de problème

## Côté container

* s'assurer que les containers tournent bien

        $ docker ps -a

* obtenir les logs de l'intérieur d'un container

        $ docker logs -f <id>

* exécuter un shell dans le container

        $ docker exec -it <container> bash

## Côté `mongo`

* utiliser `mongo-express` 

* s'introduire dans le container puis se connecter à `mongo`

```
$ docker exec -it <container> bash
# mongo --authenticationDatabase admin -u root -p example
# ou si vous êtes en version 6 pour mongo
# mongosh --authenticationDatabase admin -u root -p example
```

* ne pas oublier le `use bda`

* vérifier la présence de databases

        show databases

* vérifier la présence de collections

        show collections

## Côté `graphql`

Selon que `graphql` tourne dans un container ou en direct, l'adresse de la base de données dans `resolvers.js` doit être adaptée\ :

* dans le container

        const url = 'mongodb://root:example@mongodb:27017';

* dans un terminal sur la machine virtuelle

        const url = 'mongodb://root:example@localhost:27017';

Il doit y avoir cohérence entre `mongoDB`, le schéma, le résolveur et la requête.


# Erreurs classiques

* il ne faut pas visualiser les fichiers HTML en mode `file` : il faut accéder à <http://127.0.0.1:8080/...>
* avoir modifié le schéma ou les résolveurs, ne pas oublier\ :
  - de redémarrer le serveur
  - de reconstruire le container


# Récapitulatif sauvegarde / restauration d'un volume

On considère disposer d'un volume `docker-mongo_mongodata` :

```
# démarrer la pile de container mongo
docker-compose -f mongo.yml up -d
# insérer les données
docker exec -i mongo-dev sh -c 'mongoimport -d bda -c sales --authenticationDatabase admin -u root -p example' < sales.bson
# éteindre la pile de container
docker-compose -f mongo.yml down

# créer un répertoire de backup
mkdir backup
# exécuter une image de bash avec deux volumes : l'un est mongodata,
# l'autre sert au backup. L'option --rm permet de détruire le container
# lorsque sa tâche est terminée
docker run --rm -v docker-mongo_mongodata:/data/db -v ./backup:/backup-dir bash:4.4 -c "cd /data/db && tar cvf /backup-dir/mongo.tar ."

# détruire le volume
docker volume rm docker-mongo_mongodata
# défaire le tar dans le volume
docker run --rm -v docker-mongo_mongodata:/data/db -v ./backup:/backup-dir bash:4.4 -c "cd /data/db && tar xvf /backup-dir/mongo.tar"

# lancer un système minimal avec les volumes
docker run -it -v docker-mongo_mongodata:/data/db --rm bash:4.4
```