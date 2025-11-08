import { describe, expect, it } from 'vitest';

import { ensure, isInRange, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isInRange} */
    describe('::isInRange', () => {

        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('InvestmentLength', value, isInRange(1, 5));
            }
        }

        it.each([ 1, 2, 3, 4, 5 ])('ensures that the value is within the range specified', (value: number) => {
            expect(() => new InvestmentLength(value)).not.toThrow();
        });

        it('complains if the value is lower than the lower bound', () => {
            expect(() => new InvestmentLength(0))
                .toThrow(`InvestmentLength should either be equal to 1 or be greater than 1`);
        });

        it('complains if the value is greater than the upper bound', () => {
            expect(() => new InvestmentLength(6))
                .toThrow(`InvestmentLength should either be less than 5 or be equal to 5`);
        });

        it.each([
            undefined,
            null,
            {},
            false,
        ])('complains if the value is of a wrong type', (value: any) => {
            expect(() => new InvestmentLength(value))
                .toThrow(`InvestmentLength should either be equal to 1 or be greater than 1`);
        });
    });
});
