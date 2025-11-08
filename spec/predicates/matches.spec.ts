import { describe, expect, it } from 'vitest';

import { ensure, matches, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {matches} */
    describe('::matches', () => {

        class CompanyEmailAddress extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('CompanyEmailAddress', value, matches(/[a-z]+\.[a-z]+@example\.org/));
            }
        }

        it('ensures that the argument matches a regular expression', () => {
            expect(() => new CompanyEmailAddress('jan.molak@example.org')).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            'string',
            5,
        ])('complains if the value does not match the regular expression', (value: any) => {
            expect(() => new CompanyEmailAddress(value))
                .toThrow(`CompanyEmailAddress should match pattern /[a-z]+\\.[a-z]+@example\\.org/`);
        });
    });
});
