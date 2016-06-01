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
                dest: 'changelog.md',
                type: 'dev',
                template: '{{> features}}{{> fixes}}',
                templates: {
                    features: {
                        regex: {
                            dev: /^(.*)\[FEATURE\](.*)$/gim,
                            prod: /^(.*)closes #\d+:?(.*)$/gim
                        },
                        template: '##FEATURE:\n\n{{#if features}}{{#each features}}{{> feature}}{{/each}}{{else}}{{/if}}\n'
                    },
                    feature: {
                        template: '\t{{{this}}}\n'
                    },
                    fixes: {
                        regex: {
                            dev: /^(.*)fixes #\d+:?(.*)$/gim,
                            prod: /^(.*)fixes #\d+:?(.*)$/gim
                        },
                        template: '##FIXES:\n\n{{#if fixes}}{{#each fixes}}{{> fix}}{{/each}}{{else}}{{/if}}\n'
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
        var allTemplates = options.templates;

        var template = Handlebars.compile(options.template);

        for (var key in allTemplates) {
            Handlebars.registerPartial(key, Handlebars.compile(allTemplates[key].template));
        }


        var done = this.async();

        // ------------------------------------------------------------------------------
        //                              Git command
        // ------------------------------------------------------------------------------
        var args = [
            '--no-pager',
            'log'
        ];

        if (options.logArguments) {
            args.push.apply(args, options.logArguments);
        } else {
            args.push(
                '--pretty=format:%s',
                '--no-merges'
            );
        }

        if (isDate) {
            args.push('--after="' + start + '"');
            args.push('--before="' + end + '"');
        } else {
            args.splice(2, 0, start + '..' + end);
        }

        grunt.verbose.writeln('git ' + args.join(' '));

        // Run the git log command and parse the result.
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

                var changeLog = template(utils.getTemplateData(result, options));
                utils.writeChangeLogFile(options, grunt, changeLog);
                done();
            }
        );

    });

};
