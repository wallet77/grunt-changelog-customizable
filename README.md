# grunt-changelog-customizable

> A grunt task to generate changelog from git repository.
Based on grunt-changelog project.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-changelog-customizable --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-changelog-customizable');
```

## The "changelog_customizable" task

### Overview
In your project's Gruntfile, add a section named `changelog_customizable` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  changelogcustomizable: {
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

#### options.type
Type: `String`
Default value: 'dev'

A string to define what kind of changelog to generate.
This string should correspond to one of your options.templates regex key (see usage examples)
In usage examples we use two different keys, 'dev' and 'release' and each one have a different regex to find commits.
If you want to generate all changelog, put 'all' in this property.

#### options.writeType
Type: `String`
Default value: empty

A string to determine if we add changelog to destination file or if we erase content.
Can be :
- empty : replace file content
- "append": insert content to the end of file
- "prepend": insert content to the beginning of file 


#### options.template
Type: `String`
Default value: automatically generated

Defines the global template of generated file.
If not specified the default value is automatically generated with options.templates.
In most cases you don't really need to explicitly specified a value in this field.
It accepts a template like the following :
```js
{{> features}}{{> fixes}}
```

#### options.templates
Type: `Object`
Default value: see Usage examples

Defines all templates needed to generate your file.

### Usage Examples

#### Default Options


```js
grunt.initConfig({
  changelogcustomizable: {
    changelog: {
      options: {
        start: null,
        end: null,
        header: 'Changelog',
        dest: {
          dir: './release-notes/',
          fileName: 'changelog',
          extension: 'md'
        },
        type: 'dev',
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
      }
    }
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


## Contributing

Any help is welcome :)
