# adam

Functions to create, process and test objects.

[![NPM version](https://badge.fury.io/js/adam.png)](http://badge.fury.io/js/adam)
[![Build Status](https://secure.travis-ci.org/gamtiq/adam.png?branch=master)](http://travis-ci.org/gamtiq/adam)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

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

## Usage

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

### Examples

```js
var obj = {a: 1, b: 2, c: 3};

adam.getClass([8]);   // Array
adam.getType(null);   // null
adam.isKindOf(17, "integer");   // true
adam.isKindOf(NaN, "!number");   // true
adam.checkField(obj, "c", ["positive", "odd"]);   // true
adam.checkField(obj, "b", ["real", /^7/], {filterConnect: "or"});   // false

adam.getFreeField({a5: 5, a2: 2, a7: 7, a3: 3}, {prefix: "a", startNum: 2});   // a4

adam.getSize(obj);   // 3
adam.isSizeMore(obj, 5);   // false
adam.isEmpty({});   // true

adam.getFields(obj);   // ["a", "b", "c"]
adam.getValues(obj);   // [1, 2, 3]
adam.getValueKey({a: 1, b: 2, c: 3, d: 4}, 3);   // c

adam.fromArray([{id: "a", value: 11}, {id: "b", value: 7}, {id: "c", value: 10}], "id");   // {a: {id: "a", value: 11}, b: {id: "b", value: 7}, c: {id: "c", value: 10}}
adam.split({a: 1, b: 2, c: 3, d: 4, e: 5}, ["a", "d"]);   // [{a: 1, d: 4}, {b: 2, c: 3, e: 5}]
```

See `test/adam.js` for additional examples.

## API

### checkField(obj: Object, field: String, filter: Any, [settings: Object]): Boolean

Check whether the field of given object corresponds to specified condition(s) or filter(s).

### fromArray(list: Array, [keyField: Function | String], [settings: Object]): Object

Create object (map) from list of objects.

### getClass(value: Any): String

Return class of given value (namely value of internal property `[[Class]]`).

### getFields(obj: Object): Array

Return list of fields of specified object.

### getFreeField(obj: Object, [settings: Object]): String

Return name of first free (absent) field of specified object, that conforms to the following pattern: &lt;prefix&gt;&lt;number&gt;

### getSize(obj: Object): Integer

Return number of fields of specified object.

### getType(value: Any): String

Return type of given value.

### getValueKey(obj: Object, value, [all: Boolean]): Array | String | null

Return the name of field (or list of names) having the specified value in the given object.

### getValues(obj: Object): Array

Return list of field values of specified object.

### isEmpty(value: Any): Boolean

Check whether given value is an empty value i.e. `null`, `undefined`, empty object, empty array or empty string.

### isKindOf(value: Any, kind: String): Boolean

Check whether given value has (or does not have) specified kind (type or class).

### isSizeMore(obj: Object, qty: Number): Boolean

Check whether number of fields of specified object is more than the given value.

### split(obj: Object, firstObjFields: Array | Object): Array

Divide given object into 2 parts: the first part includes specified fields, the second part includes all other fields.

See `doc` folder for details.

## Related projects

* [eva](https://github.com/gamtiq/eva)
* [teo](https://github.com/gamtiq/teo)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014 Denis Sikuler  
Licensed under the MIT license.
