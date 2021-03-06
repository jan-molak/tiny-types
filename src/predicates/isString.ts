import { Predicate } from './Predicate';

/**
 * @desc Ensures that the `value` is a  {@link String}.
 *
 * @example
 * import { ensure, isString, TinyType } from 'tiny-types';
 *
 * class FirstName extends TinyType {
 *     constructor(public readonly value: string) {
 *         ensure('FirstName', value, isString());
 *     }
 * }
 *
 * @returns {Predicate<string>}
 */
export function isString(): Predicate<string> {
    return Predicate.to(`be a string`, (value: string) => typeof value === 'string');
}
