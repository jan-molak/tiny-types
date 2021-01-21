import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isBoolean, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isBoolean} */
    describe('::isBoolean', () => {

        class MarketingOptIn extends TinyType {
            constructor(public readonly value: boolean) {
                super();

                ensure('MarketingOptIn', value, isBoolean());
            }
        }

        it('ensures that the argument is a boolean value', () => {
            expect(() => new MarketingOptIn(false)).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            'string',
            5,
        ]).
        it('complains if the value is not a boolean', (value: any) => {
            expect(() => new MarketingOptIn(value)).to.throw(`MarketingOptIn should be a boolean value`);
        });
    });
});
