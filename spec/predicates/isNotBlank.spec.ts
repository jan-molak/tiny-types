import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isNotBlank, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isBlank} */
    describe('::isNotBlank', () => {
        class FirstName extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('FirstName', value, isNotBlank());
            }
        }

        it('ensures that the argument in not blank', () => {
            expect(() => new FirstName('Jan')).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            [],
            42,
            ''
        ]).
        it('complains if the value is blank or not a string', (value: any) => {
            expect(() => new FirstName(value)).to.throw(`FirstName should not be blank`);
        });
    });
});
