import { describe, expect, it } from 'vitest';

import { ensure, isLessThanOrEqualTo, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isLessThanOrEqualTo} */
    describe('::isLessThanOrEqualTo', () => {
        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('InvestmentLength', value, isLessThanOrEqualTo(50));
            }
        }

        it.each([ 49, 50 ])('ensures that the argument is less than or equal to the upper bound', (value: number) => {
            expect(() => new InvestmentLength(value)).not.toThrow();
        });

        it('complains if the argument is greater than the upper bound', () => {
            expect(() => new InvestmentLength(55))
                .toThrow(`InvestmentLength should either be less than 50 or be equal to 50`);
        });

        it.each([
            undefined,
            null,
            {},
            'string',
        ])('complains if the value is not an integer', (value: any) => {
            expect(() => new InvestmentLength(value))
                .toThrow(`InvestmentLength should either be less than 50 or be equal to 50`);
        });
    });
});
