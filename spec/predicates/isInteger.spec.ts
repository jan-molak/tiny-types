import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isInteger, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isInteger} */
    describe('::isInteger', () => {
        class AgeInYears extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('AgeInYears', value, isInteger());
            }
        }

        it('ensures that the argument in an integer', () => {
            expect(new AgeInYears(42)).to.not.throw;                         // tslint:disable-line:no-unused-expression
        });

        given(
            1 / 3,
            0.42,
            undefined,
            null,
            NaN,
            Infinity,
            {},
            'string',
        ).it('complains if the value is not an integer', (value: any) => {
            expect(() => new AgeInYears(value)).to.throw(`AgeInYears should be an integer`);
        });
    });
});
