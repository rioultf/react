---
title: React Native - Séance 7
author: François Rioult
---

# Construire une application React Native

Pendant le développement, notre application React Native est exécutée à l'aide d'Expo et du serveur de développement *Metro*.

Le code JavaScript est chargé dynamiquement depuis l'ordinateur du développeur.

Pour installer l'application sur un téléphone Android et l'utiliser indépendamment de cet environnement, il faut la *construire* (*build*).

Cette opération consiste notamment à :

* compiler les composants natifs de l'application ;
* empaqueter le code JavaScript et les ressources ;
* intégrer les dépendances nécessaires ;
* produire un fichier installable ;
* signer l'application.

Sur Android, nous distinguons deux formats :

* `.apk` (*Android Package*) : fichier permettant d'installer directement une application ;
* `.aab` (*Android App Bundle*) : format destiné principalement à la distribution par Google Play.

Dans ce cours, nous chercherons à produire un fichier `.apk`, que nous pourrons installer directement sur un téléphone Android.

# 1. Développement et production

Il faut distinguer trois modes d'exécution.

## Expo Go

Pendant les premières séances, nous avons utilisé Expo pour exécuter rapidement notre application.

```bash
npx expo start
```

Expo démarre Metro, qui fournit le code JavaScript à l'application Expo Go installée sur le téléphone.

Cette solution est pratique pour développer, mais elle présente plusieurs limites :

* le téléphone doit pouvoir accéder au serveur de développement ;
* l'application dépend de l'environnement Expo Go ;
* certaines bibliothèques natives ne sont pas disponibles dans Expo Go ;
* nous ne disposons pas encore d'une application autonome.

## Development build

Une *development build* est une application native construite spécialement pour le développement.

Elle contient les modules natifs nécessaires au projet et peut se connecter au serveur Metro.

Elle permet notamment d'utiliser des bibliothèques natives qui ne sont pas incluses dans Expo Go.

## Production build

Une *production build* est destinée à être installée et exécutée de manière autonome.

Le code JavaScript et les ressources nécessaires sont intégrés à l'application.

Elle n'a donc plus besoin du serveur Metro.

En revanche, les appels à notre API GraphQL nécessitent toujours une connexion réseau et un serveur accessible.

# 2. Construire avec Expo Application Services

Expo propose un service de construction appelé *EAS Build* (*Expo Application Services*).

Ce service permet de construire des applications Android et iOS, notamment sur les serveurs d'Expo.

Il remplace l'ancienne commande :

```bash
expo build:android -t apk
```

qui n'est plus utilisée.

Documentation : https://docs.expo.dev/build/introduction/

## 2.1. Installer EAS CLI

Dans un terminal :

```bash
npm install -g eas-cli
```

On peut également utiliser EAS sans installation globale :

```bash
npx eas-cli --version
```

Il faut disposer d'un compte Expo pour utiliser le service de construction distant.

Connexion :

```bash
eas login
```

## 2.2. Configurer le projet

Depuis le répertoire de notre application :

```bash
eas build:configure
```

Cette commande initialise la configuration EAS.

Elle crée notamment un fichier `eas.json`.

Nous pouvons définir un profil de construction permettant de produire un APK :

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Deux profils sont définis :

* `preview` : construction d'un APK installable directement ;
* `production` : construction d'un AAB destiné à la distribution.

## 2.3. Configurer l'identité de l'application

Dans `app.json`, nous pouvons préciser le nom de l'application et son identifiant Android.

```json
{
  "expo": {
    "name": "Todo",
    "slug": "todo",
    "version": "1.0.0",
    "android": {
      "package": "fr.unicaen.todo",
      "versionCode": 1
    }
  }
}
```

Le champ `android.package` identifie l'application Android.

Il doit être unique parmi les applications installées sur un appareil.

Le champ `versionCode` est un entier qui doit augmenter lors des nouvelles versions distribuées.

## 2.4. Construire l'APK

La commande suivante lance une construction sur les serveurs d'Expo :

```bash
eas build --platform android --profile preview
```

Lors de la première construction, EAS peut proposer de générer et de gérer les clés nécessaires à la signature de l'application.

La construction peut prendre plusieurs minutes.

Une fois terminée, EAS fournit un lien permettant de récupérer le fichier APK.

Ce fichier peut être installé sur un téléphone Android.

## 2.5. Installer l'application

On peut transférer l'APK sur le téléphone et l'ouvrir pour lancer son installation.

Il faut éventuellement autoriser l'installation d'applications provenant de cette source.

On peut également utiliser Android Debug Bridge (*ADB*) depuis l'ordinateur :

```bash
adb devices
```

Cette commande affiche les appareils Android connectés et autorisés.

Pour installer l'application :

```bash
adb install application.apk
```

Pour remplacer une version déjà installée, lorsque les signatures sont compatibles :

```bash
adb install -r application.apk
```

# 3. Construire localement avec Expo

Il est également possible de construire une application Expo directement sur notre ordinateur.

Cette solution nécessite un environnement Android correctement configuré.

En particulier :

* un JDK compatible avec la version du projet ;
* le SDK Android ;
* les outils de compilation Android ;
* Gradle, utilisé par le projet Android.

## 3.1. Générer le projet natif

Dans notre projet Expo :

```bash
npx expo prebuild --platform android
```

Cette commande génère le dossier :

```text
android/
```

Il contient le projet Android natif et sa configuration Gradle.

Cette opération ne signifie pas que nous abandonnons Expo.

Les bibliothèques et les outils Expo peuvent continuer à être utilisés.

Le dossier natif peut être régénéré à partir de la configuration Expo, mais les modifications manuelles qui y ont été effectuées risquent alors d'être perdues.

## 3.2. Exécuter l'application sur Android

Pour compiler et lancer une version de développement :

```bash
npx expo run:android
```

Cette commande utilise l'environnement Android local.

Elle compile l'application, l'installe sur un émulateur ou un appareil connecté et démarre normalement le serveur de développement.

Elle est particulièrement utile pour tester les fonctionnalités natives.

## 3.3. Construire localement avec EAS

EAS permet également de lancer une construction locale :

```bash
eas build --platform android --profile preview --local
```

Contrairement à la construction distante, cette opération utilise les outils Android installés sur l'ordinateur.

Elle nécessite donc une configuration locale fonctionnelle.

Documentation : https://docs.expo.dev/build-reference/local-builds/

# 4. Construire directement avec Gradle

Une fois le projet Android généré, nous pouvons utiliser directement son système de construction.

Gradle est l'outil chargé de compiler et d'assembler l'application Android.

Il est configuré dans le dossier `android`.

## 4.1. Construire un APK debug

Depuis la racine du projet :

```bash
cd android
./gradlew assembleDebug
```

Le fichier produit se trouve généralement dans :

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Ce fichier est destiné au développement.

Il est signé avec une clé de débogage.

Attention : un APK debug React Native dépend généralement de Metro pour charger son JavaScript. Il ne constitue donc pas une version autonome équivalente à une application de production.

## 4.2. Construire un APK release

Une version *release* est optimisée pour la distribution.

Elle intègre normalement le code JavaScript nécessaire à son fonctionnement autonome.

La commande de construction est :

```bash
cd android
./gradlew assembleRelease
```

Le fichier produit se trouve généralement dans :

```text
android/app/build/outputs/apk/release/app-release.apk
```

Cependant, pour qu'il soit installable et distribuable, il doit être correctement signé.

La configuration de signature dépend du projet Android et de la manière dont il a été généré.

# 5. Signature d'une application Android

Android impose que les applications installées soient signées.

Cette signature permet notamment de vérifier qu'une nouvelle version provient du même éditeur que la version précédente.

Il faut donc conserver les clés de signature utilisées pour distribuer une application.

## 5.1. Générer une clé

L'utilitaire `keytool`, fourni avec le JDK, permet de créer un magasin de clés (*keystore*).

Par exemple :

```bash
keytool -genkeypair \
  -v \
  -keystore todo-release.keystore \
  -alias todo \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Cette commande demande notamment un mot de passe.

Elle produit le fichier :

```text
todo-release.keystore
```

Ce fichier et ses mots de passe doivent être conservés en lieu sûr.

Il ne faut pas les publier dans un dépôt Git.

## 5.2. Configurer Gradle

Pour une construction native, Gradle doit connaître :

* le fichier contenant la clé ;
* le nom de la clé ;
* les mots de passe nécessaires.

La configuration exacte dépend de la version de React Native et du projet généré.

Il est préférable de conserver les mots de passe dans des variables d'environnement ou dans une configuration locale exclue du contrôle de version.

Dans un projet Expo utilisant EAS Build, la gestion des clés peut être confiée à EAS.

Documentation : https://reactnative.dev/docs/signed-apk-android

# 6. Connexion à notre API GraphQL

Notre application Todo communique avec une API GraphQL.

Pendant le développement, nous avons utilisé une adresse locale :

```text
http://localhost:4000/
```

Cette adresse pose un problème lorsque l'application est exécutée sur un téléphone.

En effet, `localhost` désigne toujours la machine sur laquelle le programme s'exécute.

Sur un téléphone, `localhost` désigne donc le téléphone lui-même, et non notre ordinateur.

## 6.1. Utiliser une adresse accessible

Si le serveur GraphQL est exécuté sur notre ordinateur, nous devons utiliser son adresse IP sur le réseau local.

Par exemple :

```js
const API_URL = "http://192.168.1.20:4000/";
```

L'adresse est donnée à titre d'exemple.

Le téléphone et le serveur doivent pouvoir communiquer sur le réseau.

Il faut également vérifier que le serveur GraphQL écoute sur une interface réseau accessible, et pas uniquement sur `127.0.0.1`.

Pour un déploiement réel, il est préférable d'utiliser une API accessible en HTTPS.

## 6.2. Autoriser les connexions HTTP

Android limite les connexions HTTP non chiffrées.

Si notre API utilise HTTP, il peut être nécessaire d'autoriser explicitement ce type de connexion.

Dans un projet Android natif, le fichier concerné est :

```text
android/app/src/main/AndroidManifest.xml
```

Pour une expérimentation locale, on peut ajouter :

```xml
<application
    android:usesCleartextTraffic="true"
    ... >
```

Cette configuration autorise les communications HTTP non chiffrées de l'application.

Elle ne doit pas être utilisée comme solution générale pour une application de production.

Il est préférable de configurer des exceptions limitées aux domaines nécessaires ou d'utiliser HTTPS.

Dans un projet Expo, les configurations natives doivent idéalement être exprimées par la configuration Expo et, si nécessaire, par un *config plugin*, afin de rester compatibles avec `prebuild`.

## 6.3. Attention à l'authentification

Notre application utilise des jetons JWT.

Ces jetons sont transmis à l'API dans les en-têtes HTTP :

```http
Authorization: Bearer <token>
```

Une connexion HTTP non chiffrée expose potentiellement ces jetons aux personnes capables d'observer le trafic réseau.

Pour une application déployée, il faut donc utiliser HTTPS.

# 7. React Native sans Expo

Il est possible de développer une application React Native sans utiliser les outils Expo.

On parle alors généralement d'un projet React Native utilisant directement la CLI communautaire.

Pour initialiser un tel projet :

```bash
npx @react-native-community/cli init MonProjet
```

Cette commande crée un projet contenant directement les dossiers natifs Android et iOS.

Le développement utilise toujours React Native, React, Metro et les bibliothèques JavaScript habituelles.

On peut lancer Metro :

```bash
npm start
```

Puis compiler et exécuter l'application Android :

```bash
npm run android
```

Les commandes exactes dépendent des scripts définis dans le fichier `package.json`.

Cette approche donne un accès direct aux projets natifs et à leur configuration.

En contrepartie, elle demande de gérer davantage d'éléments liés aux environnements Android et iOS.

Il n'est cependant plus nécessaire de quitter Expo pour bénéficier de cet accès : `expo prebuild` et `expo run:android` permettent également de travailler avec les projets natifs.

Documentation : https://reactnative.dev/docs/getting-started-without-a-framework

# 8. Android Studio et l'émulateur

Android Studio fournit notamment :

* le SDK Android ;
* les outils de compilation ;
* un gestionnaire de périphériques virtuels ;
* un émulateur Android ;
* des outils de débogage et d'inspection.

Il n'est pas nécessaire de conserver Android Studio ouvert pour construire une application avec Gradle.

Les outils de compilation peuvent être utilisés directement en ligne de commande.

## Utiliser un téléphone physique

Pour les travaux pratiques, il est souvent plus simple d'utiliser un téléphone Android connecté par USB.

Il faut :

1. activer les options pour les développeurs ;
2. autoriser le débogage USB ;
3. connecter le téléphone à l'ordinateur ;
4. vérifier sa détection avec `adb devices`.

Cette solution évite de devoir exécuter un émulateur.

## Utiliser un émulateur

L'émulateur Android utilise les fonctionnalités de virtualisation de la machine.

Sur Linux, il s'appuie généralement sur KVM.

Il peut cohabiter avec d'autres solutions de virtualisation, mais des conflits ou des limitations de ressources peuvent apparaître selon la configuration.

Il n'est donc pas systématiquement nécessaire de fermer VirtualBox pour utiliser l'émulateur Android.

# 9. Comparer les méthodes de construction

| Méthode | Outils nécessaires | Résultat | Usage |
|---|---|---|---|
| Expo Go | Expo, Metro | Exécution dans Expo Go | Développement rapide |
| EAS Build distant | Expo, compte EAS | APK ou AAB | Construction sans SDK Android local |
| EAS Build local | Expo, SDK Android | APK ou AAB | Construction locale |
| `expo run:android` | Expo, SDK Android | Application de développement | Tests natifs |
| Gradle `assembleDebug` | SDK Android, Gradle | APK debug | Développement |
| Gradle `assembleRelease` | SDK Android, Gradle, signature | APK release | Distribution |

Les tailles des APK produits dépendent des bibliothèques, des ressources, des architectures ciblées et des paramètres de compilation.

Il n'est donc pas possible de conclure qu'une application Expo sera systématiquement plus volumineuse qu'une application React Native sans Expo.

# Conclusion

React Native permet de développer une application mobile en JavaScript, mais son déploiement nécessite la construction d'une application native.

Expo simplifie cette opération en fournissant des outils de développement, de configuration et de construction.

Il n'est plus nécessaire de choisir définitivement entre Expo et une approche native : les projets Expo peuvent également générer et compiler leurs projets Android.

Pour notre application Todo, la construction d'un APK permet de vérifier le fonctionnement de l'ensemble de l'architecture :

* interface React Native ;
* navigation ;
* gestion des modèles ;
* authentification JWT ;
* communication avec l'API GraphQL ;
* persistance des données dans Neo4j.

La principale différence entre le développement et le déploiement réside dans l'autonomie de l'application : le code JavaScript est intégré au fichier installé, mais les services distants restent nécessaires à son fonctionnement.

# Documentation

* Expo — EAS Build : https://docs.expo.dev/build/introduction/
* Expo — Configuration des APK : https://docs.expo.dev/build-reference/apk/
* Expo — Constructions locales : https://docs.expo.dev/build-reference/local-builds/
* Expo — Prebuild : https://docs.expo.dev/workflow/prebuild/
* React Native — Environnement de développement : https://reactnative.dev/docs/set-up-your-environment
* React Native — Sans framework : https://reactnative.dev/docs/getting-started-without-a-framework
* React Native — Signature Android : https://reactnative.dev/docs/signed-apk-android
* Android — Android App Bundle : https://developer.android.com/guide/app-bundle