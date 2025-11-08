import { describe, expect, it } from 'vitest';

import { ensure, isInteger, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isInteger} */
    describe('::isInteger', () => {
        class AgeInYears extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('AgeInYears', value, isInteger());
            }
        }

        it('ensures that the argument in an integer', () => {
            expect(() => new AgeInYears(42)).not.toThrow();
        });

        it.each([
            1 / 3,
            0.42,
            undefined,
            null,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            {},
            'string',
        ])('complains if the value is not an integer', (value: any) => {
            expect(() => new AgeInYears(value)).toThrow(`AgeInYears should be an integer`);
        });
    });
});
