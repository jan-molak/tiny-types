import 'mocha';
import { given } from 'mocha-testdata';

import { TinyType, TinyTypeOf } from '../../src';
import { equal } from '../../src/objects';
import { expect } from '../expect';

/** @test {equal} */
describe('equal', () => {
    describe('when used with primitives', () => {

        given<any>(undefined, null, false, 'string', 42).
        it('is reflexive', (primitive: any) => {
            expect(equal(primitive, primitive)).to.be.true;                  // tslint:disable-line:no-unused-expression
        });

        given<{ v1: any, v2: any }>(
            { v1: false,    v2: false             },
            { v1: false,    v2: Boolean(false)    },
            { v1: 'string', v2: 'string'          },
            { v1: 'string', v2: String('string')  },
            { v1: 42,       v2: 42                },
            { v1: 42,       v2: Number(42)        },
            { v1: 42,       v2: 42.0              },
            { v1: 42,       v2: Number(42.0)      },
        ).
        it('is symmetric', ({ v1, v2 }) => {
            expect(equal(v1, v2)).to.be.true;                                // tslint:disable-line:no-unused-expression
            expect(equal(v1, v2)).to.equal(equal(v2, v1));
        });

        given<{ v1: any, v2: any, v3: any }>(
            { v1: false,    v2: false,    v3: false     },
            { v1: 'string', v2: 'string', v3: 'string'  },
            { v1: 42,       v2: 42,       v3: 42        },
        ).
        it('is transitive', ({ v1, v2, v3 }) => {
            expect(equal(v1, v2)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(equal(v2, v3)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(equal(v3, v1)).to.be.true;                               // tslint:disable-line:no-unused-expression
        });

        given<{ v1: any, v2: any }>(
            { v1: false,    v2: true       },
            { v1: 'apple',  v2: 'orange'   },
            { v1: 42,       v2: 24         },
            { v1: false,    v2: 'elephant' },
            { v1: null,     v2: undefined  },
        ).
        it('returns false when subjects are not equal', ({ v1, v2 }) => {
            expect(equal(v1, v2)).to.be.false;                               // tslint:disable-line:no-unused-expression
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

        given<TinyType>(Alice, MsAlice, Team).
        it('is reflexive', (value: TinyType) => {
            expect(equal(value, value)).to.be.true;                          // tslint:disable-line:no-unused-expression
        });

        given<{ v1: TinyType, v2: TinyType }>(
            { v1: new Name('Alice'),    v2: new Name('Alice')   },
            { v1: new Age(28),          v2: new Age(28)         },
            { v1: Team,                 v2: Team                },
            { v1: new Person(Alice, new Age(28)), v2: new Person(Alice, new Age(28))  },
        ).
        it('is symmetric', ({ v1, v2 }) => {
            expect(equal(v1, v2)).to.be.true;                                // tslint:disable-line:no-unused-expression
            expect(equal(v1, v2)).to.equal(equal(v2, v1));
        });

        given<{ v1: TinyType, v2: TinyType, v3: TinyType }>(
            { v1: new Name('Alice'),    v2: new Name('Alice'),  v3: new Name('Alice') },
            { v1: new Age(28),          v2: new Age(28),        v3: new Age(28)       },
            { v1: new Person(Alice, new Age(28)), v2: new Person(Alice, new Age(28)), v3: new Person(Alice, new Age(28)) },
        ).
        it('is transitive', ({ v1, v2, v3 }) => {
            expect(equal(v1, v2)).to.be.true;                                // tslint:disable-line:no-unused-expression
            expect(equal(v2, v3)).to.be.true;                                // tslint:disable-line:no-unused-expression
            expect(equal(v3, v1)).to.be.true;                                // tslint:disable-line:no-unused-expression
        });

        given<{ v1: any, v2: any }>(
            { v1: Alice,    v2: null    },
            { v1: Alice,    v2: Bob     },
            { v1: Bob,      v2: 'cat'   },
            { v1: Alice,    v2: MsAlice },
            { v1: MsAlice,  v2: MrBob   },
            { v1: MrBob,    v2: Team    },
            { v1: Team,     v2: Team2   },
        ).
        it('returns false when subjects are not equal', ({ v1, v2 }) => {
            expect(equal(v1, v2)).to.be.false;                               // tslint:disable-line:no-unused-expression
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

            expect(PrivateAlice.equals(PrivateAlice)).to.be.true;            // tslint:disable-line:no-unused-expression
            expect(PrivateAlice.equals(PrivateRyan)).to.be.false;            // tslint:disable-line:no-unused-expression
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
            expect(equal(dateInstance1, dateInstance1)).to.be.true;          // tslint:disable-line:no-unused-expression
        });

        it('is symmetric', () => {
            expect(equal(dateInstance1, dateInstance2)).to.be.true;          // tslint:disable-line:no-unused-expression
            expect(equal(dateInstance2, dateInstance1)).to.equal(equal(dateInstance1, dateInstance2));
        });

        it('is transitive', () => {
            expect(equal(dateInstance1, dateInstance2)).to.be.true;          // tslint:disable-line:no-unused-expression
            expect(equal(dateInstance2, dateInstance3)).to.be.true;          // tslint:disable-line:no-unused-expression
            expect(equal(dateInstance3, dateInstance1)).to.be.true;          // tslint:disable-line:no-unused-expression
        });

        it('returns false when subjects are not equal', () => {
            expect(equal(dateInstance1, differentDate)).to.be.false;         // tslint:disable-line:no-unused-expression
        });
    });

    /** @test {TinyType#equals} */
    describe('when used with Arrays', () => {
        class Name extends TinyTypeOf<string>() {}

        it('returns false when arrays are of different length', () => {
            expect(equal(
                [ new Name('Alice'), new Name('Bob') ],
                [ new Name('Alice'), new Name('Bob'), new Name('Cyril') ],
            )).to.equal(false);
        });

        it('returns false when arrays contain different items', () => {
            expect(equal(
                [ new Name('Alice'), new Name('Bob'), new Name('Cyril')],
                [ new Name('Alice'), new Name('Bob'), new Name('Cynthia') ],
            )).to.equal(false);
        });

        it('returns true when both arrays contain equal items', () => {
            expect(equal(
                [ new Name('Alice'), new Name('Bob'), new Name('Cynthia') ],
                [ new Name('Alice'), new Name('Bob'), new Name('Cynthia') ],
            )).to.equal(true);
        });
    });
});
