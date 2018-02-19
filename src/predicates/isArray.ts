import { Predicate, SingleConditionPredicate } from './Predicate';

/**
 * @desc Checks if the `value` is an {@link Array}.
 *
 * @example
 * import { check, isArray, TinyType, TinyTypeOf } from 'tiny-types';
 *
 * class Name extends TinyTypeOf<string>() {}
 *
 * class Names extends TinyType {
 *   constructor(public readonly values: Name[]) {
 *      super();
 *      check('Names', values, isArray());
 *   }
 * }
 *
 * @returns {Predicate<T[]>}
 */
export function isArray<T>(): Predicate<T[]> {
    return SingleConditionPredicate.to(`be an array`, (value: T[]) => Array.isArray(value));
}
