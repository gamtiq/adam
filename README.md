# adam <a name="start"></a>

Functions to create, process and test objects.

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

### [Component](https://github.com/component/component)

    component install gamtiq/adam

### [Jam](http://jamjs.org)

    jam install adam

### [Bower](http://bower.io)

    bower install adam

### [SPM](http://spmjs.io)

    spm install adam

### AMD, &lt;script&gt;

Use `dist/adam.js` or `dist/adam.min.js` (minified version).

## Usage <a name="usage"></a> [&#x2191;](#start)

### Node, Component, SPM

```js
var adam = require("adam");
```

### Jam

```js
require(["adam"], function(adam) {
    ...
});
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

adam.checkField(obj, "c", ["positive", "odd"]);   // true
adam.checkField(obj, "b", ["real", /^7/], {filterConnect: "or"});   // false

adam.getFreeField({a5: 5, a2: 2, a7: 7, a3: 3}, {prefix: "a", startNum: 2});   // "a4"

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

adam.getValues(obj);   // [1, 2, 3, 4, 5]
adam.getValues(obj, {filter: {field: /a|c/}});   // [1, 3]
adam.getValueKey(obj, 3);   // "c"

adam.fromArray([{id: "a", value: 11}, {id: "b", value: 7}, {id: "c", value: 10}], "id");   // {a: {id: "a", value: 11}, b: {id: "b", value: 7}, c: {id: "c", value: 10}}

adam.split(obj, ["a", "d"]);   // [{a: 1, d: 4}, {b: 2, c: 3, e: 5}]
adam.split(obj, null, {filter: "odd"});   // [{a: 1, c: 3, e: 5}, {b: 2, d: 4}]
adam.split(obj, null, {filter: ["even", /3/], filterConnect: "or"});   // [{b: 2, c: 3, d: 4}, {a: 1, e: 5}]

adam.remove({a: 1, b: "2", c: 3}, "string");   // {a: 1, c: 3}
adam.remove([1, 2, 3, 4, 5], "even");   // [1, 3, 5]

adam.empty({x: -1, y: 9});   // {}

adam.reverse({a: "x", b: "files"});   // {x: "a", files: "b"}
adam.reverse("eval");   // "lave"

adam.transform("7.381", "string");   // 7

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

### change(obj: Object, action: Function | String, [settings: Object]): Object

Change all or filtered fields of object, applying specified action/transformation.

### checkField(obj: Object, field: String, filter: Any, [settings: Object]): Boolean

Check whether the field of given object corresponds to specified condition(s) or filter(s).

### copy(source: Object, target: Object, [settings: Object]): Object

Copy all or filtered fields from source object into target object, applying specified transformation if necessary.

### empty(value: Any): Any

Empty the given value.

### fromArray(list: Array, [keyField: Function | String], [settings: Object]): Object

Create object (map) from list of objects.

### getClass(value: Any): String

Return class of given value (namely value of internal property `[[Class]]`).

### getFields(obj: Object, [settings: Object]): Array

Return list of all or filtered fields of specified object.

### getFreeField(obj: Object, [settings: Object]): String

Return name of first free (absent) field of specified object, that conforms to the following pattern: &lt;prefix&gt;&lt;number&gt;

### getPropertySymbols(obj: Object): Array

Return list of all symbol property keys for given object including keys from prototype chain.

*This function is defined only when `Object.getOwnPropertySymbols` is available in JS engine.
Otherwise the value of `getPropertySymbols` field is `undefined`.*

### getSize(obj: Object, [settings: Object]): Integer

Return number of all or filtered fields of specified object.

### getType(value: Any): String

Return type of given value.

### getValueKey(obj: Object, value, [all: Boolean]): Array | String | null

Return the name of field (or list of names) having the specified value in the given object.

### getValues(obj: Object, [settings: Object]): Array

Return list of all or filtered field values of specified object.

### isEmpty(value: Any): Boolean

Check whether given value is an empty value i.e. `null`, `undefined`, `0`, empty object, empty array or empty string.

### isKindOf(value: Any, kind: String): Boolean

Check whether given value has (or does not have) specified kind (type or class).

### isSizeMore(obj: Object, qty: Number, [settings: Object]): Boolean

Check whether number of all or filtered fields of specified object is more than the given value.

### map(obj: Object, action: Function | String, [settings: Object]): Object

Create new object containing all or filtered fields of the source object/array,
applying specified action/transformation for field values.

### remove(obj: Array | Object, filter: Any, [settings: Object]): Array | Object

Remove filtered fields/elements from specified object/array.

### reverse(value: Any): Any

Reverse or negate the given value.

### split(obj: Object, firstObjFields: Array | Object | null, [settings: Object]): Array

Divide given object into 2 parts: the first part includes specified fields, the second part includes all other fields.

### transform(value: Any, action: String): Any

Transform the given value applying the specified operation.

See `doc` folder for details.

## Related projects <a name="related"></a> [&#x2191;](#start)

* [eva](https://github.com/gamtiq/eva)
* [mixing](https://github.com/gamtiq/mixing)
* [teo](https://github.com/gamtiq/teo)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014-2016 Denis Sikuler  
Licensed under the MIT license.
