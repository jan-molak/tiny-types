import { and } from './and';
import { isDefined } from './isDefined';
import { Failure, Predicate, Result, Success } from './Predicate';

/**
 * @desc Ensures that the `property` of the `value` meets the `predicates`
 *
 * @example
 * import { ensure, isGreaterThan, property, TinyType } from 'tiny-types';
 *
 * class Name extends TinyType {
 *     constructor(public readonly value: string) {
 *         super();
 *         ensure('Name', value, property('length', isGreaterThan(3)));
 *     }
 * }
 *
 * @returns {Predicate<T>}
 */
export function property<T, K extends keyof T>(prop: K, ...predicates: Array<Predicate<T[K]>>): Predicate<T> {
    return new HaveProperty<T, K>(prop, and(...predicates));
}

/** @access private */
class HaveProperty<T, K extends keyof T> extends Predicate<T> {

    constructor(private readonly prop: K, private readonly predicate: Predicate<T[K]>) {
        super();
    }

    /** @override */
    check(value: T): Result<T> {
        const result = this.predicate.check(value[this.prop]);

        return result instanceof Failure
            ? new Failure(value, `have a property "${ this.prop }" that ${ result.description }`
                .replace(/\bbe\b/gi, 'is')
                .replace(/\beither is\b/gi, 'is either'),
            )
            : new Success(value);
    }
}
