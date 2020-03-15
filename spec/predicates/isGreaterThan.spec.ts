import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isGreaterThan, TinyType } from '../../src';
import { expect } from '../expect';

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
            expect(() => new InvestmentLength(5)).to.not.throw;              // tslint:disable-line:no-unused-expression
        });

        it('complains if the argument is more than a specified number', () => {
            expect(() => new InvestmentLength(-1)).to.throw(`InvestmentLength should be greater than 0`);
        });

        given([
            0,
            -1,
            undefined,
            null,
            {},
            'string',
        ]).
        it('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new InvestmentLength(value)).to.throw(`InvestmentLength should be greater than 0`);
        });
    });
});
