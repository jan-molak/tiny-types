import { Predicate } from './Predicate';

/**
 * @desc Checks if the `value` is an integer {@link Number}.
 *
 * @example
 * import { and, isInteger, TinyType } from 'tiny-types';
 *
 * class AgeInYears extends TinyType {
 *     constructor(public readonly value: number) {
 *         check('Age in years', value, isInteger());
 *     }
 * }
 *
 * @returns {Predicate<number>}
 */
export function isInteger(): Predicate<number> {
    return Predicate.to(`be an integer`, (value: number) =>
        typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value,
    );
}
