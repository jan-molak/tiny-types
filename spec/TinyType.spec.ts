import 'mocha';
import { TinyType } from '../src/TinyType';
import expect = require('./expect');
import { given } from 'mocha-testdata';

describe('TinyTypes', () => {

    describe('::equals', () => {
        class Name extends TinyType {
            constructor(public readonly value: string) {
                super();
            }
        }

        class Role extends TinyType {
            constructor(public readonly value: string) {
                super();
            }
        }

        class Person extends TinyType {
            constructor(public readonly name: Name, public readonly role: Role) { super(); }
        }

        it('is reflexive', () => {

            const n1 = new Name('Jan');

            expect(n1.equals(n1)).to.be.true;
        });

        it('is symmetric', () => {

            const
                n1 = new Name('Jan'),
                n2 = new Name('Jan');

            expect(n1.equals(n2)).to.be.true;
            expect(n1.equals(n2)).to.equal(n2.equals(n1));
        });

        it('is transitive', () => {

            const
                n1 = new Name('Jan'),
                n2 = new Name('Jan'),
                n3 = new Name('Jan');

            expect(n1.equals(n2)).to.be.true;
            expect(n2.equals(n3)).to.be.true;
            expect(n1.equals(n3)).to.be.true;
        });

        it('is recursive', () => {

            const
                p1 = new Person(new Name('Jan'), new Role('dev')),
                p2 = new Person(new Name('Jan'), new Role('dev')),
                p3 = new Person(new Name('John'), new Role('dev'));

            expect(p1.equals(p2)).to.be.true;
            expect(p1.equals(p3)).to.be.false;
        });

        it('works for private fields', () => {
            class PrivatePerson extends TinyType {
                constructor(private readonly name: Name, public readonly role: Role) { super(); }
            }

            const
                p1 = new PrivatePerson(new Name('Jan'), new Role('dev')),
                p2 = new PrivatePerson(new Name('Jan'), new Role('dev')),
                p3 = new PrivatePerson(new Name('John'), new Role('dev'));

            expect(p1.equals(p2)).to.be.true;
            expect(p1.equals(p3)).to.be.false;
        });


        given(
            undefined,
            null,
            {},
            [],
            1,
            '',
            false
        ).it('is false for objects of a different type', (another: any) => {
            const n = new Name('Jan');

            expect(n.equals(another)).to.be.false;
        })
    });

    describe('::toString', () => {
        class Postcode extends TinyType {
            constructor(
                public readonly area: Area,
                public readonly district: District,
                public readonly sector: Sector,
                public readonly unit: Unit,
            ) {
                super();
            }
        }

        class Area extends TinyType {
            constructor(public readonly code: string) {
                super();
            }
        }

        class District extends TinyType {
            constructor(public readonly code: number) {
                super();
            }
        }

        class Sector extends TinyType {
            constructor(public readonly code: number) {
                super();
            }
        }

        class Unit extends TinyType {
            constructor(public readonly code: string) {
                super();
            }
        }

        it('mentions the class and its properties', () => {
            const area = new Area('GU');

            expect(area.toString()).to.equal('Area(code=GU)')
        });


        it('mentions the class and its fields', () => {
            class Person extends TinyType {
                constructor(public readonly name: string) {
                    super();
                }
                rename = (newName: string) => new Person(newName);
            }

            const p = new Person('James');

            expect(p.toString())
                .to.equal('Person(name=James)')
        });

        it('only cares about the fields, not the methods', () => {
            const postcode = new Postcode(
                new Area('GU'),
                new District(15),
                new Sector(9),
                new Unit('NZ'),
            );

            expect(postcode.toString())
                .to.equal('Postcode(area=Area(code=GU), district=District(code=15), sector=Sector(code=9), unit=Unit(code=NZ))')
        });
    });
});

