import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isInstanceOf, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isInstanceOf} */
    describe('::isInstanceOf', () => {
        class Birthday extends TinyType {
            constructor(public readonly value: Date) {
                super();

                ensure('Birthday', value, isInstanceOf(Date));
            }
        }

        it('ensures that the argument is an instance of Date', () => {
            expect(() => new Birthday(new Date())).to.not.throw;              // tslint:disable-line:no-unused-expression
        });

        given(
            '2018-10-10',
            undefined,
            null,
            {},
            'string',
        ).it('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new Birthday(value)).to.throw(`Birthday should be instance of Date`);
        });
    });
});
