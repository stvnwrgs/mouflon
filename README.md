# Important Note
This project is not yet mature. Please come back in early 2015 if you intend to work with it.

# Mouflon v0.2.1

> js/yml tool that allows Capistrano-like automatic deployment with config upload, linked dirs, and past releases


## How it works
...

## Getting Started
Mouflon is still in an early stage of development and has only been tested on linux machines.

```shell
npm install mouflon --save-dev
```

Once Mouflon has been installed you need to create a main deployment file that you will later execute in order to deploy your application.
You can name it anything you like and the most simple version looks like this.

```js
//file: deploy.js
var MouflonFactory, factory, mouflon;

MouflonFactory = require('mouflon');

factory = MouflonFactory.createFromArgV();

mouflon = factory.createMouflon();

mouflon.deploy();

```

Add --v to the command for verbose mode

## Directory structure
...


## Customizations

### Paths

There are four paths that can be customized inside your `deploy.js`. Make sure to do this before the mouflon instance is created using `factory.createMouflon()`.
You can invoke `MouflonFactory.setPaths()` with one or more paths.

```js
//Sets only the path for temporary files
factory.setPaths({
    temp:     './temp',
});

//Sets all paths:
factory.setPaths({
    config:   './config',
    settings: './settings',
    temp:     './temp',
    cache:    './cache'
});
```


## Release History

 * 2014-11-17   v0.1.11   Initial public release on npm after mouflon was used internally for some time
 * 2014-12-01   v0.1.13   Added remote errors in stderr to the output
 * 2014-12-18   v0.2.1    Massive refactoring, shell now in silent mode, improved and indented log output, added --v flag

---

Maintained by [Alexander Thiel](http://www.alexthiel.de)

