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

    dest = options.dest.dir + options.dest.fileName + '.' + options.dest.extension;

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

module.exports = new Utils();