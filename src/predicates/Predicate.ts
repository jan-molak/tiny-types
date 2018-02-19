/**
 * @access private
 */
export abstract class Result<T> {
    constructor(public readonly value: T) {}
}

/**
 * @access private
 */
export class Success<T> extends Result<T> {}

/**
 * @access private
 */
export class Failure<T> extends Result<T> {
    constructor(value: T, public readonly description: string) {
        super(value);
    }
}

/**
 * @access private
 */
export class SingleConditionPredicate<T> implements Predicate<T> {
    static to<V>(description: string, condition: (value: V) => boolean) {
        return new SingleConditionPredicate(description, condition);
    }

    constructor(private readonly description: string,
                private readonly isMetBy: (value: T) => boolean,
    ) {}

    check(value: T): Result<T> {
        return this.isMetBy(value)
            ? new Success(value)
            : new Failure(value, this.description);
    }
}

/**
 * @access public
 */
export interface Predicate<T> {
    check(value: T): Result<T>;
}
