import { Predicate } from './Predicate';

/**
 * @desc Ensures that the `value` is a {@link Function}.
 *
 * @example
 * import { ensure, isFunction, TinyType } from 'tiny-types';
 *
 * function myFunction(callback: (error?: Error) => void): void {
 *     ensure('callback', callback, isFunction());
 * }
 *
 * @returns {Predicate<boolean>}
 */
export function isFunction(): Predicate<Function> {
    return Predicate.to(`be a function`, (value: Function) =>
        typeof value === 'function'
    );
}
