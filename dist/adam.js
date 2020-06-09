(function(root, factory) {
    if (root === undefined && window !== undefined) root = window;
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require, exports, module);
    }
    else if(typeof define === 'function' && define.amd) {
        define(['require', 'exports', 'module'], factory);
    }
    else {
        var req = function(id) {return root[id];},
            exp = root,
            mod = {exports: exp};
        root['adam'] = factory(req, exp, mod);
    }
}(this, function(require, exports, module) {
/*
 * adam
 * https://github.com/gamtiq/adam
 *
 * Copyright (c) 2014-2020 Denis Sikuler
 * Licensed under the MIT license.
 */


/**
 * Functions to create, process and test objects.
 * 
 * @module adam
 */


"use strict";

/*jshint latedef:nofunc*/

var getOwnPropertyNames, getPropertySymbols, getPrototypeOf;

/*jshint laxbreak:true*/
/*
 * Return own property names of given object.
 * 
 * @param {Object} obj
 *      Object whose own property names should be returned.
 * @return {Array}
 *      Own property names of the given object.
 */
getOwnPropertyNames = typeof Object.getOwnPropertyNames === "function"
                        ? Object.getOwnPropertyNames
: function getOwnPropertyNames(obj) {
    var result = [],
        sKey;
    for (sKey in obj) {
        if (obj.hasOwnProperty(sKey)) {
            result.push(sKey);
        }
    }
    return result;
};

/*
 * Return prototype of given object.
 * 
 * @param {Object} obj
 *      Object whose prototype should be returned.
 * @return {Object}
 *      The prototype of the given object.
 */
getPrototypeOf = typeof Object.getPrototypeOf === "function"
                    ? Object.getPrototypeOf
: function getPrototypeOf(obj) {
    /*jshint proto:true*/
    return obj 
            ? (obj.constructor
                ? obj.constructor.prototype
                : (obj.__proto__ || Object.prototype)
                )
            : null;
};
/*jshint laxbreak:false*/


if (typeof Object.getOwnPropertySymbols === "function") {
    /**
     * Return list of all symbol property keys for given object including keys from prototype chain.
     * 
     * This function is defined only when `Object.getOwnPropertySymbols` is available.
     * 
     * @param {Object} obj
     *      Object to be processed.
     * @return {Array}
     *      List of all found symbol property keys.
     * @alias module:adam.getPropertySymbols
     */
    getPropertySymbols = function getPropertySymbols(obj) {
        var exceptList = {},
            getOwnPropertySymbols = Object.getOwnPropertySymbols,
            getPrototypeOf = Object.getPrototypeOf,
            result = [],
            nI, nL, propName, symbolList;
        if (obj && typeof obj === "object") {
            do {
                symbolList = getOwnPropertySymbols(obj);
                for (nI = 0, nL = symbolList.length; nI < nL; nI++) {
                    propName = symbolList[nI];
                    if (! (propName in exceptList)) {
                        result.push(propName);
                        exceptList[propName] = true;
                    }
                }
                obj = getPrototypeOf(obj);
            } while (obj);
        }
        return result;
    };
}


/**
 * Return class of given value (namely value of internal property `[[Class]]`).
 * 
 * @param {Any} value
 *      Value whose class should be determined.
 * @return {String}
 *      String indicating value class.
 * @alias module:adam.getClass
 */
function getClass(value) {
    var sClass = Object.prototype.toString.call(value);
    return sClass.substring(8, sClass.length - 1);
}

/**
 * Return type of given value.
 * 
 * @param {Any} value
 *      Value whose type should be determined.
 * @return {String}
 *      For `NaN` - `'nan'`, for `null` - `'null'`, otherwise - result of `typeof` operator.
 * @alias module:adam.getType
 */
function getType(value) {
    /*jshint laxbreak:true*/
    var sType = typeof value;
    return value === null
            ? "null"
            : (sType === "number" && isNaN(value) ? "nan" : sType);
}

/**
 * Return number of all or filtered fields of specified object.
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter specifying fields that should be counted (see {@link module:adam.checkField checkField})
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Integer}
 *      Number of all or filtered fields of specified object.
 * @alias module:adam.getSize
 * @see {@link module:adam.getFields getFields}
 */
function getSize(obj, settings) {
    return getFields(obj, settings).length;
}

/**
 * Check whether number of all or filtered fields of specified object is more than the given value.
 * 
 * @param {Object} obj
 *      Object to be checked.
 * @param {Number} nValue
 *      Value that should be used for comparison with number of fields.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter specifying fields that should be counted (see {@link module:adam.checkField checkField})
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Boolean}
 *      `true`, when number of all or filtered fields is more than the given value, otherwise `false`.
 * @alias module:adam.isSizeMore
 * @see {@link module:adam.getFields getFields}
 */
function isSizeMore(obj, nValue, settings) {
    /*jshint unused:false*/
    if (settings) {
        settings = copy(settings, {});
    }
    else {
        settings = {};
    }
    nValue++;
    settings.limit = nValue;
    return getFields(obj, settings).length === nValue;
}

/**
 * Check whether given value is an empty value i.e. `null`, `undefined`, `0`, empty object, empty array or empty string.
 * 
 * @param {Any} value
 *      Value to be checked.
 * @return {Boolean}
 *      `true` if the value is an empty value, otherwise `false`.
 * @alias module:adam.isEmpty
 * @see {@link module:adam.getClass getClass}
 * @see {@link module:adam.isSizeMore isSizeMore}
 */
function isEmpty(value) {
    /*jshint eqeqeq:false, eqnull:true, laxbreak:true*/
    return value == null
            || value === 0
            || value === ""
            || (typeof value === "object" && ! isSizeMore(value, 0))
            || (getClass(value) === "Array" && value.length === 0);
}

/**
 * Check whether given value has (or does not have) specified kind (type or class).
 * 
 * @param {Any} value
 *      Value to be checked.
 * @param {String} sKind
 *      Type or class for check. Can be any value that is returned by {@link module:adam.getType getType} 
 *      and {@link module:adam.getClass getClass}, or one of the following:
 *      
 *    * `empty` - check whether the value is empty (see {@link module:adam.isEmpty isEmpty})
 *    * `even` - check whether the value is an even integer
 *    * `false` - check whether the value is a false value
 *    * `infinity` - check whether the value is a number representing positive or negative infinity
 *    * `integer` - check whether the value is an integer number
 *    * `negative` - check whether the value is a negative number
 *    * `numeric` - check whether the value is a number or a string that can be converted to number
 *    * `odd` - check whether the value is an odd integer
 *    * `positive` - check whether the value is a positive number
 *    * `real` - check whether the value is a real number
 *    * `true` - check whether the value is a true value
 *    * `zero` - check whether the value is `0`
 *    
 *      If exclamation mark (`!`) is set before the kind, it means that the check should be negated
 *      i.e. check whether given value does not have the specified kind.
 *      For example, `!real` means: check whether the value is not a real number.
 * @return {Boolean}
 *      `true` if value has the specified kind (or does not have when the check is negated), otherwise `false`.
 * @alias module:adam.isKindOf
 * @see {@link module:adam.getClass getClass}
 * @see {@link module:adam.getType getType}
 * @see {@link module:adam.isEmpty isEmpty}
 */
function isKindOf(value, sKind) {
    /*jshint laxbreak:true*/
    var bNegate = sKind.charAt(0) === "!",
        sType = getType(value),
        bInfinity, bInteger, bResult;
    if (bNegate) {
        sKind = sKind.substring(1);
    }
    bResult= sType === sKind
                || getClass(value) === sKind
                || (sKind === "true" && Boolean(value))
                || (sKind === "false" && ! value)
                || (sKind === "empty" && isEmpty(value))
                || (sKind === "numeric"
                    && ( sType === "number"
                            || (sType === "string" && value && ! isNaN(Number(value))) ) )
                || (sType === "number"
                    && ((sKind === "zero" && value === 0)
                        || (sKind === "positive" && value > 0)
                        || (sKind === "negative" && value < 0)
                        || ((bInfinity = (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY)) && (sKind === "infinity"))
                        || (! bInfinity 
                                && ( ((bInteger = (value === Math.ceil(value))) && sKind === "integer")
                                    || (bInteger && sKind === "even" && value % 2 === 0)
                                    || (bInteger && sKind === "odd" && value % 2 !== 0)
                                    || (! bInteger && sKind === "real") )
                            )
                        )
                    );
    return bNegate ? ! bResult : bResult;
}

/**
 * Check whether the field of given object corresponds to specified condition(s) or filter(s).
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @param {String | Symbol} field
 *      Field that should be checked.
 * @param {Any} filter
 *      A filter or array of filters specifying conditions that should be checked. A filter can be:
 *      
 *    * a function; if the function returns a true value it means that the field corresponds to this filter;
 *      the following parameters will be passed into the function: field value, field name, reference to the object and operation settings
 *    * a regular expression; if the field value (converted to string) matches the regular expression it means
 *      that the field corresponds to this filter
 *    * a string; value can be one of the following:
 *      - `own` - if the field is own property of the object it means that the field corresponds to this filter
 *      - `!own` - if the field is not own property of the object it means that the field corresponds to this filter
 *      - any other value - is used as the check when calling {@link module:adam.isKindOf isKindOf};
 *        if {@link module:adam.isKindOf isKindOf} returns `true` for the given field value and the filter
 *        it means that the field corresponds to this filter
 *    * an object (referred below as condition);
 *      - if the object has `and` or `or` field, its value is used as subfilter and will be passed in recursive call of `checkField`
 *        as value of `filter` parameter; the field name (`and` or `or`) will be used as value of `filterConnect` setting (see below);
 *        if the result of the recursive call is `true` it means that the field corresponds to this filter
 *      - if the object has `field` field, its value is used as filter for the field name (property key) that is being checked;
 *        the filter is applied to the field name (property key) in recursive call of `checkField`
 *        as if the key is a tested field value of special object that is created for the check purposes
 *        (i.e. `checkField({field: field}, "field", filter.field, {filterConnect: settings.filterConnect})`)
 *      - if the object has `value` field, its value is used as filter; if the field value strictly equals to the filter value
 *      - if the object has `inside` field, its value is used as filter; if the filter value "contains" the field value
 *        it means that the field corresponds to this filter;
 *        the filter value can be:
 *        + an array or a string; in such case `indexOf` is used to check presence of the field value in the filter value;
 *        + a set; in such case `has` is used to check presence of the field value in the filter value;
 *        + a map or an object; when `key` field is specified in the condition, the filter value will be checked
 *           for presence of such key/value pair; if `true` is set as value for `key` field,
 *           value of `field` parameter will be used as the key;
 *           when `key` field is absent in the condition, the field value will be checked for presence
 *           in the list of values of the map/object;
 *        + any other value; in such case the field value is not inside the filter value;
 *      - in any other case if the field value strictly equals to the object it means that the field corresponds to this filter
 *    * any other value; if the field value strictly equals to the filter value it means that the field corresponds to this filter
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported (setting's default value is specified in parentheses):
 *     
 *   * `filterConnect`: `String` (`and`) - a boolean connector that should be used when array of filters is specified
 *      in `filter` parameter; valid values are the following: `and`, `or` (case-insensitive); any other value is treated as `and`
 *   * `value`: `Any` - a value that should be used for check instead of field's value
 * @return {Boolean}
 *      `true` if the field corresponds to specified filter(s), otherwise `false`.
 * @alias module:adam.checkField
 * @see {@link module:adam.getClass getClass}
 * @see {@link module:adam.isKindOf isKindOf}
 */
function checkField(obj, field, filter, settings) {
    /*jshint laxbreak:true*/
    var test = true,
        bAnd, data, nI, nL, sKey, sType, value;
    if (! settings) {
        settings = {};
    }
    value = "value" in settings
                ? settings.value
                : obj[field];
    bAnd = settings.filterConnect;
    bAnd = typeof bAnd !== "string" || bAnd.toLowerCase() !== "or";
    if (getClass(filter) !== "Array") {
        filter = [filter];
    }
    for (nI = 0, nL = filter.length; nI < nL; nI++) {
        test = filter[nI];
        switch (getClass(test)) {
            case "Function":
                test = Boolean(test(value, field, obj, settings));
                break;
            case "String":
                if (test === "own") {
                    test = obj.hasOwnProperty(field);
                }
                else if (test === "!own") {
                    test = ! obj.hasOwnProperty(field);
                }
                else {
                    test = isKindOf(value, test);
                }
                break;
            case "RegExp":
                test = test.test(typeof value === "symbol" ? value.toString() : value);
                break;
            case "Object":
                if ("and" in test) {
                    test = checkField(obj, field, test.and, {filterConnect: "and"});
                }
                else if ("or" in test) {
                    test = checkField(obj, field, test.or, {filterConnect: "or"});
                }
                else if ("field" in test) {
                    test = checkField({field: field}, "field", test.field, {filterConnect: settings.filterConnect});
                }
                else if ("value" in test) {
                    test = test.value === value;
                }
                else if ("inside" in test) {
                    data = test.inside;
                    sType = getClass(data);
                    switch (sType) {
                        case "Array":
                        case "String":
                            test = data.indexOf(value) > -1;
                            break;
                        case "Map":
                        case "Object":
                            sKey = test.key;
                            if (sKey) {
                                if (sKey === true) {
                                    sKey = field;
                                }
                                test = sType === "Map"
                                    ? (data.has(sKey) && data.get(sKey) === value)
                                    : ((sKey in data) && data[sKey] === value);
                            }
                            else {
                                test = sType === "Map"
                                    ? (Array.from(data.values()).indexOf(value) > -1)
                                    : (getValueKey(data, value) !== null);
                            }
                            break;
                        case "Set":
                            test = data.has(value);
                            break;
                        default:
                            test = false;
                    }
                }
                else {
                    test = test === value;
                }
                break;
            default:
                test = test === value;
        }
        if ((bAnd && ! test) || (! bAnd && test)) {
            break;
        }
    }
    return test;
}

/**
 * Check whether the value corresponds to specified condition(s) or filter(s).
 * 
 * This function is a "wrap" for the following code:
 * ```js
 * checkField({value: value}, "value", filter, settings);
 * ```
 * 
 * @param {Any} value
 *      Value that should be checked.
 * @param {Any} filter
 *      A filter or array of filters specifying conditions that should be checked.
 *      See {@link module:adam.checkField checkField} for details.
 * @param {Object} [settings]
 *     Operation settings. See {@link module:adam.checkField checkField} for details.
 * @return {Boolean}
 *      `true` if the value corresponds to specified filter(s), otherwise `false`.
 * @alias module:adam.checkValue
 * @see {@link module:adam.checkField checkField}
 */
function checkValue(value, filter, settings) {
    return checkField({value: value}, "value", filter, settings);
}

/**
 * Return list of all or filtered fields of specified object.
 * 
 * Fields are searched (checked) in the object itself and in its prototype chain.
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter specifying fields that should be selected (see {@link module:adam.checkField checkField})
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 *   * `limit` - a maximum number of fields that should be included into result;
 *      after the specified number of fields is attained, the search will be stopped
 *   * `pairs`: `object | boolean | 'list' | 'obj'` - whether list of field-value pairs should be returned
 *      instead of list of fields; when `true` is set it is the same as `{form: 'obj'}`;
 *      when a string is set it is the same as `{form: <string>}`;
 *      an object value specifies a form of field-value pairs and can have
 *      the following fields:
 *      - `form`: `'list' | 'obj'` - whether an item of the result list should be `[field, value]` array
 *          or `{key: field, value: value}` object; default value is `'obj'`;
 *          any string that is different from `'list'` is treated as `'obj'`;
 *      - `type` - the same as `form`;
 *      - `key`: `string` - for object items of the result list specifies name of field
 *          that contains processed object's field; default value is `key`;
 *      - `value`: `string` - for object items of the result list specifies name of field
 *          that contains processed object's field value; default value is `value`;
 * @return {Array}
 *      List of all or filtered fields of specified object.
 * @alias module:adam.getFields
 * @see {@link module:adam.checkField checkField}
 */
function getFields(obj, settings) {
    /*jshint latedef:false, laxbreak:true*/
    
    function isLimitReached() {
        return nLimit > 0 && result.length >= nLimit;
    }
    
    function processKeyList(keyList) {
        var key, nI, nL, pair;
        for (nI = 0, nL = keyList.length; nI < nL; nI++) {
            key = keyList[nI];
            if (! (key in addedKeyMap) && (bAll || checkField(obj, key, filter, options))) {
                if (sPairType === "obj") {
                    pair = {};
                    pair[sPairKey] = key;
                    pair[sPairValue] = obj[key];
                }
                else if (sPairType === "list") {
                    pair = [key, obj[key]];
                }
                else {
                    pair = key;
                }
                result.push(pair);
                if (isLimitReached()) {
                    break;
                }
                addedKeyMap[key] = null;
            }
        }
    }
    
    var addedKeyMap = {},
        bAll = ! settings || ! ("filter" in settings),
        options = settings || {},
        getOwnPropertySymbols = Object.getOwnPropertySymbols,
        bProcessSymbols = typeof getOwnPropertySymbols === "function",
        filter = bAll ? null : options.filter,
        bOwn = bAll ? false : filter === "own",
        bNotOwn = bAll ? false : filter === "!own",
        bUseFilter = bAll ? false : ! bOwn && ! bNotOwn,
        nLimit = options.limit || 0,
        pairs = options.pairs,
        result = [],
        target = obj,
        sPairKey, sPairType, sPairValue;
    if (pairs) {
        sPairType = typeof pairs;
        if (sPairType === "boolean") {
            pairs = {form: "obj"};
        }
        else if (sPairType === "string") {
            pairs = {form: pairs};
        }
        sPairType = pairs.form || pairs.type || "obj";
        if (sPairType.toLowerCase() !== "list") {
            sPairType = "obj";
        }
        sPairKey = pairs.key || "key";
        sPairValue = pairs.value || "value";
    }
    while (target) {
        if (bAll || bUseFilter || (bOwn && target === obj) || (bNotOwn && target !== obj)) {
            processKeyList(getOwnPropertyNames(target));
            if (bProcessSymbols && ! isLimitReached()) {
                processKeyList(getOwnPropertySymbols(target));
            }
            if (isLimitReached()) {
                break;
            }
        }
        target = bAll || bNotOwn || bUseFilter
                    ? getPrototypeOf(target)
                    : null;
    }
    return result;
}

/**
 * Return the name of field (or list of names) having the specified value in the given object.
 * 
 * @param {Object} obj
 *      Object to be checked.
 * @param {Any} value
 *      Value that should be searched for.
 * @param {Boolean} [bAll]
 *      Whether names of all found fields having the specified value should be returned.
 *      Default value is `false`.
 * @return {Array | String | null}
 *      Names of fields (when `bAll` is `true`) or a field name having the specified value,
 *      or `null` when the object do not contain the specified value.
 * @alias module:adam.getValueKey
 */
function getValueKey(obj, value, bAll) {
    /*jshint laxbreak:true*/
    var result = [],
        sKey;
    for (sKey in obj) {
        if (obj[sKey] === value) {
            if (bAll) {
                result.push(sKey);
            }
            else {
                return sKey;
            }
        }
    }
    return result.length
            ? result
            : null;
}

/**
 * Return list of all or filtered field values of specified object.
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter specifying fields that should be selected (see {@link module:adam.checkField checkField})
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Array}
 *      List of all or filtered field values of specified object.
 * @alias module:adam.getValues
 * @see {@link module:adam.checkField checkField}
 */
function getValues(obj, settings) {
    var result = [],
        bAll = ! settings || ! ("filter" in settings),
        filter = bAll ? null : settings.filter,
        sKey;
    for (sKey in obj) {
        if (bAll || checkField(obj, sKey, filter, settings)) {
            result[result.length] = obj[sKey];
        }
    }
    return result;
}

/**
 * Return name of first free (absent) field of specified object, that conforms to the following pattern:
 * &lt;prefix&gt;&lt;number&gt;
 * 
 * @param {Object} obj
 *      Object in which a free field should be found.
 *      If `null` (or any false value) is set, the first value that conforms to the pattern will be returned.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported (setting's default value is specified in parentheses):
 *     
 *   * `checkPrefix`: `Boolean` (`false`) - specifies whether pattern consisting only from prefix (without number) should be checked
 *   * `prefix`: `String` (`f`) - prefix of sought field
 *   * `startNum`: `Integer` (`0`) - starting number which is used as part of pattern by search/check
 * @return {String}
 *      Name of field which is absent in the specified object and conforms to the pattern.
 * @alias module:adam.getFreeField
 */
function getFreeField(obj, settings) {
    var bCheckPrefix, nStartNum, sField, sPrefix;
    if (! settings) {
        settings = {};
    }
    sPrefix = settings.prefix;
    nStartNum = settings.startNum;
    bCheckPrefix = settings.checkPrefix;
    if (typeof sPrefix !== "string") {
        sPrefix = "f";
    }
    if (! nStartNum) {
        nStartNum = 0;
    }
    if (bCheckPrefix) {
        sField = sPrefix;
        nStartNum--;
    }
    else {
        sField = sPrefix + nStartNum;
    }
    if (obj) {
        while (sField in obj) {
            sField = sPrefix + (++nStartNum);
        }
    }
    return sField;
}

/**
 * Create object (map) from list of objects.
 * Fields of the created object are values of specified field of objects,
 * values of the created object are corresponding items of the list.
 * 
 * @param {Array} list
 *      List of objects/values to be processed.
 * @param {Function | String} [keyField]
 *      Specifies names of fields of the created object. Can be name of field or method whose value is used
 *      as field name of the created object, or function that returns the field name.
 *      In the latter case the following parameters will be passed in the function:
 *      the source object (an item of the list), the created object, the index of the source object, operation settings.
 *      When the parameter is not set, items of the list are used as field names.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported (setting's default value is specified in parentheses):
 *     
 *   * `deleteKeyField`: `Boolean` (`false`) - specifies whether key field (whose value is field name of the created object)
 *     should be deleted from the source object (an item of the list)
 *   * `filter` - a filter specifying objects that should be included into result (see {@link module:adam.checkField checkField});
 *     an item of the list will be used as value for check
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Object}
 *      Object created from the given list.
 * @alias module:adam.fromArray
 * @see {@link module:adam.checkField checkField}
 */
function fromArray(list, keyField, settings) {
    var nL = list.length,
        result = {},
        bAll, bDeleteKeyField, bFuncKey, filter, filterConnect, item, field, nI, sKeyName;
    if (nL) {
        if (! settings) {
            settings = {};
        }
        bAll = ! ("filter" in settings);
        filter = bAll ? null : settings.filter;
        filterConnect = settings.filterConnect;
        bFuncKey = typeof keyField === "function";
        bDeleteKeyField = Boolean(settings.deleteKeyField && keyField);
        if (! bFuncKey) {
            sKeyName = keyField;
        }
        for (nI = 0; nI < nL; nI++) {
            item = list[nI];
            if (bFuncKey) {
                field = sKeyName = keyField(item, result, nI, settings);
            }
            else {
                field = sKeyName ? item[sKeyName] : item;
                if (typeof field === "function") {
                    field = field.call(item);
                }
            }
            if (bAll || checkField(result, field, filter, {value: item, filterConnect: filterConnect})) {
                if (bDeleteKeyField) {
                    delete item[sKeyName];
                }
                result[field] = item;
            }
        }
    }
    return result;
}

/**
 * Return the value of the first element/field in the passed array/object that satisfies the specified filter(s).
 * 
 * If value passed for selection is not an array nor an object and `settings.defaultValue` is not set, the value will be returned as is.
 * If no element in the passed array satisfies the specified filter(s),
 * `settings.defaultValue` or the last element of the array (or `undefined` when the array is empty) will be returned.
 * If no field in the passed object satisfies the specified filter(s), `settings.defaultValue` or `undefined` will be returned.
 *
 * @param {Any} filter
 *      Filter that should be used to select a value (see {@link module:adam.checkField checkField} for details).
 * @param {Any} from
 *      An array/object from which a value should be selected.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported (setting's default value is specified in parentheses):
 *     
 *   * `defaultValue`: `Any` - default value that should be used when no element/field in the passed array/object
 *      satisfies the specified filter(s) or when value of `from` parameter is not an array nor an object
 *   * `filterConnect`: `String` (`and`) - a boolean connector that should be used when array of filters is specified
 *      in `filter` parameter (see {@link module:adam.checkField checkField} for details)
 * @return {Any}
 *      The value of first element/field in the passed array/object that satisfies the specified filter(s),
 *      or `settings.defaultValue`, or the value of `from` parameter or `undefined`.
 * @alias module:adam.select
 * @see {@link module:adam.checkField checkField}
 */
function select(filter, from, settings) {
    /*jshint latedef:false, laxbreak:true*/
    function getDefaultValue(value) {
        return "defaultValue" in options
            ? options.defaultValue
            : value;
    }

    var options = settings || {},
        result = getDefaultValue(from),
        key, nL, nLast;
    if (getClass(from) === "Array") {
        nL = from.length;
        if (nL) {
            nLast = nL - 1;
            for (key = 0; key < nL; key++) {
                if (checkField(from, key, filter, options)) {
                    result = from[key];
                    break;
                }
                else if (key === nLast) {
                    result = getDefaultValue(from[key]);
                }
            }
        }
        else {
            result = getDefaultValue(key);
        }
    }
    else if (getType(from) === "object") {
        result = getDefaultValue(key);
        for (key in from) {
            if (checkField(from, key, filter, options)) {
                result = from[key];
                break;
            }
        }
    }
    return result;
}

/**
 * Divide given object into 2 parts: the first part includes specified fields, the second part includes all other fields.
 * 
 * @param {Object} obj
 *      Object to be divided.
 * @param {Array | Object | null} firstObjFields
 *      List of names of fields that should be included in the first part,
 *      or an object defining those fields.
 *      If value is not specified (`null` or `undefined`), `filter` setting should be used to divide fields into parts.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter that should be used to divide fields into parts (see {@link module:adam.checkField checkField});
 *      fields conforming to the filter will be included in the first part,
 *      fields that do not conform to the filter will be included in the second part
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Array}
 *      Created parts: item with index 0 is the first part, item with index 1 is the second part.
 * @alias module:adam.split
 * @see {@link module:adam.checkField checkField}
 */
function split(obj, firstObjFields, settings) {
    /*jshint laxbreak:true*/
    var first = {},
        second = {},
        result = [first, second],
        bByName, filter, sKey;
    if (! settings) {
        settings = {};
    }
    if (firstObjFields) {
        bByName = true;
        if (typeof firstObjFields.length === "number") {
            firstObjFields = fromArray(firstObjFields);
        }
    }
    else {
        bByName = false;
        filter = settings.filter;
    }
    for (sKey in obj) {
        ((bByName ? sKey in firstObjFields : checkField(obj, sKey, filter, settings)) 
            ? first 
            : second)[sKey] = obj[sKey];
    }
    return result;
}

/**
 * Remove filtered fields/elements from specified object/array.
 * 
 * @param {Array | Object} obj
 *      Array or object to be processed.
 * @param {Any} filter
 *      A filter or array of filters specifying fields or elements that should be removed
 *      (see {@link module:adam.checkField checkField}).
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` parameter (see {@link module:adam.checkField checkField})
 * @return {Array | Object}
 *      Processed array or object.
 * @alias module:adam.remove
 * @see {@link module:adam.checkField checkField}
 */
function remove(obj, filter, settings) {
    var field;
    if (obj && typeof obj === "object") {
        if (getClass(obj) === "Array") {
            field = obj.length;
            while(field--) {
                if (checkField(obj, field, filter, settings)) {
                    obj.splice(field, 1);
                }
            }
        }
        else {
            for (field in obj) {
                if (checkField(obj, field, filter, settings)) {
                    delete obj[field];
                }
            }
        }
    }
    return obj;
}

/**
 * Empty the given value according to the following rules:
 * 
 *   * for array: removes all elements from the value
 *   * for object: removes all own fields from the value
 *   * for string: returns empty string
 *   * for number: returns `0`
 *   * otherwise: returns `undefined`
 * 
 * @param {Any} value
 *      Value to be processed.
 * @return {Any}
 *      Processed value (for array or object) or empty value corresponding to the given value.
 * @alias module:adam.empty
 */
function empty(value) {
    var sField;
    switch (getType(value)) {
        case "object":
            if (getClass(value) === "Array") {
                value.length = 0;
            }
            else {
                for (sField in value) {
                    delete value[sField];
                }
            }
            break;
        case "string":
            value = "";
            break;
        case "number":
            value = 0;
            break;
        default:
            value = sField;
    }
    return value;
}

/**
 * Reverse or negate the given value according to the following rules:
 * 
 *   * for array: reverses order of its elements
 *   * for object: swaps fields with their values (i.e. for `{a: "b", c: "d"}` returns `{b: "a", d: "c"}`)
 *   * for string: reverses order of its characters
 *   * for number: returns negated value (i.e. `- value`)
 *   * for boolean: returns negated value (i.e. `! value`)
 *   * otherwise: returns source value without modification
 * 
 * @param {Any} value
 *      Value to be processed.
 * @return {Any}
 *      Processed value.
 * @alias module:adam.reverse
 */
function reverse(value) {
    var cache, sField;
    switch (getType(value)) {
        case "object":
            if (getClass(value) === "Array") {
                value = value.reverse();
            }
            else {
                cache = {};
                for (sField in value) {
                    cache[ value[sField] ] = sField;
                }
                value = cache;
            }
            break;
        case "string":
            value = value.split("").reverse().join("");
            break;
        case "number":
            value = - value;
            break;
        case "boolean":
            value = ! value;
            break;
    }
    return value;
}

/**
 * Transform the given value applying the specified operation.
 * 
 * @param {Any} value
 *      Value to be transformed.
 * @param {String} sAction
 *      Operation that should be applied to transform the value. Can be one of the following:
 *      
 *    * `array` - convert the value to array (using `Array(value)`)
 *    * `boolean` - convert the value to boolean value (using `Boolean(value)`)
 *    * `empty` - empty the value (see {@link module:adam.empty empty})
 *    * `function` - convert the value to function (using `Function(value)`)
 *    * `integer` - try to convert the value to an integer number (using `Math.round(Number(value)`)
 *    * `number` - try to convert the value to number (using `Number(value)`)
 *    * `object` - convert the value to object (using `Object(value)`)
 *    * `promise` or `resolve` - convert the value to resolved promise (using `Promise.resolve(value)`)
 *    * `reject` - convert the value to rejected promise (using `Promise.reject(value)`)
 *    * `reverse` - reverse the value (see {@link module:adam.reverse reverse})
 *    * `string` - convert the value to string (using `String(value)`)
 *    * otherwise - source value
 * @return {Any}
 *      Transformed value.
 * @alias module:adam.transform
 * @see {@link module:adam.empty empty}
 * @see {@link module:adam.reverse reverse}
 */
function transform(value, sAction) {
    /*jshint evil:true, -W064*/
    var result;
    switch (sAction) {
        case "array":
            result = Array(value);
            break;
        case "boolean":
            result = Boolean(value);
            break;
        case "empty":
            result = empty(value);
            break;
        case "function":
            result = Function(value);
            break;
        case "integer":
            result = Math.round(Number(value));
            break;
        case "number":
            result = Number(value);
            break;
        case "object":
            result = Object(value);
            break;
        case "promise":
        case "resolve":
            result = Promise.resolve(value);
            break;
        case "reject":
            result = Promise.reject(value);
            break;
        case "reverse":
            result = reverse(value);
            break;
        case "string":
            result = String(value);
            break;
        default:
            result = value;
    }
    return result;
}

/**
 * Copy all or filtered fields from source object into target object, applying specified transformation if necessary.
 * 
 * @param {Object} source
 *      Object whose fields will be copied.
 * @param {Object} target
 *      Object into which fields should be copied.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter that should be used to select fields for copying (see {@link module:adam.checkField checkField});
 *      fields conforming to the filter will be copied
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 *   * `transform` - an action/operation that should be applied to get field's value that will be copied
 *      instead of value from source object; can be a string specifying transformation (see {@link module:adam.transform transform})
 *      or a function whose result will be used as field's value; object with the following fields will be passed into the function:
 *      - `field` - field name
 *      - `value` field value from source object
 *      - `source` - reference to the source object
 *      - `target` - reference to the target object
 *      - `settings` - operation settings
 * @return {Object}
 *      Reference to the target object (value of `target` parameter).
 * @alias module:adam.copy
 * @see {@link module:adam.checkField checkField}
 * @see {@link module:adam.transform transform}
 */
function copy(source, target, settings) {
    /*jshint laxbreak:true*/
    var bAll = true,
        bFuncAction, action, filter, key;
    if (! settings) {
        settings = {};
    }
    if ("filter" in settings) {
        filter = settings.filter;
        bAll = false;
    }
    action = settings.transform;
    if (typeof action === "function") {
        bFuncAction = true;
    }
    for (key in source) {
        if (bAll || checkField(source, key, filter, settings)) {
            target[key] = action
                            ? (bFuncAction
                                ? action({source: source, target: target, field: key, value: source[key], settings: settings})
                                : transform(source[key], action))
                            : source[key];
        }
    }
    return target;
}

/**
 * Change all or filtered fields of object, applying specified action/transformation.
 * 
 * @param {Object} obj
 *      Object whose fields should be changed.
 * @param {Function | String} action
 *      An action/operation that should be applied to get new field value.
 *      See description of `transform` setting of {@link module:adam.copy copy}.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter that should be used to select fields for modification (see {@link module:adam.checkField checkField});
 *      fields conforming to the filter will be changed
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Object}
 *      Modified object (value of `obj` parameter).
 * @alias module:adam.change
 * @see {@link module:adam.checkField checkField}
 * @see {@link module:adam.copy copy}
 */
function change(obj, action, settings) {
    /*jshint laxbreak:true*/
    settings = settings
                ? copy(settings, {})
                : {};
    settings.transform = action;
    return copy(obj, obj, settings);
}

/**
 * Create new object containing all or filtered fields of the source object/array,
 * applying specified action/transformation for field values.
 * 
 * @param {Array | Object} obj
 *      Array/object whose fields should be copied.
 * @param {Function | String} action
 *      An action/operation that should be applied to get field value that will be saved in created object.
 *      See description of `transform` setting of {@link module:adam.copy copy}.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported:
 *     
 *   * `filter` - a filter that should be used to select fields for copying (see {@link module:adam.checkField checkField});
 *      fields conforming to the filter will be copied in created object
 *   * `filterConnect`: `String` - a boolean connector that should be used when array of filters is specified
 *      in `filter` setting (see {@link module:adam.checkField checkField})
 * @return {Object}
 *      Created object containing processed fields.
 * @alias module:adam.map
 * @see {@link module:adam.checkField checkField}
 * @see {@link module:adam.copy copy}
 */
function map(obj, action, settings) {
    /*jshint laxbreak:true*/
    settings = settings
                ? copy(settings, {})
                : {};
    settings.transform = action;
    return copy(obj, 
                getClass(obj) === "Array" ? [] : {}, 
                settings);
}

// Exports

module.exports = {
    change: change,
    checkField: checkField,
    checkValue: checkValue,
    copy: copy,
    empty: empty,
    fromArray: fromArray,
    getClass: getClass,
    getFields: getFields,
    getFreeField: getFreeField,
    getPropertySymbols: getPropertySymbols,
    getSize: getSize,
    getType: getType,
    getValueKey: getValueKey,
    getValues: getValues,
    isEmpty: isEmpty,
    isKindOf: isKindOf,
    isSizeMore: isSizeMore,
    map: map,
    remove: remove,
    reverse: reverse,
    select: select,
    split: split,
    transform: transform
};

return module.exports;
}));
