module.exports = function(grunt) {
    grunt.initConfig({
        pkg: '<json:package.json>',
        lint: {
            all: ['grunt.js', 'src/**/*.js']
        },
        min: {
            dist: {
                src: ['build/detailed/<%= pkg.version %>.js'],
                dest: 'build/<%= pkg.version %>.js'
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
                dest: 'build/detailed/<%= pkg.version %>.js'
            }
        },
        watch: {
            files: ['grunt.js', 'src/**/*.js'],
            tasks: 'default'
        }
    });
    grunt.registerTask('gitbranch', 'set the git branch', function(branch) {
        grunt.config("gitbranch", branch);
    });
    grunt.registerTask('default', 'lint concat');
    grunt.registerTask('release', 'lint concat min');
};