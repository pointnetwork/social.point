# Point Social Example Zapp

Welcome to the Point Social Example Zapp. This README is a basic guide to getting started with this application.

This is a React JS app. So you will need to install dependencies for it and run a build watcher if you want to develop it further.

## Prepare deployment

Since this a React JS site it rquires to be built before it can be deployed as follows:

```
npm i
npm run build
```

Now a `public` folder will be created containing the deployable built site. 

Start your local Point Node and deploy the Zapp by following the instructions [here](https://pointnetwork.github.io/docs/build-run-dev-node-and-services).

## Rebuild on changes using watch

You can simply run the watch command here to automatically rebuild the React frontend on any changes you make.

```
npm run watch
```

Now when you save changes to any of the projects components the project will be automatically built and you can refresh the Point Browser to review the updated changes immediately.