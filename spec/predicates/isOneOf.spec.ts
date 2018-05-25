import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isOneOf, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isOneOf} */
    describe('::isOneOf', () => {

        class StreetLight extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('StreetLight', value, isOneOf('red', 'yellow', 'green'));
            }
        }

        given('red', 'yellow', 'green').
        it('ensures that the value is equal to one of the allowed values', (value: string) => {
            expect(() => new StreetLight(value)).to.not.throw;               // tslint:disable-line:no-unused-expression
        });

        it('complains if the value not one the allowed ones', () => {
            expect(() => new StreetLight('green-ish'))
                .to.throw(`StreetLight should either be equal to red, be equal to yellow or be equal to green`);
        });

        given(
            undefined,
            null,
            {},
            false,
        ).
        it('complains if the value is of a wrong type', (value: any) => {
            expect(() => new StreetLight(value))
                .to.throw(`StreetLight should either be equal to red, be equal to yellow or be equal to green`);
        });
    });
});
