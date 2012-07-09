module.exports = function(grunt) {
    var sourceFiles = ['src/util/start.js', 'src/core.js', 'src/util/config.js', 'src/util/selector.js', 'src/third-party/swfobject.js', 'src/player/flash-player.js', 'src/player/html-player.js', 'src/api.js', 'src/third-party/yepnope.js', 'src/util/load-module.js', 'src/util/clean-up.js', 'build/version.js'],
        targetPath = 'build/<%= grunt.config("dirname") %>',
        fileName = '<%= pkg.version %><%= grunt.config("buildNumber") %>.js',
        detailedPath = targetPath + 'detailed/' + fileName,
        autoPath = targetPath + 'auto/' + fileName,
        minPath = targetPath + fileName;
    grunt.loadNpmTasks('grunt-contrib');
    grunt.initConfig({
        pkg: '<json:package.json>',
        clean: {
            folder: ["build/*"]
        },
        lint: {
            all: ['grunt.js', 'src/*.js', 'src/player/*.js', 'src/util/*.js', 'test/buster/**/*.js']
        },
        min: {
            dist: {
                src: detailedPath,
                dest: minPath
            },
            auto: {
                src: autoPath,
                dest: autoPath
            }
        },
        jshint: {
            options: {
                browser: true
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
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.js', 'test/buster/**/*.js'],
            tasks: 'default'
        }
    });
    grunt.registerTask('version', 'write some javascript that contains the version.', function(dir) {
        var version = grunt.config("pkg").version;
        grunt.log.writeln("building version:" + version);
        grunt.file.write("build/version.js", "MTVNPlayer.version=\"" + version + "\";");
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
    grunt.registerTask('default', 'clean version lint concat');
    grunt.registerTask('release', 'clean version lint concat min');
};