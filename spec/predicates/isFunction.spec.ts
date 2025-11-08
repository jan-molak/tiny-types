import { describe, expect, it } from 'vitest';

import { ensure, isFunction } from '../../src';

describe('predicates', () => {

    /** @test {isFunction} */
    describe('::isFunction', () => {

        // eslint-disable-next-line unicorn/consistent-function-scoping
        function run(callback: () => void) {
            ensure('callback', callback, isFunction())
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        function validCallback() {
            // do nothing
        }

        it('ensures that the argument in a function', () => {
            expect(() => run(validCallback)).not.toThrow();
        });

        it.each([
            function () {},                     // eslint-disable-line @typescript-eslint/no-empty-function
            () => {},                           // eslint-disable-line @typescript-eslint/no-empty-function
            async function asyncFunction() {},  // eslint-disable-line @typescript-eslint/no-empty-function
            Array,
            Date,
            Object,
            Number,
            String,
            Symbol,
        ])('works for any type of function', (callback: any) => {
            expect(() => run(callback)).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            [],
            true,
            'string',
        ])('complains if the value is not a function', (callback: any) => {
            expect(() => run(callback)).toThrow(`callback should be a function`);
        });
    });
});
