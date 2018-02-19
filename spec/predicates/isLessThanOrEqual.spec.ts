import 'mocha';
import { given } from 'mocha-testdata';

import { check, isLessThanOrEqualTo, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isLessThanOrEqualTo} */
    describe('::isLessThanOrEqualTo', () => {
        class InvestmentLength extends TinyType {
            constructor(public readonly value: number) {
                super();

                check('InvestmentLength', value, isLessThanOrEqualTo(50));
            }
        }

        given(49, 50).
        it('ensures that the argument is less than or equal to the upper bound', (value: number) => {
            expect(new InvestmentLength(value)).to.not.throw;                // tslint:disable-line:no-unused-expression
        });

        it('complains if the argument is greater than the upper bound', () => {
            expect(() => new InvestmentLength(55))
                .to.throw(`InvestmentLength should either be less than 50 or be equal to 50`);
        });

        given(
            undefined,
            null,
            {},
            'string',
        ).it('complains if the value is not an integer', (value: any) => {
            expect(() => new InvestmentLength(value))
                .to.throw(`InvestmentLength should either be less than 50 or be equal to 50`);
        });
    });
});
