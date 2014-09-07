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

    
    describe(".getSize(obj)", function() {
        var getSize = adam.getSize;
        
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

    
    describe(".isSizeMore(obj, nQty)", function() {
        var isSizeMore = adam.isSizeMore;
        
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

    
    describe(".getFields(obj)", function() {
        var getFields = adam.getFields;
        
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

    
    describe(".getValues(obj)", function() {
        var getValues = adam.getValues,
            d = new Date();
        
        it("should return array of all field values of object (including prototype chain)", function() {
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

    
    describe(".split(obj, firstObjFields)", function() {
        var split = adam.split,
            date = new Date(),
            nTime = date.getTime(),
            method = function() {return nTime;},
            obj = {a: 1, b: 2, first: "first", second: "second", delta: 123, d: date, time: nTime, func: method};
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
                obj = fromArray(categoryList, "id", {deleteKeyField: true});
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
    });
});
