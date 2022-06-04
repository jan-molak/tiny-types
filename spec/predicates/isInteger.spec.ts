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
            expect(() => new AgeInYears(42)).to.not.throw();
        });

        given([
            1 / 3,
            0.42,
            undefined,
            null,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            {},
            'string',
        ]).
        it('complains if the value is not an integer', (value: any) => {
            expect(() => new AgeInYears(value)).to.throw(`AgeInYears should be an integer`);
        });
    });
});
