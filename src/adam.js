/*
 * adam
 * https://github.com/gamtiq/adam
 *
 * Copyright (c) 2014 Denis Sikuler
 * Licensed under the MIT license.
 */


/**
 * Functions to create, process and test objects.
 * 
 * @module adam
 */


"use strict";

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
 * Return number of fields of specified object.
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @return {Integer}
 *      Number of fields of specified object.
 * @alias module:adam.getSize
 */
function getSize(obj) {
    /*jshint unused:false*/
    var nSize = 0,
        sKey;
    for (sKey in obj) {
        nSize++;
    }
    return nSize;
}

/**
 * Check whether number of fields of specified object is more than the given value.
 * 
 * @param {Object} obj
 *      Object to be checked.
 * @param {Number} nValue
 *      Value that should be used for comparison with number of fields.
 * @return {Boolean}
 *      `true`, when number of fields is more than the given value, otherwise `false`.
 * @alias module:adam.isSizeMore
 */
function isSizeMore(obj, nValue) {
    /*jshint unused:false*/
    var nSize = 0,
        sKey;
    if (nValue >= 0) {
        for (sKey in obj) {
            nSize++;
            if (nSize > nValue) {
                return true;
            }
        }
    }
    return nSize > nValue;
}

/**
 * Check whether given value is an empty value i.e. `null`, `undefined`, empty object, empty array or empty string.
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
 * @param {String} field
 *      Name of the field that should be checked.
 * @param {Any} filter
 *      A filter or array of filters specifying conditions that should be checked. A filter can be:
 *      
 *    * a function; if the function returns a true value it means that the field corresponds to this filter;
 *      the following parameters will be passed into the function: field value, field name and reference to the object
 *    * a regular expression; if the field value (converted to string) matches the regular expression it means
 *      that the field corresponds to this filter
 *    * a string; value can be one of the following:
 *      - `own` - if the field is own property of the object it means that the field corresponds to this filter
 *      - `!own` - if the field is not own property of the object it means that the field corresponds to this filter
 *      - any other value - is used as the check when calling {@link module:adam.isKindOf isKindOf};
 *        if {@link module:adam.isKindOf isKindOf} returns `true` for the given field value and the filter
 *        it means that the field corresponds to this filter
 *    * an object;
 *      - if the object has `and` or `or` field, its value is used as subfilter and will be passed in recursive call of `checkField`
 *        as value of `filter` parameter; the field name (`and` or `or`) will be used as value of `filterConnect` setting (see below);
 *        if the result of the recursive call is `true` it means that the field corresponds to this filter
 *      - if the object has `field` field, its value is used as filter; if the filter is a regular expression
 *        and the field name matches the regular expression it means that the field corresponds to this filter;
 *        otherwise the field corresponds to this filter when the filed name strictly equals to the filter (converted to string)
 *      - if the object has `value` field, its value is used as filter; if the field value strictly equals to the filter value
 *        it means that the field corresponds to this filter
 *      - in any other case if the field value strictly equals to the object it means that the field corresponds to this filter
 *    * any other value; if the field value strictly equals to the filter value it means that the field corresponds to this filter
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported (setting's default value is specified in parentheses):
 *     
 *   * `filterConnect`: `String` (`and`) - a boolean connector that should be used when array of filters is specified
 *      in `filter` parameter; valid values are the following: `and`, `or` (case-insensitive); any other value is treated as `and`
 * @return {Boolean}
 *      `true` if the field corresponds to specified filter(s), otherwise `false`.
 * @alias module:adam.checkField
 * @see {@link module:adam.getClass getClass}
 * @see {@link module:adam.isKindOf isKindOf}
 */
function checkField(obj, field, filter, settings) {
    var value = obj[field],
        test = true,
        bAnd, nI, nL;
    field = String(field);
    if (! settings) {
        settings = {};
    }
    bAnd = settings.filterConnect;
    bAnd = typeof bAnd !== "string" || bAnd.toLowerCase() !== "or";
    if (getClass(filter) !== "Array") {
        filter = [filter];
    }
    for (nI = 0, nL = filter.length; nI < nL; nI++) {
        test = filter[nI];
        switch (getClass(test)) {
            case "Function":
                test = Boolean(test(value, field, obj));
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
                test = test.test(value);
                break;
            case "Object":
                if ("and" in test) {
                    test = checkField(obj, field, test.and, {filterConnect: "and"});
                }
                else if ("or" in test) {
                    test = checkField(obj, field, test.or, {filterConnect: "or"});
                }
                else if ("field" in test) {
                    test = test.field;
                    if (getClass(test) === "RegExp") {
                        test = test.test(field);
                    }
                    else {
                        test = String(test) === field;
                    }
                }
                else if ("value" in test) {
                    test = test.value === value;
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
 * Return list of fields of specified object.
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @return {Array}
 *      List of fields of specified object.
 * @alias module:adam.getFields
 */
function getFields(obj) {
    var result = [],
        sKey;
    for (sKey in obj) {
        result.push(sKey);
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
 * Return list of field values of specified object.
 * 
 * @param {Object} obj
 *      Object to be processed.
 * @return {Array}
 *      List of field values of specified object.
 * @alias module:adam.getValues
 */
function getValues(obj) {
    var result = [],
        sKey;
    for (sKey in obj) {
        result[result.length] = obj[sKey];
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
 *      the source object (an item of the list), the created object, the index of the source object.
 *      When the parameter is not set, items of the list are used as field names.
 * @param {Object} [settings]
 *     Operation settings. Keys are settings names, values are corresponding settings values.
 *     The following settings are supported (setting's default value is specified in parentheses):
 *     
 *   * `deleteKeyField`: `Boolean` (`false`) - specifies whether key field (whose value is field name of the created object)
 *     should be deleted from the source object (an item of the list)
 * @return {Object}
 *      Object created from the given list.
 * @alias module:adam.fromArray
 */
function fromArray(list, keyField, settings) {
    var nL = list.length,
        result = {},
        bDeleteKeyField, bFuncKey, item, field, nI, sKeyName;
    if (nL) {
        if (! settings) {
            settings = {};
        }
        bFuncKey = typeof keyField === "function";
        bDeleteKeyField = Boolean(settings.deleteKeyField && keyField);
        if (! bFuncKey) {
            sKeyName = keyField;
        }
        for (nI = 0; nI < nL; nI++) {
            item = list[nI];
            if (bFuncKey) {
                field = sKeyName = keyField(item, result, nI);
            }
            else {
                field = sKeyName ? item[sKeyName] : item;
                if (typeof field === "function") {
                    field = field.call(item);
                }
            }
            if (bDeleteKeyField) {
                delete item[sKeyName];
            }
            result[field] = item;
        }
    }
    return result;
}

/**
 * Divide given object into 2 parts: the first part includes specified fields, the second part includes all other fields.
 * 
 * @param {Object} obj
 *      Object to be divided.
 * @param {Array | Object} firstObjFields
 *      List of names of fields that should be included in the first part,
 *      or an object defining those fields.
 * @return {Array}
 *      Created parts: item with index 0 is the first part, item with index 1 is the second part.
 * @alias module:adam.split
 */
function split(obj, firstObjFields) {
    var first = {},
        second = {},
        result = [first, second],
        sKey;
    if (typeof firstObjFields.length === "number") {
        firstObjFields = fromArray(firstObjFields);
    }
    for (sKey in obj) {
        (sKey in firstObjFields ? first : second)[sKey] = obj[sKey];
    }
    return result;
}

// Exports

exports.checkField = checkField;
exports.fromArray = fromArray;
exports.getClass = getClass;
exports.getFields = getFields;
exports.getFreeField = getFreeField;
exports.getSize = getSize;
exports.getType = getType;
exports.getValueKey = getValueKey;
exports.getValues = getValues;
exports.isEmpty = isEmpty;
exports.isKindOf = isKindOf;
exports.isSizeMore = isSizeMore;
exports.split = split;