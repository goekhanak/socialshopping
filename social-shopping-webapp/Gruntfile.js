// Generated on 2014-02-06 using generator-jhipster 0.8.4
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
/* global module:  false */

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    require('grunt-karma')(grunt);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'delta');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'deltaTests');

    grunt.initConfig({
        appConfig: {
            // configurable paths
            appPath: require('./bower.json').appPath || './src/main/webapp/app',
            karmaPath: 'target/karma-resources/',
            stylesPath: './src/main/webapp/styles',
            imagesPath: './src/main/webapp/images',
            i18nPath: './src/main/webapp/i18n',
            dist: 'src/main/webapp/dist'
        },
        delta: {
            less: {
                files: ['<%= appConfig.stylesPath %>/less/**/*.less'],
                tasks: ['less']
            },
            html: {
                files: ['<%= appConfig.appPath %>/**/*.html'],
                tasks: ['html2js']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= appConfig.appPath %>/**/*.js',
                    '<%= appConfig.stylesPath %>/{,*/}*.css',
                    '<%= appConfig.i18nPath %>/*.json',
                    '<%= appConfig.imagesPath %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]

            }
        },
        html2js: {
            options: {
                module: 'appTemplates',
                base: 'src/main/webapp',
                quoteChar: '\'',
                indentString: '    ',
                useStrict: true,
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            main: {
                src: ['<%= appConfig.appPath %>/**/*.html'],
                dest: '<%= appConfig.appPath %>/templates/AppTemplates.js'
            }
        },
        shell: {
            protractor: {
                options: {
                    stdout: true,
                    stderr: true,
                    error: true
                },
                command: 'node_modules/protractor/bin/protractor src/test/javascript/protractor.config.js'
            },
            'init-protractor': {
                options: {
                    stdout: true,
                    stderr: true,
                    error: true
                },
                command: 'node_modules/protractor/bin/webdriver-manager update --standalone && node_modules/protractor/bin/webdriver-manager start'
            },
            'jenkins-e2e': {
                options: {
                    stdout: true,
                    stderr: true,
                    error: true
                },
                command: 'node_modules/protractor/bin/protractor src/test/javascript/jenkins.config.js'
            }
        },
        autoprefixer: {
            options: ['last 1 version'],
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/main/webapp/styles',
                        src: '{,*/}*.css',
                        dest: 'src/main/webapp/styles'
                    }
                ]
            }
        },
        connect: {
            proxies: [
                {
                    context: '/',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                }
            ],
            options: {
                port: 9000,
                // Change this to 'localhost' to deny access to the server from outside.
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        'src/main/webapp/WEB-INF/templates',
                        '<%= appConfig.appPath %>'
                    ],
                    middleware: function (connect) {
                        return [
                            proxySnippet,
                            connect.static(require('path').resolve('<%= appConfig.appPath %>'))
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= appConfig.appPath %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= appConfig.dist %>'
                }
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= appConfig.dist %>/*',
                            '!<%= appConfig.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp',
            bower: 'src/main/webapp/bower_components'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= appConfig.appPath %>/**/*.js'
            ]
        },
        less: {
            dist: {
                files: {
                    'src/main/webapp/styles/main.css': ['<%= appConfig.stylesPath %>/less/main.less'],
                    'src/main/webapp/styles/zalando-bootstrap.css': ['<%= appConfig.stylesPath %>/less/zalando-bootstrap.less']
                },
                options: {
                    sourceMap: true,
                    sourceMapFilename: '<%= appConfig.stylesPath %>/main.css.map',
                    sourceMapBasepath: '<%= appConfig.appPath %>',
                    sourceMapRootpath: '/'
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= appConfig.dist %>/scripts/{,*/}*.js',
                        '<%= appConfig.dist %>/styles/{,*/}*.css',
                        '<%= appConfig.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= appConfig.dist %>/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: 'src/main/webapp/{,*/}*.html',
            options: {
                dest: '<%= appConfig.dist %>'
            }
        },
        usemin: {
            html: ['<%= appConfig.dist %>/{,*/}*.html'],
            css: ['<%= appConfig.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= appConfig.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/main/webapp/images',
                        src: '{,*/}*.{png,jpg,jpeg}',
                        dest: '<%= appConfig.dist %>/images'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/main/webapp/images',
                        src: '{,*/}*.svg',
                        dest: '<%= appConfig.dist %>/images'
                    }
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                     // https://github.com/appConfig/grunt-usemin/issues/44
                     //collapseWhitespace: true,
                     collapseBooleanAttributes: true,
                     removeAttributeQuotes: true,
                     removeRedundantAttributes: true,
                     useShortDoctype: true,
                     removeEmptyAttributes: true,
                     removeOptionalTags: true*/
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/main/webapp',
                        src: ['*.html', 'views/**/*.html'],
                        dest: '<%= appConfig.dist %>'
                    }
                ]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            tests: {
                files: [
                    // libraries
                    {
                        src: [
                            'bower_components/**/*.js',
                            'bower_components/**/*.min.js'
                        ],
                        cwd: 'src/main/webapp/',
                        dest: '<%= appConfig.karmaPath %>',
                        expand: true
                    },
                    // application files
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/main/webapp',
                        dest: '<%= appConfig.karmaPath %>',
                        src: [
                            'app/**/*.js'
                        ]
                    },
                    // tests
                    {
                        src: [
                            'app/**/*.spec.js',
                            'test-main.js'
                        ],
                        cwd: 'src/test/webapp/',
                        dest: '<%= appConfig.karmaPath %>',
                        expand: true
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= appConfig.dist %>/images',
                        src: [
                            'generated/*'
                        ]
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/main/webapp',
                        dest: '<%= appConfig.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'images/{,*/}*.{gif,webp}',
                            'fonts/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= appConfig.dist %>/images',
                        src: [
                            'generated/*'
                        ]
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: 'src/main/webapp/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        concurrent: {
            server: [
                'less',
                'copy:styles'
            ],
            test: [
                'less',
                'copy:styles'
            ],
            dist: [
                'less',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: false,
                background: true
            },
            dev: {
                // load base config file
                configFile: 'karma.conf.js',

                // run in background to allow for delta-task
                background: true
            },
            ci: {
                // load base config file
                configFile: 'karma.conf.js',
                // files will be overwritten in registerTask
                // see https://github.com/karma-runner/grunt-karma/issues/21

                // overwrite for continuous integration setting
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        cdnify: {
            dist: {
                html: ['<%= appConfig.dist %>/*.html']
            }
        },
        ngmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/concat/scripts',
                        src: '*.js',
                        dest: '.tmp/concat/scripts'
                    }
                ]
            }
        },
        replace: {
            dist: {
                src: ['<%= appConfig.dist %>/index.html'],
                overwrite: true,                 // overwrite matched source files
                replacements: [
                    {
                        from: '<div class="development"></div>',
                        to: ''
                    }
                ]
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= appconfig.dist %>/scripts/scripts.js': [
                        '<%= appConfig.dist %>/scripts/scripts.js'
                    ]
                }
            }
        },
        jsbeautifier: {
            files: [
                ['<%= appConfig.appPath %>/**/*.js']
            ],
            options: {
                js: {
                    braceStyle: 'collapse',
                    jslintHappy: true,
                    maxPreserveNewlines: 2,
                    wrapLineLength: 200
                }
            }
        },
        deltaTests: {
            options: {
                livereload: false
            },
            htmljs: {
                files: ['src/main/webapp/app/**/*.html'],
                tasks: ['html2js']
            },
            jssrc: {
                files: [
                    'src/main/webapp/app/**/*.js',
                    'src/test/webapp/**/*.js'
                ],
                tasks: ['copy:tests', 'karma:dev:run']
            }
        },
        /**
         * Downloads and installs library dependencies via bower defined in bower.json.
         */
        'bower-install-simple': {
            options: {
                color: true,
                production: false,
                directory: 'src/main/webapp/bower_components',
                interactive: false
            }
        }
    });

//    grunt.registerTask('watch', ['delta']);

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'jshint',
            'html2js',
            'less',
            'concurrent:server',
            'autoprefixer',
            'configureProxies',
            'connect:livereload',
            'delta'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma',
        'connect:livereload',
        'shell:protractor'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'html2js',
        'less',
        'autoprefixer'
    ]);

    grunt.registerTask('default', [
        'test',
        'build'
    ]);


    grunt.registerTask('e2e', [
        'clean:server',
        'concurrent:server',
        'autoprefixer',
        'configureProxies',
        'connect:livereload',
        'shell:protractor'
    ]);


    grunt.registerTask('init-e2e', ['shell:init-protractor']);


    grunt.registerTask('run-e2e', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:livereload',
        'shell:protractor'
    ]);


    // karma test for ci
    grunt.registerTask('test:ci', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'copy:tests',
        'karma:ci:start'
    ]);


    // karma test for dev
    grunt.registerTask('test:dev', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'copy:tests',
        'karma:unit:start',
        'deltaTests'
    ]);


    grunt.registerTask('jenkins-e2e', ['shell:jenkins-e2e']);

};
