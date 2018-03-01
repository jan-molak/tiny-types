import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isGreaterThanOrEqualTo, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isGreaterThanOrEqualTo} */
    describe('::isGreaterThanOrEqualTo', () => {
        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('InvestmentLength', value, isGreaterThanOrEqualTo(0));
            }
        }

        given(0, 1).
        it('ensures that the argument is greater than or equal to a specified number', (value: number) => {
            expect(new InvestmentLength(value)).to.not.throw;                // tslint:disable-line:no-unused-expression
        });

        it('complains if the argument is less than the lower bound', () => {
            expect(() => new InvestmentLength(-1))
                .to.throw(`InvestmentLength should either be equal to 0 or be greater than 0`);
        });

        given(
            -1,
            undefined,
            null,
            {},
            'string',
        ).it('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new InvestmentLength(value))
                .to.throw(`InvestmentLength should either be equal to 0 or be greater than 0`);
        });
    });
});
