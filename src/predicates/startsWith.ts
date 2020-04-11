import { Predicate } from './Predicate';

/**
 * @desc Ensures that the `value` starts with a given prefix.
 *
 * @example
 * import { ensure, startsWith, TinyType } from 'tiny-types';
 *
 * class Username extends TinyType {
 *     constructor(public readonly value: string) {
 *         super();
 *
 *         ensure('Username', value, startsWith('usr'));
 *     }
 * }
 *
 * @param {string} prefix
 *
 * @returns {Predicate<string>}
 */
export function startsWith(prefix: string): Predicate<string> {
    return Predicate.to(`start with '${ prefix }'`, (value: string) =>
        typeof value === 'string'
            && value.startsWith(prefix),
    );
}
