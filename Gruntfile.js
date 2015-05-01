module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: ['<%= pkg.name %>.js'],
            options: {
                trailing: true,
                jquery: true,
                devel: false,
                unused: false,
                undef: true,
                plusplus: false,
                nonew: true,
                noempty: false,
                noarg: true,
                newcap: true,
                latedef: true,
                indent: 4,
                immed: false,
                freeze: true,
                forin: false,
                es3: true,
                eqeqeq: true,
                strict: true,
                browser: true,
                evil: true,
                globals: {
                    config: true,
                    Guestful: true,
                    FastClick: true,
                    Handlebars: true,
                    moment: true,
                    mixpanel: true,
                    Pusher: true,
                    purl: true
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %> */\n'
            },
            build: {
                src: '<%= pkg.name %>.js',
                dest: '<%= pkg.name %>.min.js'
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        }

    });

    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['jshint', 'uglify']);
    grunt.registerTask('release', ['build', 'bump:minor']);

};
