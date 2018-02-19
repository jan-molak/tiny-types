import { isArray } from './isArray';
import { isDefined } from './isDefined';
import { isGreaterThan } from './isGreaterThan';
import { Failure, Predicate, Result, Success } from './Predicate';

/**
 * @desc Checks if the `value` meets all the provided {@link Predicate}s.
 *
 * @example
 * import { and, check, isDefined, isGreaterThan, isInteger, TinyType } from 'tiny-types';
 *
 * class AgeInYears extends TinyType {
 *     constructor(public readonly value: number) {
 *         check('Percentage', value, and(isDefined(), isInteger(), isGreaterThan(18));
 *     }
 * }
 *
 * @param {...Array<Predicate<T>>} predicates
 * @returns {Predicate<T>}
 */
export function and<T>(...predicates: Array<Predicate<T>>): Predicate<T> {
    return new And<T>(predicates);
}

/** @access private */
class And<T> implements Predicate<T> {

    constructor(private readonly predicates: Array<Predicate<T>>) {
        if ([
                _ => isDefined().check(_),
                _ => isArray().check(_),
                _ => isGreaterThan(0).check(_.length),
            ].some(check => check(this.predicates) instanceof Failure)
        ) {
            throw new Error(`Looks like you haven\'t specified any predicates to check the value against?`);
        }
    }

    check(value: T): Result<T> {
        const firstUnmet = this.predicates
            .map(predicate => predicate.check(value))
            .find(result => result instanceof Failure);

        return firstUnmet || new Success(value);
    }
}
