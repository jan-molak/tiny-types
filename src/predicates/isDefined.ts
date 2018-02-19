import { Predicate, SingleConditionPredicate } from './Predicate';

/**
 * @desc Checks if the `value` is defined as anything other than {@link null} or {@link undefined}.
 *
 * @example
 * import { check, isDefined, TinyType } from 'tiny-types';
 *
 * class Name extends TinyType {
 *     constructor(public readonly value: string) {
 *       check('Name', value, isDefined());
 *     }
 * }
 *
 * @returns {Predicate<T>}
 */
export function isDefined<T>(): Predicate<T> {
    return SingleConditionPredicate.to(`be defined`, (value: T) =>
        ! (value === null || value === undefined),
    );
}
