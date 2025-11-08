import { describe, expect, it } from 'vitest';

import { ensure, isLessThan, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isLessThan} */
    describe('::isLessThan', () => {
        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('InvestmentLength', value, isLessThan(50));
            }
        }

        it('ensures that the argument is less than a specified number', () => {
            expect(() => new InvestmentLength(5)).not.toThrow();
        });

        it('complains if the argument is more than a specified number', () => {
            expect(() => new InvestmentLength(55)).toThrow(`InvestmentLength should be less than 50`);
        });

        it.each([
            undefined,
            null,
            {},
            'string',
        ])('complains if the value is not an integer', (value: any) => {
            expect(() => new InvestmentLength(value)).toThrow(`InvestmentLength should be less than 50`);
        });
    });
});
