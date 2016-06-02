# changelog-customizable

> A grunt task to generate changelog from git repository.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install changelog-customizable --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('changelog-customizable');
```

## The "changelog_customizable" task

### Overview
In your project's Gruntfile, add a section named `changelog_customizable` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  changelog_customizable: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.end
Type: `String`
Default value: null

A string value that is a date or a git tag

#### options.start
Type: `String`
Default value: null

A string value that is a date or a git tag

#### options.header
Type: `String`
Default value: 'Changelog'

A string value that is put as generated file's header

#### options.dest
Type: `Object`
Default value: see usage examples

A object to describe destination file

#### options.template
Type: `String`
Default value: '{{> features}}{{> fixes}}'

Defines the global template of generated file.

#### options.templates
Type: `Object`
Default value: see Usage examples

Defines all templates needed to generate your file.

### Usage Examples

#### Default Options


```js
grunt.initConfig({
  changelog_customizable: {
    options: {
      {
        start: null,
        end: null,
        header: 'Changelog',
        dest: {
            dir: './',
            fileName: 'changelog',
            extension: 'md'
        },
        type: 'dev',
        template: '{{> features}}{{> fixes}}',
        templates: {
            features: {
                regex: {
                    dev: /^(.*)\[FEATURE\](.*)$/gim,
                    release: /^(.*)closes #\d+:?(.*)$/gim
                },
                template: '##FEATURE:\n\n{{#if features}}{{#each features}}{{> feature}}{{/each}}{{else}}{{/if}}\n'
            },
            feature: {
                template: '\t{{{this}}}\n'
            },
            fixes: {
                regex: {
                    dev: /^(.*)fixes #\d+:?(.*)$/gim,
                    release: /^(.*)fixes #\d+:?(.*)$/gim
                },
                template: '##FIXES:\n\n{{#if fixes}}{{#each fixes}}{{> fix}}{{/each}}{{else}}{{/if}}\n'
            },
            fix: {
                template: '\t{{{this}}}\n'
            }
        }
      }
    }
  },
});
```

will generate the following file :
```js
  #Changelog
  
  ##FEATURE:
  
  	first changelog generation with basic options
  	commit readme and configuration files
  
  ##FIXES:
  
    first fix
    second fix
```