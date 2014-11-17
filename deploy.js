var MouflonFactory, factory, mouflon;

MouflonFactory = require('./dist/classes/MouflonFactory');

factory = MouflonFactory.createFromArgV();

mouflon = factory.createMouflon();

mouflon.deploy();
