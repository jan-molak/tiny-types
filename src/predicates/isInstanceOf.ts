import { isTinyType, isTinyTypeOf } from '../TinyType.js';
import { Predicate } from './Predicate.js';

/**
 * @desc Symbol used to brand instances for cross-module identification.
 * Uses Symbol.for() to ensure the same symbol is returned across ESM/CJS boundaries.
 */
const TYPE_BRAND_PREFIX = 'tiny-types/instance/';

/**
 * @desc Ensures that the `value` is an instance of `type`.
 * This predicate handles the dual-package hazard where the same class loaded
 * from different module formats (ESM/CJS) creates distinct constructor functions.
 *
 * @example
 * import { ensure, isInstanceOf, TinyType } from 'tiny-types';
 *
 * class Birthday extends TinyType {
 *     constructor(public readonly value: Date) {
 *         ensure('Date', value, isInstanceOf(Date));
 *     }
 * }
 *
 * @param {Constructor<T>} type
 * @returns {Predicate<T>}
 */
export function isInstanceOf<T>(type: new (...args: any[]) => T): Predicate<T> {
    return Predicate.to(`be instance of ${type.name}`, (value: T) => {
        // First try native instanceof (works when same module format)
        if (value instanceof type) {
            return true;
        }

        // For TinyType subclasses, use the cross-module check
        if (isTinyTypeSubclass(type) && isTinyType(value)) {
            // Cast needed for abstract constructor compatibility
            return isTinyTypeOf(value, type as any);
        }

        // For non-TinyType classes, fall back to brand-based check
        return checkBrand(value, type);
    });
}

/**
 * @desc Checks if a constructor is a TinyType subclass
 */
function isTinyTypeSubclass(type: new (...args: any[]) => unknown): boolean {
    let proto = type.prototype;
    while (proto !== null) {
        if (proto.constructor && proto.constructor.name === 'TinyType') {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

/**
 * @desc Checks if a value has been branded with the given type name.
 * This is a fallback for non-TinyType classes that may also suffer from
 * the dual-package hazard.
 */
function checkBrand(value: unknown, type: new (...args: any[]) => unknown): boolean {
    if (value === null || typeof value !== 'object') {
        return false;
    }

    const brandSymbol = Symbol.for(`${TYPE_BRAND_PREFIX}${type.name}`);
    return (value as any)[brandSymbol] === true;
}
