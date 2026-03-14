import { isEqualTo } from './isEqualTo.js';
import { or } from './or.js';
import { Predicate } from './Predicate.js';

/**
 * @desc Ensures that the `value` is equal to one of the `allowedValues`
 *
 * @example
 * import { ensure, isOneOf, TinyType } from 'tiny-types';
 *
 * class StreetLight extends TinyType {
 *     constructor(public readonly value: string) {
 *         super();
 *
 *         ensure('StreetLight', value, isOneOf('red', 'yellow', 'green'));
 *     }
 * }
 *
 * @param {...T[]} allowedValues
 * @returns {Predicate<T>}
 */
export function isOneOf<T>(...allowedValues: T[]): Predicate<T> {
    return or(...allowedValues.map(allowed => isEqualTo(allowed)));
}
