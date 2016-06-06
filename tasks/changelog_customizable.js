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

    grunt.registerMultiTask('changelog_customizable', 'A grunt task to generate changelog from git repository.', function () {

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
        if (options.start) {

            if (!semver.valid(options.start)) {
                start = moment(options.start);
                if(!start.isValid()) {
                    start = moment().subtract(14, 'days'); // basic scrum sprint
                }

                if(options.end) {
                    end = moment(options.end);

                    if(!end.isValid()) {
                        end = moment(); // until now
                    }
                }

                start.format();
                end.format();

                isDate = true;
            } else {
                start = options.start;
                end = semver.valid(options.end) ? options.end : null;
            }

        }

        if(!start) {
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

        if (options.logArguments) {
            args.push.apply(args, options.logArguments);
        } else {
            args.push(
                '--format=%B',
                '--no-merges'
            );
        }

        // git with date
        if (isDate) {
            args.push('--after="' + start + '"');
            args.push('--before="' + end + '"');
        } else { // git with tag
            args.splice(2, 0, start + '..' + end);
        }

        grunt.verbose.writeln('git ' + args.join(' '));

        grunt.util.spawn(
            {
                cmd: 'git',
                args: args
            },

            function (error, result) {
                if (error) {
                    grunt.log.error(error);
                    return done(false);
                }

                var templateData = utils.getTemplateData(result, options),
                    changeLog;

                for(var key in templateData) {
                    changeLog = compiledGlobalTemplate(templateData[key]);
                    utils.writeChangeLogFile(options, grunt, key, changeLog);
                }


                done();
            }
        );

    });

};
