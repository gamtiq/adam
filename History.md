### 1.3.0 / 2020-06-24

* support for `Map`s and `Set`s

### 1.2.1 / 2020-06-17

* support of `pairs` setting for `getFields`

### 1.2.0 / 2020-06-05

* add `checkValue` function
* support for `inside` filter in `checkField`

### 1.1.0 / 2020-03-25

* rework `select` function to support search in objects
* add `promise`, `resolve` and `reject` actions for `transform`
* pass operation settings as parameter of function for `checkField`'s `filter`, `fromArray`'s `keyField`
  and `copy`'s `transform`

### 1.0.0 / 2020-03-22

* add `select` function

### 0.4.1 / 2016-04-12

* improve filtering for property keys in `checkField`
* add `numeric` check for `isKind`
* remove SPM support

### 0.4.0 / 2016-03-20

* add `limit` setting for `getFields` method
* change implementation of `getSize` and `isSizeMore` methods to consider symbol property keys

### 0.3.0 / 2016-01-26

* add `getPropertySymbols` method
* change implementation of `getFields` method

### 0.2.0 / 2014-10-22

* add methods `remove`, `empty`, `reverse`, `transform`, `copy`, `change`, `map`
* `isEmpty` treats `0` as empty value

### 0.1.2 / 2014-10-12

* add ability to use filter for `getSize`, `isSizeMore`, `getFields`, `getValues`, `fromArray`, `split`
* add `value` setting for `checkField`
* fix `exports` problem in browser

### 0.1.1 / 2014-09-21

* add `checkField`, `getClass`, `getType`, `isEmpty` and `isKindOf` methods
