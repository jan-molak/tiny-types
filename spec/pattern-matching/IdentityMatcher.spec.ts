import { describe, expect, it } from 'vitest';

import { IdentityMatcher } from '../../src/pattern-matching';

describe('pattern-matching', () => {
    describe('IdentityMatcher', () => {

        it.each([
            [true, 'received "true"'],
            [false, 'received "false"'],
        ])('matches a boolean', (input: boolean, expected_result: string) => {

            const result = new IdentityMatcher(input)
                .when(true, _ => `received "true"`)
                .else(_ => `received "false"`);

            expect(result).toEqual(expected_result);
        });

        it.each([
            [-1, 'received "-1"'],
            [0.1, 'received "0.1"'],
            [5, 'else, received "5"'],
            // [NaN, 'received "NaN"'],
            [Number.POSITIVE_INFINITY, 'to infinity and beyond!'],
        ])('matches a number', (input: number, expected_result: string) => {

            const result = new IdentityMatcher(input)
                .when(-1, _ => `received "-1"`)
                .when(0.1, _ => `received "0.1"`)
                .when(Number.POSITIVE_INFINITY, _ => `to infinity and beyond!`)
                .else(_ => `else, received "${_}"`);

            expect(result).toEqual(expected_result);
        });

        it('matches a symbol', () => {
            const s = Symbol('some symbol');

            const result = new IdentityMatcher(s)
                .when(s, _ => `received "some symbol"`)
                .else(_ => `else, received "${_.toString()}"`);

            expect(result).toEqual('received "some symbol"');
        });
    });
});
