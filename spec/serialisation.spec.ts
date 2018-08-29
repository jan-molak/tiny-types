import 'mocha';
import { given } from 'mocha-testdata';

import { Serialised, TinyType, TinyTypeOf } from '../src';
import { expect } from './expect';

describe('Serialisation', () => {

    describe('of single-value TinyTypes', () => {

        class Amount extends TinyTypeOf<number>() {}
        class Name extends TinyTypeOf<string>() {}
        class Vote extends TinyTypeOf<boolean>() {}
        class Maybe extends TinyType {
            constructor(public readonly value: any) {
                super();
            }
        }

        given([
            { obj: new Amount(0),        expectedType: 'number'    },
            { obj: new Amount(10/3),     expectedType: 'number'    },
            { obj: new Name('Jan'),      expectedType: 'string'    },
            { obj: new Vote(true),       expectedType: 'boolean'   },
            { obj: new Vote(false),      expectedType: 'boolean'   },
            { obj: new Maybe(undefined), expectedType: 'undefined' },
        ]).
        it('preserves the type of the wrapped value', ({ obj, expectedType: expectedType }) => {
            expect(obj.toJSON()).to.be.an(expectedType);
        });
    });

    describe('of TinyTypes wrapping several primitive values', () => {

        class Person extends TinyType {
            public role: string = 'dev';

            static fromJSON(o: Serialised<Person>): Person {
                return new Person(o.firstName as string, o.lastName as string, o.age as number);
            }

            constructor(public readonly firstName: string, public readonly lastName: string, public readonly age: number) {
                super();
            }

            speak() {
                return `Hi, I'm ${this.firstName} ${this.lastName}`;
            }
        }

        it('uses only the significant fields and retains their type', () => {
            const p = new Person('John', 'Smith', 42);
            const serialised = p.toJSON() as Serialised<Person>;

            expect(Object.keys(serialised)).to.include.ordered.members(['age', 'firstName', 'lastName', 'role']);
            expect(Object.keys(serialised)).to.not.include.members(['speak', 'toJSON', 'toString']);

            expect(serialised.age).to.be.a('number');
            expect(serialised.firstName).to.be.a('string');
            expect(serialised.lastName).to.be.a('string');
            expect(serialised.role).to.be.a('string');
        });
    });

    describe('of nested Tiny Types', () => {
        class FirstName extends TinyTypeOf<string>() {
            static fromJSON = (v: string) => new FirstName(v);
        }
        class LastName  extends TinyTypeOf<string>() {
            static fromJSON = (v: string) => new LastName(v);
        }
        class Age extends TinyTypeOf<number>() {
            static fromJSON = (v: number) => new Age(v);
        }

        class AnotherPerson extends TinyType {
            public role: string = 'dev';

            static fromJSON(o: Serialised<AnotherPerson>): AnotherPerson {
                return new AnotherPerson(
                    FirstName.fromJSON(o.firstName as string),
                    LastName.fromJSON(o.lastName as string),
                    Age.fromJSON(o.age as number),
                );
            }

            constructor(public readonly firstName: FirstName,
                        public readonly lastName: LastName,
                        public readonly age: Age,
            ) {
                super();
            }

            speak() {
                return `Hi, I'm ${this.firstName} ${this.lastName}`;
            }
        }

        it('uses only the significant fields and retains the type of their respective values', () => {
            const p = new AnotherPerson(new FirstName('John'), new LastName('Smith'), new Age(42));
            const serialised = p.toJSON() as Serialised<AnotherPerson>;

            expect(Object.keys(serialised)).to.include.ordered.members(['age', 'firstName', 'lastName', 'role']);
            expect(Object.keys(serialised)).to.not.include.members(['speak', 'toJSON', 'toString']);

            expect(serialised.age).to.be.a('number');
            expect(serialised.firstName).to.be.a('string');
            expect(serialised.lastName).to.be.a('string');
            expect(serialised.role).to.be.a('string');
        });
    });

    it('works both ways', () => {
        class EmployeeId extends TinyTypeOf<number>() {
            static fromJSON = (id: number) => new EmployeeId(id);
        }

        class DepartmentId extends TinyTypeOf<string>() {
            static fromJSON = (id: string) => new DepartmentId(id);
        }

        class Allocation extends TinyType {
            static fromJSON = (o: Serialised<Allocation>) => new Allocation(
                EmployeeId.fromJSON(o.employeeId as number),
                DepartmentId.fromJSON(o.departmentId as string),
            )

            constructor(public readonly employeeId: EmployeeId, public readonly departmentId: DepartmentId) {
                super();
            }
        }

        const allocation = new Allocation(new EmployeeId(1), new DepartmentId('engineering'));

        const deserialised = Allocation.fromJSON({ departmentId: 'engineering', employeeId: 1 });

        expect(deserialised.equals(allocation)).to.be.true;                 // tslint:disable-line:no-unused-expression
    });
});
