import { and, Failure, isArray, isDefined, isGreaterThan, Predicate } from './predicates';

/**
 * @desc The `check` function verifies if the value meets the specified {Predicate}s.
 *
 * @example <caption>Basic usage</caption>
 * import { check, isDefined } from 'tiny-types'
 *
 * const username = 'jan-molak'
 * check('Username', username, isDefined());
 *
 * @example <caption>Ensuring validity of a domain object upon creation</caption>
 * import { TinyType, check, isDefined, isInteger, isInRange } from 'tiny-types'
 *
 * class Age extends TinyType {
 *   constructor(public readonly value: number) {
 *     check('Age', value, isDefined(), isInteger(), isInRange(0, 125));
 *   }
 * }
 *
 * @param {string} name - the name of the value to check.
 *      This name will be included in the error message should the check fail
 * @param {T} value - the argument to check
 * @param {...Array<Predicate<T>>} predicates - a list of predicates to check the value against
 * @returns {T} - if the original value passes all the predicates, it's returned from the function
 */
export function check<T>(name: string, value: T, ...predicates: Array<Predicate<T>>): T {
    const result = and(...predicates).check(value);

    if (result instanceof Failure) {
        throw new Error(`${ name } should ${ result.description }`);
    }

    return result.value;
}
