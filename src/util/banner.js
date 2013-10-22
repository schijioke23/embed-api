var MTVNPlayer = window.MTVNPlayer = window.MTVNPlayer || {};
MTVNPlayer.version = "<%= pkg.version %><%= grunt.config('buildNumber') %>";
MTVNPlayer.build = "<%= grunt.template.today('mm/dd/yyyy hh:MM:ss TT') %>";