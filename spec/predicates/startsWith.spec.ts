import 'mocha';

import { given } from 'mocha-testdata';

import { ensure, startsWith, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {startsWith} */
    describe('::startsWith', () => {

        class Username extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('Username', value, startsWith('usr'));
            }
        }

        it('ensures that the argument starts with a given prefix', () => {
            expect(() => new Username('usr123')).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            'string',
            5,
        ]).
        it('complains if the value does not start with the given prefix', (value: any) => {
            expect(() => new Username(value))
                .to.throw(`Username should start with 'usr'`);
        });
    });
});
