"use strict";

module.exports = function(grunt) {
    
    var matchdep = require("matchdep");
    
    // Configuration
    grunt.initConfig({
        
        pkg: grunt.file.readJSON("package.json"),
        
        name: "<%= pkg.name %>",
        version: "<%= pkg.version %>",
        
        mainFile: "adam.js",
        distFile: "adam.js",
        
        srcDir: "src",
        srcFiles: "**/*.js",
        src: "<%= srcDir %>/<%= srcFiles %>",
        
        destDir: "dist",
        
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            gruntfile: {
                src: "Gruntfile.js"
            },
            src: {
                src: ["<%= src %>"]
            },
            test: {
                src: ["test/*.js"]
            }
        },
        
        jsdoc: {
            dist: {
                src: ["<%= src %>", "README.md"],
                options: {
                    destination: "doc",
                    template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure: "jsdoc-conf.json"
                }
            }
        },
        
        clean: {
            dist: {
                src: ["<%= destDir %>"]
            }
        },
        
        uglify: {
            minify: {
                files: [
                    {
                        expand: true,
                        cwd: "<%= destDir %>/",
                        src: "<%= srcFiles %>",
                        dest: "<%= destDir %>/",
                        ext: ".min.js"
                    }
                ]
            }
        },
        
        umd: {
            dist: {
                src: "<%= srcDir %>/<%= mainFile %>",
                dest: "<%= destDir %>/<%= distFile %>",
                template: "unit",
                objectToExport: "module.exports",
                globalAlias: "<%= name %>",
                indent: "    "
            }
        },
        
        push: {
            options: {
                files: ["package.json", "bower.json", "component.json"],
                commitMessage: "Release version %VERSION%",
                commitFiles: ["-a"],
                tagName: "%VERSION%",
                tagMessage: "Version %VERSION%"
            }
        },
        
        mochacli: {
            all: {}
        }
    });
    
    // Plugins
    matchdep.filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    
    // Tasks
    grunt.registerTask("build", ["clean", "umd", "uglify"]);
    grunt.registerTask("doc", ["jsdoc"]);
    grunt.registerTask("test", ["mochacli"]);
    grunt.registerTask("default", ["jshint", "test"]);
    grunt.registerTask("all", ["default", "build", "doc"]);
    
    grunt.registerTask("release", ["push"]);
    grunt.registerTask("release-minor", ["push:minor"]);
    grunt.registerTask("release-major", ["push:major"]);
    
    // For Travis CI service
    grunt.registerTask("travis", ["all"]);
};
