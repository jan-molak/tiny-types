import 'mocha';
import { given } from 'mocha-testdata';
import { IdentityMatcher } from '../../src/pattern-matching';
import { expect } from '../expect';

describe('pattern-matching', () => {
    describe('IdentityMatcher', () => {
        given(
            [true, 'received "true"'],
            [false, 'received "false"'],
        ).it('matches a boolean', (input: boolean, expected_result: string) => {

            const result = new IdentityMatcher(input)
                .when(true, _ => `received "true"`)
                .else(_ => `received "false"`);

            expect(result).to.equal(expected_result);
        });

        given(
            [-1, 'received "-1"'],
            [0.1, 'received "0.1"'],
            [5, 'else, received "5"'],
            // [NaN, 'received "NaN"'],
            [Infinity, 'to infinity and beyond!'],
        ).it('matches a number', (input: number, expected_result: string) => {

            const result = new IdentityMatcher(input)
                .when(-1, _ => `received "-1"`)
                .when(0.1, _ => `received "0.1"`)
                .when(Infinity, _ => `to infinity and beyond!`)
                .else(_ => `else, received "${_}"`);

            expect(result).to.equal(expected_result);
        });

        it('matches a symbol', () => {
            const s = Symbol('some symbol');

            const result = new IdentityMatcher(s)
                .when(s, _ => `received "some symbol"`)
                .else(_ => `else, received "${_}"`);

            expect(result).to.equal('received "some symbol"');
        });
    });
});
