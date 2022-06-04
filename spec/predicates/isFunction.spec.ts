import 'mocha';

import { given } from 'mocha-testdata';

import { ensure, isFunction } from '../../src';
import { expect } from '../expect';

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
            expect(() => run(validCallback)).to.not.throw();
        });

        given([
            function () {},                     // eslint-disable-line @typescript-eslint/no-empty-function
            () => {},                           // eslint-disable-line @typescript-eslint/no-empty-function
            async function asyncFunction() {},  // eslint-disable-line @typescript-eslint/no-empty-function
            Array,
            Date,
            Object,
            Number,
            String,
            Symbol,
        ]).
        it('works for any type of function', (callback: any) => {
            expect(() => run(callback)).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            [],
            true,
            'string',
        ]).
        it('complains if the value is not a function', (callback: any) => {
            expect(() => run(callback)).to.throw(`callback should be a function`);
        });
    });
});
