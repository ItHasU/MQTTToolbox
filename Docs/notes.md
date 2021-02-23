# Création de l'application

J'utilise NX pour le projet. Ca permet de créer une app en fullstack Typescript. Ca gère la compilation et le découpage de l'application.

```
cd <project folder>/..
npm init nx-workspace <project folder>
```

## Création du serveur

```
npm install -D @nrwl/express
npm run nx generate @nrwl/express:application server
```

## Création d'une lib

```
npm run nx generate library <lib-name>
```

## Création d'une page web

```
npm install -D @nrwl/web
npm run nx g @nrwl/web:application <name>
```

### Et pour intégrer bootstrap ...

```
npm install -D bootstrap popper.js jquery
```

Ajouter les imports dans main.ts. Dans le HTML, ensuite, c'est classique.

```javascript
//import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
```

### Personnalisér webpack

https://yonatankra.com/how-to-use-custom-webpack-configuration-in-a-nrwl-project/