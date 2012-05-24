module.exports = function(grunt) {
    grunt.initConfig({
        pkg: '<json:package.json>',
        lint: {
            all: ['grunt.js', 'src/**/*.js', 'test/buster/**/*.js']
        },
        min: {
            dist: {
                src: ['build/<%= grunt.config("dirname") %>detailed/<%= pkg.version %><%= grunt.config("buildNumber") %>.js'],
                dest: 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>.js'
            }
        },
        jshint: {
            options: {
                browser: true
            }
        },
        concat: {
            dist: {
                src: ['src/util/module.js', 'src/core.js', 'src/util/config.js', 'src/util/selector.js', 'src/player/flash-player.js', 'src/player/html-player.js', 'src/api.js'],
                dest: 'build/<%= grunt.config("dirname") %>detailed/<%= pkg.version %><%= grunt.config("buildNumber") %>.js'
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.js', 'test/buster/**/*.js'],
            tasks: 'default'
        }
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
    grunt.registerTask('default', 'lint concat');
    grunt.registerTask('release', 'lint concat min');
};