---
title: React Native - Séance 6
author: François Rioult
---

# Objectifs de la séance

Cette séance approfondit trois notions rencontrées dans l'application Todo :

- les opérations asynchrones et les promesses JavaScript ;
- les hooks React (`useState`, `useContext`, `useEffect`) et le suivi d'un chargement ;
- l'accès aux fonctionnalités d'un téléphone, en particulier la caméra et la géolocalisation, avec Expo.

À l'issue de la séance, on saura enchaîner des opérations asynchrones, traiter leurs erreurs, présenter un indicateur de chargement et demander une permission avant d'utiliser un capteur.

# 1. Retour sur les fonctions asynchrones

## 1.1. Pourquoi l'asynchronisme ?

Une requête réseau ne fournit pas immédiatement sa réponse. Le programme peut continuer à traiter d'autres événements pendant que le serveur travaille. On distingue donc le lancement d'une opération de l'obtention de son résultat.

Dans notre application, l'appel `signIn(username, password)` interroge l'API GraphQL. Il ne retourne pas immédiatement le jeton JWT : il retourne une *promesse* qui permettra d'obtenir ce jeton, ou une erreur.

Attention à une distinction : `setState` (ou le mutateur retourné par `useState`) **n'est pas une fonction qui retourne une promesse**. Il demande à React de planifier une mise à jour d'état et un nouveau rendu. Il ne faut donc pas écrire `await setState(...)` pour attendre la mise à jour.

## 1.2. Les promesses

Une *Promise* représente le résultat futur d'une opération. Elle peut être dans l'un des états suivants :

- `pending` : l'opération n'est pas terminée ;
- `fulfilled` : l'opération a réussi et fournit une valeur ;
- `rejected` : l'opération a échoué et fournit une raison d'échec.

On utilise principalement :

- `.then(f)` pour traiter le résultat d'une promesse résolue ;
- `.catch(f)` pour traiter une erreur ;
- `.finally(f)` pour exécuter une opération dans les deux cas (par exemple arrêter un indicateur de chargement).

Une chaîne de `.then()` retourne elle-même une promesse. La valeur retournée par un gestionnaire est transmise au suivant ; si elle est une promesse, le gestionnaire suivant attend sa résolution.

### Exemple : une connexion à l'API

On suppose que `graphqlRequest(query, variables)` retourne une promesse résolue avec le champ `data` de la réponse GraphQL et rejette les erreurs réseau ou GraphQL :

```js
function signIn(username, password) {
    return graphqlRequest(SIGN_IN, { username, password })
        .then(data => data.signIn);
}
```

L'écran de connexion consomme cette promesse :

```js
signIn(username, password)
    .then(token => {
        login(username, token); // fonction du contexte AuthContext
    })
    .catch(error => {
        setError(error.message);
    });
```

La fonction `login` modifie l'état partagé du contexte. La navigation conditionnelle réagit ensuite au nouveau `token`.

### Pourquoi ne pas ajouter systématiquement `.catch(error => { throw error; })` ?

Un tel `catch` ne fait que rejeter à nouveau la promesse. Il est inutile s'il n'ajoute aucune information ni aucun traitement : la propagation des erreurs se fait déjà naturellement dans une chaîne de promesses.

## 1.3. `async` et `await` : une autre syntaxe

JavaScript propose aussi les mots-clés `async` et `await` pour écrire des traitements fondés sur les promesses. Une fonction déclarée `async` retourne toujours une promesse ; `await` suspend l'exécution **de cette fonction**, sans bloquer le thread JavaScript.

Il ne s'agit donc pas d'une solution intrinsèquement plus lente ou moins asynchrone que `.then()`. Dans ce cours, nous privilégions les chaînes `.then()`, `.catch()` et `.finally()` afin de rendre explicites les dépendances entre opérations.

## 1.4. Construire une promesse

Le constructeur `Promise` reçoit une fonction dont les paramètres `resolve` et `reject` permettent de signaler la réussite ou l'échec de l'opération.

```js
function attendreDeuxSecondes() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("OK");
        }, 2000);
    });
}

console.log("Début");

attendreDeuxSecondes()
    .then(resultat => console.log(resultat))
    .catch(error => console.error(error));

console.log("Suite immédiate");
```

L'ordre attendu est : `Début`, `Suite immédiate`, puis `OK` environ deux secondes plus tard.

Ici, `reject` n'est pas utilisé : il serait utile si une condition d'échec devait être signalée.

**À retenir :** `setTimeout` programme un rappel ; la promesse permet d'intégrer ce rappel à une chaîne d'opérations asynchrones. Il n'est pas nécessaire de construire une nouvelle promesse lorsqu'une API en retourne déjà une.

### Exercice 1 — Enchaîner deux opérations

Écrire une fonction `attendre(ms)` qui retourne une promesse résolue après `ms` millisecondes. Enchaîner deux attentes d'une seconde avec `.then()` et afficher un message après chacune. Vérifier que le second délai commence après le premier.

# 2. Retour sur les hooks React

## 2.1. `useState` : mise à jour à partir de l'état précédent

Le mutateur d'état peut recevoir une nouvelle valeur ou une fonction de mise à jour. Cette seconde forme est particulièrement utile lorsque la nouvelle valeur dépend de la précédente.

```jsx
import { useState } from "react";
import { View, Text, Button } from "react-native";

export default function Counter({ initialCount = 0 }) {
    const [count, setCount] = useState(initialCount);

    return (
        <View>
            <Text>Total : {count}</Text>
            <Button title="-" onPress={() => setCount(c => c - 1)} />
            <Button title="+" onPress={() => setCount(c => c + 1)} />
            <Button title="Réinitialiser" onPress={() => setCount(initialCount)} />
        </View>
    );
}
```

La fonction `c => c + 1` reçoit la valeur précédente de l'état. Elle évite de dépendre d'une valeur capturée par une ancienne fermeture JavaScript (*closure*).

## 2.2. `useContext` : partager un état

`useContext` permet de lire la valeur du fournisseur de contexte (*Provider*) le plus proche dans l'arbre des composants.

```jsx
const { username, token, login, logout } = useAuth();
```

Dans notre application, `AuthProvider` enveloppe les écrans. Sans ce fournisseur, le hook personnalisé `useAuth()` ne peut pas accéder au contexte attendu.

`useContext` ne crée pas à lui seul un état global : le contexte expose les valeurs fournies par son `Provider`, qui peuvent elles-mêmes être gérées avec `useState` ou `useReducer`.

## 2.3. `useEffect` : synchroniser avec l'extérieur

`useEffect` reçoit une fonction et, éventuellement, un tableau de dépendances :

```jsx
useEffect(() => {
    // Effet exécuté après le rendu
}, [dependance]);
```

- Sans tableau : l'effet s'exécute après chaque rendu.
- Avec `[]` : l'effet s'exécute après le montage, et son nettoyage lors du démontage.
- Avec `[x]` : l'effet s'exécute après le montage puis lorsque `x` change.

En développement, le mode Strict de React peut effectuer un cycle supplémentaire de configuration/nettoyage pour détecter les effets incorrects.

### Exemple : charger les tâches d'une liste

```jsx
useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    getTodos(todoListId, token)
        .then(items => {
            if (active) {
                dispatch({ type: "itemsLoaded", items });
            }
        })
        .catch(error => {
            if (active) setError(error.message);
        })
        .finally(() => {
            if (active) setLoading(false);
        });

    return () => {
        active = false;
    };
}, [todoListId, token]);
```

La fonction de nettoyage empêche de traiter une réponse devenue obsolète ; elle n'annule pas la requête HTTP. Pour interrompre effectivement une requête `fetch`, on peut utiliser `AbortController` lorsque l'API le permet.

### Exercice 2 — Observer le cycle de vie

Ajouter des `console.log` dans le corps d'un composant, dans un `useEffect` avec `[count]` et dans sa fonction de nettoyage. Observer l'ordre des messages lors du montage, d'un clic sur `+` et du démontage.

# 3. Afficher un indicateur de chargement

Le composant React Native `ActivityIndicator` signale qu'une opération est en cours. On peut l'utiliser pour éviter qu'un écran paraisse vide pendant une requête réseau.

```jsx
import { useEffect, useReducer, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";

function TodoItemsScreen({ route }) {
    const { todoListId } = route.params;
    const { token } = useAuth();
    const [items, dispatch] = useReducer(todoItemsReducer, []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        getTodos(todoListId, token)
            .then(items => {
                if (active) dispatch({ type: "itemsLoaded", items });
            })
            .catch(error => {
                if (active) setError(error.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [todoListId, token]);

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text>Erreur : {error}</Text>;

    return (
        <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <Text>{item.content}</Text>}
            ListEmptyComponent={<Text>Aucune tâche.</Text>}
        />
    );
}
```

La variable `loading` décrit un état de l'interface ; la collection `items` constitue le modèle métier. Il est donc pertinent de les gérer séparément avec `useState` et `useReducer`.

Pour expérimenter cet affichage, on peut ralentir artificiellement le réseau dans les outils de développement du navigateur, ou insérer temporairement un délai dans une API de test.

### Exercice 3 — Trois états d'affichage

Modifier un écran pour distinguer clairement : *chargement*, *erreur* et *données disponibles*. Vérifier qu'une erreur n'entraîne pas un indicateur de chargement permanent.

# 4. Utiliser les fonctionnalités du téléphone

Les appareils mobiles possèdent des capteurs et des interfaces spécifiques : caméra, GPS, microphone, accéléromètre, etc.

React Native permet de les exploiter grâce à des modules natifs. Expo fournit des bibliothèques qui facilitent leur intégration et leur configuration. Des modules communautaires existent également ; le choix dépend de la compatibilité, des besoins et de la maintenance du projet.

L'accès à certains capteurs nécessite une *permission* accordée par l'utilisateur. Cette permission peut être refusée ou révoquée : l'application doit prévoir ces situations.

## 4.1. Lire un QR code avec `expo-camera`

Installer le module dans le projet Expo :

```bash
npx expo install expo-camera
```

L'ancien composant `BarCodeScanner` a été remplacé dans les usages récents par les fonctionnalités de lecture de codes de `CameraView`.

```jsx
import { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function QRCodeScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [result, setResult] = useState(null);

    if (!permission) {
        return <Text>Vérification de la permission caméra...</Text>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text>La caméra nécessite votre autorisation.</Text>
                <Button title="Autoriser la caméra" onPress={requestPermission} />
            </View>
        );
    }

    function handleScan({ data }) {
        setScanned(true);
        setResult(data);
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleScan}
            />
            {result !== null && <Text>QR code : {result}</Text>}
            {scanned && (
                <Button title="Scanner à nouveau" onPress={() => {
                    setResult(null);
                    setScanned(false);
                }} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    camera: { flex: 1 }
});
```

Le callback `onBarcodeScanned` est déclenché par la caméra lorsqu'un code est reconnu. Après la première lecture, nous désactivons temporairement ce callback pour éviter les lectures répétées.

La gestion des permissions est ici fournie par le hook `useCameraPermissions`. Il n'est donc pas nécessaire d'écrire soi-même un `useEffect` pour demander la permission.

Documentation : https://docs.expo.dev/versions/latest/sdk/camera/

### Exercice 4 — Scanner un code

Afficher le contenu d'un QR code et permettre un nouveau scan. Tester le comportement lorsque la permission caméra est refusée.

## 4.2. Obtenir une position GPS avec `expo-location`

Installer le module :

```bash
npx expo install expo-location
```

La récupération de la position comporte deux opérations asynchrones successives : demander la permission, puis obtenir la position. La seconde ne doit être lancée que si la première réussit.

```jsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function LocationScreen() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        Location.requestForegroundPermissionsAsync()
            .then(({ status }) => {
                if (status !== "granted") {
                    throw new Error("Permission de localisation refusée");
                }
                return Location.getCurrentPositionAsync({});
            })
            .then(position => {
                if (active) setLocation(position);
            })
            .catch(error => {
                if (active) setError(error.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text>{error}</Text>;
    if (!location) return <Text>Position indisponible.</Text>;

    return (
        <View>
            <Text>Latitude : {location.coords.latitude}</Text>
            <Text>Longitude : {location.coords.longitude}</Text>
            <Text>Précision : {location.coords.accuracy} m</Text>
        </View>
    );
}
```

Ici, le `useEffect` n'est **pas bloqué** pendant l'attente des permissions ou du GPS. Il installe une chaîne de promesses, puis React peut poursuivre son travail. Les callbacks sont exécutés lorsque les opérations aboutissent.

La fonction de nettoyage évite de modifier l'état après que l'écran est devenu obsolète. Elle n'annule pas nécessairement la demande de permission ou l'acquisition GPS en cours.

Sur un téléphone réel, l'utilisateur peut refuser la permission, désactiver la localisation ou se trouver dans un environnement où la position est difficile à déterminer. Le chargement peut donc prendre du temps ou échouer.

Documentation : https://docs.expo.dev/versions/latest/sdk/location/

### Exercice 5 — Permission et GPS

Afficher la latitude, la longitude et la précision. Tester le refus de permission. Expliquer pourquoi la demande de position est placée dans le premier `.then()` et non exécutée immédiatement.

# 5. Synthèse : un même mécanisme pour plusieurs usages

Les trois exemples — authentification, chargement des tâches et géolocalisation — suivent un schéma commun :

```text
Événement ou montage du composant
               ↓
       Opération asynchrone
               ↓
           Promise
         ↙         ↘
       then       catch
         ↘         ↙
        Mise à jour d'état
               ↓
         Nouveau rendu
```

Le rôle des outils React et JavaScript peut être résumé ainsi :

| Outil | Rôle |
|---|---|
| `Promise` | Représenter le résultat futur d'une opération |
| `.then()` / `.catch()` | Traiter le succès ou l'échec |
| `.finally()` | Effectuer un traitement final dans les deux cas |
| `useState` | Gérer un état local d'interface |
| `useContext` | Accéder à des données partagées par un fournisseur |
| `useReducer` | Calculer les transitions d'un modèle métier |
| `useEffect` | Synchroniser un composant avec un système extérieur |
| `ActivityIndicator` | Informer l'utilisateur qu'une opération est en cours |

Le principe à retenir est le suivant : **les opérations asynchrones et les effets sont réalisés en dehors du reducer ; leurs résultats provoquent des mises à jour d'état, qui entraînent de nouveaux rendus React.**

# Références

- Promesses JavaScript : https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Using_promises
- `useState` : https://react.dev/reference/react/useState
- `useContext` : https://react.dev/reference/react/useContext
- `useEffect` : https://react.dev/reference/react/useEffect
- `ActivityIndicator` : https://reactnative.dev/docs/activityindicator
- Expo Camera : https://docs.expo.dev/versions/latest/sdk/camera/
- Expo Location : https://docs.expo.dev/versions/latest/sdk/location/
- Bibliothèques React Native : https://reactnative.directory/
