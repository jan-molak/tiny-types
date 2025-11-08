import { describe, expect, it } from 'vitest';

import { ensure, isGreaterThanOrEqualTo, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isGreaterThanOrEqualTo} */
    describe('::isGreaterThanOrEqualTo', () => {
        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('InvestmentLength', value, isGreaterThanOrEqualTo(0));
            }
        }

        it.each([
            0,
            1
        ])('ensures that the argument is greater than or equal to a specified number', (value: number) => {
            expect(() => new InvestmentLength(value)).not.toThrow();
        });

        it('complains if the argument is less than the lower bound', () => {
            expect(() => new InvestmentLength(-1))
                .toThrow(`InvestmentLength should either be equal to 0 or be greater than 0`);
        });

        it.each([
            -1,
            undefined,
            null,
            {},
            'string',
        ])('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new InvestmentLength(value))
                .toThrow(`InvestmentLength should either be equal to 0 or be greater than 0`);
        });
    });
});
