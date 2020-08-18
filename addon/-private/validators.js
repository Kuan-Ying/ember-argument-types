import { isArray } from '@ember/array';
import { get } from '@ember/object';
import { ensureValidator, toString, typeOf } from './utils';

/**
 * Validator to handle type checking via typeof
 * @param {string} expectedType - The type the validator expects
 * @returns {function} Validator function
 */
export function createTypeValidator(expectedType) {
  return function(value) {
    if (typeof value !== expectedType) {
      return `Expected type ${expectedType} but received ${typeOf(value)}`;
    }
  }
}

/**
 * Validator to handle strict equality checking
 * @param {string} expectedValue - The value the validator expects
 * @returns {function} Validator function
 */
export function createEqualityValidator(expectedValue) {
  return function(value) {
    if (value !== expectedValue) {
      return `Expected value to equal ${toString(expectedValue)} but received ${toString(value)}`;
    }
  }
}

/**
 * Validator to structurally type check an object
 * @param {object} validators - Key value pairs of propertyName -> validator
 * @returns {function} Validator function
 */
export function createShapeValidator(validators) {
  /**
   * @param {object} value - An object to structurally validate
   * @param {function} context - The context for the path to any validation error
   */
  return function(value, context) {
    const error = ensureValidator('object')(value, context);
    if (error) {
      return error;
    }

    for (const key of Object.keys(validators)) {
      const error = ensureValidator(validators[key])(get(value, key), context(key));
      if (error) {
        return error;
      }
    }
  }
}

/**
 * Validator to type check all items in an array
 * @param {string|function} validator - The validator to run against all items in the array
 * @returns {function} Validator function
 */
export function createArrayValidator(validator) {
  /**
   * @param {any[]} values - An array of values to structurally validate
   * @param {function} context - The context for the path to any validation error
   */
  return function(values, context) {
    if (!isArray(values)) {
      return [`Expected type array but received ${typeOf(values)}`, context];
    }

    for (let i = 0; i < values.length; i++) {
      const error = ensureValidator(validator)(values[i], context(i));
      if (error) {
        return error;
      }
    }
  }
}