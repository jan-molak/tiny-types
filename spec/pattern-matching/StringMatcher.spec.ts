import 'mocha';
import { given } from 'mocha-testdata';
import { StringMatcher } from '../../src/pattern-matching';
import { expect } from '../expect';

describe('pattern-matching', () => {
    describe('StringMatcher', () => {

        given(
            ['hello', 'matched a regular expression'],
            ['hello world', 'matched the identity matcher'],
        ).it('matches string and regular expressions', (input: string, expected_result: string) => {
            const result = new StringMatcher(input)
                .when('hello world', _ => `matched the identity matcher`)
                .when(/^[Hh]ello.*$/, _ => `matched a regular expression`)
                .else(_ => `else, received "${_}"`);

            expect(result).to.equal(expected_result);
        });
    });
});
