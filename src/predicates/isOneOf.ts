import { isEqualTo } from './isEqualTo';
import { or } from './or';
import { Predicate } from './Predicate';

/**
 * @desc Checks if the `value` is equal to one of the `allowedValues`
 *
 * @example
 * import { check, isOneOf, TinyType } from 'tiny-types';
 *
 * class StreetLight extends TinyType {
 *     constructor(public readonly value: string) {
 *         super();
 *
 *         check('StreetLight', value, isOneOf('red', 'yellow', 'green'));
 *     }
 * }
 *
 * @param {...T[]} allowedValues
 * @returns {Predicate<T>}
 */
export function isOneOf<T>(...allowedValues: T[]): Predicate<T> {
    return or(...allowedValues.map(allowed => isEqualTo(allowed)));
}
