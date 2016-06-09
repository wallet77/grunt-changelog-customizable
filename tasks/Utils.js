'use strict';

var Utils = function() {};

/**
 * Exec a regex in order to find commits in a set of changes.
 *
 * @param regex
 *      Javascript regex
 * @param log
 *      result of a "git log" command
 * @returns {Array}
 *      array of all matching commits
 */
Utils.prototype.findCommits = function(regex, log) {
    var logs = [],
        match;

    while ((match = regex.exec(log))) {
        var change = '';

        for (var i = 1, len = match.length; i < len; i++) {
            change += match[i];
        }

        logs.push(change.trim());
    }

    return logs;
};

/**
 * Methods which returns all commits sort by changelog type (dev, release ...)
 *
 * @param log
 *      result of a "git log" command
 * @param options
 *      grunt's options
 * @returns {Object]
 *      Object containing all commits group by a key equal to options.type
 */
Utils.prototype.getTemplateData = function(log, options) {
    var self = this,
        data = {},
        type = options.type;

    // loop through all templates
    for(var key in options.templates) {

        // only focus on template which have regex, all others are "sub-templates"
        if(options.templates[key].regex)
        {

            // loop through all template "types" (dev, release, all ...)
            for(var regexType in options.templates[key].regex) {

                // if regex corresponds to global changelog's type
                // then process it
                if(regexType === type || type === 'all') {
                    if(!data[regexType]) {
                        data[regexType] = {};
                    }

                    data[regexType][key] = self.findCommits(options.templates[key].regex[regexType], log);
                }
            }
        }
    }

    return data;
};

/**
 * Methods to write a set of commits in a file
 *
 * @param options
 *      grunt's options
 * @param grunt
 *      grunt variable
 * @param type
 *      global changelog's type (can be dev, release ...)
 * @param changelog
 *      a set of commits to write
 */
Utils.prototype.writeChangeLogFile = function(options, grunt, type, changelog) {
    var fileContents = null,
        header = '',
        dest = '';

    if(!options.dest) {
        grunt.fatal('No destination file specified !');
    }

    if(!options.dest.fileName) {
        grunt.fatal('No destination fileName');
    }

    if(!options.dest.dir) {
        grunt.fatal('No destination directory');
    }

    dest = options.dest.dir + type + '/' + options.dest.fileName + '.' + options.dest.extension;

    if (options.writeType && grunt.file.exists(dest)) {
        fileContents = grunt.file.read(dest);

        if(options.writeType === 'append') {
            changelog = changelog + '\n' + fileContents;
        } else if(options.writeType === 'prepend') {
            changelog = fileContents + '\n' + changelog;
        } else {
            grunt.fatal('"' + options.append + '" is not a valid writeType. Please use "append" or "prepend".');
            return false;
        }
    }

    if (options.header) {
        header = options.header;
    }

    if(header.length > 0) {
        changelog = '#' + header + '\n\n' + changelog;
    }

    grunt.file.write(dest, changelog);

    // Log the results.
    grunt.log.ok(changelog);
    grunt.log.writeln();
    grunt.log.writeln('Changelog generated at '+ dest.toString().cyan);
};


Utils.prototype.launchGitLog = function(grunt, options, args, isDate, start, end, compiledGlobalTemplate, done) {
    var self = this;

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

    grunt.log.writeln('git ' + args.join(' '));

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

            var templateData = self.getTemplateData(result, options),
                changeLog;

            for (var key in templateData) {
                changeLog = compiledGlobalTemplate(templateData[key]);
                self.writeChangeLogFile(options, grunt, key, changeLog);
            }


            done();
        }
    );
};

module.exports = new Utils();