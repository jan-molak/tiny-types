import { describe, expect, it } from 'vitest';

import { ensure, isNumber, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isNumber} */
    describe('::isNumber', () => {
        class Percentage extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('Percentage', value, isNumber());
            }
        }

        it('ensures that the argument in a number', () => {
            expect(() => new Percentage(42)).not.toThrow();
        });

        it.each([
            1 / 3,
            0.42,
            0o3,
            0xB4D455,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ])('works for any type of number', (value: any) => {
            expect(() => new Percentage(value)).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            'string',
        ])('complains if the value is not a number', (value: any) => {
            expect(() => new Percentage(value)).toThrow(`Percentage should be a number`);
        });
    });
});
