import { describe, expect, it } from 'vitest';

import { MatchesAnything } from '../../../src/pattern-matching/rules';

describe('pattern-matching', () => {

    describe('rules', () => {

        describe('MatchesAnything', () => {

            it.each([
                1,
                false,
                {},
            ])('is always executed', (input: any) => {
                const rule = new MatchesAnything(_ => _);

                expect(rule.matches(input)).toEqual(true);
            });
        });
    });
});
