import { and } from './and.js';
import { isGreaterThanOrEqualTo } from './isGreaterThanOrEqualTo.js';
import { isLessThanOrEqualTo } from './isLessThanOrEqualTo.js';
import { Predicate } from './Predicate.js';

/**
 * @desc Ensures that the `value` is greater than or equal to the `lowerBound` and less than or equal to the `upperBound`
 *
 * @example
 * import { ensure, isInRange, TinyType } from 'tiny-types';
 *
 * class InvestmentLengthInYears extends TinyType {
 *     constructor(public readonly value: number) {
 *         super();
 *         ensure('InvestmentLengthInYears', value, isInRange(1, 5));
 *     }
 * }
 *
 * @param {number} lowerBound
 * @param {number} upperBound
 * @returns {Predicate<number>}
 */
export function isInRange(lowerBound: number, upperBound: number): Predicate<number> {
    return and(isGreaterThanOrEqualTo(lowerBound), isLessThanOrEqualTo(upperBound));
}
