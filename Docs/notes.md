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
