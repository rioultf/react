## Containers `docker`

Nous utilisons `docker`, une technologie de virtualisation. La notion
de base est celle de `container`, qui font tourner une machine
virtuelle qui utilise les ressources de la machine hôte.

Les containers sont initialisés à partir d'*images* contenant la
technologie nécessaire, par exemple un serveur de bases de données
`mongo`, un serveur web, etc. On peut également créer ses propres
containers à partir d'autres containers.

Pour l'application finale, nous utiliserons plusieurs containers, qui formeront une *pile*\ :

* un serveur `mongo`
* un serveur `apache` pour définir une interface web
* un serveur `graphQL` pour définir un point d'accès à la base de données (*database endpoint*)

## `docker` sur la VDI

Pour exécuter `docker` sur la VDI, vous devez être dans le groupe `docker`.
Chaque commande `docker` ou `docker-compose` qui suit doit donc être précédée de `sudo -g docker` (demander des privilèges consistant à être membre du groupe `docker`).

Par exemple, pour faire tourner le container de test `hello-world`\ :

```
sudo -g docker docker run hello-world
```

C'est quand-même très fastidieux de faire précéder toutes vos commandes `docker` de `sudo -g docker`, donc je recommande de créer un *alias*\ :

```
$ alias docker='sudo -g docker docker'
$ alias docker-compose='sudo -g docker docker-compose'
```

**Attention** : les alias ne fonctionnent pas dans les scripts ! dans un script, `bash` n'interroge pas sa liste d'alias pour exécuter une commande. En revanche, les alias peuvent être paramétrés dans certains scripts.

Pour éviter de définir cet alias à chaque lancement de VDI, vous pouvez créer un script `~/Document/bashrc` contenant cette définition et utiliser `~/Documents/x11_user_startup_jammy-vdi.sh`, qui est exécuté au lancement de la VDI (voir <https://faq-etu.unicaen.fr/x11_user_startup>), pour installer ce `bashrc` à sa bonne place\ : `~/.bashrc`. Voici comment procéder\ :

```bash
$ cat ~/Documents/bashrc
alias docker='sudo -g docker docker'
alias docker-compose='sudo -g docker docker-compose'
$ cat ~/Documents/x11_user_startup_jammy-vdi.sh
if [ ! -f ~/.bashrc ]; then
  cp -f ~/Documents/bashrc ~/.bashrc
fi
```

Attention\ : lorsqu'on se déconnecte de la VDI, la machine n'est détruite que 15 mn après déconnexion. Le temps que le fichier `~/Documents/x11_user_startup_jammy-vdi.sh`, installez votre `~/.bashrc` à la main.
