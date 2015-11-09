"use strict";
/*global chai, describe, it, window*/


// Tests for adam
describe("adam", function() {
    var adam,
        expect,
        
        Klass = function() {},
        AnotherKlass = function() {},
        parent = {a: 1, b: 2, c: 3},
        child, 
        grandchild,
        undef;
    
    Klass.someField = "some field";
    Klass.prototype = parent;
    
    child = new Klass();
    child.c = "abc";
    child.d = 4;
    child.e = 5;
    
    AnotherKlass.prototype = child;
    grandchild = new AnotherKlass();
    grandchild.a = "a";
    grandchild.c = "C++";
    grandchild.f = "field";
    grandchild.g = "gnome";
    
    
    // node
    if (typeof chai === "undefined") {
        adam = require("../src/adam.js");
        expect = require("./lib/chai").expect;
    }
    // browser
    else {
        adam = window.adam;
        expect = chai.expect;
    }
    
    function checkArray(func, paramList, expectedResult) {
        var result = func.apply(null, paramList),
            nL = expectedResult.length,
            nI;
        expect( result )
            .length(nL);
        for (nI = 0; nI < nL; nI++) {
            if (nI in expectedResult) {
                expect( result )
                    .include(expectedResult[nI]);
            }
        }
    }
    
    function inc(data) {
        return ++data.value;
    }
    
    
    if (adam.getPropertySymbols) {
        describe(".getPropertySymbols(obj)", function() {
            var getPropertySymbols = adam.getPropertySymbols;
            
            it("should return empty array", function() {
                expect( getPropertySymbols(null) )
                    .eql([]);
                expect( getPropertySymbols(undef) )
                    .eql([]);
                expect( getPropertySymbols({}) )
                    .eql([]);
                expect( getPropertySymbols("abc") )
                    .eql([]);
                expect( getPropertySymbols(543) )
                    .eql([]);
                expect( getPropertySymbols(true) )
                    .eql([]);
            });
            
            it("should return array containing symbol property keys", function() {
                var symA = Symbol("a"),
                    symB = Symbol("b"),
                    symC = Symbol("c"),
                    symD = Symbol("d"),
                    rootProto = {
                        first: "field",
                        second: "value"
                    },
                    proto = Object.create(rootProto),
                    obj;
                
                rootProto[symA] = "Symbol a";
                rootProto[symB] = symB;
                proto.f1 = "F1";
                proto[symB] = "symbolical";
                proto[symC] = "JS++";
                
                obj = {
                    f: 1,
                    s: 2
                };
                obj[symA] = symD;
                obj[symB] = symC;
                
                checkArray(getPropertySymbols, [obj], [symA, symB]);
                
                obj = Object.create(proto);
                obj[symA] = "a";
                obj[symC] = "c";
                obj[symD] = "d";
                
                checkArray(getPropertySymbols, [obj], [symA, symB, symC, symD]);
            });
        });
    }
    
    
    describe(".getClass(value)", function() {
        var getClass = adam.getClass;
        
        it("should return value class", function() {
            /*jshint supernew:true*/
            expect( getClass(false) )
                .equal("Boolean");
            /*jshint ignore:start*/
            expect( getClass(new Boolean(true)) )
                .equal("Boolean");
            /*jshint ignore:end*/
            
            expect( getClass("abc") )
                .equal("String");
            /*jshint ignore:start*/
            expect( getClass(new String("s")) )
                .equal("String");
            /*jshint ignore:end*/
            
            expect( getClass(8) )
                .equal("Number");
            /*jshint ignore:start*/
            expect( getClass(new Number(0)) )
                .equal("Number");
            /*jshint ignore:end*/
            expect( getClass(NaN) )
                .equal("Number");
            
            expect( getClass(null) )
                .equal("Null");
            expect( getClass(undef) )
                .equal("Undefined");
            
            expect( getClass({}) )
                .equal("Object");
            expect( getClass([2, 0, 1, 4]) )
                .equal("Array");
            expect( getClass(new Date()) )
                .equal("Date");
            expect( getClass(/\d+/) )
                .equal("RegExp");
            expect( getClass(getClass) )
                .equal("Function");
            expect( getClass(Math) )
                .equal("Math");
            expect( getClass(new Error("test")) )
                .equal("Error");
            
            expect( getClass(parent) )
                .equal("Object");
            expect( getClass(child) )
                .equal("Object");
            expect( getClass(grandchild) )
                .equal("Object");
        });
    });

    
    describe(".getType(value)", function() {
        var getType = adam.getType;
        
        it("should return value of typeof operator", function() {
            function check(value) {
                expect( getType(value) )
                    .equal(typeof value);
            }
            
            check(true);
            check(false);
            check(undef);
            check(-946);
            check(71);
            check(102030);
            check(Number.POSITIVE_INFINITY);
            check(Number.NEGATIVE_INFINITY);
            check("abc");
            check({});
            check(adam);
            check([1, 2, 3]);
            check(new Date());
            check(/\w/);
        });
        
        it("should return null", function() {
            expect( getType(null) )
                .equal("null");
        });
        
        it("should return nan", function() {
            expect( getType(NaN) )
                .equal("nan");
            expect( getType(Number("abcdef")) )
                .equal("nan");
        });
    });

    
    describe(".getSize", function() {
        var getSize = adam.getSize;
        
        describe("getSize(obj)", function() {
            it("should return quantity of all fields of object (including prototype chain)", function() {
                var parent = {a: 1, b: 2, c: 3, d: 4},
                    F = function() {},
                    child;
                F.prototype = parent;
                child = new F();
                child.b = "b";
                child.d = "d";
                child.e = 5;
                child.f = "f";
                expect( getSize({}) )
                    .equal(0);
                /*jshint ignore:start*/
                expect( getSize(new Object()) )
                    .equal(0);
                expect( getSize(new Boolean(true)) )
                    .equal(0);
                expect( getSize(new Date()) )
                    .equal(0);
                expect( getSize(new Number(57)) )
                    .equal(0);
                /*jshint ignore:end*/
                expect( getSize(grandchild) )
                    .equal(7);
                expect( getSize(parent) )
                    .equal(4);
                expect( getSize(child) )
                    .equal(6);
                
                parent.f = 6;
                expect( getSize(parent) )
                    .equal(5);
                expect( getSize(child) )
                    .equal(6);
                
                delete parent.a;
                delete parent.c;
                expect( getSize(parent) )
                    .equal(3);
                expect( getSize(child) )
                    .equal(4);
            });
        });
        
        describe("getSize(obj, settings)", function() {
            it("should return quantity of fields corresponding to given filter", function() {
                expect( getSize(child, {filter: "integer"}) )
                    .equal(4);
                expect( getSize(child, {filter: "string"}) )
                    .equal(1);
                expect( getSize(child, {filter: ["odd", "string"], filterConnect: "or"}) )
                    .equal(3);
            });
        });
    });

    
    describe(".isSizeMore", function() {
        var isSizeMore = adam.isSizeMore;
        
        describe("isSizeMore(obj, nQty)", function() {
            it("should return true (obj has more fields than nQty)", function() {
                /*jshint expr:true*/
                expect( isSizeMore({}, -1) )
                    .be["true"];
                expect( isSizeMore(Klass, 0) )
                    .be["true"];
                expect( isSizeMore(parent, 0) )
                    .be["true"];
                expect( isSizeMore(parent, 1) )
                    .be["true"];
                expect( isSizeMore(parent, 2) )
                    .be["true"];
                expect( isSizeMore(child, 0) )
                    .be["true"];
                expect( isSizeMore(child, 3) )
                    .be["true"];
                expect( isSizeMore(child, 4) )
                    .be["true"];
                expect( isSizeMore(grandchild, 6) )
                    .be["true"];
            });
            
            it("should return false (obj has less fields than nQty)", function() {
                /*jshint expr:true*/
                expect( isSizeMore({}, 0) )
                    .be["false"];
                expect( isSizeMore(parent, 3) )
                    .be["false"];
                expect( isSizeMore(parent, 4) )
                    .be["false"];
                expect( isSizeMore(parent, 1000) )
                    .be["false"];
                expect( isSizeMore(child, 5) )
                    .be["false"];
                expect( isSizeMore(child, 50000) )
                    .be["false"];
                expect( isSizeMore(grandchild, 7) )
                    .be["false"];
            });
        });
        
        describe("isSizeMore(obj, nQty, settings)", function() {
            it("should return true (obj has more filtered fields than nQty)", function() {
                /*jshint expr:true*/
                expect( isSizeMore(grandchild, 3, {filter: "string"}) )
                    .be["true"];
                expect( isSizeMore(child, 2, {filter: ["odd", "string"], filterConnect: "or"}) )
                    .be["true"];
            });
            
            it("should return false (obj has less filtered fields than nQty)", function() {
                /*jshint expr:true*/
                expect( isSizeMore(child, 4, {filter: "integer"}) )
                    .be["false"];
                expect( isSizeMore(child, 3, {filter: ["even", "null"], filterConnect: "or"}) )
                    .be["false"];
            });
        });
    });

    
    describe(".isEmpty(value)", function() {
        var isEmpty = adam.isEmpty;
        
        it("should return true", function() {
            function check(value) {
                expect( isEmpty(value) )
                    .equal(true);
            }
            
            check(0);
            check("");
            check(null);
            check(undef);
            check([]);
            check({});
        });
        
        it("should return false", function() {
            function check(value) {
                expect( isEmpty(value) )
                    .equal(false);
            }
            
            check(true);
            check(false);
            check(" ");
            check("a b");
            check(1);
            check(NaN);
            check([null]);
            check({a: 9});
            check(adam);
            check(check);
        });
    });

    
    describe(".isKindOf(value, sKind)", function() {
        var isKindOf = adam.isKindOf;
        
        it("should return true", function() {
            function check(value, sKind) {
                expect( isKindOf(value, sKind) )
                    .equal(true);
            }
            
            check(true, "true");
            check(1, "true");
            check(check, "true");
            check("js", "true");
            check(adam, "true");
            check(false, "false");
            check(null, "false");
            check(undef, "false");
            check(0, "false");
            check("", "false");
            check(true, "boolean");
            check(false, "boolean");
            check(0, "zero");
            check(73, "number");
            check(73, "integer");
            check(73, "odd");
            check(74, "even");
            check(73.05673, "real");
            check(Math.PI, "real");
            check(Math.PI, "positive");
            check(-74994.393405, "negative");
            check(Number.POSITIVE_INFINITY, "infinity");
            check(Number.NEGATIVE_INFINITY, "infinity");
            check(Number.POSITIVE_INFINITY, "positive");
            check(Number.NEGATIVE_INFINITY, "negative");
            check(NaN, "nan");
            check(null, "null");
            check("abc", "string");
            check(check, "function");
            check(adam, "object");
            check([], "object");
            check(null, "empty");
            check(undef, "empty");
            check("", "empty");
            check([], "empty");
            check({}, "empty");
            
            check(check, "Function");
            check(adam, "Object");
            check(/\d/, "RegExp");
            check(new Date(), "Date");
            
            check(null, "!object");
            check(1, "!string");
            check(1, "!even");
            check(2, "!odd");
            check(Math.E, "!integer");
            check(Math.E, "!negative");
            check(0, "!real");
            check(0, "!positive");
            check(-0.00000000001, "!zero");
            check(true, "!number");
            check(NaN, "!number");
            check({}, "!null");
            check({a: check}, "!empty");
            check(undef, "!null");
            check(check, "!Object");
            check(adam, "!Array");
        });
        
        it("should return false", function() {
            function check(value, sKind) {
                expect( isKindOf(value, sKind) )
                    .equal(false);
            }
            
            check(1, "false");
            check(check, "false");
            check("", "true");
            check(null, "true");
            check(1, "boolean");
            check(1, "negative");
            check(0, "real");
            check(0.00000001, "zero");
            check(1.2, "integer");
            check(-2.8, "positive");
            check(4.2, "even");
            check(5.1, "odd");
            check(-10000000, "infinity");
            check(null, "object");
            check(NaN, "number");
            check("abc", "number");
            check(NaN, "empty");
            check(adam, "empty");
            check("adam", "empty");
            check([1, 2, 3], "Object");
            check(Math, "Object");
            
            check(1, "!integer");
            check(Math.PI, "!real");
            check(0, "!number");
            check("", "!empty");
            check(undef, "!false");
        });
    });

    
    describe(".checkField", function() {
        var checkField = adam.checkField;
        
        function checkTrue(obj, field, filter, settings) {
            /*jshint unused:vars*/
            expect( checkField.apply(null, arguments) )
                .equal(true);
        }
        
        function checkFalse(obj, field, filter, settings) {
            /*jshint unused:vars*/
            expect( checkField.apply(null, arguments) )
                .equal(false);
        }
        
        describe("checkField(obj, field, function)", function() {
            it("should return true", function() {
                checkTrue({a: null, b: 4}, "a", adam.isEmpty);
                checkTrue(adam, "isEmpty", function(value, field, obj) {
                    /*jshint unused:vars*/
                    return /^is/i.test(field);
                });
                checkTrue({a: 1, b: 2, c: 3}, "b", function(value, field, obj) {
                    return adam.isSizeMore(obj, value);
                });
            });
            
            it("should return false", function() {
                checkFalse({a: null, b: 4}, "b", adam.isEmpty);
                checkFalse(adam, "getSize", function(value, field, obj) {
                    /*jshint unused:vars*/
                    return /^is/i.test(field);
                });
                checkFalse({a: 1, b: 2, c: 3}, "c", function(value, field, obj) {
                    return adam.isSizeMore(obj, value);
                });
            });
        });
        
        describe("checkField(obj, field, regexp)", function() {
            var obj = {a: null, b: 4};
            
            it("should return true", function() {
                checkTrue(obj, "a", /^nu/);
                checkTrue(obj, "b", /\d/);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", /^\s/);
                checkFalse(obj, "b", /[a-z]/);
            });
        });
        
        describe("checkField(obj, field, string)", function() {
            var obj = {a: null, b: 4, check: checkField};
            
            it("should return true", function() {
                checkTrue(child, "c", "own");
                checkTrue(obj, "check", "own");
                checkTrue(obj, "toString", "!own");
                checkTrue(obj, "check", "function");
                checkTrue(obj, "a", "null");
                checkTrue(obj, "b", "integer");
            });
            
            it("should return false", function() {
                checkFalse(child, "a", "own");
                checkFalse(obj, "toString", "own");
                checkFalse(obj, "b", "!own");
                checkFalse(obj, "a", "object");
            });
        });
        
        describe("checkField(obj, field, {field: ...})", function() {
            var obj = {a: null, b: 4, check: checkField};
            
            it("should return true", function() {
                checkTrue(obj, "check", {field: /^che/});
                checkTrue(obj, "b", {field: "b"});
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", {field: /\d/});
                checkFalse(obj, "b", {field: "c"});
            });
        });
        
        describe("checkField(obj, field, {value: ...})", function() {
            var obj = {a: adam, b: [1, 2], check: checkTrue};
            
            it("should return true", function() {
                checkTrue(obj, "check", {value: checkTrue});
                checkTrue(obj, "a", {value: obj.a});
                checkTrue(obj, "b", {value: obj.b});
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", {value: 1});
                checkFalse(obj, "b", {value: adam});
            });
        });
        
        describe("checkField(obj, field, {and: ...})", function() {
            var obj = {a: 1, b: 2, c: -3};
            
            it("should return true", function() {
                checkTrue(obj, "a", {and: ["positive", "odd"]});
                checkTrue(obj, "b", {and: ["positive", "even"]});
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", {and: ["positive", "even"]});
                checkFalse(obj, "b", {and: ["negative", "odd"]});
            });
        });
        
        describe("checkField(obj, field, {or: ...})", function() {
            var obj = {a: 1, b: 2, c: -3, d: "data"};
            
            it("should return true", function() {
                checkTrue(obj, "a", {or: ["real", "positive"]});
                checkTrue(obj, "b", {or: ["negative", "integer"]});
            });
            
            it("should return false", function() {
                checkFalse(obj, "c", {or: ["positive", "real"]});
                checkFalse(obj, "d", {or: ["number", "empty"]});
            });
        });
        
        describe("checkField(obj, field, {...})", function() {
            var filter = {f: 1},
                obj = {a: filter, b: adam};
            
            it("should return true", function() {
                checkTrue(obj, "a", filter);
            });
            
            it("should return false", function() {
                checkFalse(obj, "b", filter);
            });
        });
        
        describe("checkField(obj, field, value)", function() {
            var date = new Date(),
                obj = {a: 1, b: false, c: null, d: date, e: undef};
            
            it("should return true", function() {
                checkTrue(obj, "a", 1);
                checkTrue(obj, "b", false);
                checkTrue(obj, "c", null);
                checkTrue(obj, "d", date);
                checkTrue(obj, "e", undef);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", 2);
                checkFalse(obj, "b", 1);
                checkFalse(obj, "c", false);
                checkFalse(obj, "d", obj);
                checkFalse(obj, "e", null);
            });
        });
        
        describe("checkField(obj, field, [list, of, filters])", function() {
            var obj = {a: "1812", b: 123, c: Math.PI};
            
            it("should return true", function() {
                checkTrue(obj, "a", ["own", "string", /\d/, {or: [/5$/, /1/, /7/]}]);
                checkTrue(obj, "b", ["integer", /3$/]);
                checkTrue(obj, "c", ["Number", "!integer", /^3/]);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", ["own", "string", /^5/]);
                checkFalse(obj, "b", [/2/, "real"]);
                checkFalse(child, "a", [/\d/, "number", "own"]);
                checkFalse(obj, "c", ["number", {or: ["integer", "negative"]}]);
            });
        });
        
        describe("checkField(obj, field, [list, of, filters], {filterConnect: 'or'})", function() {
            var obj = {a: "field value", b: 123, c: null, d: ""},
                settings = {filterConnect: "or"};
            
            it("should return true", function() {
                checkTrue(obj, "a", ["!own", "number", /a/], settings);
                checkTrue(obj, "b", ["real", /2/], settings);
                checkTrue(obj, "c", ["integer", "false"], settings);
                checkTrue(obj, "d", [0, null, "empty"], settings);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", ["!own", "!string", /^\d/], settings);
                checkFalse(obj, "b", [/777/, "nan"], settings);
                checkFalse(obj, "c", [/nil/, "true", "!null"], settings);
                checkFalse(obj, "d", ["object", /\w/, "!empty"], settings);
            });
        });
        
        describe("checkField(obj, field, filter, {value: ...})", function() {
            var obj = {a: "value", b: [], c: null},
                settings = {value: obj};
            
            it("should return true", function() {
                checkTrue(obj, "a", "object", settings);
                checkTrue(obj, "b", "!empty", settings);
                checkTrue(obj, "c", "!null", settings);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", ["string", "!empty"], settings);
                checkFalse(obj, "b", "Array", settings);
                checkFalse(obj, "c", /null/, settings);
            });
        });
    });

    
    describe(".getFields", function() {
        var getFields = adam.getFields;
        
        describe("getFields(obj)", function() {
            it("should return array of all fields of object (including prototype chain)", function() {
                expect( getFields({}) )
                    .eql([]);
                expect( getFields({}) )
                    .length(0);
                expect( getFields({fld: function() {}}) )
                    .eql(["fld"]);
                /*jshint ignore:start*/
                expect( getFields(new Boolean(false)) )
                    .eql([]);
                expect( getFields(new Date()) )
                    .eql([]);
                expect( getFields(new Number(784)) )
                    .eql([]);
                /*jshint ignore:end*/
                expect( getFields(parent) )
                    .include("a")
                    .and.include("b")
                    .and.include("c");
                expect( getFields(parent) )
                    .length(3);
                expect( getFields(child) )
                    .include("a")
                    .and.include("b")
                    .and.include("c")
                    .and.include("d")
                    .and.include("e");
                expect( getFields(child) )
                    .length(5);
                expect( getFields(grandchild) )
                    .include("a")
                    .and.include("b")
                    .and.include("c")
                    .and.include("d")
                    .and.include("e")
                    .and.include("f")
                    .and.include("g");
                expect( getFields(grandchild) )
                    .length(7);
            });
        });
        
        describe("getFields(obj, settings)", function() {
            it("should return array of object's fields conforming to the given filter", function() {
                checkArray(getFields,
                            [child, {filter: "odd"}],
                            ["a", "e"]);
                checkArray(getFields,
                            [child, {filter: ["even", "string"], filterConnect: "or"}],
                            ["b", "c", "d"]);
            });
        });
    });

    
    describe(".getValueKey", function() {
        var getValueKey = adam.getValueKey,
            date = new Date(),
            obj = {child: child, grandchild: grandchild, parent: parent, date: date, "false": false, "true": true, "null": null, undef: undef};
        
        describe("getValueKey(obj, value)", function() {
            it("should return field name for the specified value", function() {
                expect( getValueKey(parent, 1) )
                    .equal("a");
                expect( getValueKey(parent, 3) )
                    .equal("c");
                expect( getValueKey(child, 4) )
                    .equal("d");
                expect( getValueKey(child, "abc") )
                    .equal("c");
                expect( getValueKey(grandchild, 5) )
                    .equal("e");
                expect( getValueKey(grandchild, "C++") )
                    .equal("c");
                
                expect( getValueKey(obj, child) )
                    .equal("child");
                expect( getValueKey(obj, grandchild) )
                    .equal("grandchild");
                expect( getValueKey(obj, parent) )
                    .equal("parent");
                expect( getValueKey(obj, date) )
                    .equal("date");
                expect( getValueKey(obj, false) )
                    .equal("false");
                expect( getValueKey(obj, true) )
                    .equal("true");
                expect( getValueKey(obj, null) )
                    .equal("null");
                expect( getValueKey(obj, undef) )
                    .equal("undef");
            });
            
            it("should return array's index as string for the specified value", function() {
                var nN = 7,
                    sStr = "some string",
                    list = [parent, child, grandchild, date, null, undef, true, false, sStr, nN];
                expect( getValueKey(list, parent) )
                    .equal("0");
                expect( getValueKey(list, child) )
                    .equal("1");
                expect( getValueKey(list, grandchild) )
                    .equal("2");
                expect( getValueKey(list, date) )
                    .equal("3");
                expect( getValueKey(list, null) )
                    .equal("4");
                expect( getValueKey(list, undef) )
                    .equal("5");
                expect( getValueKey(list, true) )
                    .equal("6");
                expect( getValueKey(list, false) )
                    .equal("7");
                expect( getValueKey(list, sStr) )
                    .equal("8");
                expect( getValueKey(list, nN) )
                    .equal("9");
            });
            
            it("should return null", function() {
                /*jshint expr:true*/
                expect( getValueKey(parent, 10) )
                    .be["null"];
                expect( getValueKey(child, "abcd") )
                    .be["null"];
                expect( getValueKey(grandchild, "Java") )
                    .be["null"];
                
                expect( getValueKey(obj, {}) )
                    .be["null"];
                expect( getValueKey(obj, obj) )
                    .be["null"];
                expect( getValueKey(obj, "undefined") )
                    .be["null"];
                expect( getValueKey(obj, NaN) )
                    .be["null"];
            });
        });
        
        describe("getValueKey(obj, value, true)", function() {
            var list = [-1, 123, date, 123, parent, child, child, null, date, 123],
                o = {
                        p: parent, 
                        c: child, 
                        child: child, 
                        grand: grandchild, 
                        parent: parent, 
                        p2: parent,
                        date: date,
                        dt: date,
                        f: false
                    };
            
            it("should return array of field names having the specified value", function() {
                expect( getValueKey(list, 123, true) )
                    .eql(["1", "3", "9"]);
                expect( getValueKey(list, date, true) )
                    .eql(["2", "8"]);
                expect( getValueKey(list, child, true) )
                    .eql(["5", "6"]);
                expect( getValueKey(list, parent, true) )
                    .eql(["4"]);
                expect( getValueKey(list, null, true) )
                    .eql(["7"]);
                
                expect( getValueKey(o, false, true) )
                    .eql(["f"]);
                expect( getValueKey(o, parent, true) )
                    .eql(["p", "parent", "p2"]);
                expect( getValueKey(o, child, true) )
                    .eql(["c", "child"]);
                expect( getValueKey(o, grandchild, true) )
                    .eql(["grand"]);
                expect( getValueKey(o, date, true) )
                    .eql(["date", "dt"]);
            });
            
            it("should return null", function() {
                /*jshint expr:true*/
                expect( getValueKey(list, 0, true) )
                    .be["null"];
                expect( getValueKey(list, "123", true) )
                    .be["null"];
                expect( getValueKey(list, grandchild, true) )
                    .be["null"];
                expect( getValueKey(list, undef, true) )
                    .be["null"];
                
                expect( getValueKey(obj, {}, true) )
                    .be["null"];
                expect( getValueKey(obj, obj, true) )
                    .be["null"];
                
                expect( getValueKey(o, null, true) )
                    .be["null"];
                expect( getValueKey(o, true, true) )
                    .be["null"];
            });
        });
    });

    
    describe(".getValues", function() {
        var getValues = adam.getValues;
        
        describe("getValues(obj)", function() {
            it("should return array of all field values of object (including prototype chain)", function() {
                var d = new Date();
                
                expect( getValues({}) )
                    .eql([]);
                expect( getValues({}) )
                    .length(0);
                expect( getValues({field: d}) )
                    .eql([d]);
                /*jshint ignore:start*/
                expect( getValues(new Boolean(true)) )
                    .eql([]);
                expect( getValues(new Date()) )
                    .eql([]);
                expect( getValues(new Number(234345)) )
                    .eql([]);
                /*jshint ignore:end*/
                expect( getValues(parent) )
                    .include(1)
                    .and.include(2)
                    .and.include(3);
                expect( getValues(parent) )
                    .length(3);
                expect( getValues(child) )
                    .include("abc")
                    .and.include(1)
                    .and.include(2)
                    .and.include(4)
                    .and.include(5);
                expect( getValues(child) )
                    .length(5);
                expect( getValues(grandchild) )
                    .include("a")
                    .and.include(2)
                    .and.include("C++")
                    .and.include(4)
                    .and.include(5)
                    .and.include("field")
                    .and.include("gnome");
                expect( getValues(grandchild) )
                    .length(7);
            });
        });
        
        describe("getValues(obj, settings)", function() {
            it("should return array of object's field values conforming to the given filter", function() {
                checkArray(getValues,
                            [child, {filter: {field: /b|e/}}],
                            [2, 5]);
                checkArray(getValues,
                            [grandchild, {filter: {or: ["!string", /\W/]}}],
                            [2, 4, 5, "C++"]);
            });
        });
    });

    
    describe(".getFreeField", function() {
        var getFreeField = adam.getFreeField,
            obj = {a5: 5, a2: "adfs", a3: "---", b3: 3, b4: "some", b0: "build best", b: "To be, or not to be: that's the question", c: 0, d1: 120, d2: new Date()};
        
        describe("getFreeField() / getFreeField(null) / getFreeField(<false value>)" + 
                 " / getFreeField(<false value>, {prefix: <not string>})" + 
                 " / getFreeField(<false value>, {prefix: <not string>, startNum: <false value>})", function() {
            it("should return 'f0'", function() {
                expect( getFreeField() )
                    .equal("f0");
                expect( getFreeField(null) )
                    .equal("f0");
                expect( getFreeField(0) )
                    .equal("f0");
                expect( getFreeField("") )
                    .equal("f0");
                expect( getFreeField(false) )
                    .equal("f0");
                expect( getFreeField(null, {prefix: null}) )
                    .equal("f0");
                expect( getFreeField(null, {prefix: 10}) )
                    .equal("f0");
                expect( getFreeField(null, {prefix: 10, startNum: 0}) )
                    .equal("f0");
                expect( getFreeField("", {prefix: new Date(), startNum: null}) )
                    .equal("f0");
                /*jshint ignore:start*/
                expect( getFreeField(undef, {prefix: new String("something wrong"), startNum: ""}) )
                    .equal("f0");
                /*jshint ignore:end*/
            });
        });
        
        describe("getFreeField(<false value>, {prefix: sPrefix})" + 
                 " / getFreeField(<false value>, {prefix: sPrefix, startNum: <false value>})", function() {
            it("should return sPrefix + '0'", function() {
                expect( getFreeField(null, {prefix: "abc"}) )
                    .equal("abc0");
                expect( getFreeField(null, {prefix: "abc", startNum: 0}) )
                    .equal("abc0");
                expect( getFreeField(null, {prefix: "+++", startNum: undef}) )
                    .equal("+++0");
                expect( getFreeField(false, {prefix: String(5)}) )
                    .equal("50");
                expect( getFreeField(undef, {prefix: "Zero is ", startNum: 0}) )
                    .equal("Zero is 0");
                expect( getFreeField("", {prefix: "-"}) )
                    .equal("-0");
                expect( getFreeField("", {prefix: "GROT", startNum: Number.NaN}) )
                    .equal("GROT0");
            });
        });
        
        describe("getFreeField(<false value>, {prefix: sPrefix, startNum: nStartNum})", function() {
            it("should return sPrefix + nStartNum", function() {
                expect( getFreeField(null, {prefix: "d", startNum: 5}) )
                    .equal("d5");
                expect( getFreeField(null, {prefix: "100", startNum: 500}) )
                    .equal("100500");
                expect( getFreeField(0, {prefix: "max number - ", startNum: Number.MAX_VALUE}) )
                    .equal("max number - " + Number.MAX_VALUE);
                expect( getFreeField(0, {prefix: "-infinity = ", startNum: Number.NEGATIVE_INFINITY}) )
                    .equal("-infinity = " + Number.NEGATIVE_INFINITY);
            });
        });
        
        describe("getFreeField(obj) / getFreeField(obj, {prefix: <not string>})" + 
                 " / getFreeField(obj, {prefix: <not string>, startNum: <false value>})", function() {
            it("should return field name 'f<number>' so that there are no such field in obj", function() {
                expect( getFreeField({f5: 5}) )
                    .equal("f0");
                expect( getFreeField({f0: 0, f1: 1, f2: 2}, {prefix: null}) )
                    .equal("f3");
                expect( getFreeField({a: 1, b: 2, f2: 2, f0: 0}, {prefix: {}, startNum: false}) )
                    .equal("f1");
            });
        });
        
        describe("getFreeField(obj, {prefix: sPrefix}) / getFreeField(obj, {prefix: sPrefix, startNum: <false value>})", function() {
            it("should return field name sPrefix + '<number>' so that there are no such field in obj", function() {
                expect( getFreeField({f5: 5}, {prefix: "abc"}) )
                    .equal("abc0");
                expect( getFreeField({f5: 5}, {prefix: "f"}) )
                    .equal("f0");
                expect( getFreeField({f0: 0, "$$$0": 1, "$$$12": 12}, {prefix: "$$$"}) )
                    .equal("$$$1");
                expect( getFreeField(adam, {prefix: "abc", startNum: false}) )
                    .equal("abc0");
                expect( getFreeField({"0": "a", "1": "b"}, {prefix: ""}) )
                    .equal("2");
                expect( getFreeField(new Date(), {prefix: "getTime", startNum: null}) )
                    .equal("getTime0");
                expect( getFreeField(["a", new Date(), true, 111], {prefix: "", startNum: 0}) )
                    .equal("4");
            });
        });
        
        describe("getFreeField(obj, {prefix: sPrefix, startNum: nStartNum})", function() {
            it("should return field name sPrefix + '<number>' so that there are no such field in obj (search is started from sPrefix + nStartNum)", function() {
                expect( getFreeField(obj, {prefix: "a", startNum: 5}) )
                    .equal("a6");
                expect( getFreeField(obj, {prefix: "a", startNum: 1}) )
                    .equal("a1");
                expect( getFreeField(obj, {prefix: "a", startNum: 2}) )
                    .equal("a4");
                expect( getFreeField(obj, {prefix: "b", startNum: 1}) )
                    .equal("b1");
                expect( getFreeField(obj, {prefix: "b", startNum: 3}) )
                    .equal("b5");
                expect( getFreeField(obj, {prefix: "c", startNum: 0}) )
                    .equal("c0");
                expect( getFreeField(obj, {prefix: "c", startNum: 8}) )
                    .equal("c8");
                expect( getFreeField(obj, {prefix: "d", startNum: 1}) )
                    .equal("d3");
                expect( getFreeField(obj, {prefix: "d", startNum: 100}) )
                    .equal("d100");
            });
        });
        
        describe("getFreeField(obj, {prefix: sPrefix, startNum: nStartNum | <false value>, checkPrefix: true})", function() {
            it("should return field name <sPrefix>[<number>] so that there are no such field in obj (search is started from sPrefix)", function() {
                expect( getFreeField(obj, {prefix: "", startNum: false, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(obj, {prefix: "", startNum: 0, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(obj, {prefix: "", startNum: 1, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(obj, {prefix: "", startNum: 10, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(obj, {prefix: "a", startNum: false, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(obj, {prefix: "a", startNum: 0, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(obj, {prefix: "a", startNum: 1, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(obj, {prefix: "a", startNum: 100, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(obj, {prefix: "b", startNum: null, checkPrefix: true}) )
                    .equal("b1");
                expect( getFreeField(obj, {prefix: "b", startNum: 0, checkPrefix: true}) )
                    .equal("b1");
                expect( getFreeField(obj, {prefix: "b", startNum: 1, checkPrefix: true}) )
                    .equal("b1");
                expect( getFreeField(obj, {prefix: "b", startNum: 2, checkPrefix: true}) )
                    .equal("b2");
                expect( getFreeField(obj, {prefix: "b", startNum: 3, checkPrefix: true}) )
                    .equal("b5");
                expect( getFreeField(obj, {prefix: "b", startNum: 100, checkPrefix: true}) )
                    .equal("b100");
                expect( getFreeField(obj, {prefix: "c", startNum: "", checkPrefix: true}) )
                    .equal("c0");
                expect( getFreeField(obj, {prefix: "c", startNum: 0, checkPrefix: true}) )
                    .equal("c0");
                expect( getFreeField(obj, {prefix: "c", startNum: 1, checkPrefix: true}) )
                    .equal("c1");
                expect( getFreeField(obj, {prefix: "c", startNum: 7, checkPrefix: true}) )
                    .equal("c7");
                expect( getFreeField(obj, {prefix: "d", startNum: undef, checkPrefix: true}) )
                    .equal("d");
                expect( getFreeField(obj, {prefix: "d", startNum: 0, checkPrefix: true}) )
                    .equal("d");
                expect( getFreeField(obj, {prefix: "d", startNum: 1, checkPrefix: true}) )
                    .equal("d");
                expect( getFreeField(obj, {prefix: "d", startNum: 2, checkPrefix: true}) )
                    .equal("d");
            });
        });
        
    });

    
    describe(".split", function() {
        var split = adam.split,
            date = new Date(),
            nTime = date.getTime(),
            method = function() {return nTime;},
            obj = {a: 1, b: 2, first: "first", second: "second", delta: 123, d: date, time: nTime, func: method};
        
        describe("split(obj, firstObjFields)", function() {
            it("should return array from 2 correct objects", function() {
                expect( split({}, {}) )
                    .eql([{}, {}]);
                expect( split({}, {one: 1, two: 2, three: 3}) )
                    .eql([{}, {}]);
                expect( split({abc: date}, ["one", "two", "three"]) )
                    .eql([{}, {abc: date}]);
                expect( split(obj, ["one", "two", "three"]) )
                    .eql([{}, obj]);
                expect( split(obj, {first: null, second: null}) )
                    .eql([{first: "first", second: "second"}, 
                          {a: 1, b: 2, delta: 123, d: date, time: nTime, func: method}]);
                expect( split(obj, ["a", "delta", "time", "second"]) )
                    .eql([{a: 1, second: "second", delta: 123, time: nTime}, 
                          {b: 2, first: "first", d: date, func: method}]);
            });
        });
        
        describe("split(obj, null, {filter: ...})", function() {
            it("should return array from 2 correct objects", function() {
                expect( split(obj, null, {filter: "integer"}) )
                    .eql([{a: 1, b: 2, delta: 123, time: nTime}, 
                          {first: "first", second: "second", d: date, func: method}]);
                expect( split(obj, null, {filter: ["string", "Date"], filterConnect: "or"}) )
                    .eql([{first: "first", second: "second", d: date}, 
                          {a: 1, b: 2, delta: 123, time: nTime, func: method}]);
            });
        });
    });

    
    describe(".fromArray", function() {
        var fromArray = adam.fromArray,
            categoryList = [
                            {
                              "id": 0,
                              "name": "All",
                              "quantity": 77
                            },
                            {
                              "id": 1,
                              "name": "Drama",
                              "quantity": 1
                            },
                            {
                              "id": 2,
                              "name": "Thriller",
                              "quantity": 14
                            },
                            {
                              "id": 3,
                              "name": "Comedy",
                              "quantity": 6
                            },
                            {
                              "id": 4,
                              "name": "Cartoon",
                              "quantity": 13
                            },
                            {
                              "id": 5,
                              "name": "Science fiction",
                              "quantity": 21
                            },
                            {
                              "id": 6,
                              "name": "Action",
                              "quantity": 17
                            },
                            {
                              "id": 7,
                              "name": "Fantasy",
                              "quantity": 5
                            }
                          ];
        
        function getCategoryListCopy() {
            var result = categoryList.slice(0),
                nL = result.length,
                copy, item, nI, sKey;
            for (nI = 0; nI < nL; nI++) {
                item = result[nI];
                copy = {};
                for (sKey in item) {
                    copy[sKey] = item[sKey];
                }
                result[nI] = copy;
            }
            return result;
        }
        
        function test(list, bCallFunc, sField) {
            /*jshint laxbreak:true*/
            var obj = sField ? fromArray(list, sField) : fromArray(list),
                item, key, nI, nL;
            for (nI = 0, nL = list.length; nI < nL; nI++) {
                item = list[nI];
                key = sField ? item[sField] : item;
                key = String( typeof key === "function" && bCallFunc
                                ? key()
                                : key );
                expect(obj)
                    .contain.key(key);
                expect( obj[key] )
                    .equal(item);
            }
        }
        
        describe("fromArray(list)", function() {
            function testKeyValParity(list, bString) {
                var obj = fromArray(list),
                    sKey, value;
                for (sKey in obj) {
                    value = obj[sKey];
                    expect( bString ? String(value) : value )
                        .equal(sKey);
                }
            }
            
            it("should return object whose keys are equal to values", function() {
                testKeyValParity(["one", "2", "thRee", "false", "true", "null", "void 0", "function() {}"]);
            });
            
            it("should return object whose keys are equal to values converted to strings", function() {
                testKeyValParity([1, 2, "thRee", false, true, null, void 0, "ABC DEF"], true);
            });
            
            it("should return object containing the only field '[object Object]'", function() {
                var result = fromArray([
                                          {a: 1, b: 2},
                                          {c: 3},
                                          {d: 4, e: 5},
                                          {"end": "final words"}
                                      ]);
                expect(result)
                    .keys([ "[object Object]" ]);
            });
            
            it("should return object whose keys are list items converted to strings and values are list items", function() {
                function someName() {
                    return someName.toString();
                }
                
                test([1, 2, "thRee", false, true, null, void 0, "ABC DEF",
                      new Date(),
                      ["this", "is", "subarray"],
                       someName,
                       {f1: "Formula 1", f2: "just a field", f3: 3, toString: function() {return "I am super unique";}}]);
            });
            
            it("should return object whose keys are stringified values returned from functions contained in list", function() {
                test([
                          function() {
                              return 1;
                          },
                          function() {
                              return new Date();
                          },
                          function() {}
                      ],
                      true);
            });
        });
        
        describe("fromArray(list, sField)", function() {
            it("should return object whose keys are equal to values of object fields and values are objects", function() {
                test([{a: 1}, {a: 2, b: 2}, {a: "id", b: 3, d: 345}], false, "a");
                test(categoryList, false, "id");
                test(categoryList, false, "name");
                test(categoryList, false, "quantity");
            });
        });
        
        describe("fromArray(list, func)", function() {
            it("should return object whose keys are results of calling of specified function and values are objects", function() {
                function getKey(source, target, index) {
                    /*jshint unused:vars*/
                    return source.name + " (" + source.quantity + ")";
                }
                var obj = fromArray(categoryList, getKey),
                    nL = categoryList.length,
                    item, nI;
                for (nI = 0; nI < nL; nI++) {
                    item = categoryList[nI];
                    expect(obj)
                        .have.property(getKey(item), item);
                }
            });
        });
        
        describe("fromArray(list, sField, {deleteKeyField: true})", function() {
            it("should return object whose keys are equal to values of object fields and values are objects without the key field", function() {
                var keys = [],
                    nI, nL, obj, sKey;
                for (nI = 0, nL = categoryList.length; nI < nL; nI++) {
                    keys.push( String(categoryList[nI].id) );
                }
                obj = fromArray(getCategoryListCopy, "id", {deleteKeyField: true});
                for (sKey in obj) {
                    expect(keys)
                        .contain(sKey);
                    expect(obj)
                        .not.contain.key("id");
                }
            });
        });
        
        describe("fromArray(list, func, {deleteKeyField: true})", function() {
            it("should return object whose keys are results of calling of specified function and values are objects without the key field", function() {
                function getKey(source, target, index) {
                    var sKey;
                    for (sKey in source) {
                        if (! (sKey in target)) {
                            return sKey;
                        }
                    }
                    return "f" + index;
                }
                
                var obj = fromArray([{a: 1, b: 2, c: 3}, {a: 10, b: 20, c: 30}, {a: 11, b: 22, c: 33}, {a: "a"}], 
                                    getKey, 
                                    {deleteKeyField: true});
                expect(obj)
                    .eql({
                            a: {b: 2, c: 3},
                            b: {a: 10, c: 30},
                            c: {a: 11, b: 22},
                            f3: {a: "a"}
                        });
                
            });
        });
        
        describe("fromArray(list, keyField, {filter: ..., filterConnect: ...})", function() {
            it("should return object including values conforming to the given filter", function() {
                function test(list, keyField, settings, expectedResult) {
                    var result = fromArray(list, keyField, settings),
                        nSize = 0,
                        sKey;
                    for (sKey in result) {
                        expect( expectedResult )
                            .contain.key(sKey);
                        expect( result[sKey] )
                            .equal(expectedResult[sKey]);
                        nSize++;
                    }
                    expect( adam.getSize(expectedResult) )
                        .equal(nSize);
                }
                
                test(categoryList, "id", 
                        {filter: function(item) {
                            return item.quantity < 10;
                        }},
                        {
                            1: categoryList[1],
                            3: categoryList[3],
                            7: categoryList[7]
                        });
                
                test(categoryList, "name", {filter: {field: /^(?:C|D)/}},
                        {
                            "Drama": categoryList[1],
                            "Comedy": categoryList[3],
                            "Cartoon": categoryList[4]
                        });
            });
        });
    });

    
    describe(".remove(obj, filter, [settings])", function() {
        var remove = adam.remove;
        
        it("should remove specified elements from array", function() {
            checkArray(remove, 
                        [
                             [1, 2, 3, 4, 5], 
                             "odd"
                         ], 
                        [2, 4]);
            checkArray(remove, 
                        [
                             ["1", 2, null, 11, -5, 0, "29", undef], 
                             ["string", "false"],
                             {filterConnect: "or"}
                         ], 
                         [2, 11, -5]);
        });
        
        it("should remove specified fields from object", function() {
            expect( remove({a: 1, z: 7, omega: 3, delta: 5, f: -7}, {field: /a/}) )
                .eql({z: 7, f: -7});
            expect( remove({a: "a", b: "be", c: "omega", d: 7}, [/a/, "number"], {filterConnect: "or"}) )
                .eql({b: "be"});
        });
    });
    
    describe(".empty(value)", function() {
        var empty = adam.empty;
        
        it("should return empty array", function() {
            var list = [1, 2, 3];
            expect( empty(list) )
                .equal(list);
            expect( list.length )
                .equal(0);
        });
        
        it("should return empty object", function() {
            var obj = {a: 1, b: parent, c: child, d: undef};
            expect( empty(obj) )
                .equal(obj);
            expect( adam.getSize(obj) )
                .equal(0);
        });
        
        it("should return empty string", function() {
            expect( empty("abc...xyz") )
                .equal("");
            expect( empty("") )
                .equal("");
        });
        
        it("should return 0", function() {
            expect( empty(3403793) )
                .equal(0);
            expect( empty(-74024) )
                .equal(0);
            expect( empty(Number.NEGATIVE_INFINITY) )
                .equal(0);
        });
        
        it("should return undefined", function() {
            expect( empty(null) )
                .equal(undef);
            expect( empty(undef) )
                .equal(undef);
            expect( empty(false) )
                .equal(undef);
            expect( empty(true) )
                .equal(undef);
            expect( empty(NaN) )
                .equal(undef);
        });
    });

    
    describe(".reverse(value)", function() {
        var reverse = adam.reverse;
        
        it("should return reversed array", function() {
            expect( reverse([1, 2, 3]) )
                .eql([3, 2, 1]);
            expect( reverse(["a", child, parent, adam, null]) )
                .eql([null, adam, parent, child, "a"]);
        });
        
        it("should return reversed object", function() {
            expect( reverse(parent) )
                .eql({1: "a", 2: "b", 3: "c"});
            expect( reverse(grandchild) )
                .eql({a: "a", 2: "b", "C++": "c", 4: "d", 5: "e", field: "f", gnome: "g"});
        });
        
        it("should return reversed string", function() {
            expect( reverse("abc-xyz") )
                .equal("zyx-cba");
            expect( reverse("refer") )
                .equal("refer");
            expect( reverse("lave") )
                .equal("eval");
        });
        
        it("should return negated number", function() {
            expect( reverse(7) )
                .equal(-7);
            expect( reverse(-4) )
                .equal(4);
            expect( reverse(0) )
                .equal(0);
            expect( reverse(Number.POSITIVE_INFINITY) )
                .equal(Number.NEGATIVE_INFINITY);
        });
        
        it("should return negated boolean", function() {
            expect( reverse(true) )
                .equal(false);
            expect( reverse(false) )
                .equal(true);
        });
        
        it("should return source value", function() {
            expect( reverse(null) )
                .equal(null);
            expect( reverse(undef) )
                .equal(undef);
            expect( isNaN(reverse(NaN)) )
                .equal(true);
        });
    });

    
    describe(".transform(value, sAction)", function() {
        var transform = adam.transform;
        
        it("should return array", function() {
            var result = transform(3, "array");
            expect( adam.getClass(result) )
                .equal("Array");
            expect( result )
                .length(3);
            
            checkArray(transform,
                        ["abc", "array"],
                        ["abc"]);
            checkArray(transform,
                        [parent, "array"],
                        [parent]);
        });
        
        it("should return boolean", function() {
            expect( transform("false", "boolean") )
                .equal(true);
            expect( transform(1, "boolean") )
                .equal(true);
            expect( transform(child, "boolean") )
                .equal(true);
            
            expect( transform("", "boolean") )
                .equal(false);
            expect( transform(null, "boolean") )
                .equal(false);
            expect( transform(0, "boolean") )
                .equal(false);
            expect( transform(NaN, "boolean") )
                .equal(false);
            expect( transform(undef, "boolean") )
                .equal(false);
        });
        
        it("should empty value", function() {
            expect( transform("true", "empty") )
                .equal("");
            expect( transform(-583, "empty") )
                .equal(0);
            expect( transform({z: "x", u: "i"}, "empty") )
                .eql({});
        });
        
        it("should return function", function() {
            expect( transform("true", "function") )
                .a("function");
        });
        
        it("should return integer", function() {
            expect( transform(7.3953039923423, "integer") )
                .equal(7);
            expect( transform(-90.5, "integer") )
                .equal(-90);
            expect( transform(Math.PI, "integer") )
                .equal(3);
            expect( isNaN(transform("true", "integer")) )
                .equal(true);
        });
        
        it("should return number", function() {
            expect( transform("389", "number") )
                .equal(389);
            expect( transform("12.8", "number") )
                .equal(12.8);
            expect( transform("-4031", "number") )
                .equal(-4031);
            expect( isNaN(transform("Math.PI", "number")) )
                .equal(true);
        });
        
        it("should return object", function() {
            function check(value, expectedClass) {
                var result = transform(value, "object");
                expect( typeof result )
                    .equal("object");
                expect( adam.getClass(result) )
                    .equal(expectedClass);
            }
            
            expect( transform(grandchild, "object") )
                .eql(grandchild);
            
            expect( transform(null, "object") )
                .eql({});
            expect( transform(undef, "object") )
                .eql({});
            
            check(true, "Boolean");
            check(-83, "Number");
            check("some text", "String");
        });
        
        it("should reverse value", function() {
            expect( transform("adam", "reverse") )
                .equal("mada");
            expect( transform({a: 1, b: 2}, "reverse") )
                .eql({1: "a", "2": "b"});
            expect( transform(-94, "reverse") )
                .equal(94);
        });
        
        it("should return string", function() {
            expect( transform(false, "string") )
                .equal("false");
            expect( transform(5, "string") )
                .equal("5");
            expect( transform(child, "string") )
                .equal("[object Object]");
            expect( transform(undef, "string") )
                .equal("undefined");
            expect( transform("delta", "string") )
                .equal("delta");
        });
        
        it("should return source value", function() {
            expect( transform(7.3, "int") )
                .equal(7.3);
            expect( transform("9", "char") )
                .equal("9");
            expect( transform("destiny") )
                .equal("destiny");
            expect( transform("current", "date") )
                .equal("current");
        });
    });

    
    describe(".copy", function() {
        var copy = adam.copy;
        
        function check(expectedResult, source, target, settings) {
            /*jshint unused:vars*/
            var result = copy.apply(null, Array.prototype.slice.call(arguments, 1));
            expect( result )
                .equal(target);
            expect( result )
                .eql(expectedResult);
        }
        
        describe("copy(source, target)", function() {
            it("should copy all fields", function() {
                check({a: 1, b: 2, c: 3, d: 4},
                        {b: 2, c: 3, d: 4},
                        {a: 1, b: 100, d: "delta"});
                checkArray(copy,
                            [
                                 ["a", 2, "c"],
                                 [1, 3, 5, child, null]
                             ],
                             ["a", 2, "c", child, null]);
            });
        });
        
        describe("copy(source, target, {filter: ...})", function() {
            it("should copy filtered fields", function() {
                check({a: "a", b: 100, c: "C++", f: "field", g: "gnome", x: "rays"},
                        grandchild,
                        {a: 1, b: 100, x: "rays"},
                        {filter: "string"});
                checkArray(copy,
                            [
                                 ["a", "b", "c", "d", "e", "f", "g"],
                                 [1, 2, 3, 4, 5],
                                 {filter: function(value, key) {
                                     return key > 3;
                                 }}
                             ],
                             [1, 2, 3, 4, "e", "f", "g"]);
            });
        });
        
        describe("copy(source, target, {transform: ...})", function() {
            it("should copy transformed fields", function() {
                check({a: 2, b: 100, c: 4, t: "eam"},
                        {a: 1, c: 3},
                        {a: 7, b: 100, t: "eam"},
                        {transform: inc});
                check({a: "-1", b: 100, c: "3", f: "fire"},
                        {a: -1, c: 3},
                        {a: 5, b: 100, f: "fire"},
                        {transform: "string"});
                checkArray(copy,
                            [
                                 [1, 2, 3],
                                 [1, 2, 3, 40, 50],
                                 {transform: inc}
                             ],
                             [2, 3, 4, 40, 50]);
            });
        });
        
        describe("copy(source, target, {filter: ..., transform: ...})", function() {
            it("should copy filtered and transformed fields", function() {
                var result;
                check({a: -1, b: 3, c: 4, d: -4},
                        {a: "a", b: 2, c: 3, d: null},
                        {a: -1, b: -2, c: -3, d: -4},
                        {filter: "number", transform: inc});
                
                result = ["1", -2, "3", "null"];
                result[6] = "7";
                checkArray(copy,
                            [
                                 [1, false, 3, null, "abc", 6, 7, 8],
                                 [-1, -2, -3],
                                 {filter: ["odd", "null"], filterConnect: "or", transform: "string"}
                             ],
                             result);
            });
        });
    });

    
    describe(".change", function() {
        var change = adam.change;
        
        function check(expectedResult, obj, action, settings) {
            /*jshint unused:vars*/
            var result = change.apply(null, Array.prototype.slice.call(arguments, 1));
            expect( result )
                .equal(obj);
            expect( result )
                .eql(expectedResult);
        }
        
        it("should change all fields", function() {
            check({x: 1, y: 12, z: 123},
                    {x: 0, y: 11, z: 122},
                    inc);
            checkArray(change,
                        [
                             ["abc", 8, {d: 3, g: 5}, true],
                             "reverse"
                         ],
                         ["cba", -8, {3: "d", 5: "g"}, false]);
        });
        
        it("should change filtered fields", function() {
            check({x: 1, y: 11, z: 123},
                    {x: 0, y: 11, z: 122},
                    inc,
                    {filter: "even"});
            checkArray(change,
                        [
                             ["a", 7, false, null, 8],
                             "string",
                             {filter: ["odd", "null"], filterConnect: "or"}
                         ],
                         ["a", "7", false, "null", 8]);
        });
    });

    
    describe(".map", function() {
        var map = adam.map;
        
        function check(expectedResult, obj, action, settings) {
            /*jshint unused:vars*/
            var result = map.apply(null, Array.prototype.slice.call(arguments, 1));
            expect( result )
                .not.equal(obj);
            expect( result )
                .eql(expectedResult);
        }
        
        it("should copy and transform all fields", function() {
            check({c: -2, b: -1, a: 0},
                    {c: -3, b: -2, a: -1},
                    inc);
            checkArray(map,
                        [
                             ["abc", -987, {x: "files"}],
                             "empty"
                         ],
                         ["", 0, {}]);
        });
        
        it("should copy and transform filtered fields", function() {
            var result;
            check({b: 3, d: 5, e: 6},
                    grandchild,
                    inc,
                    {filter: "integer"});
            
            result = [];
            result[1] = "";
            result[4] = 0;
            result[6] = 0;
            result[7] = "";
            result[8] = "";
            checkArray(map,
                        [
                             [0, "x-way", 7, true, -9, child, -3, "some", "value", 104],
                             "empty",
                             {filter: ["negative", "string"], filterConnect: "or"}
                         ],
                         result);
        });
    });
});
