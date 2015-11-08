module.exports = function (tasky) {

    tasky.action('clean')
        .configure({
            source: './dist/classes'
        });

    tasky.action('typescript')
        .configure({
            source: './src/classes/**/*.ts',
            destination: './dist/classes'
        });

    tasky.steps('build')
        .add('clean')
        .add('typescript');

    tasky.steps('production')
        .add('clean')
        .add('typescript');

    tasky.watch('watch-typescript')
        .source('./src/classes/**/*.ts')
        .run('typescript');

    tasky.steps('default')
        .add('build')
        .parallel('watch-typescript');
};