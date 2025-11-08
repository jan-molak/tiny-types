import { describe, expect, it } from 'vitest';

import { ensure, isDefined, isGreaterThanOrEqualTo, isString, property, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {property} */
    describe('::property', () => {

        /** @test {property} */
        describe('shifts the focus from the value itself to its property', () => {

            class Name extends TinyType {
                constructor(public readonly value: string) {
                    super();
                    ensure('Name', value,
                        isDefined(),
                        property('length', isDefined(), isGreaterThanOrEqualTo(3)),
                        isString(),
                    );
                }
            }

            /** @test {property} */
            it('ensures that the property meets the predicates', () => {
                expect(() => new Name('Jan')).not.toThrow();
            });

            it.each([
                undefined,
                null,
            ])('complains when the value is undefined', (value: any) => {
                expect(() => new Name({ length: value } as any))
                    .toThrow(`Name should have a property "length" that is defined`);
            });

            it.each<[ any, string ]>([
                [ undefined, 'Name should be defined' ],
                [ { length: undefined }, 'Name should have a property "length" that is defined' ],
                [ 'JM', 'Name should have a property "length" that is either equal to 3 or is greater than 3' ],
                [ [ 'J', 'a', 'n' ], 'Name should be a string' ],
            ])('can be composed with other predicates', (value: any, expectedError: string) => {
                expect(() => new Name(value)).toThrow(expectedError);
            });
        });
    });
});
