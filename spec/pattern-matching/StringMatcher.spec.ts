import { describe, expect, it } from 'vitest';

import { StringMatcher } from '../../src/pattern-matching';

describe('pattern-matching', () => {
    describe('StringMatcher', () => {

        it.each([
            ['hello', 'matched a regular expression'],
            ['hello world', 'matched the identity matcher'],
        ])('matches string and regular expressions', (input: string, expected_result: string) => {
            const result = new StringMatcher(input)
                .when('hello world', _ => `matched the identity matcher`)
                .when(/^[Hh]ello.*$/, _ => `matched a regular expression`)
                .else(_ => `else, received "${_}"`);

            expect(result).toEqual(expected_result);
        });
    });
});
