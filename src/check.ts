import { Failure, isArray, isDefined, isGreaterThan, Predicate } from './predicates';

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
 * import { TinyType, check, isDefined, isInt, isInRange } from 'tiny-types'
 *
 * class Age extends TinyType {
 *   constructor(public readonly value: number) {
 *     check('Age', value, isDefined(), isInt(), isInRange(0, 125));
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
    if ([
            _ => isDefined().check(_),
            _ => isArray().check(_),
            _ => isGreaterThan(0).check(_.length),
        ].some(c => c(predicates) instanceof Failure)
    ) {
        throw new Error(`Looks like you haven't specified any predicates to check the value of ${name} against?`);
    }

    const firstUnmet = predicates
        .map(predicate => predicate.check(value))
        .find(result => result instanceof Failure) as Failure<T>;

    if (!! firstUnmet) {
        throw new Error(`${ name } should ${ firstUnmet.description }`);
    }

    return value;
}
