Florian MILLER

# Basic integration testing with Jest

L'application MyTodos est une bête application fournissant un début d'API REST pour gérer des entrées d'une *TODO list*.
Pour fonctionner, cette application enregistre les tâches saisies par l'utilisateur-rice dans une base de données [MongoDB](https://www.mongodb.com/fr-fr).

## Installer Docker

Plutôt que d'installer directement MongoDB pour en démarrer une instance, nous allons plutôt utiliser [Docker](https://www.docker.com/).
Docker est un outil de conteneurisation (c-à-d de virtualisation légère).
Il permet de créer facilement une image d'une application donnée, puis de démarrer des conteneurs (des machines virtuelles) à partir de cette image sur n'importe quelle machine ayant Docker d'installé.

Commencer donc par télécharger et installer Docker (https://www.docker.com/get-started).

## Démarrer MongoDB à l'aide de Docker

Une fois Docker installé sur votre machine, il ne nous reste plus qu'à :
  - Récupérer l'image Docker de MongoDB
  - Démarrer un conteneur à partir de cette image

Pour récupérer l'image de MongoDB, utiliser la commande suivante dans un terminal :

```cmd
docker image pull mongo
```

Puis pour démarrer un conteneur à partir de cette image, utiliser la commande suivante :

```cmd
docker run -p 27017:27017 mongo
```

L'option `-p` permet de créer un pont entre un port de la machine hôte (c-à-d votre machine) et un port du conteneur (c-à-d la machine virtuelle).
Ici, on associe le port 27017 de votre machine au port 27017 du conteneur (il s'agit du port utilisé par défaut par MongoDB).
Ainsi, toute requête effectuée vers `localhost:27017` sera transférée au conteneur.

## Installer les dépendances de MyTodos

Comme pour le TD précédent, le fichier `package.json` fournit la configuration initiale du projet et liste notamment les dépendances de MyTodos.

Pour les installer, exécuter la commande suivante :

```cmd
npm install
```

## Lancer MyTodos

Pour démarrer MyTodos, utiliser la commande suivante :

```cmd
npm start
```

L'application est ensuite accessible à l'adresse : `localhost:8080`.

## API

On utilise le modèle de données suivant pour représenter les TODOs :

```js
{
    title: string
    completed: boolean
    createdAt: Date
    updatedAt: Date
}
```

avec :
  - `title` : le nom de la tâche
  - `completed` : si la tâche est finie ou non
  - `createdAt` : la date à laquelle la tâche a été ajoutée
  - `updatedAt` : la date de la dernière modification de la tâche (`title` ou `completed`)

### GET /todos

Ne nécessite aucun paramètre.
Retourne la réponse suivante :

```js
[
    {
        _id: '61e931687474c53eca3a716c',
        title: 'Todo 1',
        completed: false,
        createdAt: '2022-01-20T09:54:48.139Z',
        updatedAt: '2022-01-20T09:54:48.139Z'
    },
    {
        _id: '61e931687474c53eca3a716d',
        title: 'Todo 2',
        completed: true,
        createdAt: '2022-01-20T09:54:48.139Z',
        updatedAt: '2022-01-20T10:32:50.952Z'
    }
]
```

### POST /todos

Nécessite le paramètre `title`.
Retourne la réponse suivante :

```js
{ id: '61e931687474c53eca3a7171' }
```

où `id` correspond à l'identifiant unique autogénéré par Mongo et associé au TODO nouvellement créé.

Si `title` est manquant, renvoie le contenu suivant avec `422` comme code HTTP.

```js
{ errorMsg: "Missing parameter 'title'" }
```

## Lancer les tests

Pour rappel, utiliser la commande suivante pour lancer les tests :

```cmd
npm test
```
