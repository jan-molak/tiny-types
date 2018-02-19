import 'mocha';
import { given } from 'mocha-testdata';
import { JSONObject, JSONPrimitive, TinyType, TinyTypeOf } from '../src';
import { expect } from './expect';

/** @test {TinyType} */
describe('TinyType', () => {

    /** @test {TinyType} */
    describe('definition', () => {

        /** @test {TinyTypeOf} */
        it('can be a one-liner for TinyTypes representing a single value', () => {
            class FirstName extends TinyTypeOf<string>() {}

            const firstName = new FirstName('Jan');

            expect(firstName.value).to.equal('Jan');
            expect(firstName).to.be.instanceOf(FirstName);
            expect(firstName).to.be.instanceOf(TinyType);
            expect(firstName.constructor.name).to.equal('FirstName');
            expect(firstName.toString()).to.equal('FirstName(value=Jan)');
        });

        /**
         * @test {TinyType}
         * @test {TinyTypeOf}
         */
        it('needs to extend the TinyType for types with more than one value', () => {
            class FirstName extends TinyTypeOf<string>() {}
            class LastName extends TinyTypeOf<string>() {}

            class FullName extends TinyType {
                constructor(public readonly firstName: FirstName,
                            public readonly lastName: LastName) {
                    super();
                }
            }

            const fullName = new FullName(new FirstName('Jan'), new LastName('Molak'));

            expect(fullName.firstName.value).to.equal('Jan');
            expect(fullName.lastName.value).to.equal('Molak');
            expect(fullName).to.be.instanceOf(FullName);
            expect(fullName).to.be.instanceOf(FullName);
            expect(fullName.constructor.name).to.equal('FullName');
            expect(fullName.toString()).to.equal('FullName(firstName=FirstName(value=Jan), lastName=LastName(value=Molak))');
        });

        /**
         * @test {TinyType}
         * @test {TinyTypeOf}
         */
        it('can be mixed and matched', () => {
            const now = new Date(Date.UTC(2018, 2, 12, 0, 30, 0));

            class UserName extends TinyTypeOf<string>() {}
            class Timestamp extends TinyTypeOf<Date>() {
                toString() {
                    return `Timestamp(value=${this.value.toISOString()})`;
                }
            }

            abstract class DomainEvent extends TinyTypeOf<Timestamp>() {}

            class AccountCreated extends DomainEvent {
                constructor(public readonly username: UserName, timestamp: Timestamp) {
                    super(timestamp);
                }
            }

            const e = new AccountCreated(new UserName('jan-molak'), new Timestamp(now));

            expect(e.toString()).to.equal(
                'AccountCreated(username=UserName(value=jan-molak), value=Timestamp(value=2018-03-12T00:30:00.000Z))',
            );
        });
    });

    /** @test {TinyType#equals} */
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

            expect(n1.equals(n1)).to.be.true;                               // tslint:disable-line:no-unused-expression
        });

        it('is symmetric', () => {

            const
                n1 = new Name('Jan'),
                n2 = new Name('Jan');

            expect(n1.equals(n2)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(n1.equals(n2)).to.equal(n2.equals(n1));
        });

        it('is transitive', () => {

            const
                n1 = new Name('Jan'),
                n2 = new Name('Jan'),
                n3 = new Name('Jan');

            expect(n1.equals(n2)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(n2.equals(n3)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(n1.equals(n3)).to.be.true;                               // tslint:disable-line:no-unused-expression
        });

        it('is recursive', () => {

            const
                p1 = new Person(new Name('Jan'), new Role('dev')),
                p2 = new Person(new Name('Jan'), new Role('dev')),
                p3 = new Person(new Name('John'), new Role('dev'));

            expect(p1.equals(p2)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(p1.equals(p3)).to.be.false;                              // tslint:disable-line:no-unused-expression
        });

        it('works for private fields', () => {
            class PrivatePerson extends TinyType {
                constructor(private readonly name: Name, public readonly role: Role) { super(); }
            }

            const
                p1 = new PrivatePerson(new Name('Jan'), new Role('dev')),
                p2 = new PrivatePerson(new Name('Jan'), new Role('dev')),
                p3 = new PrivatePerson(new Name('John'), new Role('dev'));

            expect(p1.equals(p2)).to.be.true;                               // tslint:disable-line:no-unused-expression
            expect(p1.equals(p3)).to.be.false;                              // tslint:disable-line:no-unused-expression
        });

        given(
            undefined,
            null,
            {},
            [],
            1,
            '',
            false,
        ).it('is false for objects of a different type', (another: any) => {
            const n = new Name('Jan');

            expect(n.equals(another)).to.be.false;                          // tslint:disable-line:no-unused-expression
        });
    });

    /** @test {TinyType#toString} */
    describe('::toString', () => {
        class Area      extends TinyTypeOf<string>() {}
        class District  extends TinyTypeOf<number>() {}
        class Sector    extends TinyTypeOf<number>() {}
        class Unit      extends TinyTypeOf<string>() {}

        class Postcode extends TinyType {
            constructor(public readonly area: Area,
                        public readonly district: District,
                        public readonly sector: Sector,
                        public readonly unit: Unit,
            ) {
                super();
            }
        }

        it('mentions the class and its properties', () => {
            const area = new Area('GU');

            expect(area.toString()).to.equal('Area(value=GU)');
        });

        it('mentions the class and its fields, but not the methods', () => {
            class Person extends TinyType {
                constructor(public readonly name: string) {
                    super();
                }
                rename = (newName: string) => new Person(newName);
            }

            const p = new Person('James');

            expect(p.toString())
                .to.equal('Person(name=James)');
        });

        it('only cares about the fields, not the methods', () => {
            const postcode = new Postcode(
                new Area('GU'),
                new District(15),
                new Sector(9),
                new Unit('NZ'),
            );

            expect(postcode.toString())
                .to.equal('Postcode(area=Area(value=GU), district=District(value=15), sector=Sector(value=9), unit=Unit(value=NZ))');
        });
    });

    /** @test {TinyType#toJSON} */
    describe('serialisation', () => {

        class FirstName extends TinyTypeOf<string>() {}
        class LastName extends TinyTypeOf<string>() {}
        class Age extends TinyTypeOf<number>() {}
        class Person extends TinyType {
            constructor(
                public readonly firstName: FirstName,
                public readonly lastName: LastName,
                public readonly age: Age,
            ) {
                super();
            }
        }

        describe('::toJSON', () => {

            given<TinyType & { value: any }>(
                new FirstName('Bruce'),
                new Age(55),
            ).
            it('should serialise a single-value TinyType to just its value', input => {
               expect(input.toJSON()).to.equal(input.value);
            });

            it('should serialise a complex TinyType recursively', () => {

                const person = new Person(new FirstName('Bruce'), new LastName('Smith'), new Age(55));

                expect(person.toJSON()).to.deep.equal({
                    firstName: 'Bruce',
                    lastName: 'Smith',
                    age: 55,
                });
            });

            it(`should JSON.stringify any object that can't be represented in a more sensible way`, () => {
                class TT extends TinyTypeOf<object>() {}

                const tt = new TT(new Object({ key: 'value' }));

                expect(tt.toJSON()).to.equal('{"key":"value"}');
            });
        });
    });

    /** @test {TinyType} */
    describe('de-serialisation', () => {

        type SerialisedFirstName = string & JSONPrimitive;
        class FirstName extends TinyTypeOf<string>() {
            static fromJSON = (v: SerialisedFirstName) => new FirstName(v);
            toJSON(): SerialisedFirstName {
                return super.toJSON() as SerialisedFirstName;
            }
        }

        type SerialisedLastName = string & JSONPrimitive;
        class LastName extends TinyTypeOf<string>() {
            static fromJSON = (v: SerialisedLastName) => new LastName(v);
            toJSON(): SerialisedLastName {
                return super.toJSON() as SerialisedLastName;
            }
        }

        type SerialisedAge = number & JSONPrimitive;
        class Age extends TinyTypeOf<number>() {
            static fromJSON = (v: SerialisedAge) => new Age(v);
            toJSON(): SerialisedAge {
                return super.toJSON() as SerialisedAge;
            }
        }

        interface SerialisedPerson extends JSONObject {
            firstName: SerialisedFirstName;
            lastName: SerialisedLastName;
            age: SerialisedAge;
        }
        class Person extends TinyType {
            static fromJSON = (v: SerialisedPerson) => new Person(
                FirstName.fromJSON(v.firstName),
                LastName.fromJSON(v.lastName),
                Age.fromJSON(v.age),
            )

            constructor(public readonly firstName: FirstName,
                        public readonly lastName: LastName,
                        public readonly age: Age,
            ) {
                super();
            }

            toJSON(): SerialisedPerson {
                return super.toJSON() as SerialisedPerson;
            }
        }

        it('custom fromJSON can de-serialise a serialised single-value TinyType', () => {
            const firstName = new FirstName('Jan');

            // tslint:disable-next-line:no-unused-expression
            expect(FirstName.fromJSON(firstName.toJSON()).equals(firstName)).to.be.true;
        });

        it('custom fromJSON can recursively de-serialise a serialised complex TinyType', () => {
            const person = new Person(new FirstName('Bruce'), new LastName('Smith'), new Age(55));

            // tslint:disable-next-line:no-unused-expression
            expect(Person.fromJSON(person.toJSON()).equals(person)).to.be.true;
        });
    });
});
