/*global module*/
module.exports = function(grunt) {
    var targetPath = 'dist/';
    grunt.loadNpmTasks('grunt-contrib');
    grunt.initConfig({
        pkg: '<json:package.json>',
        clean: {
            folder: [targetPath+"*"]
        },
        lint: {
            devel: ['grunt.js', 'src/*.js'],
            release: ['grunt.js', 'src/*.js']
        },
        min: {
            dist: {
                src: targetPath + "<%= pkg.name %>.js",
                dest: targetPath + "<%= pkg.name %>.min.js"
            }
        },
        jshint: {
            devel: {
                options: {
                    browser: true,
                    devel: true,
                    debug: true
                }
            },
            release: {
                options: {
                    browser: true
                }
            }
        },
        copy: {
            target: {
                files: {
                    "dist/<%= pkg.name %>.js" : "src/<%= pkg.name %>.js",
                    "dist/test/": ["test/**"]
                }
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.*'],
            tasks: 'default'
        }
    });
    grunt.registerTask('default', 'clean lint:devel copy');
    grunt.registerTask('release', 'clean lint:release copy min');
};