import { isEqualTo } from './isEqualTo.js';
import { isGreaterThan } from './isGreaterThan.js';
import { or } from './or.js';
import { Predicate } from './Predicate.js';

/**
 * @desc Ensures that the `value` is greater than or equal to the `lowerBound`.
 *
 * @example
 * import { ensure, isGreaterThanOrEqualTo, TinyType } from 'tiny-types';
 *
 * class AgeInYears extends TinyType {
 *     constructor(public readonly value: number) {
 *         ensure('Age in years', value, isGreaterThanOrEqualTo(18));
 *     }
 * }
 *
 * @param {number} lowerBound
 * @returns {Predicate<number>}
 */
export function isGreaterThanOrEqualTo(lowerBound: number): Predicate<number> {
    return or(isEqualTo(lowerBound), isGreaterThan(lowerBound));
}
