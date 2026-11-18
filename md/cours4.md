---
title: React Native - Mise en page
author: Cours de François Rioult <francois.rioult@unicaen.fr>
---

# Mise en page en React Native

React Native utilise des objets JavaScript pour décrire les styles des composants. La disposition des éléments repose principalement sur *Flexbox*, qui permet de construire des interfaces adaptées à différentes tailles d'écran.

La documentation officielle présente les propriétés disponibles :

- [Styles](https://reactnative.dev/docs/style)
- [Flexbox](https://reactnative.dev/docs/flexbox)
- [Propriétés de mise en page](https://reactnative.dev/docs/layout-props)

Tous les composants n'acceptent pas exactement les mêmes propriétés. Par exemple, `Text` possède des propriétés typographiques, tandis que `View` sert principalement à organiser les éléments. `TextInput` peut être stylé directement (bordure, couleur, marge, remplissage, etc.) ; une `View` supplémentaire est utile lorsqu'on souhaite organiser ou décorer un ensemble de composants.

## 1. Définir les styles

Les styles sont passés au composant au moyen de la propriété `style` :

```jsx
import { View, Text, StyleSheet } from "react-native";

export default function Example() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bonjour</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#eeeeee",
    },
    title: {
        fontSize: 24,
        color: "blue",
    },
});
```

Les styles sont des objets JavaScript, et non des feuilles CSS. Le nom des propriétés suit la convention *camelCase* (`backgroundColor`, `fontSize`, `flexDirection`). Les dimensions numériques sont généralement exprimées en unités logiques, sans suffixe `px`.

`StyleSheet.create()` permet de regrouper et de réutiliser les définitions. On peut également fournir directement un objet :

```jsx
<View style={{ padding: 10, backgroundColor: "lightblue" }}>
    <Text>Exemple</Text>
</View>
```

Un style peut dépendre de l'état du composant :

```jsx
<View style={{ backgroundColor: selected ? "lightblue" : "white" }}>
    <Text>Élément</Text>
</View>
```

L'interface reste ainsi une fonction de l'état.

## 2. Utilisation de Flexbox

Flexbox est le système de disposition privilégié dans React Native. Il permet de répartir l'espace disponible sans supposer une taille d'écran particulière.

Un conteneur organise ses enfants selon deux axes :

- l'*axe principal* (*main axis*) ;
- l'*axe secondaire* (*cross axis*), perpendiculaire au premier.

La propriété `flexDirection` détermine l'axe principal :

- `flexDirection: "column"` : disposition verticale, valeur par défaut ;
- `flexDirection: "row"` : disposition horizontale ;
- `column-reverse` et `row-reverse` : directions inversées.

Ainsi, pour `column`, l'axe principal est vertical ; pour `row`, il est horizontal.

```jsx
<View style={{ flexDirection: "row" }}>
    <Text>Un</Text>
    <Text>Deux</Text>
    <Text>Trois</Text>
</View>
```

### 2.1. Répartition des tailles : `flex`

La propriété `flex` indique comment un enfant participe au partage de l'espace disponible **sur l'axe principal**. Sa valeur peut être un nombre positif, éventuellement fractionnaire.

```jsx
<View style={{ flex: 1, flexDirection: "row" }}>
    <View style={{ flex: 1, backgroundColor: "lightblue" }} />
    <View style={{ flex: 2, backgroundColor: "lightgreen" }} />
    <View style={{ flex: 1, backgroundColor: "salmon" }} />
</View>
```

Dans cet exemple, les trois enfants se partagent l'espace disponible dans les proportions `1 : 2 : 1`, soit 25 %, 50 % et 25 %, en l'absence d'autres contraintes de dimensionnement.

Par défaut, `flex` vaut `0` : un élément ne cherche pas à occuper une part de l'espace libre. Sa taille dépend alors notamment de son contenu et de ses dimensions explicites.

Une taille fixe reste possible lorsqu'elle est pertinente :

```jsx
<View style={{ width: 40, height: 40, backgroundColor: "orange" }} />
```

### 2.2. Alignement sur l'axe principal : `justifyContent`

`justifyContent` règle la répartition des enfants sur l'axe principal. Les principales valeurs sont :

- `flex-start` : au début ;
- `flex-end` : à la fin ;
- `center` : au centre ;
- `space-between` : espace réparti entre les enfants ;
- `space-around` : espace autour des enfants ;
- `space-evenly` : espaces égaux entre les enfants et aux extrémités.

```jsx
<View style={{ flex: 1, justifyContent: "center" }}>
    <Text>Contenu centré sur l'axe principal</Text>
</View>
```

### 2.3. Alignement sur l'axe secondaire : `alignItems`

`alignItems` détermine l'alignement des enfants sur l'axe secondaire. Les valeurs usuelles sont `stretch` (valeur par défaut), `flex-start`, `flex-end` et `center`.

`alignSelf` permet de remplacer localement l'alignement d'un enfant.

```jsx
<View style={{ flex: 1, alignItems: "center" }}>
    <Text>Élément centré sur l'axe secondaire</Text>
</View>
```

**Attention :** avec `flexDirection: "column"`, l'axe secondaire est horizontal. `alignItems: "center"` empêche l'étirement automatique des enfants sur toute la largeur du conteneur. Pour des éléments devant occuper toute la largeur disponible, on peut conserver `alignItems: "stretch"` ou définir explicitement leur largeur.

### 2.4. Marges et remplissage

Les propriétés `margin` et `padding` permettent d'espacer les composants :

- `margin` ajoute de l'espace à l'extérieur du composant ;
- `padding` ajoute de l'espace entre son bord et son contenu.

Elles existent aussi sous des formes directionnelles : `marginTop`, `marginHorizontal`, `paddingVertical`, etc.

```jsx
<View style={{ margin: 10, padding: 20, backgroundColor: "lightgray" }}>
    <Text>Contenu avec une marge et un remplissage</Text>
</View>
```

## 3. Utiliser les dimensions de la fenêtre

Flexbox suffit pour la plupart des mises en page. Il arrive toutefois qu'un composant doive être dimensionné en fonction de la fenêtre disponible.

Le hook `useWindowDimensions()` fournit notamment sa largeur et sa hauteur. Contrairement à une mesure prise une seule fois, ses valeurs évoluent lorsque les dimensions de la fenêtre changent.

```jsx
import { View, useWindowDimensions } from "react-native";

export default function Example() {
    const { width } = useWindowDimensions();

    return (
        <View style={{
            width: width * 0.8,
            height: 100,
            backgroundColor: "lightblue",
        }} />
    );
}
```

Ici, la largeur de la `View` représente 80 % de celle de la fenêtre. On privilégiera toutefois Flexbox lorsque la disposition peut être exprimée sans mesure explicite.

## 4. Exercice : mettre en page le formulaire d'inscription

Reprendre le composant `SignUpScreen` réalisé précédemment. Il contient deux champs de saisie (`username` et `password`), un bouton d'inscription et un message de résultat.

Objectifs :

1. Ajouter un `StyleSheet` au composant.
2. Prévoir un `padding` régulier autour du formulaire.
3. Donner aux champs de saisie une bordure et un espacement vertical.
4. Faire occuper aux champs la largeur disponible.
5. Distinguer visuellement le titre, le formulaire et le message de résultat.
6. Vérifier le comportement lorsque la largeur de la fenêtre change.

Exemple de styles de départ :

```jsx
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
        padding: 10,
        marginBottom: 12,
    },
    message: {
        marginTop: 16,
    },
});
```

On appliquera ensuite `styles.container` à la `View` principale, `styles.title` au titre, `styles.input` aux deux `TextInput` et `styles.message` au texte de résultat.

## 5. Pour aller plus loin

- [Documentation officielle : Style](https://reactnative.dev/docs/style)
- [Documentation officielle : Flexbox](https://reactnative.dev/docs/flexbox)
- [Documentation officielle : useWindowDimensions](https://reactnative.dev/docs/usewindowdimensions)
- [Organiser les styles React Native](https://freecontent.manning.com/applying-and-organizing-styles-in-react-native/)

On peut notamment regrouper les styles dans des modules réutilisables ou les produire dynamiquement à partir de paramètres et de l'état.
