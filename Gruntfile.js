module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: ['track.js'],
            options: {
                trailing: true,
                jquery: true,
                devel: false,
                unused: false,
                undef: true,
                plusplus: false,
                nonew: true,
                noempty: false,
                sub: true,
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

        concat: {
            options: {
                separator: '\n;',
                process: function (src, filepath) {
                    grunt.log.ok('+ ' + filepath);
                    return src;
                }
            },
            dist: {
                files: {
                    'guestful-track.js': [
                        'mixpanel.js',
                        'track.js'
                    ]
                }
            }
        },

        shell: {
            prebump: {
                command: function () {
                    return "git commit -am 'Commit updates to guestful-track & guestful-track.min'";
                },
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
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
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json', 'bower.json'],
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
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['jshint' , 'concat', 'uglify']);
    grunt.registerTask('release', ['build', 'shell:prebump', 'bump:minor']);

};
