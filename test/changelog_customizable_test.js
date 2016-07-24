'use strict';

var grunt = require('grunt');


exports.changelog_customizable = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },

    default_options: function (test) {
        test.expect(1);

        var actual = grunt.file.read('release-notes/dev/changelog.md').replace(/(\r\n|\n|\r)/gm,"");
        //test.equal(actual, expected, 'should describe what the default behavior is.');
        var hasHeader = actual.indexOf('#Changelog') > -1;
        var hasFeatureSection = actual.indexOf('##FEATURE:') > -1;
        var hasFixSection = actual.indexOf('##FIXES:') > -1;
        var hasHotFixSection = actual.indexOf('##HOT FIXES:') > -1;
        var message = '';

        if(!hasHeader) {
            test.ok(false, "No header found");
        }

        if(!hasFeatureSection) {
            test.ok(false, "No feature section found");
        }

        if(!hasFixSection) {
            test.ok(false, "No fix section found");
        }

        if(!hasHotFixSection) {
            test.ok(false, "No hot fix section found");
        }

        //test.ok(hasHeader, "No header found");
        //test.ok(hasFeatureSection, "No feature section found");
        //test.ok(hasFixSection, "No fix section found");
        //test.ok(hasHotFixSection, "No hot fix section found");

        test.ok(true);
        test.done();
    },

    custom_options: function (test) {
        test.expect(1);

        var actual = grunt.file.read('release-notes/custom/release/changelog.md').replace(/(\r\n|\n|\r)/gm,"");
        var expected = grunt.file.read('test/expected/custom_options').replace(/(\r\n|\n|\r)/gm,"");
        test.equal(actual, expected, 'should describe what the custom option(s) behavior is.');

        test.done();
    },
};
