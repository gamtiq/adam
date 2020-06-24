# adam <a name="start"></a>

Functions to create, process and test objects/maps/arrays/sets.

[![NPM version](https://badge.fury.io/js/adam.png)](http://badge.fury.io/js/adam)
[![Build Status](https://secure.travis-ci.org/gamtiq/adam.png?branch=master)](http://travis-ci.org/gamtiq/adam)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

* [Usage](#usage)
* [Examples](#examples)
* [API](#api)
* [Related projects](#related)

## Installation

### Node

    npm install adam

### [Bower](https://bower.io)

    bower install adam

### AMD, &lt;script&gt;

Use `dist/adam.js` or `dist/adam.min.js` (minified version).

## Usage <a name="usage"></a> [&#x2191;](#start)

### Node

```js
var adam = require("adam");
```

### AMD

```js
define(["path/to/dist/adam.js"], function(adam) {
    ...
});
```

### Bower, &lt;script&gt;

```html

<!-- Use bower_components/adam/dist/adam.js if the library was installed by Bower -->

<script type="text/javascript" src="path/to/dist/adam.js"></script>
<script type="text/javascript">
    // adam is available via adam field of window object
    
    ...
</script>
```

### Examples <a name="examples"></a> [&#x2191;](#start)

```js
function inc(data) {
    return ++data.value;
}

var obj = {a: 1, b: 2, c: 3, d: 4, e: 5},
    s1 = Symbol("s1"),
    s2 = Symbol("s2"),
    proto = {a: 1},
    obj2 = Object.create(proto);

proto[s1] = "s1";
obj2.b = 2;
obj2[s2] = null;
obj2.c = "str";
obj2.d = 0;

adam.getPropertySymbols(obj2);   // [s2, s1]

adam.getClass([8]);   // "Array"
adam.getType(null);   // "null"
adam.isKindOf(17, "integer");   // true
adam.isKindOf(NaN, "!number");   // true
adam.isKindOf(".321e+2", "numeric");   // true

adam.checkField(obj, "c", ["positive", "odd"]);   // true
adam.checkField(obj, "b", ["real", /^7/], {filterConnect: "or"});   // false

adam.checkValue(-15, ["negative", /5/, {inside: [2, -7, -15, 12, 9]}]);   // true
adam.checkValue("73", [/^\d+$/, {inside: {a: 1, b: "43", c: null}}]);   // false
adam.checkValue("73", [/^\d+$/, {inside: {a: 1, b: "43", c: null}}], {filterConnect: "or"});   // true

adam.getFreeField({a5: 5, a2: 2, a7: 7, a3: 3}, {prefix: "a", startNum: 2});   // "a4"
adam.getFreeField(new Map([["a", 3], ["key", 9], ["key-1", true]]), {prefix: "key-"});   // "key-0"
adam.getFreeField(new Map([["a", 3], ["key", 9], ["key-1", true]]), {prefix: "key-", startNum: 1});   // "key-2"

adam.getSize(obj);   // 5
adam.getSize(obj, {filter: "even"});   // 2
adam.getSize(obj2, {filter: ["string", "null"], filterConnect: "or"});   // 3
adam.isSizeMore(obj, 5);   // false
adam.isSizeMore(obj2, 1, {filter: "string"});   // true
adam.isEmpty({});   // true

adam.getFields(obj);   // ["a", "b", "c", "d", "e"]
adam.getFields(obj, {filter: function(value) {return value < 4;}});   // ["a", "b", "c"]
adam.getFields(obj, {filter: {field: /^[d-h]/}});   // ["d", "e"]
adam.getFields(obj2);   // ["b", "c", "d", s2, "a", s1]
adam.getFields(obj2, {filter: ["string", "false"], filterConnect: "or"});   // ["c", "d", s2, s1]
adam.getFields(obj2, {filter: "number", limit: 2});   // ["b", "d"]
adam.getFields(obj2, {filter: {field: "symbol"}})   // [s2, s1]
adam.getFields(obj2, {filter: "number", limit: 7, pairs: true});   // [{key: "b", value: 2}, {key: "d", value: 0}, {key: "a", value: 1}]
adam.getFields(obj2, {filter: "number", pairs: "list"});   // [["b", 2], ["d", 0], ["a", 1]]
adam.getFields(new Map([[obj, 1], [obj2, false], ["c", 5]]), {filter: {field: "object"}});   // [obj, obj2]
adam.getFields(new Map([["a", 1], ["b", false], ["c", 5]]), {filter: "number", pairs: "obj"});   // [{key: "a", value: 1}, {key: "c", value: 5}]

adam.getValues(obj);   // [1, 2, 3, 4, 5]
adam.getValues(obj, {filter: {field: /a|c/}});   // [1, 3]
adam.getValues(new Map([[obj, "a"], [obj2, 2], ["obj3", 3]]), {filter: {field: "object"}});   // ["a", 2]
adam.getValueKey(obj, 3);   // "c"

adam.fromArray([{id: "a", value: 11}, {id: "b", value: 7}, {id: "c", value: 10}], "id");   // {a: {id: "a", value: 11}, b: {id: "b", value: 7}, c: {id: "c", value: 10}}

adam.select(["negative", "odd"], [null, 4, NaN, 7, false, -2, "", 0, -5, 3, null, -9]);   // -5
adam.select(["negative", "odd"], [null, 4, NaN, 8, false, 2, "", 0, 30, 4, false], {filterConnect: "or"});   // false
adam.select(["negative", "odd"], [null, 4, NaN, 8, false, 2, "", 0, 30, 4, false], {filterConnect: "or", defaultValue: -3});   // -3
adam.select([{field: /[c-g]/}, "odd"], {a: [3, 5, 2], b: 1, c: 0, d: "-7", e: 4, f: -2, g: -1, h: null, i: -7, j: true, k: -5});   // -1
adam.select(["negative", "even"], new Set([null, 4, NaN, 8, -1, false, -2, "", 0, "beta", -30, 4, true]));   // -2

adam.split(obj, ["a", "d"]);   // [{a: 1, d: 4}, {b: 2, c: 3, e: 5}]
adam.split(obj, null, {filter: "odd"});   // [{a: 1, c: 3, e: 5}, {b: 2, d: 4}]
adam.split(obj, null, {filter: ["even", /3/], filterConnect: "or"});   // [{b: 2, c: 3, d: 4}, {a: 1, e: 5}]
adam.split(new Map([["a", false], [obj, 2], [false, obj2], [true, null]]), null, {filter: "true"});   // [Map{obj -> 2, false -> obj2}, Map{"a" -> false, true -> null}]

adam.remove({a: 1, b: "2", c: 3}, "string");   // {a: 1, c: 3}
adam.remove([1, 2, 3, 4, 5], "even");   // [1, 3, 5]
adam.remove(new Set([1, 2, 3, 4, 5]), "odd");   // Set[2, 4]

adam.empty({x: -1, y: 9});   // {}

adam.reverse({a: "x", b: "files"});   // {x: "a", files: "b"}
adam.reverse("eval");   // "lave"
adam.reverse(new Map([[obj, 1], [obj2, 2]]));   // Map{1 -> obj, 2 -> obj2}

adam.transform("7.381", "integer");   // 7

adam.copy(obj, {b: "no", z: "a"});   // {a: 1, b: 2, c: 3, d: 4, e: 5, z: "a"}
adam.copy(obj, {b: "no", z: "a"}, {filter: "odd"});   // {a: 1, b: "no", c: 3, e: 5, z: "a"}
adam.copy(obj, {b: "no", z: "a"}, {filter: "even", transform: inc});   // {b: 3, d: 5, z: "a"}

adam.change({a: 1, b: 2, c: 3}, "reverse");   // {a: -1, b: -2, c: -3}
adam.change({a: 10, b: 28, c: -3, d: null, e: "zero = 0"}, "empty", {filter: /0/});   // {a: 0, b: 28, c: -3, d: null, e: ""}
adam.change([1, 2, 3, 4, 5], "reverse", {filter: "even"});   // [1, -2, 3, -4, 5]

adam.map(obj, "reverse", {filter: "odd"});   // {a: -1, c: -3, e: -5}
adam.map(["1", "2", "3"], "number");   // [1, 2, 3]
```

See `test/adam.js` for additional examples.

## API <a name="api"></a> [&#x2191;](#start)

See [`docs`](https://gamtiq.github.io/adam/module-adam.html).

## Related projects <a name="related"></a> [&#x2191;](#start)

* [eva](https://github.com/gamtiq/eva)
* [mixing](https://github.com/gamtiq/mixing)
* [teo](https://github.com/gamtiq/teo)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014-2020 Denis Sikuler  
Licensed under the MIT license.
