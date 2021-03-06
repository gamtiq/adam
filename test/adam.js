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
        symA,
        symB,
        symC,
        symD,
        testObj,
        testProto,
        testSymbols,
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
    
    
    testSymbols = adam.getPropertySymbols;
    
    if (testSymbols) {
        symA = Symbol("symA");
        symB = Symbol("B");
        symC = Symbol("symbol c");
        symD = Symbol("D");
        
        testProto = Object.create(grandchild);
        testProto.pro = "super sym";
        testProto[symA] = -1;
        testProto[symC] = "semifinal";
        testProto.symD = symD;
        
        testObj = Object.create(testProto);
        testObj[symA] = true;
        testObj[symB] = symA;
        testObj.b = undef;
        testObj.d = null;
        testObj.f = "frozen";
        testObj.h = "symbolic value";
        testObj.iValue = 789;
        testObj.xyz = parent;
    }
    
    function getTestMap() {
        return new Map([
            ["a5", 5],
            ["a2", "adfs"],
            ["a3", "---"],
            ["b3", 3],
            ["b4", "some"],
            ["b0", "build best"],
            ["b", "To be, or not to be: that's the question"],
            ["c", 0],
            ["d1", 120],
            ["d2", new Date()],
            ["e", 2],
            ["f", false],
            ["g", null],
            [parent, child],
            [null, true]
        ]);
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
                    .deep.include(expectedResult[nI]);
            }
        }
    }

    function checkMap(map, expectedMap) {
        var keyList = Array.from(expectedMap.keys()),
            nL = keyList.length,
            key, nI;

        expect( adam.getClass(map) )
            .equal( "Map" );
        for (nI = 0; nI < nL; nI++) {
            key = keyList[nI];
            expect( map.has(key) )
                .equal( true );
            expect( map.get(key) )
                .equal( expectedMap.get(key) );
        }
        expect( map.size )
            .equal( nL );
    }

    function checkSet(set, expectedSet) {
        var keyList = Array.from(expectedSet.keys()),
            nL = keyList.length,
            key, nI;

        expect( adam.getClass(set) )
            .equal( "Set" );
        for (nI = 0; nI < nL; nI++) {
            key = keyList[nI];
            expect( set.has(key) )
                .equal( true );
        }
        expect( set.size )
            .equal( nL );
    }
        
    function checkValue(value, expectedValue) {
        switch (adam.getClass(value)) {
            case "Map":
                checkMap(value, expectedValue);
                break;
            case "Set":
                checkSet(value, expectedValue);
                break;
            default:
                expect( value )
                    .eql( expectedValue );
        }
    }

    function inc(data) {
        /*jshint laxbreak:true*/
        var settings = data.settings,
            update = "update" in settings
                ? settings.update
                : 1;
        return data.value + update;
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
    
    
    describe(".isMap", function() {
        var isMap = adam.isMap;
        
        function checkTrue(value, bWeak) {
            /*jshint unused:vars*/
            expect( isMap.apply(null, arguments) )
                .equal(true);
        }
        
        function checkFalse(value, bWeak) {
            /*jshint unused:vars*/
            expect( isMap.apply(null, arguments) )
                .equal(false);
        }
        
        describe(".isMap(value)", function() {
            it("should return true", function() {
                checkTrue(new Map());
                checkTrue(new Map([[1, "a"], [parent, "b"]]));
            });

            it("should return false", function() {
                checkFalse(new Set());
                checkFalse(new WeakMap());
                checkFalse(child);
                checkFalse(false);
                checkFalse(adam);
            });
        });
        
        describe(".isMap(value, bWeak)", function() {
            it("should return true", function() {
                checkTrue(new Map(), true);
                checkTrue(new Map([[1, "a"], [parent, "b"]]), true);
                checkTrue(new Map([[1, "a"], [parent, "b"]]), false);
                checkTrue(new WeakMap([[parent, "a"], [child, "b"]]), true);
            });

            it("should return false", function() {
                checkFalse(new Set(), true);
                checkFalse(child, true);
                checkFalse(false, true);
                checkFalse(adam, true);
                checkFalse(new WeakMap(), false);
            });
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
            
            if (testSymbols) {
                it("should return quantity of all fields of object (including symbol property keys and keys from prototype chain)", function() {
                    expect( getSize(testProto) )
                        .equal(11);
                    
                    expect( getSize(testObj) )
                        .equal(15);
                });
            }

            it("should return quantity of all keys of map", function() {
                expect( getSize(new Map([[1, 1], [parent, child], ["some", null]])) )
                    .equal(3);
                
                expect( getSize(new Map()) )
                    .equal(0);
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
                expect( getSize(new Map([[1, 1], [parent, child], ["some", ""]]), {filter: ["odd", "string"], filterConnect: "or"}) )
                    .equal(2);
            });
            
            if (testSymbols) {
                it("should return quantity of fields corresponding to given filter (including symbol property keys)", function() {
                    expect( getSize(testProto, {filter: "number"}) )
                        .equal(4);
                    
                    expect( getSize(testObj, {filter: ["number", "symbol"], filterConnect: "or"}) )
                        .equal(4);
                });
            }
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
                expect( isSizeMore(new Map([[1, 1], [parent, child], [null, false]]), 2) )
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
                expect( isSizeMore(new Map([[1, 1], [parent, child], [null, false]]), 3) )
                    .be["false"];
            });
            
            if (testSymbols) {
                it("should check whether object has more fields than given value (including symbol property keys)", function() {
                    /*jshint expr:true*/
                    expect( isSizeMore(testProto, 10) )
                        .be["true"];
                    expect( isSizeMore(testProto, 20) )
                        .be["false"];
                    expect( isSizeMore(testObj, 12) )
                        .be["true"];
                    expect( isSizeMore(testObj, 15) )
                        .be["false"];
                });
            }
        });
        
        describe("isSizeMore(obj, nQty, settings)", function() {
            it("should return true (obj has more filtered fields than nQty)", function() {
                /*jshint expr:true*/
                expect( isSizeMore(grandchild, 3, {filter: "string"}) )
                    .be["true"];
                expect( isSizeMore(child, 2, {filter: ["odd", "string"], filterConnect: "or"}) )
                    .be["true"];
                expect( isSizeMore(new Map([["a", false], [1, 2], [false, true], [child, true]]), 2, {filter: "boolean"}) )
                    .be["true"];
            });
            
            it("should return false (obj has less filtered fields than nQty)", function() {
                /*jshint expr:true*/
                expect( isSizeMore(child, 4, {filter: "integer"}) )
                    .be["false"];
                expect( isSizeMore(child, 3, {filter: ["even", "null"], filterConnect: "or"}) )
                    .be["false"];
                expect( isSizeMore(new Map([["a", false], [1, "2"], [child, true]]), 1, {filter: "string"}) )
                    .be["false"];
            });
            
            if (testSymbols) {
                it("should check whether object has more filtered fields than given value (including symbol property keys)", function() {
                    /*jshint expr:true*/
                    expect( isSizeMore(testProto, 1, {filter: "positive"}) )
                        .be["true"];
                    expect( isSizeMore(testProto, 9, {filter: ["string", "own"], filterConnect: "and"}) )
                        .be["false"];
                    expect( isSizeMore(testObj, 7, {filter: ["string", "symbol", "null"], filterConnect: "or"}) )
                        .be["true"];
                    expect( isSizeMore(testObj, 1, {filter: ["symbol", "own"], filterConnect: "and"}) )
                        .be["false"];
                });
            }
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
            check(new Map());
            check(new Set());
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
            check(new Map([["a1", "b2"], ["c3", "d4"]]));
            check(new Set([1, 2, null, false]));
        });
        
        if (testSymbols) {
            it("should return false if object has symbol property keys", function() {
                var obj = {};
                obj[symA] = 1;
                expect( isEmpty(obj) )
                    .equal(false);
            });
        }
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
            check(new Map(), "empty");
            check(new Set(), "empty");
            check(-893.217, "numeric");
            check("-27891.09873", "numeric");
            check("5.92e4", "numeric");
            check("-0.34534e-2", "numeric");
            
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
            check(false, "!numeric");
            check(".9e", "!numeric");
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
            check(new Map([[1, 2]]), "empty");
            check(new Set([false]), "empty");
            check([1, 2, 3], "Object");
            check(Math, "Object");
            check(true, "numeric");
            check(NaN, "numeric");
            check("3.2a", "numeric");
            
            check(1, "!integer");
            check(Math.PI, "!real");
            check(0, "!number");
            check("", "!empty");
            check(undef, "!false");
            check("7.7e+7", "!numeric");
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
                checkTrue(new Map([["a", new Set()]]), "a", adam.isEmpty);
                checkTrue(new Set(["a", ""]), "", adam.isEmpty);
                checkTrue(adam, "isEmpty", function(value, field, obj) {
                    /*jshint unused:vars*/
                    return /^is/i.test(field);
                });
                checkTrue({a: 1, b: 2, c: 3}, "b", function(value, field, obj) {
                    return adam.isSizeMore(obj, value);
                });
                checkTrue(
                    {a: 1, b: 2, c: 3},
                    "b",
                    function(value, field, obj, settings) {
                        return value >= settings.min;
                    },
                    {
                        min: 2
                    }
                );
            });
            
            it("should return false", function() {
                checkFalse({a: null, b: 4}, "b", adam.isEmpty);
                checkFalse(new Map([["a", new Set([1, 2, 3])]]), "a", adam.isEmpty);
                checkFalse(new Set(["a", 2, false]), 2, adam.isEmpty);
                checkFalse(adam, "getSize", function(value, field, obj) {
                    /*jshint unused:vars*/
                    return /^is/i.test(field);
                });
                checkFalse({a: 1, b: 2, c: 3}, "c", function(value, field, obj) {
                    return adam.isSizeMore(obj, value);
                });
                checkFalse(
                    {a: 1, b: 2, c: 3},
                    "c",
                    function(value, field, obj, settings) {
                        return value > settings.min || field === settings.exception;
                    },
                    {
                        min: 10,
                        exception: "b"
                    }
                );
            });
        });
        
        describe("checkField(obj, field, regexp)", function() {
            var obj = {
                a: null,
                b: 4,
                toString: function toString() {
                    return "some value";
                }
            };
            
            it("should return true", function() {
                checkTrue(obj, "a", /^nu/);
                checkTrue(obj, "b", /\d/);
                checkTrue(new Map([["c", "a 3"]]), "c", /\d/);
                checkTrue(new Set(["c", "a 3"]), "a 3", /\d/);
                checkTrue(new Set(["c", obj, true]), obj, /val/);

                if (testSymbols) {
                    checkTrue(testObj, symB, /sym/);
                }
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", /^\s/);
                checkFalse(obj, "b", /[a-z]/);
                checkFalse(new Map([["c", "a 3"]]), "c", /xyz/);
                checkFalse(new Set(["c", 5, "a 3"]), 5, /xyz/);
                checkFalse(new WeakSet([testObj, obj, child]), obj, /no/);

                if (testSymbols) {
                    checkFalse(testObj, "symD", /sym/);
                }
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
                checkTrue(new Map([["a", 1]]), "a", "own");
                checkTrue(new WeakMap([[obj, 2]]), child, "!own");
                checkTrue(new Set(["a", 1]), 1, "own");
                checkTrue(new Set(["a", 1]), true, "!own");
                checkTrue(new WeakSet([child, parent, grandchild]), parent, "own");
            });
            
            it("should return false", function() {
                checkFalse(child, "a", "own");
                checkFalse(obj, "toString", "own");
                checkFalse(obj, "b", "!own");
                checkFalse(obj, "a", "object");
                checkFalse(new Map([["a", 1]]), "no", "own");
                checkFalse(new WeakMap([[obj, 2]]), obj, "!own");
                checkFalse(new Set(["a", false, null]), true, "own");
                checkFalse(new Set(["a", false, null]), false, "!own");
                checkFalse(new WeakSet([child, parent, grandchild]), obj, "own");
                checkFalse(new WeakSet([child, parent, grandchild]), null, "own");
                checkFalse(new WeakSet([child, parent, grandchild]), "child", "own");
            });
        });
        
        describe("checkField(obj, field, {field: ...})", function() {
            var obj = {a: null, b: 4, check: checkField};
            
            it("should return true", function() {
                checkTrue(obj, "check", {field: /^che/});
                checkTrue(obj, "b", {field: {value: "b"}});
                
                if (testSymbols) {
                    checkTrue(testObj, "d", {field: "string"});
                    checkTrue(testObj, symA, {field: "symbol"});
                }
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", {field: /\d/});
                checkFalse(obj, "b", {field: "symbol"});
                
                if (testSymbols) {
                    checkFalse(testObj, symB, {field: "string"});
                    checkFalse(testObj, "iValue", {field: "positive"});
                }
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
        
        describe("checkField(obj, field, {inside: ...})", function() {
            var obj = {a: 1, b: 2, c: -3, d: "data", e: false, f: null, g: "test"};
            
            describe("checkField(obj, field, {inside: <array>})", function() {
                it("should return true", function() {
                    checkTrue(obj, "a", {inside: [0, -4, 1, 5]});
                    checkTrue(obj, "d", {inside: ["input", "data", "end"]});
                });
                
                it("should return false", function() {
                    checkFalse(obj, "c", {inside: [3, null, false, "abc"]});
                    checkFalse(obj, "d", {inside: ["number", "empty"]});
                });
            });
            
            describe("checkField(obj, field, {inside: <set>})", function() {
                var dataSet = new Set([
                    0, -4, 1, "b2", 5, 2, -8, false, "input", new Date(), "data", {a: -3}, "end"
                ]);

                it("should return true", function() {
                    checkTrue(obj, "b", {inside: dataSet});
                    checkTrue(obj, "d", {inside: dataSet});
                    checkTrue(obj, "e", {inside: dataSet});
                });
                
                it("should return false", function() {
                    checkFalse(obj, "c", {inside: dataSet});
                    checkFalse(obj, "f", {inside: dataSet});
                    checkFalse(obj, "g", {inside: dataSet});
                });
            });
            
            describe("checkField(obj, field, {inside: <string>})", function() {
                it("should return true", function() {
                    checkTrue(obj, "a", {inside: "alfa-1"});
                    checkTrue(obj, "d", {inside: "data set"});
                    checkTrue(obj, "g", {inside: "This is a test string."});
                });
                
                it("should return false", function() {
                    checkFalse(obj, "c", {inside: "123"});
                    checkFalse(obj, "f", {inside: "nul"});
                });
            });
            
            describe("checkField(obj, field, {inside: <map>...})", function() {
                var dataMap = new Map([
                    ["a", 0],
                    ["b", 2],
                    ["by", "name"],
                    ["d", true],
                    ["f", null],
                    ["end", "test"],
                    ["mega", "data"],
                    ["z", -3]
                ]);

                describe("checkField(obj, field, {inside: <map>})", function() {
                    it("should return true", function() {
                        checkTrue(obj, "b", {inside: dataMap});
                        checkTrue(obj, "c", {inside: dataMap});
                        checkTrue(obj, "d", {inside: dataMap});
                        checkTrue(obj, "f", {inside: dataMap});
                        checkTrue(obj, "g", {inside: dataMap});
                    });
                    
                    it("should return false", function() {
                        checkFalse(obj, "a", {inside: dataMap});
                        checkFalse(obj, "e", {inside: dataMap});
                    });
                });
                
                describe("checkField(obj, field, {inside: <map>, key: true})", function() {
                    it("should return true", function() {
                        checkTrue(obj, "b", {inside: dataMap, key: true});
                        checkTrue(obj, "f", {inside: dataMap, key: true});
                    });
                    
                    it("should return false", function() {
                        checkFalse(obj, "c", {inside: dataMap, key: true});
                        checkFalse(obj, "d", {inside: dataMap, key: true});
                        checkFalse(obj, "???", {inside: dataMap, key: true});
                    });
                });
                
                describe("checkField(obj, field, {inside: <map>, key: <field>})", function() {
                    it("should return true", function() {
                        checkTrue(obj, "c", {inside: dataMap, key: "z"});
                        checkTrue(obj, "d", {inside: dataMap, key: "mega"});
                        checkTrue(obj, "g", {inside: dataMap, key: "end"});
                    });
                    
                    it("should return false", function() {
                        checkFalse(obj, "b", {inside: dataMap, key: "by"});
                        checkFalse(obj, "e", {inside: dataMap, key: "f"});
                        checkFalse(obj, "???", {inside: dataMap, key: "xyz"});
                    });
                });
            });
            
            describe("checkField(obj, field, {inside: <object>...})", function() {
                var dataObj = {
                    a: 0,
                    b: 2,
                    by: "name",
                    d: true,
                    f: null,
                    end: "test",
                    mega: "data",
                    z: -3
                };

                describe("checkField(obj, field, {inside: <object>})", function() {
                    it("should return true", function() {
                        checkTrue(obj, "b", {inside: dataObj});
                        checkTrue(obj, "c", {inside: dataObj});
                        checkTrue(obj, "d", {inside: dataObj});
                        checkTrue(obj, "f", {inside: dataObj});
                        checkTrue(obj, "g", {inside: dataObj});
                    });
                    
                    it("should return false", function() {
                        checkFalse(obj, "a", {inside: dataObj});
                        checkFalse(obj, "e", {inside: dataObj});
                    });
                });
                
                describe("checkField(obj, field, {inside: <object>, key: true})", function() {
                    it("should return true", function() {
                        checkTrue(obj, "b", {inside: dataObj, key: true});
                        checkTrue(obj, "f", {inside: dataObj, key: true});
                    });
                    
                    it("should return false", function() {
                        checkFalse(obj, "c", {inside: dataObj, key: true});
                        checkFalse(obj, "d", {inside: dataObj, key: true});
                        checkFalse(obj, "???", {inside: dataObj, key: true});
                    });
                });
                
                describe("checkField(obj, field, {inside: <object>, key: <field>})", function() {
                    it("should return true", function() {
                        checkTrue(obj, "c", {inside: dataObj, key: "z"});
                        checkTrue(obj, "d", {inside: dataObj, key: "mega"});
                        checkTrue(obj, "g", {inside: dataObj, key: "end"});
                    });
                    
                    it("should return false", function() {
                        checkFalse(obj, "b", {inside: dataObj, key: "by"});
                        checkFalse(obj, "e", {inside: dataObj, key: "f"});
                        checkFalse(obj, "???", {inside: dataObj, key: "xyz"});
                    });
                });
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
                checkTrue(obj, "b", ["integer", /3$/, {inside: [1, 12, 123, 1234, 12345]}]);
                checkTrue(obj, "c", ["Number", "!integer", /^3/]);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", ["own", "string", /^5/]);
                checkFalse(obj, "b", [/2/, "real"]);
                checkFalse(obj, "b", [/2/, {inside: [1, 2, 11, 12, 21, 22]}, "positive"]);
                checkFalse(child, "a", [/\d/, "number", "own"]);
                checkFalse(obj, "c", ["number", {or: ["integer", "negative"]}]);
            });
        });
        
        describe("checkField(obj, field, [list, of, filters], {filterConnect: 'or'})", function() {
            var obj = {a: "field value", b: 123, c: null, d: ""},
                settings = {filterConnect: "or"};
            
            it("should return true", function() {
                checkTrue(obj, "a", ["!own", "number", /a/], settings);
                checkTrue(obj, "b", ["real", /2/, {inside: [1, 2, 3]}], settings);
                checkTrue(obj, "c", ["integer", "false"], settings);
                checkTrue(obj, "d", [0, null, "empty"], settings);
            });
            
            it("should return false", function() {
                checkFalse(obj, "a", ["!own", "!string", /^\d/, {inside: "1800-1815"}], settings);
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
    
    describe(".checkValue", function() {
        var checkValue = adam.checkValue;
        
        function checkTrue(obj, field, filter, settings) {
            /*jshint unused:vars*/
            expect( checkValue.apply(null, arguments) )
                .equal(true);
        }
        
        function checkFalse(obj, field, filter, settings) {
            /*jshint unused:vars*/
            expect( checkValue.apply(null, arguments) )
                .equal(false);
        }
        
        describe("checkValue(value, filter)", function() {
            it("should return true", function() {
                checkTrue(1, "number");
                checkTrue(true, "boolean");
                checkTrue([1], "Array");
                checkTrue(new Map(), "Map");
                checkTrue(parent, "object");
                checkTrue(parent, "!empty");
                checkTrue(14, ["positive", /4/, {inside: [-3, 5, 14, false, 8]}]);
            });
            
            it("should return false", function() {
                checkFalse("", ["string", "!empty"]);
                checkFalse(parent, "Array");
                checkFalse(new Set(), /null/);
                checkFalse("at", ["string", {inside: "somewhere in the universe"}, {inside: ["in", "to", "at"]}]);
            });
        });

        describe("checkValue(value, filter, {filterConnect: 'or'})", function() {
            var settings = {filterConnect: "or"};
            
            it("should return true", function() {
                checkTrue(1, "number", settings);
                checkTrue(true, ["boolean"], settings);
                checkTrue(14, ["negative", /4/, {inside: [-3, 5, false, 8]}], settings);
                checkTrue("at", [{inside: "somewhere in the universe"}, {inside: ["in", "to", "at"]}], settings);
            });
            
            it("should return false", function() {
                checkFalse(57, ["string", "empty"], settings);
                checkFalse("at", [/\d/, {inside: "somewhere in the universe"}], settings);
            });
        });
    });

    
    describe("getKeys(value)", function() {
        var getKeys = adam.getKeys;

        function check(value, expected) {
            expect( getKeys(value) )
                .eql( arguments.length > 1 ? expected : null );
        }

        it("should return key list", function() {
            var list = new Array(5);
            list[1] = child;
            list[3] = "value";
            check({a: 1, b: 2}, ["a", "b"]);
            check(["a", "b", 8], ["0", "1", "2"]);
            check(list, ["1", "3"]);
            check(new Map([["a", false], [parent, child]]), ["a", parent]);
            check(new Set(["a", false, child, null]), ["a", false, child, null]);
        });
        
        it("should return null", function() {
            check("at");
            check(5);
            check(true);
            check(false);
            check(null);
            check(undef);
        });
    });

    
    describe(".getFields", function() {
        var getFields = adam.getFields;
        
        describe("getFields(obj)", function() {
            it("should return array of all fields of object (including prototype chain)", function() {
                var list;
                
                list = getFields({});
                expect( list )
                    .eql([]);
                expect( list )
                    .length(0);
                
                expect( getFields({fld: function() {}}) )
                    .eql(["fld"]);
                /*jshint ignore:start*/
                expect( getFields(new Boolean(false)) )
                    .eql([]);
                expect( getFields(new Object()) )
                    .eql([]);
                /*jshint ignore:end*/
                
                list = getFields(parent);
                expect( list )
                    .include("a")
                    .and.include("b")
                    .and.include("c");
                expect( list )
                    .length(3);
                
                list = getFields(child);
                expect( list )
                    .include("a")
                    .and.include("b")
                    .and.include("c")
                    .and.include("d")
                    .and.include("e");
                expect( list )
                    .length(5);
                
                list = getFields(grandchild);
                expect( list )
                    .include("a")
                    .and.include("b")
                    .and.include("c")
                    .and.include("d")
                    .and.include("e")
                    .and.include("f")
                    .and.include("g");
                expect( list )
                    .length(7);
            });
            
            if (testSymbols) {
                it("should return array of all fields of object (including symbol property keys and keys from prototype chain)", function() {
                    var proto = Object.create(child),
                        obj = Object.create(proto),
                        symA = Symbol("A"),
                        symB = Symbol("B"),
                        symC = Symbol("symbol c");
                    proto.pro = "super";
                    proto[symA] = 1;
                    proto[symC] = "final";
                    obj[symB] = symA;
                    obj.d = null;
                    obj.b = undef;
                    obj.omega = "333";
                    
                    checkArray(getFields,
                                [obj],
                                ["a", "b", "c", "d", "e", "pro", symA, symC, symB, "omega"]);
                });
            }

            it("should return array of all keys of map", function() {
                checkArray(
                    getFields,
                    [new Map([["a", 1], [null, true], [child, false]])],
                    ["a", null, child]
                );
                checkArray(
                    getFields,
                    [new Map()],
                    []
                );
            });
        });
        
        describe("getFields(obj, settings)", function() {
            it("should return array of object's fields conforming to the given filter", function() {
                checkArray(getFields,
                            [child, {filter: "odd"}],
                            ["a", "e"]);
                checkArray(getFields,
                            [child, {filter: ["own", "string"], filterConnect: "and"}],
                            ["c"]);
                checkArray(getFields,
                            [child, {filter: ["even", "string"], filterConnect: "or"}],
                            ["b", "c", "d"]);
                checkArray(getFields,
                            [grandchild, {filter: ["!own", /\d/], filterConnect: "and"}],
                            ["b", "d", "e"]);
                checkArray(
                    getFields,
                    [
                        new Map([
                            ["a", "some"],
                            ["b", null],
                            [child, 2],
                            [null, ""],
                            [parent, 1]
                        ]),
                        {filter: ["even", "string"], filterConnect: "or"}
                    ],
                    ["a", child, null]
                );
                checkArray(
                    getFields,
                    [
                        new Map([
                            ["a", "some"],
                            ["b", null],
                            [child, 2],
                            [null, ""],
                            [parent, 1]
                        ]),
                        {filter: {field: "object"}}
                    ],
                    [child, parent]
                );

                if (testSymbols) {
                    checkArray(
                        getFields,
                        [
                            new Map([
                                ["a", "some"],
                                [symC, "symC"],
                                ["b", null],
                                [symD, parent],
                                [child, 2],
                                [null, ""],
                                [grandchild, 1],
                                [symA, symB]
                            ]),
                            {filter: [{field: "object"}, {field: "symbol"}], filterConnect: "or"}
                        ],
                        [symC, symD, child, grandchild, symA]
                    );
                }
            });
            
            it("should return array of object's fields with length not exceeding given limit", function() {
                checkArray(getFields,
                            [child, {limit: 3}],
                            ["c", "d", "e"]);
                checkArray(getFields,
                            [grandchild, {filter: "number", limit: 2}],
                            ["d", "e"]);
                checkArray(getFields,
                            [grandchild, {filter: ["own", "string"], filterConnect: "or", limit: 10}],
                            ["a", "c", "f", "g"]);
                checkArray(
                    getFields,
                    [
                        new Map([
                            ["a", "some"],
                            ["b", null],
                            [child, 2],
                            [null, ""],
                            [parent, 1]
                        ]),
                        {filter: "empty", limit: 1}
                    ],
                    ["b"]
                );
            });
            
            it("should return array of field-value pairs conforming to the given filter and/or limit", function() {
                checkArray(getFields,
                            [child, {limit: 2, pairs: true}],
                            [{key: "c", value: "abc"}, {key: "d", value: 4}]);
                checkArray(getFields,
                            [child, {filter: "odd", pairs: "list"}],
                            [["e", 5], ["a", 1]]);
                checkArray(getFields,
                            [child, {filter: ["!own", "even"], filterConnect: "or", pairs: "list"}],
                            [["d", 4], ["a", 1], ["b", 2]]);
                checkArray(getFields,
                            [child, {filter: ["!own", "even"], filterConnect: "or", limit: 2, pairs: "list"}],
                            [["d", 4], ["a", 1]]);
                checkArray(getFields,
                            [child, {filter: "odd", pairs: {}}],
                            [{key: "e", value: 5}, {key: "a", value: 1}]);
                checkArray(getFields,
                            [grandchild, {filter: "number", limit: 2, pairs: {type: "some"}}],
                            [{key: "d", value: 4}, {key: "e", value: 5}]);
                checkArray(getFields,
                            [grandchild, {filter: "number", limit: 2, pairs: {form: "object", key: "f"}}],
                            [{f: "d", value: 4}, {f: "e", value: 5}]);
                checkArray(getFields,
                            [grandchild, {filter: "number", pairs: {type: "o", key: "f", value: "v"}}],
                            [{f: "d", v: 4}, {f: "e", v: 5}, {f: "b", v: 2}]);
                checkArray(getFields,
                            [grandchild, {filter: ["!own", "string"], filterConnect: "or", limit: 5, pairs: {type: "list"}}],
                            [["a", "a"], ["c", "C++"], ["f", "field"], ["g", "gnome"], ["d", 4]]);
                checkArray(getFields,
                            [grandchild, {filter: ["own", "number"], filterConnect: "or", limit: 10, pairs: {type: "list"}}],
                            [["a", "a"], ["c", "C++"], ["f", "field"], ["g", "gnome"], ["d", 4], ["e", 5], ["b", 2]]);
                checkArray(
                    getFields,
                    [
                        new Map([
                            ["a", "some"],
                            ["b", null],
                            [child, 2],
                            [null, ""],
                            [parent, 1]
                        ]),
                        {filter: "empty", pairs: true}
                    ],
                    [{key: "b", value: null}, {key: null, value: ""}]
                );
                checkArray(
                    getFields,
                    [
                        new Map([
                            ["a", "some"],
                            ["b", null],
                            [child, 2],
                            [null, ""],
                            [parent, 1]
                        ]),
                        {filter: ["empty", "number"], filterConnect: "or", limit: 3, pairs: "list"}
                    ],
                    [["b", null], [child, 2], [null, ""]]
                );
            });
            
            if (testSymbols) {
                it("should return array of object's fields conforming to the given settings (including symbol property keys)", function() {
                    checkArray(getFields,
                                [testObj, {filter: ["symbol", "own"], filterConnect: "and"}],
                                [symB]);
                    
                    checkArray(getFields,
                                [testObj, {filter: ["symbol", /^sym/], filterConnect: "or"}],
                                ["symD", symB, "h"]);
                    
                    checkArray(getFields,
                                [testObj, {filter: ["positive", "false", /sym/], filterConnect: "or"}],
                                ["b", "d", "e", "h", "pro", symB, "iValue"]);
                    
                    checkArray(getFields,
                                [testObj, {filter: "symbol", limit: 1}],
                                [symB]);
                    
                    checkArray(getFields,
                                [testObj, {filter: ["symbol", "number"], filterConnect: "or", limit: 4}],
                                [symB, "iValue", "symD", "e"]);
                    
                    checkArray(getFields,
                                [testObj, {filter: ["symbol", "number"], filterConnect: "or", limit: 3}],
                                [symB, "iValue", "symD"]);
                    
                    checkArray(getFields,
                                [testObj, {filter: {field: "symbol"}}],
                                [symA, symB, symC]);
                    
                    checkArray(getFields,
                                [testObj, {filter: [{field: "symbol"}, "!own"]}],
                                [symC]);
                    
                    checkArray(getFields,
                                [testObj, {filter: ["symbol", "number"], filterConnect: "or", limit: 5, pairs: "list"}],
                                [[symB, symA], ["iValue", 789], ["symD", symD], ["e", 5]]);
                });
            }
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
            
            it("should return map's key for the specified value", function() {
                expect( getValueKey(new Map([[parent, child], ["some", "value"]]), child) )
                    .equal(parent);
                expect( getValueKey(new Map([["a", child], ["some", child]]), child) )
                    .equal("a");
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
                
                expect( getValueKey(new Map([[parent, null], [child, parent]]), child) )
                    .be["null"];
                expect( getValueKey(new Map(), "a") )
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
            
            it("should return array of map's keys having the specified value", function() {
                expect( getValueKey(new Map([[123, 1], [false, 2], [parent, 1]]), 1, true) )
                    .eql([123, parent]);
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
                
                expect( getValueKey(new Map([["a", false], [parent, null], [1, 2]]), "", true) )
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

            it("should return array of all values of map", function() {
                checkArray(
                    getValues,
                    [
                        new Map([
                            [1, parent],
                            ["2", child],
                            [null, 3],
                            [grandchild, true]
                        ])
                    ],
                    [parent, child, 3, true]
                );
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

            it("should return array of map's values conforming to the given filter", function() {
                checkArray(
                    getValues,
                    [
                        new Map([
                            [1, parent],
                            ["2", child],
                            [null, 3],
                            [grandchild, true]
                        ]),
                        {filter: "object"}
                    ],
                    [parent, child]
                );
            });
        });
    });

    
    describe(".getFreeField", function() {
        var getFreeField = adam.getFreeField,
            obj = {a5: 5, a2: "adfs", a3: "---", b3: 3, b4: "some", b0: "build best", b: "To be, or not to be: that's the question", c: 0, d1: 120, d2: new Date()},
            map = getTestMap();
        
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

            it("should return field name 'f<number>' so that there are no such key in map", function() {
                expect( getFreeField(new Map()) )
                    .equal("f0");
                expect( getFreeField(new Map([[parent, child]])) )
                    .equal("f0");
                expect( getFreeField(new Map([["f4", "child"]])) )
                    .equal("f0");
                expect( getFreeField(new Map([["f0", 0], ["f1", 7]]), {prefix: null}) )
                    .equal("f2");
                expect( getFreeField(new Map([["a", 1], ["f2", 5], ["b", 0], ["f0", 2]]), {prefix: {}, startNum: false}) )
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

            it("should return field name sPrefix + '<number>' so that there are no such key in map", function() {
                expect( getFreeField(new Map(), {prefix: "abc"}) )
                    .equal("abc0");
                expect( getFreeField(new Map([["f3", 6]]), {prefix: "abc"}) )
                    .equal("abc0");
                expect( getFreeField(new Map([["f3", 6]]), {prefix: "f"}) )
                    .equal("f0");
                expect( getFreeField(new Map([["f0", 0], ["$$$0", 1], ["$$$12", 12]]), {prefix: "$$$"}) )
                    .equal("$$$1");
                expect( getFreeField(new Map([[0, "a"], ["1", "b"]]), {prefix: ""}) )
                    .equal("0");
                expect( getFreeField(new Map([["0", "a"], ["1", "b"]]), {prefix: ""}) )
                    .equal("2");
                expect( getFreeField(new Map(), {prefix: "size", startNum: null}) )
                    .equal("size0");
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

            it("should return field name sPrefix + '<number>' so that there are no such key in map (search is started from sPrefix + nStartNum)", function() {
                expect( getFreeField(map, {prefix: "a", startNum: 5}) )
                    .equal("a6");
                expect( getFreeField(map, {prefix: "a", startNum: 1}) )
                    .equal("a1");
                expect( getFreeField(map, {prefix: "a", startNum: 2}) )
                    .equal("a4");
                expect( getFreeField(map, {prefix: "b", startNum: 1}) )
                    .equal("b1");
                expect( getFreeField(map, {prefix: "b", startNum: 3}) )
                    .equal("b5");
                expect( getFreeField(map, {prefix: "c", startNum: 0}) )
                    .equal("c0");
                expect( getFreeField(map, {prefix: "c", startNum: 8}) )
                    .equal("c8");
                expect( getFreeField(map, {prefix: "d", startNum: 1}) )
                    .equal("d3");
                expect( getFreeField(map, {prefix: "d", startNum: 100}) )
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

            it("should return field name <sPrefix>[<number>] so that there are no such key in map (search is started from sPrefix)", function() {
                expect( getFreeField(map, {prefix: "", startNum: false, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(map, {prefix: "", startNum: 0, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(map, {prefix: "", startNum: 1, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(map, {prefix: "", startNum: 10, checkPrefix: true}) )
                    .equal("");
                expect( getFreeField(map, {prefix: "a", startNum: false, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(map, {prefix: "a", startNum: 0, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(map, {prefix: "a", startNum: 1, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(map, {prefix: "a", startNum: 100, checkPrefix: true}) )
                    .equal("a");
                expect( getFreeField(map, {prefix: "b", startNum: null, checkPrefix: true}) )
                    .equal("b1");
                expect( getFreeField(map, {prefix: "b", startNum: 0, checkPrefix: true}) )
                    .equal("b1");
                expect( getFreeField(map, {prefix: "b", startNum: 1, checkPrefix: true}) )
                    .equal("b1");
                expect( getFreeField(map, {prefix: "b", startNum: 2, checkPrefix: true}) )
                    .equal("b2");
                expect( getFreeField(map, {prefix: "b", startNum: 3, checkPrefix: true}) )
                    .equal("b5");
                expect( getFreeField(map, {prefix: "b", startNum: 100, checkPrefix: true}) )
                    .equal("b100");
                expect( getFreeField(map, {prefix: "c", startNum: "", checkPrefix: true}) )
                    .equal("c0");
                expect( getFreeField(map, {prefix: "c", startNum: 0, checkPrefix: true}) )
                    .equal("c0");
                expect( getFreeField(map, {prefix: "c", startNum: 1, checkPrefix: true}) )
                    .equal("c1");
                expect( getFreeField(map, {prefix: "c", startNum: 7, checkPrefix: true}) )
                    .equal("c7");
                expect( getFreeField(map, {prefix: "d", startNum: undef, checkPrefix: true}) )
                    .equal("d");
                expect( getFreeField(map, {prefix: "d", startNum: 0, checkPrefix: true}) )
                    .equal("d");
                expect( getFreeField(map, {prefix: "d", startNum: 1, checkPrefix: true}) )
                    .equal("d");
                expect( getFreeField(map, {prefix: "d", startNum: 2, checkPrefix: true}) )
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

            it("should return array from 2 correct maps", function() {
                var result = split(
                    new Map([
                        ["a", 1],
                        [parent, child],
                        ["b", false],
                        [null, true],
                        [4, adam]
                    ]),
                    [parent, null]
                );
                
                checkMap(
                    result[0],
                    new Map([
                        [parent, child],
                        [null, true]
                    ])
                );
                checkMap(
                    result[1],
                    new Map([
                        ["a", 1],
                        ["b", false],
                        [4, adam]
                    ])
                );
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

            it("should return array from 2 correct maps", function() {
                var result = split(
                    new Map([
                        ["a", 1],
                        [parent, child],
                        ["b", false],
                        [null, true],
                        [4, adam]
                    ]),
                    null,
                    {
                        filter: ["boolean", {field: "string"}],
                        filterConnect: "or"
                    }
                );
                
                checkMap(
                    result[0],
                    new Map([
                        ["a", 1],
                        ["b", false],
                        [null, true]
                    ])
                );
                checkMap(
                    result[1],
                    new Map([
                        [parent, child],
                        [4, adam]
                    ])
                );
            });
        });
    });

    
    describe(".fromArray", function() {
        var fromArray = adam.fromArray,
            isMap = adam.isMap,
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
                },
                new Map([
                    ["id", 8],
                    ["name", "History"],
                    ["quantity", 33]
                ]),
                new Map([
                    ["id", 9],
                    ["name", "Serial"],
                    ["quantity", 9]
                ])
            ];
        
        function getCategoryListCopy() {
            var result = categoryList.slice(0),
                nL = result.length,
                copy, item, nI, sKey;
            for (nI = 0; nI < nL; nI++) {
                item = result[nI];
                if (isMap(item)) {
                    copy = new Map( Array.from(item.entries()) );
                }
                else {
                    copy = {};
                    for (sKey in item) {
                        copy[sKey] = item[sKey];
                    }
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
                key = sField
                    ? (isMap(item)
                        ? item.get(sField)
                        : item[sField]
                    )
                    : item;
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
                function getKey(source, target, index, settings) {
                    /*jshint unused:vars*/
                    var bMap = isMap(source),
                        sName = bMap ? source.get("name") : source.name,
                        nQty = bMap ? source.get("quantity") : source.quantity;
                    return settings.prefix + sName + " (" + nQty + ")";
                }
                var settings = {prefix: "_"},
                    obj = fromArray(categoryList, getKey, settings),
                    nL = categoryList.length,
                    item, nI;
                for (nI = 0; nI < nL; nI++) {
                    item = categoryList[nI];
                    expect(obj)
                        .have.property(getKey(item, null, nI, settings), item);
                }
            });
        });
        
        describe("fromArray(list, sField, {deleteKeyField: true})", function() {
            it("should return object whose keys are equal to values of object fields and values are objects without the key field", function() {
                var keys = [],
                    item, nI, nL, obj, sKey;
                for (nI = 0, nL = categoryList.length; nI < nL; nI++) {
                    item = categoryList[nI];
                    keys.push( String(isMap(item) ? item.get("id") : item.id) );
                }
                obj = fromArray(getCategoryListCopy(), "id", {deleteKeyField: true});
                for (sKey in obj) {
                    expect(keys)
                        .contain(sKey);
                    item = obj[sKey];
                    if (isMap(item)) {
                        expect( item.has("id") )
                            .equal( false );
                    }
                    else {
                        expect(item)
                            .not.contain.key("id");
                    }
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
                            return (isMap(item) ? item.get("quantity") : item.quantity) < 10;
                        }},
                        {
                            1: categoryList[1],
                            3: categoryList[3],
                            7: categoryList[7],
                            9: categoryList[9]
                        });
                
                test(categoryList, "name", {filter: {field: /^(?:C|D|H)/}},
                        {
                            "Drama": categoryList[1],
                            "Comedy": categoryList[3],
                            "Cartoon": categoryList[4],
                            "History": categoryList[8]
                        });
            });
        });
    });

    
    describe(".select", function() {
        var select = adam.select,
            numList = [3, -4, 7, 10, 5, 19];
        
        it("should return the first element from the passed array/set that satisfies the specified filter(s)", function() {
            expect( select("positive", [false, -10, null, "test", -3, 0, 4, adam, 5, true, numList]) )
                .equal( 4 );
            expect( select("Array", [false, null, "test", 3, numList, 5, [true], "zero"]) )
                .equal( numList );
            expect( select(function(value) {return value > 7;}, numList) )
                .equal( 10 );
            expect( select(function(value) {return value > 7;}, new Set(numList)) )
                .equal( 10 );
            expect( select(["negative", "odd"], [numList, -10, NaN, "-7", 3, 0, -4, null, -7, true, -5]) )
                .equal( -7 );
            expect( select(["negative", "odd"], [numList, 10, 0, "-7", 3, 0, -4, null, -7, true, -5], {filterConnect: "or"}) )
                .equal( 3 );
            expect( select(["negative", "odd"], new Set([numList, 10, 0, "-7", 3, 0, -4, null, -7, true, -5]), {filterConnect: "or"}) )
                .equal( 3 );
        });
        
        it("should return the last element from the passed array/set", function() {
            expect( select("negative", [false, 1, null, "test", 3, 0, 4, 5, true, numList, 8]) )
                .equal( 8 );
            expect( select("Array", [false, null, "test", undef, 3, "zero", numList]) )
                .equal( numList );
            expect( select("Array", [false, null, "test", 3, "zero"]) )
                .equal( "zero" );
            expect( select("Array", new Set([false, null, "test", 3, "zero"])) )
                .equal( "zero" );
            expect( select(function(value) {return typeof value === "boolean";}, numList) )
                .equal( numList[numList.length - 1] );
            expect( select(["negative", "odd"], [numList, 10, NaN, "-7", 3, undef, 0, -4, null, 7, true, Date]) )
                .equal( Date );
            expect( select(["negative", "odd"], new Set([numList, 10, NaN, "-7", 3, undef, 0, -4, null, 7, true, Date])) )
                .equal( Date );
            expect( select(["negative", "odd"], [numList, 10, 0, "-7", 32, 0, 4, null, 8, true], {filterConnect: "or"}) )
                .equal( true );
        });
        
        it("should return the first field from the passed object/map that satisfies the specified filter(s)", function() {
            expect( select("positive", {a: -1, b: false, c: true, d: "test", e: 5, fin: 9}) )
                .equal( 5 );
            expect( select("Array", {a: false, b: null, c: "test", d: 3, e: numList, f: 5, g: [true], h: "zero"}) )
                .equal( numList );
            expect( select(function(value) {return value > 7;}, {a: -3, b: 10, c: 20}) )
                .equal( 10 );
            expect( select(["negative", "odd"], {a: numList, b: -10, c: NaN, d: "-7", e: 3, f: 0, g: -4, h: null, i: -7, j: true, k: -5}) )
                .equal( -7 );
            expect( select(["negative", "odd"], {a: numList, b: 10, c: 0, d: "-7", e: 3, f: 0, g: -4, h: null, i: -7, j: true, k: -5}, {filterConnect: "or"}) )
                .equal( 3 );
            expect( select([{field: /[c-g]/}, "odd"], {a: numList, b: 1, c: 0, d: "-7", e: 4, f: -2, g: -1, h: null, i: -7, j: true, k: -5}) )
                .equal( -1 );
            expect( select("even", new Map([["a", false], [4, 1], ["c", 8], [false, 2]])) )
                .equal( 8 );
        });
        
        it("should return undefined", function() {
            expect( select("positive", []) )
                .equal( undef );
            expect( select(["positive", "even"], [undef, undef, undef]) )
                .equal( undef );
            expect( select("even", {a: 1, b: false, c: adam, e: -3, d: true}) )
                .equal( undef );
            expect( select(["negative", "even"], {a: 2, b: 3, c: true, d: 8}) )
                .equal( undef );
            expect( select("positive", new Map()) )
                .equal( undef );
            expect( select("positive", new Set()) )
                .equal( undef );
            expect( select("real", new Map([["a", 1], ["b", false]])) )
                .equal( undef );
        });
        
        it("should return default value specified in settings", function() {
            expect( select("negative", [false, 1, null, "test", 3, 0, 4, 5, true, numList, 8], {defaultValue: -1}) )
                .equal( -1 );
            expect( select("Array", [false, null, "test", 3, "zero"], {defaultValue: numList}) )
                .equal( numList );
            expect( select(function(value) {return typeof value === "boolean";}, numList, {defaultValue: false}) )
                .equal( false );
            expect( select(["negative", "odd"], [numList, 10, NaN, "-7", 3, undef, 0, -4, null, 7], {defaultValue: -5}) )
                .equal( -5 );
            expect( select(["negative", "odd"], [numList, 10, 0, "-7", 32, 0, 4, null, 8, true], {filterConnect: "or", defaultValue: 3}) )
                .equal( 3 );
            expect( select("even", false, {defaultValue: 8}) )
                .equal( 8 );
            expect( select("number", 1, {defaultValue: 7}) )
                .equal( 7 );
            expect( select("number", new Map([["a", true], ["b", parent]]), {defaultValue: 0}) )
                .equal( 0 );
            expect( select("object", new Set(["a", true, "b", select]), {defaultValue: child}) )
                .equal( child );
        });
        
        it("should return passed value", function() {
            expect( select("positive", -7) )
                .equal( -7 );
            expect( select("even", true) )
                .equal( true );
            expect( select("!false", false) )
                .equal( false );
            expect( select("object", null) )
                .equal( null );
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
        
        it("should remove specified elements from set", function() {
            function check(argList, expectedSet) {
                var result = remove.apply(null, argList);

                expect( result )
                    .equal( argList[0] );
                checkSet(result, expectedSet);
            }

            check(
                [
                    new Set([1, 2, 3, 4, 5]),
                    "odd"
                ],
                new Set([2, 4])
            );
            check(
                [
                    new Set(["1", 2, null, 11, -5, 0, "29", undef]),
                    ["string", "false"],
                    {filterConnect: "or"}
                ],
                new Set([2, 11, -5])
            );
        });
        
        it("should remove specified fields from object", function() {
            expect( remove({a: 1, z: 7, omega: 3, delta: 5, f: -7}, {field: /a/}) )
                .eql({z: 7, f: -7});
            expect( remove({a: "a", b: "be", c: "omega", d: 7}, [/a/, "number"], {filterConnect: "or"}) )
                .eql({b: "be"});
        });
        
        it("should remove specified keys from map", function() {
            function check(argList, expectedMap) {
                var result = remove.apply(null, argList);

                expect( result )
                    .equal( argList[0] );
                checkMap(result, expectedMap);
            }

            check(
                [
                    new Map([
                        ["a", 1],
                        ["z", 7],
                        ["omega", 3],
                        ["delta", 5],
                        ["f", -7]
                    ]),
                    {field: /a/}
                ],
                new Map([
                    ["z", 7],
                    ["f", -7]
                ])
            );
            check(
                [
                    new Map([
                        ["a", "a"],
                        ["b", "be"],
                        ["c", "omega"],
                        ["d", 7]
                    ]),
                    [/a/, "number"],
                    {filterConnect: "or"}
                ],
                new Map([
                    ["b", "be"]
                ])
            );
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
        
        it("should return empty map", function() {
            var map = new Map([["a", 1], ["b", true]]);
            expect( empty(map) )
                .equal(map);
            expect( map.size )
                .equal(0);
        });
        
        it("should return empty set", function() {
            var set = new Set(["a", 1, "b", false, null]);
            expect( empty(set) )
                .equal(set);
            expect( set.size )
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
        
        it("should return reversed set", function() {
            function check(value, expectedSet) {
                var result = reverse(value);
                expect( result )
                    .not.equal( value );
                checkSet(result, expectedSet);
            }

            check(new Set([1, null, true, adam]), new Set([adam, true, null, 1]));
            check(new Set([false]), new Set([false]));
        });
        
        it("should return reversed object", function() {
            expect( reverse(parent) )
                .eql({1: "a", 2: "b", 3: "c"});
            expect( reverse(grandchild) )
                .eql({a: "a", 2: "b", "C++": "c", 4: "d", 5: "e", field: "f", gnome: "g"});
        });
        
        it("should return reversed map", function() {
            function check(value, expectedMap) {
                var result = reverse(value);
                expect( result )
                    .not.equal( value );
                checkMap(result, expectedMap);
            }

            check(new Map([[null, 5], [adam, 2]]), new Map([[5, null], [2, adam]]));
            check(new Map([[checkSet, "set"]]), new Map([["set", checkSet]]));
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
        
        it("should return map", function() {
            function check(value, expectedMap) {
                checkMap(transform(value, "map"), expectedMap);
            }

            check("a", new Map([["a", "a"]]));
            check(5, new Map([[5, 5]]));
            check([["a", 1], ["b", 2]], new Map([["a", 1], ["b", 2]]));
            check([], new Map());
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
        
        it("should return resolved promise", function() {
            function getPromise(value, sAction) {
                return transform(value, sAction)
                    .then(function(val) {
                        expect( val )
                            .equal( value );
                    });
            }

            return Promise.all([
                getPromise("test", "promise"),
                getPromise(false, "resolve")
            ]);
        });
        
        it("should return rejected promise", function() {
            var reason = "some message";

            return transform(reason, "reject")
                .catch(function(val) {
                    expect( val )
                        .equal( reason );
                });
        });
        
        it("should reverse value", function() {
            expect( transform("adam", "reverse") )
                .equal("mada");
            expect( transform({a: 1, b: 2}, "reverse") )
                .eql({1: "a", "2": "b"});
            expect( transform(-94, "reverse") )
                .equal(94);
        });
        
        it("should return set", function() {
            function check(value, expectedSet) {
                checkSet(transform(value, "set"), expectedSet);
            }

            check("a", new Set(["a"]));
            check(false, new Set([false]));
            check(["a", 1, "b", 2], new Set(["a", 1, "b", 2]));
            check([], new Set());
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
            checkValue(result, expectedResult);
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
                check(
                    new Map([[5, 6], [1, 2], [3, 4]]),
                    new Map([[1, 2], [3, 4]]),
                    new Map([[5, 6]])
                );
                check(
                    new Set([parent, 1, 2, child, 4]),
                    new Set([1, 2, child, 4]),
                    new Set([parent])
                );
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
                check(
                    new Map([[1, 2], ["c", 0], ["d1", 120]]),
                    getTestMap(),
                    new Map([[1, 2]]),
                    {filter: ["even", /0/]}
                );
                check(
                    new Set(["a", false, "", null]),
                    new Set([1, false, "", true, [], null]),
                    new Set(["a"]),
                    {filter: "false"}
                );
            });
        });
        
        describe("copy(source, target, {transform: ...})", function() {
            it("should copy transformed fields", function() {
                check(
                    {a: 2, b: 100, c: 4, t: "eam"},
                    {a: 1, c: 3},
                    {a: 7, b: 100, t: "eam"},
                    {transform: inc}
                );
                check(
                    {a: 5, b: 100, c: 7, t: "eam"},
                    {a: 1, c: 3},
                    {a: 7, b: 100, t: "eam"},
                    {transform: inc, update: 4}
                );
                check(
                    {a: "-1", b: 100, c: "3", f: "fire"},
                    {a: -1, c: 3},
                    {a: 5, b: 100, f: "fire"},
                    {transform: "string"}
                );
                checkArray(
                    copy,
                    [
                        [1, 2, 3],
                        [1, 2, 3, 40, 50],
                        {transform: inc}
                    ],
                    [2, 3, 4, 40, 50]
                );
                check(
                    new Map([[1, 2], ["a", "false"]]),
                    new Map([["a", false]]),
                    new Map([[1, 2]]),
                    {transform: "string"}
                );
                check(
                    new Set(["a", -1, true]),
                    new Set([1, false]),
                    new Set(["a"]),
                    {transform: "reverse"}
                );
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
                check(
                    new Map([[1, 2], ["c", 1], ["d1", 121]]),
                    getTestMap(),
                    new Map([[1, 2], ["c", false]]),
                    {filter: ["even", /0/], transform: inc}
                );
                check(
                    new Set(["a", -1, "cba", false]),
                    new Set([1, false, "a", "abc", true, null]),
                    new Set(["a"]),
                    {filter: "true", transform: "reverse"}
                );
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
            checkValue(result, expectedResult);
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
            check(
                new Map([["a", 3], [parent, 0]]),
                new Map([["a", 2], [parent, -1]]),
                inc
            );

            var obj = {x: "files"};
            check(
                new Set(["", 0, obj]),
                new Set(["abc", -987, obj]),
                "empty"
            );
            expect( "x" in obj )
                .equal( false );
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
            check(
                new Map([["a5", 6], ["b3", 4]]),
                getTestMap(),
                inc,
                {filter: "odd"}
            );
            check(
                new Set(["cba", "xyz"]),
                new Set([1, "abc", false, "zyx"]),
                "reverse",
                {filter: "string"}
            );
        });
    });
});
