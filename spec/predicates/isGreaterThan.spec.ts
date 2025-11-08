import { describe, expect, it } from 'vitest';

import { ensure, isGreaterThan, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isGreaterThan} */
    describe('::isGreaterThan', () => {
        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('InvestmentLength', value, isGreaterThan(0));
            }
        }

        it('ensures that the argument is greater than a specified number', () => {
            expect(() => new InvestmentLength(5)).not.toThrow();
        });

        it('complains if the argument is more than a specified number', () => {
            expect(() => new InvestmentLength(-1)).toThrow(`InvestmentLength should be greater than 0`);
        });

        it.each([
            0,
            -1,
            undefined,
            null,
            {},
            'string',
        ])('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new InvestmentLength(value)).toThrow(`InvestmentLength should be greater than 0`);
        });
    });
});
