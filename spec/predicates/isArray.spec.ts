import 'mocha';
import { given } from 'mocha-testdata';

import { check, isArray, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isArray} */
    describe('::isArray', () => {

        class Strings extends TinyType {
            constructor(public readonly values: string[]) {
                super();

                check('Collection', values, isArray());
            }
        }

        it('ensures that the argument is an array', () => {
            expect(new Strings(['lorem', 'ipsum'])).to.not.throw;          // tslint:disable-line:no-unused-expression
        });

        given(
            undefined,
            null,
            {},
            false,
            5,
        ).it('complains if the value is not an array and provides', (value: any) => {
            expect(() => new Strings(value)).to.throw(`Collection should be an array`);
        });
    });
});
