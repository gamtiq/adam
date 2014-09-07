/*
 * adam
 * https://github.com/gamtiq/adam
 *
 * Copyright (c) 2014 Denis Sikuler
 * Licensed under the MIT license.
 */


/**
 * Functions to create and process objects.
 * 
 * @module adam
 */


"use strict";

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

exports.fromArray = fromArray;
exports.getFields = getFields;
exports.getFreeField = getFreeField;
exports.getSize = getSize;
exports.getValueKey = getValueKey;
exports.getValues = getValues;
exports.isSizeMore = isSizeMore;
exports.split = split;