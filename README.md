# adam

Functions to create and process objects.

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
adam.getFreeField({a5: 5, a2: 2, a7: 7, a3: 3}, {prefix: "a", startNum: 2});   // a4
adam.getSize(obj);   // 3
adam.isSizeMore(obj, 5);   // false
adam.getFields(obj);   // ["a", "b", "c"]
adam.getValues(obj);   // [1, 2, 3]
adam.getValueKey({a: 1, b: 2, c: 3, d: 4}, 3);   // c
adam.fromArray([{id: "a", value: 11}, {id: "b", value: 7}, {id: "c", value: 10}], "id");   // {a: {id: "a", value: 11}, b: {id: "b", value: 7}, c: {id: "c", value: 10}}
adam.split({a: 1, b: 2, c: 3, d: 4, e: 5}, ["a", "d"]);   // [{a: 1, d: 4}, {b: 2, c: 3, e: 5}]
```

## API

### fromArray(list: Array, [keyField: Function | String], [settings: Object]): Object

Create object (map) from list of objects.

### getFields(obj: Object): Array

Return list of fields of specified object.

### getFreeField(obj: Object, [settings: Object]): String

Return name of first free (absent) field of specified object, that conforms to the following pattern: &lt;prefix&gt;&lt;number&gt;

### getSize(obj: Object): Integer

Return number of fields of specified object.

### getValueKey(obj: Object, value, [all: Boolean]): Array | String | null

Return the name of field (or list of names) having the specified value in the given object.

### getValues(obj: Object): Array

Return list of field values of specified object.

### isSizeMore(obj: Object, qty: Number): Boolean

Check whether number of fields of specified object is more than the given value.

### split(obj: Object, firstObjFields: Array | Object): Array

Divide given object into 2 parts: the first part includes specified fields, the second part includes all other fields.

See `doc` folder for details.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014 Denis Sikuler  
Licensed under the MIT license.
