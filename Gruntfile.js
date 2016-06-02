/*
 * changelog-customizable
 * https://github.com/wallet77/changelog-customizable
 *
 * Copyright (c) 2016 Vincent Vallet
 * Licensed under the GNU license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        changelog_customizable: {
            default_options: {
                options: {},
                //files: {
                //  'tmp/default_options': ['test/fixtures/testing']
                //}
            },
            custom_options: {
                options: {
                    dest: 'release-notes/prod/changelog.md',
                    header: 'Custom header'
                },
                //files: {
                //  'tmp/custom_options': ['test/fixtures/testing']
                //}
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.loadNpmTasks('grunt-git-release');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'changelog_customizable', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
