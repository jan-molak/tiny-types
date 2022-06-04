import 'mocha';

import { given } from 'mocha-testdata';

import { ensure, isNumber, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isNumber} */
    describe('::isNumber', () => {
        class Percentage extends TinyType {
            constructor(public readonly value: number) {
                super();

                ensure('Percentage', value, isNumber());
            }
        }

        it('ensures that the argument in a number', () => {
            expect(() => new Percentage(42)).to.not.throw();
        });

        given([
            1 / 3,
            0.42,
            0o3,
            0xB4D455,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]).
        it('works for any type of number', (value: any) => {
            expect(() => new Percentage(value)).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            'string',
        ]).
        it('complains if the value is not a number', (value: any) => {
            expect(() => new Percentage(value)).to.throw(`Percentage should be a number`);
        });
    });
});
