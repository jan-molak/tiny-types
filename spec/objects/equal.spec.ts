import { describe, expect, it } from 'vitest';

import { isTinyType, TinyType, TinyTypeOf } from '../../src';
import { equal } from '../../src/objects';

// Symbol used to brand TinyType instances - must match the one in TinyType.ts
const TINY_TYPE_BRAND = Symbol.for('tiny-types/TinyType');

/**
 * Creates a mock TinyType-like object that simulates an instance
 * created from a different module format (ESM vs CJS).
 * The object has the TinyType brand but a different constructor reference.
 */
function createCrossModuleInstance<T>(className: string, value: T): object {
    // Create a class with the specified name to simulate a cross-module class
    const CrossModuleClass = { [className]: class {
        value = value;
    } }[className];

    const instance = new CrossModuleClass();
    // Brand it as a TinyType
    (instance as any)[TINY_TYPE_BRAND] = true;
    return instance;
}

/** @test {equal} */
describe('equal', () => {
    describe('when used with primitives', () => {

        it.each<any>([
            undefined,
            null,
            false,
            'string',
            42
        ])('is reflexive', (primitive: any) => {
            expect(equal(primitive, primitive)).toEqual(true);
        });

        it.each<{ v1: any, v2: any }>([
            { v1: false,    v2: false             },
            { v1: false,    v2: Boolean(false)    },
            { v1: 'string', v2: 'string'          },
            { v1: 'string', v2: String('string')  },
            { v1: 42,       v2: 42                },
            { v1: 42,       v2: Number(42)        },
            { v1: 42,       v2: 42              },
            { v1: 42,       v2: Number(42)      },
        ])('is symmetric', ({ v1, v2 }) => {
            expect(equal(v1, v2)).toEqual(true);
            expect(equal(v1, v2)).toEqual(equal(v2, v1));
        });

        it.each<{ v1: any, v2: any, v3: any }>([
            { v1: false,    v2: false,    v3: false     },
            { v1: 'string', v2: 'string', v3: 'string'  },
            { v1: 42,       v2: 42,       v3: 42        },
        ])('is transitive', ({ v1, v2, v3 }) => {
            expect(equal(v1, v2)).toEqual(true);
            expect(equal(v2, v3)).toEqual(true);
            expect(equal(v3, v1)).toEqual(true);
        });

        it.each<{ v1: any, v2: any }>([
            { v1: false,    v2: true       },
            { v1: 'apple',  v2: 'orange'   },
            { v1: 42,       v2: 24         },
            { v1: false,    v2: 'elephant' },
            { v1: null,     v2: undefined  },
        ])('returns false when subjects are not equal', ({ v1, v2 }) => {
            expect(equal(v1, v2)).toEqual(false);
        });
    });

    /** @test {TinyType#equals} */
    describe('when used with TinyTypes', () => {

        class Name extends TinyTypeOf<string>() {}
        class Age  extends TinyTypeOf<number>() {}

        class Person extends TinyType {
            constructor(public readonly name: Name, public readonly role: Age) {
                super();
            }
        }

        // Please note that there's not much point in wrapping an array into a tiny type, as it doesn't provide
        // methods you'd expect from a list, such as map, reduce, forEach, etc.
        // What People is here to demonstrate is that `equals` works equally well (pun intended)
        // with tiny types with a member field of type Array.
        class People extends TinyTypeOf<Person[]>() {}

        const
            Alice   = new Name('Alice'),
            Bob     = new Name('Bob'),
            MsAlice = new Person(Alice, new Age(28)),
            MrBob   = new Person(Alice, new Age(38)),
            Team    = new People([MsAlice, MrBob]),
            Team2   = new People([MsAlice]);

        it.each<TinyType>([
            Alice,
            MsAlice,
            Team
        ])('is reflexive', (value: TinyType) => {
            expect(equal(value, value)).toEqual(true);
        });

        it.each<{ v1: TinyType, v2: TinyType }>([
            { v1: new Name('Alice'),    v2: new Name('Alice')   },
            { v1: new Age(28),          v2: new Age(28)         },
            { v1: Team,                 v2: Team                },
            { v1: new Person(Alice, new Age(28)), v2: new Person(Alice, new Age(28))  },
        ])('is symmetric', ({ v1, v2 }) => {
            expect(equal(v1, v2)).toEqual(true);
            expect(equal(v1, v2)).toEqual(equal(v2, v1));
        });

        it.each<{ v1: TinyType, v2: TinyType, v3: TinyType }>([
            { v1: new Name('Alice'),    v2: new Name('Alice'),  v3: new Name('Alice') },
            { v1: new Age(28),          v2: new Age(28),        v3: new Age(28)       },
            { v1: new Person(Alice, new Age(28)), v2: new Person(Alice, new Age(28)), v3: new Person(Alice, new Age(28)) },
        ])('is transitive', ({ v1, v2, v3 }) => {
            expect(equal(v1, v2)).toEqual(true);
            expect(equal(v2, v3)).toEqual(true);
            expect(equal(v3, v1)).toEqual(true);
        });

        it.each<{ v1: any, v2: any }>([
            { v1: Alice,    v2: null    },
            { v1: Alice,    v2: Bob     },
            { v1: Bob,      v2: 'cat'   },
            { v1: Alice,    v2: MsAlice },
            { v1: MsAlice,  v2: MrBob   },
            { v1: MrBob,    v2: Team    },
            { v1: Team,     v2: Team2   },
        ])('returns false when subjects are not equal', ({ v1, v2 }) => {
            expect(equal(v1, v2)).toEqual(false);
        });

        it('compares public and private member fields', () => {
            class PrivatePerson extends TinyType {
                constructor(private readonly name: Name, private readonly age: Age) {
                    super();
                }
            }

            const
                PrivateAlice = new PrivatePerson(new Name('Alice'), new Age(28)),
                PrivateRyan  = new PrivatePerson(new Name('Ryan'), new Age(28));

            expect(PrivateAlice.equals(PrivateAlice)).toEqual(true);
            expect(PrivateAlice.equals(PrivateRyan)).toEqual(false);
        });
    });

    /** @test {TinyType#equals} */
    describe('when used with TinyTypes with optional fields', () => {

        class FirstName extends TinyTypeOf<string>() {}
        class LastName extends TinyTypeOf<string>() {}

        class Magician extends TinyType {
            constructor(
                public readonly firstName: FirstName,
                public readonly lastName?: LastName,
            ) {
                super();
            }
        }

        it('returns true when the non-optional fields are equal', () => {
            const
                t1 = new Magician(new FirstName('Teller')),
                t2 = new Magician(new FirstName('Teller'));

            expect(equal(t1, t2)).toEqual(true);
        });
    });

    /** @test {TinyType#equals} */
    describe('when used with Dates', () => {
        const
            dateInstance1 = new Date('2018-05-01T12:00:00.000Z'),
            dateInstance2 = new Date('2018-05-01T12:00:00.000Z'),
            dateInstance3 = new Date('2018-05-01T12:00:00.000Z'),
            differentDate = new Date('2042-05-01T12:15:30.000Z');

        it('is reflexive', () => {
            expect(equal(dateInstance1, dateInstance1)).toEqual(true);
        });

        it('is symmetric', () => {
            expect(equal(dateInstance1, dateInstance2)).toEqual(true);
            expect(equal(dateInstance2, dateInstance1)).toEqual(equal(dateInstance1, dateInstance2));
        });

        it('is transitive', () => {
            expect(equal(dateInstance1, dateInstance2)).toEqual(true);
            expect(equal(dateInstance2, dateInstance3)).toEqual(true);
            expect(equal(dateInstance3, dateInstance1)).toEqual(true);
        });

        it('returns false when subjects are not equal', () => {
            expect(equal(dateInstance1, differentDate)).toEqual(false);
        });
    });

    /** @test {TinyType#equals} */
    describe('when used with Arrays', () => {
        class Name extends TinyTypeOf<string>() {}

        it('returns false when arrays are of different length', () => {
            expect(equal(
                [ new Name('Alice'), new Name('Bob') ],
                [ new Name('Alice'), new Name('Bob'), new Name('Cyril') ],
            )).toEqual(false);
        });

        it('returns false when arrays contain different items', () => {
            expect(equal(
                [ new Name('Alice'), new Name('Bob'), new Name('Cyril')],
                [ new Name('Alice'), new Name('Bob'), new Name('Cynthia') ],
            )).toEqual(false);
        });

        it('returns true when both arrays contain equal items', () => {
            expect(equal(
                [ new Name('Alice'), new Name('Bob'), new Name('Cynthia') ],
                [ new Name('Alice'), new Name('Bob'), new Name('Cynthia') ],
            )).toEqual(true);
        });
    });

    /**
     * @test {equal}
     * @desc Tests for cross-module equality (ESM/CJS dual-package hazard mitigation)
     *
     * When the same TinyType class is loaded from both ESM and CJS contexts,
     * the constructors are different objects, causing native instanceof to fail.
     * The equal() function should handle this by comparing constructor names
     * for TinyType instances.
     */
    describe('when comparing TinyTypes across module boundaries (dual-package hazard)', () => {

        class Name extends TinyTypeOf<string>() {}

        it('returns true when comparing TinyType instances with same class name and value from different module contexts', () => {
            const esmName = new Name('Alice');
            const cjsName = createCrossModuleInstance('Name', 'Alice');

            // Both should be recognized as TinyType instances
            expect(isTinyType(esmName)).toBe(true);
            expect(isTinyType(cjsName)).toBe(true);

            // They should be considered equal despite different constructor references
            expect(equal(esmName, cjsName)).toBe(true);
        });

        it('returns false when comparing TinyType instances with same class name but different values', () => {
            const esmName = new Name('Alice');
            const cjsName = createCrossModuleInstance('Name', 'Bob');

            expect(equal(esmName, cjsName)).toBe(false);
        });

        it('returns false when comparing TinyType instances with different class names', () => {
            const esmName = new Name('Alice');
            const cjsAge = createCrossModuleInstance('Age', 'Alice');

            expect(equal(esmName, cjsAge)).toBe(false);
        });

        it('still uses instanceof for non-TinyType objects', () => {
            class RegularClass {
                constructor(public readonly value: string) {}
            }

            const object1 = new RegularClass('test');
            const object2 = new RegularClass('test');

            // Regular objects should still work with instanceof-based comparison
            expect(equal(object1, object2)).toBe(true);
        });

        it('returns false when comparing TinyType with non-TinyType object of same shape', () => {
            const tinyTypeName = new Name('Alice');

            // Create a plain object with same structure but no TinyType brand
            class FakeName {
                constructor(public readonly value: string) {}
            }
            const plainObject = new FakeName('Alice');

            // sameClass should return false because plainObject is not a TinyType
            // and instanceof check will fail
            expect(isTinyType(tinyTypeName)).toBe(true);
            expect(isTinyType(plainObject)).toBe(false);
            expect(equal(tinyTypeName, plainObject)).toBe(false);
        });
    });
});
