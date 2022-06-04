import 'mocha';

import { given } from 'mocha-testdata';

import { ensure, matches, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {matches} */
    describe('::matches', () => {

        class CompanyEmailAddress extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('CompanyEmailAddress', value, matches(/[a-z]+\.[a-z]+@example\.org/));
            }
        }

        it('ensures that the argument matches a regular expression', () => {
            expect(() => new CompanyEmailAddress('jan.molak@example.org')).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            'string',
            5,
        ]).
        it('complains if the value does not match the regular expression', (value: any) => {
            expect(() => new CompanyEmailAddress(value))
                .to.throw(`CompanyEmailAddress should match pattern /[a-z]+\\.[a-z]+@example\\.org/`);
        });
    });
});
