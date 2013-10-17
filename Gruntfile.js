/*global module */
module.exports = function(grunt) {
    var targetPath = 'dist/',
        sourceFiles = ['dist/api.js'],
        detailedPath = targetPath + "api.js",
        autoPath = targetPath + 'auto.min.js',
        syndicatedPath = targetPath + 'syndicated.min.js',
        minPath = targetPath + 'api.min.js';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            folders: ["dist/*"]
        },
        lint: {
            devel: ['src/*.js', 'src/player/*.js', 'src/util/*.js'],
            release: ['src/*.js', 'src/player/*.js', 'src/util/*.js']
        },
        uglify: {
            dist: {
                src: detailedPath,
                dest: minPath
            },
            auto: {
                src: autoPath,
                dest: autoPath
            },
            syndicated: {
                src: syndicatedPath,
                dest: syndicatedPath
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
        concat: {
            dist: {
                src: sourceFiles,
                dest: detailedPath
            },
            auto: {
                src: sourceFiles.concat(['src/third-party/domready.js', 'src/auto-create-players.js']),
                dest: autoPath
            },
            syndicated: {
                src: sourceFiles.concat(['src/syndicated.js']),
                dest: syndicatedPath
            }
        },
        rig: {
            options: {
                processContent: true,
                footer: '\nMTVNPlayer.version="<%= pkg.version %><%= grunt.config("buildNumber") %>";\nMTVNPlayer.build="<%= grunt.template.today("mm/dd/yyyy hh:MM:ss TT") %>";',
            },
            files: {
                src: "src/api.js",
                dest: "dist/api.js"
            }
        },
        copy: {
            test: {
                src: "test/**/*",
                dest: "dist/"
            }
        },
        testem: {
            options: {
                "framework": "qunit"
            },
            all: {
                options: {
                    launch_in_ci: ['safari']
                },
                src: ['test/qunit/index.html']

            }
        },
        push_svn: {
            options: {
                trymkdir: true,
                remove: false
            },
            release: {
                src: "./dist",
                dest: '<%= grunt.config("svnDir") %>/<%= pkg.version %><%= grunt.config("buildNumber") %>',
                tmp: './.build'
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.js'],
            tasks: 'default'
        }
    });
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks("grunt-testem");
    grunt.loadNpmTasks("grunt-push-svn");
    grunt.registerTask('deploy', 'deploy to svn', function() {
        grunt.config("svnDir", grunt.option("dir"));
        if (grunt.option("build")) {
            grunt.config("buildNumber", "-" + grunt.option("build"));
        }
        grunt.task.run("push_svn");
    });
    grunt.registerTask('default', ['clean', 'jshint:devel', 'rig', 'concat', 'copy']);
    grunt.registerTask('release', ['clean', 'jshint:release', 'rig', 'concat', 'uglify', 'copy']);
};