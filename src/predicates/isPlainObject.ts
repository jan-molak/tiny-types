import { Predicate } from './Predicate';

/**
 * @package
 */
const toString = Object.prototype.toString;

/**
 * @package
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @package
 */
function isObject(value) {
    return value !== null
        && value !== undefined
        && typeof value === 'object'
        && Array.isArray(value) === false
        && toString.call(value) === '[object Object]';
}

/**
 * @desc
 *  Ensures that the `value` is a plain {@link Object}.
 *  Based on Jon Schlinkert's implementation.
 *
 * @see https://github.com/jonschlinkert/is-plain-object
 *
 * @example
 *  import { ensure, isPlainObject } from 'tiny-types';
 *
 *  ensure('plain object', {}, isPlainObject());
 *
 * @returns {Predicate<string>}
 */
export function isPlainObject<T extends object = object>(): Predicate<T> {
    return Predicate.to(`be a plain object`, (value: T) => {
        if (! isObject(value)) {
            return false;
        }

        // If has modified constructor
        if (value.constructor === undefined) {
            return true;
        }

        // If has modified prototype
        if (! isObject(value.constructor.prototype)) {
            return false;
        }

        // If constructor does not have an Object-specific method
        if (! hasOwnProperty.call(value.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        // Most likely a plain Object
        return true;
    });
}
