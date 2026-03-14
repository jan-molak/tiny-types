import { describe, expect, it } from 'vitest';

import { ensure, isInstanceOf, isTinyType, isTinyTypeOf, TinyType, TinyTypeOf } from '../../src';

// Simulate a class loaded from a different module by creating
// a "different" constructor with the same name.
// This simulates what happens when the same class is loaded
// from both ESM and CJS - we get two distinct constructor functions
function createSeparateModuleDuration(): new (value: number) => TinyType & { value: number } {
    return class Duration extends TinyTypeOf<number>() {};
}

describe('predicates', () => {

    /** @test {isInstanceOf} */
    describe('::isInstanceOf', () => {
        class Birthday extends TinyType {
            constructor(public readonly value: Date) {
                super();

                ensure('Birthday', value, isInstanceOf(Date));
            }
        }

        it('ensures that the argument is an instance of Date', () => {
            expect(() => new Birthday(new Date())).not.toThrow();
        });

        it.each([
            '2018-10-10',
            undefined,
            null,
            {},
            'string',
        ])('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new Birthday(value)).toThrow(`Birthday should be instance of Date`);
        });

        describe('cross-module identification (dual-package hazard)', () => {

            class Duration extends TinyTypeOf<number>() {}

            class CustomDuration extends TinyType {
                constructor(public readonly milliseconds: number) {
                    super();
                }
            }

            it('brands TinyType instances for cross-module identification', () => {
                const duration = new Duration(500);

                expect(isTinyType(duration)).toBe(true);
            });

            it('returns false for non-TinyType values', () => {
                expect(isTinyType(null)).toBe(false);
                // eslint-disable-next-line unicorn/no-useless-undefined
                expect(isTinyType(undefined)).toBe(false);
                expect(isTinyType({})).toBe(false);
                expect(isTinyType(42)).toBe(false);
                expect(isTinyType('string')).toBe(false);
                expect(isTinyType(new Date())).toBe(false);
            });

            it('identifies TinyType subclass instances by type', () => {
                const duration = new Duration(500);

                expect(isTinyTypeOf(duration, Duration)).toBe(true);
            });

            it('returns false when checking against wrong TinyType subclass', () => {
                const duration = new Duration(500);
                const customDuration = new CustomDuration(500);

                expect(isTinyTypeOf(duration, CustomDuration)).toBe(false);
                expect(isTinyTypeOf(customDuration, Duration)).toBe(false);
            });

            it('works with isInstanceOf predicate for TinyType subclasses', () => {
                const duration = new Duration(500);

                expect(() => ensure('duration', duration, isInstanceOf(Duration))).not.toThrow();
            });

            it('fails isInstanceOf for wrong TinyType subclass', () => {
                const duration = new Duration(500);

                expect(() => ensure('duration', duration, isInstanceOf(CustomDuration) as any))
                    .toThrow('duration should be instance of CustomDuration');
            });

            describe('simulating cross-module scenario', () => {

                it('identifies instances across module boundaries using brand check', () => {
                    const Duration1 = Duration;
                    const Duration2 = createSeparateModuleDuration();

                    // These are different constructors (simulating ESM vs CJS)
                    expect(Duration1).not.toBe(Duration2);

                    const instance1 = new Duration1(500);
                    const instance2 = new Duration2(500);

                    // Both are TinyTypes
                    expect(isTinyType(instance1)).toBe(true);
                    expect(isTinyType(instance2)).toBe(true);

                    // And can be identified by class name
                    expect(isTinyTypeOf(instance1, Duration1)).toBe(true);
                    expect(isTinyTypeOf(instance2, Duration2)).toBe(true);

                    // Cross-module check works via name matching
                    // This is the key feature - even though Duration1 !== Duration2,
                    // isTinyTypeOf recognizes them as the same type by name
                    expect(isTinyTypeOf(instance1, Duration2)).toBe(true);
                    expect(isTinyTypeOf(instance2, Duration1)).toBe(true);
                });

                it('isInstanceOf predicate works across module boundaries', () => {
                    const Duration1 = Duration;
                    const Duration2 = createSeparateModuleDuration();

                    const instance1 = new Duration1(500);

                    // This is the key test - isInstanceOf should work even when
                    // checking against a "different" constructor with the same name
                    expect(() => ensure('duration', instance1, isInstanceOf(Duration2))).not.toThrow();
                });
            });
        });
    });
});
