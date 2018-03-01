import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, hasLengthOf, TinyType } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {hasLengthOf} */
    describe('::hasLengthOf', () => {

        /** @test {hasLengthOf} */
        describe('when used with strings', () => {
            class Password extends TinyType {
                constructor(public readonly value: string) {
                    super();

                    ensure('Password', value, hasLengthOf(8));
                }
            }

            it('ensures that the value has a correct length', () => {
                expect(new Password('P@ssw0rd')).to.not.throw;                   // tslint:disable-line:no-unused-expression
            });

            given(
                undefined,
                null,
            ).
            it('complains when the value is undefined', (value: any) => {
                expect(() => new Password(value)).to.throw(`Password should have a length of 8`);
            });

            given(
                '7_chars',
                '9___chars',
            ).
            it('complains if the value is of incorrect length', (value: string) => {
                expect(() => new Password(value)).to.throw(`Password should have a length of 8`);
            });
        });

        /** @test {hasLengthOf} */
        describe('when used with arrays', () => {
            class Collection extends TinyType {
                constructor(public readonly values: string[]) {
                    super();

                    ensure('Collection', values, hasLengthOf(2));
                }
            }

            it('ensures that the value has a correct length', () => {
                expect(new Collection(['a', 'b'])).to.not.throw;             // tslint:disable-line:no-unused-expression
            });

            given(
                ['a'],
                ['a', 'b', 'c'],
            ).
            it('complains if the value is of incorrect length', (values: string[]) => {
                expect(() => new Collection(values)).to.throw(`Collection should have a length of 2`);
            });
        });
    });
});
