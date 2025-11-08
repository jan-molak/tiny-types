import { describe, expect, it } from 'vitest';

import { ensure, hasLengthOf, TinyType } from '../../src';

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
                expect(() => new Password('P@ssw0rd')).not.toThrow();
            });

            it.each([
                '7_chars',
                '9___chars',
            ])('complains if the value is of incorrect length', (value: string) => {
                expect(() => new Password(value)).toThrow(`Password should have a property "length" that is equal to 8`);
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
                expect(() => new Collection([ 'a', 'b' ])).not.toThrow();
            });

            it.each([
                [ 'a' ],
                [ 'a', 'b', 'c' ],
            ])('complains if the value is of incorrect length', (...values: string[]) => {
                expect(() => new Collection(values)).toThrow(
                    `Collection should have a property "length" that is equal to 2`
                );
            });
        });
    });
});
