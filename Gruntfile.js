/*global module */
module.exports = function(grunt) {
    var targetPath = 'dist/',
        deployPath = 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>/',
        inPageComponents = ["components/mtvn-util/dist/mtvn-util.js", "components/html5-playback/index.js", "components/mtvn-playlist/index.js"],
        finish = "src/util/fire-api-callbacks.js";
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            folder: ["dist/*", "build/*"]
        },
        jshint: {
            devel: {
                options: {
                    asi: false,
                    browser: true,
                    devel: true,
                    debug: true
                },
                src: ['src/*.js', 'src/player/*.js', 'src/util/*.js', 'src/model/*.js']
            },
            release: {
                options: {
                    browser: true
                },
                src: ['src/*.js', 'src/player/*.js', 'src/util/*.js', 'src/model/*.js']
            }
        },
        uglify: {
            all: {
                files: [{
                        expand: true,
                        cwd: "dist",
                        src: "{flash,html5,micro,unicorn}.js",
                        dest: "dist/",
                        ext: ".min.js"

                    }
                ]
            }
        },
        rig: {
            options: {
                processContent: true
            },
            html5: {
                options: {
                    data: {
                        project: "html5.js"
                    }
                },
                files: {
                    "dist/html5.js": "src/main.js"
                }
            },
            flash: {
                options: {
                    data: {
                        project: "flash.js"
                    }
                },
                files: {
                    "dist/flash.js": "src/main.js"
                }
            },
            unicorn: {
                options: {
                    data: {
                        project: "unicorn.js"
                    }
                },
                files: {
                    "dist/unicorn.js": "src/main.js"
                }
            },
            micro: {
                options: {
                    data: {
                        project: "micro.js"
                    }
                },
                files: {
                    "dist/micro.js": "src/main.js"
                }
            }
        },
        concat: {
            unicorn: {
                src: ["dist/unicorn.js"].concat(inPageComponents).concat([finish]),
                dest: "dist/unicorn.js"
            },
            micro: {
                src: ["dist/micro.js"].concat(inPageComponents).concat(["components/Bento.JS/index.js", finish]),
                dest: "dist/micro.js"
            },
            flash: {
                src: ["dist/flash.js"].concat(["src/third-party/swfobject.js", finish]),
                dest: "dist/flash.js"
            },
            html5: {
                src: ["dist/html5.js"].concat([finish]),
                dest: "dist/html5.js"
            }
        },
        copy: {
            build: {
                src: "dist/**/*",
                expand: true,
                flatten: true,
                dest: deployPath
            },
            test: {
                src: "test/**/*",
                dest: deployPath
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.js'],
            tasks: 'default'
        }
    });
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('version', 'write some javascript that contains the version.', function() {
        var version = grunt.config("pkg").version,
            date = grunt.template.today("mm/dd/yyyy hh:mm:ss");
        grunt.file.write(targetPath + "version.js", "MTVNPlayer.version=\"" + version + "\";\nMTVNPlayer.build=\"" + date + "\";");
    });
    grunt.registerTask('buildNumber', 'append a build number to the build', function(buildNumber) {
        grunt.config("buildNumber", "-" + buildNumber);
    });
    grunt.registerTask('dirname', 'set a subdirectory name, result will be build/subdirectory(s)', function(dir) {
        if (dir.lastIndexOf("/") !== dir.length - 1) {
            dir += "/";
        }
        grunt.config("dirname", dir);
    });
    grunt.registerTask('default', ['clean', 'version', 'jshint:devel', 'rig', 'concat', 'copy']);
    grunt.registerTask('release', ['clean', 'version', 'jshint:release', 'rig', 'concat', 'uglify', 'copy']);
};