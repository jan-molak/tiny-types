import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isLessThan, TinyType } from '../../src';
import { expect } from '../expect';

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
            expect(new InvestmentLength(5)).to.not.throw;                    // tslint:disable-line:no-unused-expression
        });

        it('complains if the argument is more than a specified number', () => {
            expect(() => new InvestmentLength(55)).to.throw(`InvestmentLength should be less than 50`);
        });

        given(
            undefined,
            null,
            {},
            'string',
        ).it('complains if the value is not an integer', (value: any) => {
            expect(() => new InvestmentLength(value)).to.throw(`InvestmentLength should be less than 50`);
        });
    });
});
