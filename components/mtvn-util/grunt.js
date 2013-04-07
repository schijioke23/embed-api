/*global module */
module.exports = function(grunt) {
    var deployPath = 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>/';
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-remove-logging');
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            version: 'MTVNPlayer.require("<%= pkg.name %>").version = "<%= pkg.version %><%= grunt.config("buildNumber") %>";',
            buildDate: 'MTVNPlayer.require("<%= pkg.name %>").build = "<%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %>";'
        },
        clean: {
            folder: ["dist/*", "build/*"]
        },
        lint: {
            devel: ['grunt.js', 'src/*.js'],
            release: ['grunt.js', 'src/*.js']
        },
        min: {
            dist: {
                src: "dist/<%= pkg.name %>.js",
                dest: "dist/<%= pkg.name %>.min.js"
            }
        },
        removelogging: {
            dist: {
                src: "dist/<%= pkg.name %>.js",
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        jshint: {
            devel: {
                options: {
                    asi: false,
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
                src: ['src/<%= pkg.name %>.js', '<banner:meta.version>', '<banner:meta.buildDate>'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        copy: {
            build: {
                src: "dist/**/*",
                dest: deployPath
            },
            test: {
                src: "test/**/*",
                dest: deployPath + "/test/"
            },
            components: {
                src: "components/**/*",
                dest: deployPath + "/components/"
            }
        },
        watch: {
            files: ['grunt.js', 'src/*.*'],
            tasks: 'default'
        }
    });
    grunt.registerTask('remove-globals', 'clean up', function() {
        var globals = /\/\*global.*\*\//gi,
            target = "dist/mtvn-util.js";
        grunt.file.write(target, grunt.file.read(target).replace(globals, ""));
    });
    grunt.registerTask('buildNumber', 'append a build number to the build', function(buildNumber) {
        grunt.config("buildNumber", "-" + buildNumber);
    });
    grunt.registerTask('default', 'clean lint:devel rig');
    grunt.registerTask('release', 'clean lint:release rig removelogging remove-globals min copy');
};