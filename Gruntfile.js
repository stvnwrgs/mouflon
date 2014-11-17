module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        path:       {
            classes: {
                src:   'classes',
                build: 'dist/classes'
            }
        },
        typescript: {
            base: {
                src:     ['classes/**/*.ts'],
                dest:    'dist/classes',
                options: {
                    module:      'commonjs',
                    target:      'es5', //or es3
                    basePath:    'classes',
                    sourceMap:   false,
                    declaration: false
                }
            }
        },
        watch:      {
            grunt:      {
                files: ['Gruntfile.js', 'package.json'],
                tasks: ['default']
            },
            typescript: {
                files: [
                    'classes/**/*.ts'
                ],
                tasks: ['typescript']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('default', [
        'typescript'
    ]);

    grunt.registerTask('then-watch', ['default', 'watch']);

};