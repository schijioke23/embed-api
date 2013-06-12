/*global module */
module.exports = function(grunt) {
    var targetPath = 'dist/',
        deployPath = 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>/',
        package_manager = "components/mtvn-package-manager/dist/mtvn-package-manager.js",
        mtvn_util = "../components/mtvn-util/dist/mtvn-util.js",
        mtvn_playback = "../components/html5-playback/index.js",
        mtvn_playlist = "../components/mtvn-playlist/index.js",
        finish = "src/util/fire-api-callbacks.js";
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        build: deployPath,
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
                        project: "unicorn.js",
                        modules: "[" + mtvn_util + "," + mtvn_playback + "]"
                    }
                },
                files: {
                    "dist/unicorn.js": "src/main.js"
                }
            },
            micro: {
                options: {
                    data: {
                        project: "micro.js",
                        modules: "[" + mtvn_util + "," + mtvn_playback + "," + mtvn_playlist + "]"
                    }
                },
                files: {
                    "dist/micro.js": "src/main.js"
                }
            }
        },
        concat: {
            unicorn: {
                src: [package_manager, "dist/unicorn.js"].concat([finish]),
                dest: "dist/unicorn.js"
            },
            micro: {
                src: [package_manager, "dist/micro.js"].concat(["components/Bento.JS/index.js", finish]),
                dest: "dist/micro.js"
            },
            flash: {
                src: [package_manager, "dist/flash.js"].concat(["src/third-party/swfobject.js", finish]),
                dest: "dist/flash.js"
            },
            html5: {
                src: [package_manager, "dist/html5.js"].concat([finish]),
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
        plato: {
            all: {
                files: {
                    "<%=build%>report/": ['src/**/*.js', '!**/third-party/**']
                }
            }
        },
        watch: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            tasks: ["version", "rig", "concat"]
        }
    });
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-plato');
    grunt.registerTask('version', 'write some javascript that contains the version.', function() {
        var version = grunt.config("pkg").version,
            date = grunt.template.today("mm/dd/yyyy hh:MM:ss TT");
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
    grunt.registerTask('default', ['clean', 'version', 'jshint:devel', 'rig', 'concat']);
    grunt.registerTask('release', ['clean', 'version', 'jshint:release', 'rig', 'concat', 'uglify', 'copy', 'plato']);
};