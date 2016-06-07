# Mouflon v0.4.0

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

 * 2014-11-17   v0.1.11      Initial public release on npm after mouflon was used internally for some time
 * 2014-12-01   v0.1.13      Added remote errors in stderr to the output
 * 2014-12-18   v0.2.1       Massive refactoring, shell now in silent mode, improved and indented log output, added --v flag
 * 2014-12-20   v0.2.1       Minor bug fixes
 * 2015-01-04   v0.2.3       Added gulp task
 * 2015-01-11   v0.2.4       Added tsd (typescript definitions from Definitely Typed) task
 * 2015-01-12   v0.2.5       Added support for git submodules
 * 2015-02-26   v0.2.6       Added configuration feature for dist subdirectories being deployed (instead of the whole project root)
 * 2015-06-03   v0.2.7       Added maven task (local)
 * 2015-11-06   v0.3.0       Now supports multiple hosts (and warns the deprecation of the old "host" server parameter)
 * 2015-11-06   v0.3.1       Bugfixes
 * 2015-11-08   v0.4.0-rc1   Switch from Grunt to tasky, switch to TypeScript 1.5 and ES2015 style code
 * 2015-11-09   v0.4.0-rc2   Fixed linkedFiles task
 * 2015-11-10   v0.4.0-rc3   Fixed linkedDirs task
 * 2015-11-13   v0.4.0       New release, no code changes to last RC
 * 2015-11-18   v0.4.1       Now creates parent directories automatically when creating directories
 * 2016-06-06   v1.0.0  [DEPRECATD]deploy() Now resolves with a promise. Added custom data to config
 * 2016-06-07   V1.0.1
---

Maintained by [Alexander Thiel](http://www.alexthiel.de)

