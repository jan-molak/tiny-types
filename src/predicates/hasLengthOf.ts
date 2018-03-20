import { Predicate } from './Predicate';

export interface HasLength { length: number; }

/**
 * @desc Ensures that the `value` is of `expectedLength`.
 * Applies to {@link String}s, {@link Array}s and anything that has a `.length` property.
 *
 * @example <caption>Array</caption>
 * import { ensure, hasLengthOf, TinyType } from 'tiny-types';
 *
 * class Tuple extends TinyType {
 *   constructor(public readonly values: any[]) {
 *      super();
 *      ensure('Tuple', values, hasLengthOf(2));
 *   }
 * }
 *
 * @example <caption>String</caption>
 * import { ensure, hasLengthOf, TinyType } from 'tiny-types';
 *
 * class Username extends TinyType {
 *   constructor(public readonly value: string) {
 *      super();
 *      ensure('Username', value, hasLengthOf(8));
 *   }
 * }
 *
 * @param {number} expectedLength
 * @returns {Predicate}
 */
export function hasLengthOf(expectedLength: number): Predicate<HasLength> {
    const actualLengthOf = (value: HasLength) => (!! value && value.length);

    return Predicate.to(`have a length of ${ expectedLength }`, (value: HasLength) =>
        actualLengthOf(value) === expectedLength,
    );
}
