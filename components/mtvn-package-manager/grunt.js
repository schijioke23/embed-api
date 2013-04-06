/*global module*/
module.exports = function(grunt) {
    var deployPath = 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>/',
        targetPath = 'dist/';
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-rigger');
    grunt.initConfig({
        pkg: '<json:package.json>',
        clean: {
            folder: [targetPath + "*"]
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
        rig: {
            devel: {
                src: ['src/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        copy: {
            build: {
                src: "dist/**/*",
                dest: deployPath
            },
            files: {
                "dist/<%= pkg.name %>.js": "src/<%= pkg.name %>.js",
                "dist/test/": ["test/**"]
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.*'],
            tasks: 'default'
        }
    });
    grunt.registerTask('buildNumber', 'append a build number to the build', function(buildNumber) {
        grunt.config("buildNumber", "-" + buildNumber);
    });
    grunt.registerTask('default', 'clean lint:devel rig');
    grunt.registerTask('release', 'clean lint:release rig min copy');
};