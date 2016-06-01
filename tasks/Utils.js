'use strict';

var Utils = function() {};


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


Utils.prototype.getTemplateData = function(log, options) {
    var self = this,
        data = {},
        type = options.type;

    for(var key in options.templates) {
        if(options.templates[key].regex) {
            data[key] = self.findCommits(options.templates[key].regex[type], log);
        }
    }

    return data;
};


Utils.prototype.writeChangeLogFile = function(options, grunt, changelog) {
    var fileContents = null,
        regex = null,
        header = '';

    if (options.writeType && grunt.file.exists(options.dest)) {
        fileContents = grunt.file.read(options.dest);

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

    changelog = '#' + header + '\n\n' + changelog;

    grunt.file.write(options.dest, changelog);

    // Log the results.
    grunt.log.ok(changelog);
    grunt.log.writeln();
    grunt.log.writeln('Changelog generated at '+ options.dest.toString().cyan);
};

module.exports = new Utils();