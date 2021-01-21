import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isString, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isString} */
    describe('::isString', () => {
        class FirstName extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('FirstName', value, isString());
            }
        }

        it('ensures that the argument is a string', () => {
            expect(() => new FirstName('Jan')).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            [],
            42,
        ]).
        it('complains if the value is not a string', (value: any) => {
            expect(() => new FirstName(value)).to.throw(`FirstName should be a string`);
        });
    });
});
