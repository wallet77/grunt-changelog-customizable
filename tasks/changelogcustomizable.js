/*
 * changelog-customizable
 * https://github.com/wallet77/changelog-customizable
 *
 * Copyright (c) 2016 Vincent Vallet
 * Licensed under the GNU license.
 */

'use strict';

module.exports = function (grunt) {

    var moment = require('moment'),
        semver = require('semver'),
        Handlebars = require('handlebars'),
        utils = require('./Utils');

    grunt.registerMultiTask('changelogcustomizable', 'A grunt task to generate changelog from git repository.', function () {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
                start: null,
                end: null,
                header: 'Changelog',
                dest: {
                    dir: './release-notes/',
                    fileName: 'changelog',
                    extension: 'md'
                },
                type: 'dev',
                template: null,
                templates: {
                    features: {
                        regex: {
                            dev: /^(.*)feature(.*)$/gim,
                            release: /^(.*)release(.*)feature(.*)$/gim
                        },
                        template: '##FEATURE:\n\n{{#if features}}{{#each features}}{{> feature}}{{/each}}{{else}}{{/if}}\n'
                    },
                    feature: {
                        template: '\t{{{this}}}\n'
                    },
                    fixes: {
                        regex: {
                            dev: /^(.*)fixes #\d+:?(.*)$/gim,
                            release: /^(.*)release(.*)fixes #\d+:?(.*)$/gim
                        },
                        template: '##FIXES:\n\n{{#if fixes}}{{#each fixes}}{{> fix}}{{/each}}{{else}}{{/if}}\n'
                    },
                    hotfixes: {
                        regex: {
                            dev: /^(.*)hotfix #\d+:?(.*)$/gim
                        },
                        template: '##HOT FIXES:\n\n{{#if hotfixes}}{{#each hotfixes}}{{> fix}}{{/each}}{{else}}{{/if}}\n'
                    },
                    fix: {
                        template: '\t{{{this}}}\n'
                    }
                }
        }),
            start,
            end,
            isDate = false;

        // ------------------------------------------------------------------------------
        //                  Switch start and end between date or Git tag
        // ------------------------------------------------------------------------------
        if (options.end || options.start) {

            if (!semver.valid(options.end)) {
                start = moment(options.start);
                if(!start.isValid()) {
                    start = moment().subtract(14, 'days'); // basic scrum sprint
                }

                end = moment(options.end);
                if(!end.isValid()) {
                    end = moment(); // until now
                }

                start.format();
                end.format();

                isDate = true;
            } else {
                end = options.end;
                start = options.start && semver.valid(options.start) ? options.start : null;
            }

        } else {
            start = moment().subtract(14, 'days').format(); // basic scrum sprint
            end = moment().format();
            isDate = true;
        }

        // ------------------------------------------------------------------------------
        //                              Register partials
        // ------------------------------------------------------------------------------
        var allTemplates = options.templates,
            globalTemplate = options.template ? options.template : '',
            compiledGlobalTemplate;

        for (var key in allTemplates) {

            // automatically generates global template (if not defined by user) with templates list
            if(!options.template && allTemplates[key].hasOwnProperty('regex')) {
                globalTemplate += '{{> ' + key + '}}';
            }

            Handlebars.registerPartial(key, Handlebars.compile(allTemplates[key].template));
        }

        compiledGlobalTemplate = Handlebars.compile(globalTemplate);


        // ------------------------------------------------------------------------------
        //                              Git command
        // ------------------------------------------------------------------------------
        var done = this.async(),
            args = [
            '--no-pager',
            'log'
        ];

        // if we have a git tag for end but nothing into start
        // then we can get previous tag
        if(!isDate && !start) {
            grunt.util.spawn(
                {
                    cmd: 'git',
                    args: ['pull', '--tags']
                },

                function (error, result) {

                    if (error) {
                        grunt.log.error(error);
                        return done(false);
                    }


                    grunt.util.spawn(
                        {
                            cmd: 'git',
                            args: ['describe', '--abbrev=0', end + '^']
                        },

                        function (error, result) {
                            if (error) {
                                grunt.log.error(error);
                                return done(false);
                            }

                            start = result;

                            utils.launchGitLog(grunt, options, args, isDate, start, end, compiledGlobalTemplate, done);
                        }
                    );

                }
            );
        } else {

            utils.launchGitLog(grunt, options, args, isDate, start, end, compiledGlobalTemplate, done);
        }

    });

};
