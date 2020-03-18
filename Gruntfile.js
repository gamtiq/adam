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
                    template: "node_modules/ink-docstrap/template",
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
        
        bump: {
            options: {
                files: ["package.json", "package-lock.json", "bower.json", "component.json"],
                commitMessage: "Release version %VERSION%",
                commitFiles: ["-a"],
                tagName: "%VERSION%",
                tagMessage: "Version %VERSION%",
                pushTo: "origin"
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
    
    grunt.registerTask("release", ["bump"]);
    grunt.registerTask("release-minor", ["bump:minor"]);
    grunt.registerTask("release-major", ["bump:major"]);
    
    // For Travis CI service
    grunt.registerTask("travis", ["all"]);
};
