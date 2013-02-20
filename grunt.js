module.exports = function(grunt) {
    var targetPath = 'dist/',
    sourceFiles = ['dist/api.js'],
        detailedPath = targetPath + "api.js",
        autoPath = targetPath + 'auto.min.js',
        syndicatedPath = targetPath + 'syndicated.min.js',
        minPath = targetPath + 'api.min.js';
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-remove-logging');
    grunt.initConfig({
        pkg: '<json:package.json>',
        clean: {
            folder: ["dist/*"]
        },
        lint: {
            devel: ['src/*.js', 'src/player/*.js', 'src/util/*.js'],
            release: ['src/*.js', 'src/player/*.js', 'src/util/*.js']
        },
        min: {
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
                    asi:false,
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
            devel: {
                src: ['src/api.js'],
                dest: 'dist/api.js'
            }
        },
        copy: {
            target: {
                files: {
                    "dist/test/": ["test/**"]
                }
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.js', 'test/buster/**/*.js'],
            tasks: 'default'
        }
    });
    grunt.registerTask('version', 'write some javascript that contains the version.', function() {
        var version = grunt.config("pkg").version,
            date = grunt.template.today("mm/dd/yyyy hh:mm:ss");
        grunt.log.writeln("building version:" + version);
        grunt.file.write(targetPath + "version.js", "MTVNPlayer.version=\"" + version + "\";MTVNPlayer.build=\"" + date + "\";");
    });
    grunt.registerTask('buildNumber', 'append a build number to the build', function(buildNumber) {
        grunt.config("buildNumber", "-" + buildNumber);
    });
    grunt.registerTask('dirname', 'set a subdirectory name, result will be build/subdirectory(s)', function(dir) {
        if (dir.lastIndexOf("/") !== dir.length - 1) {
            // append / if missing
            dir += "/";
        }
        grunt.config("dirname", dir);
    });
    grunt.registerTask("prepare_deploy", "take the build output and prepare it for deployment", function(build) {
        var dest = "deploy/" + grunt.config("pkg").version + (build ? "-" + build : ""),
            files = grunt.file.expandFiles("dist/**");
        if (files.length === 0) {
            grunt.log.error("run grunt release first");
        }
        files.forEach(function(file) {
            grunt.file.copy(file, dest + file.replace("dist", ""));
        });
    });
    grunt.registerTask('default', 'clean version lint:devel rig concat copy');
    grunt.registerTask('release', 'clean version lint:release rig concat min copy');
};