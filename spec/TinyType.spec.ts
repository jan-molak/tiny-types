import 'mocha';

import { given } from 'mocha-testdata';

import { JSONObject, JSONPrimitive, TinyType, TinyTypeOf } from '../src';
import { expect } from './expect';

/** @test {TinyType} */
describe('TinyType', () => {

    describe('wrapping a single value', () => {

        /** @test {TinyType} */
        describe('definition', () => {

            /** @test {TinyTypeOf} */
            it('can be a one-liner for TinyTypes representing a single value', () => {
                class FirstName extends TinyTypeOf<string>() {
                }

                const firstName = new FirstName('Jan');

                expect(firstName.value).to.equal('Jan');
                expect(firstName).to.be.instanceOf(FirstName);
                expect(firstName).to.be.instanceOf(TinyType);
                expect(firstName.constructor.name).to.equal('FirstName');
                expect(firstName.toString()).to.equal('FirstName(value=Jan)');
            });

            /** @test {TinyTypeOf} */
            it('prevents null and undefined when the single-line definition style is used', () => {
                class FirstName extends TinyTypeOf<string>() {
                }

                expect(() => new FirstName(null as any)).to.throw('FirstName should be defined');
                expect(() => new FirstName(undefined as any)).to.throw('FirstName should be defined');
            });

            /**
             * @test {TinyType}
             * @test {TinyTypeOf}
             */
            it('needs to extend the TinyType for types with more than one value', () => {
                class FirstName extends TinyTypeOf<string>() {
                }

                class LastName extends TinyTypeOf<string>() {
                }

                class FullName extends TinyType {
                    constructor(
                        public readonly firstName: FirstName,
                        public readonly lastName: LastName,
                    ) {
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

                class UserName extends TinyTypeOf<string>() {
                }

                class Timestamp extends TinyTypeOf<Date>() {
                    toString() {
                        return `Timestamp(value=${ this.value.toISOString() })`;
                    }
                }

                abstract class DomainEvent extends TinyTypeOf<Timestamp>() {
                }

                class AccountCreated extends DomainEvent {
                    constructor(public readonly username: UserName, timestamp: Timestamp) {
                        super(timestamp);
                    }
                }

                const event = new AccountCreated(new UserName('jan-molak'), new Timestamp(now));

                expect(event.toString()).to.equal(
                    'AccountCreated(username=UserName(value=jan-molak), value=Timestamp(value=2018-03-12T00:30:00.000Z))',
                );
            });
        });

        /** @test {TinyType#toString} */
        describe('::toString', () => {
            class Area extends TinyTypeOf<string>() {
            }

            class District extends TinyTypeOf<number>() {
            }

            class Sector extends TinyTypeOf<number>() {
            }

            class Unit extends TinyTypeOf<string>() {
            }

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

            it('prints the array-type properties', () => {
                class Name extends TinyTypeOf<string>() {
                }

                class Names extends TinyTypeOf<Name[]>() {
                }

                const names = new Names([new Name('Alice'), new Name('Bob')]);

                expect(names.toString())
                    .to.equal('Names(value=Array(Name(value=Alice), Name(value=Bob)))');
            });

            it('prints the object-type properties', () => {
                class Dictionary extends TinyTypeOf<{ [key: string]: string }>() {
                }

                const dictionary = new Dictionary({ greeting: 'Hello', subject: 'World' });

                expect(dictionary.toString())
                    .to.equal('Dictionary(value=Object(greeting=Hello, subject=World))');
            });
        });

        /** @test {TinyType#toJSON} */
        describe('serialisation', () => {

            class FirstName extends TinyTypeOf<string>() {
            }

            class LastName extends TinyTypeOf<string>() {
            }

            class Age extends TinyTypeOf<number>() {
            }

            class Person extends TinyType {
                constructor(public readonly firstName: FirstName,
                    public readonly lastName: LastName,
                    public readonly age: Age,
                ) {
                    super();
                }
            }

            class People extends TinyTypeOf<Person[]>() {
            }

            describe('::toJSON', () => {

                given<TinyType & { value: any }>(
                    new FirstName('Bruce'),
                    new Age(55),
                ).it('should serialise a single-value TinyType to just its value', input => {
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

                it(`should serialise an array recursively`, () => {
                    const people = new People([
                        new Person(new FirstName('Alice'), new LastName('Jones'), new Age(62)),
                        new Person(new FirstName('Bruce'), new LastName('Smith'), new Age(55)),
                    ]);

                    expect(people.toJSON()).to.deep.equal([{
                        firstName: 'Alice',
                        lastName: 'Jones',
                        age: 62,
                    }, {
                        firstName: 'Bruce',
                        lastName: 'Smith',
                        age: 55,
                    }]);
                });

                it(`should serialise a plain-old JavaScript object`, () => {
                    class Parameters extends TinyTypeOf<{ [parameter: string]: string }>() {
                    }

                    const parameters = new Parameters({
                        env: 'prod',
                    });

                    expect(parameters.toJSON()).to.deep.equal({
                        env: 'prod',
                    });
                });

                it(`should serialise Map as object`, () => {
                    class Notes extends TinyTypeOf<Map<string, any>>() {
                    }

                    const parameters = new Notes(new Map(Object.entries({
                        stringEntry: 'prod',
                        numberEntry: 42,
                        objectEntry: { key: 'value' },
                    })));

                    expect(parameters.toJSON()).to.deep.equal({
                        stringEntry: 'prod',
                        numberEntry: 42,
                        objectEntry: { key: 'value' },
                    });
                });

                it(`should serialise a Set as Array`, () => {
                    class Notes extends TinyTypeOf<Set<string>>() {
                    }

                    const parameters = new Notes(new Set(['apples', 'bananas', 'cucumbers']));

                    expect(parameters.toJSON()).to.deep.equal(['apples', 'bananas', 'cucumbers']);
                });

                it(`should serialise an Error as its stack trace`, () => {
                    class CustomError extends TinyTypeOf<Error>() {
                    }

                    const error = thrown(new Error('example error'))

                    const customError = new CustomError(error);

                    expect(customError.toJSON()).to.deep.equal({
                        message:    'example error',
                        stack:      error.stack,
                    });
                });

                it('should serialise a plain-old JavaScript object with nested complex types recursively', () => {
                    interface NotesType {
                        authCredentials: {
                            username: string;
                            password: string;
                        },
                        names:  Set<FirstName>;
                        age:    Map<FirstName, Age>;
                    }

                    class Notes extends TinyTypeOf<NotesType>() {
                    }

                    const
                        alice = new FirstName('Alice'),
                        bob = new FirstName('Bob'),
                        cindy = new FirstName('Cindy');

                    const names = new Set<FirstName>([ alice, bob, cindy ]);
                    const age = new Map<FirstName, Age>()
                        .set(alice, new Age(23))
                        .set(bob, new Age(42))
                        .set(cindy, new Age(67));

                    const notes = new Notes({
                        authCredentials: {
                            username: 'Alice',
                            password: 'P@ssw0rd!',
                        },
                        names,
                        age
                    });

                    expect(notes.toJSON()).to.deep.equal({
                        authCredentials: {
                            username: 'Alice',
                            password: 'P@ssw0rd!',
                        },
                        names: [ 'Alice', 'Bob', 'Cindy' ],
                        age: {
                            Alice: 23,
                            Bob: 42,
                            Cindy: 67,
                        }
                    });
                });

                it('should serialise null and undefined', () => {
                    interface NotesType {
                        nullValue: any;
                        undefinedValue: any;
                    }

                    class Notes extends TinyTypeOf<NotesType>() {
                    }

                    const notes = new Notes({
                        nullValue: null,
                        undefinedValue: undefined,
                    });

                    expect(notes.toJSON()).to.deep.equal({
                        nullValue: null,
                        undefinedValue: undefined,
                    });
                });

                it(`should JSON.stringify any object that can't be represented in a more sensible way`, () => {
                    class TT extends TinyTypeOf<number>() {
                    }

                    const tt = new TT(Number.NaN);

                    expect(tt.toJSON()).to.equal('null');
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
                );

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
});

function thrown<T>(throwable: T): T {
    try {
        throw throwable;
    } catch (error) {
        return error as T;
    }
}
