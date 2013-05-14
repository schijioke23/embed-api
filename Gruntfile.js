/*global module */
module.exports = function(grunt) {
    var targetPath = 'dist/',
        deployPath = 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>/',
        sourceFiles = ['dist/api.js'],
        detailedPath = targetPath + "api.js",
        autoPath = targetPath + 'auto.min.js',
        placeholdersPath = targetPath + 'placeholders.min.js',
        syndicatedPath = targetPath + 'syndicated.min.js',
        minPath = targetPath + 'api.min.js';
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.initConfig({
        pkg: '<json:package.json>',
        clean: {
            folder: ["dist/*", "build/*"]
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
            placeholders: {
                src: placeholdersPath,
                dest: placeholdersPath
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
            placeholders: {
                src: sourceFiles.concat(['src/placeholders.js']),
                dest: placeholdersPath
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
            files: ['grunt.js', 'src/**/*.js', 'test/buster/**/*.js'],
            tasks: 'default'
        }
    });
    grunt.registerTask('version', 'write some javascript that contains the version.', function() {
        var version = grunt.config("pkg").version,
            date = grunt.template.today("mm/dd/yyyy hh:mm:ss");
        grunt.log.writeln("building version:" + version);
        grunt.file.write(targetPath + "version.js", "MTVNPlayer.version=\"" + version + "\";\nMTVNPlayer.build=\"" + date + "\";");
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
    grunt.registerTask('default', ['clean', 'version', 'jshint:devel', 'rig', 'concat', 'copy']);
    grunt.registerTask('release', ['clean', 'version', 'jshint:release', 'rig', 'concat', 'uglify', 'copy']);
};