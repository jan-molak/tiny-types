import { describe, expect, it } from 'vitest';

import { JSONObject, TinyType, TinyTypeOf } from '../src';

describe('Serialisation', () => {

    describe('of single-value TinyTypes', () => {

        class Amount extends TinyTypeOf<number>() {
        }

        class Name extends TinyTypeOf<string>() {
        }

        class Vote extends TinyTypeOf<boolean>() {
        }

        class Maybe extends TinyType {
            constructor(public readonly value: any) {
                super();
            }
        }

        it.each([
            { obj: new Amount(0), expectedType: 'number' },
            { obj: new Amount(10 / 3), expectedType: 'number' },
            { obj: new Name('Jan'), expectedType: 'string' },
            { obj: new Vote(true), expectedType: 'boolean' },
            { obj: new Vote(false), expectedType: 'boolean' },
            { obj: new Maybe(undefined), expectedType: 'undefined' },
        ])('preserves the type of the wrapped value', ({ obj, expectedType }) => {
            expect(obj.toJSON()).toBeTypeOf(expectedType as any);
        });
    });

    describe('of TinyTypes wrapping several primitive values', () => {

        class Person extends TinyType {
            public role = 'dev';

            static fromJSON(o: JSONObject): Person {
                return new Person(o.firstName as string, o.lastName as string, o.age as number);
            }

            constructor(public readonly firstName: string, public readonly lastName: string, public readonly age: number) {
                super();
            }

            speak() {
                return `Hi, I'm ${ this.firstName } ${ this.lastName }`;
            }
        }

        it('uses only the significant fields and retains their type', () => {
            const p = new Person('John', 'Smith', 42);
            const serialised = p.toJSON() as JSONObject;

            expect(Object.keys(serialised)).toEqual([ 'age', 'firstName', 'lastName', 'role' ]);

            expect(serialised.age).toBeTypeOf('number');
            expect(serialised.firstName).toBeTypeOf('string');
            expect(serialised.lastName).toBeTypeOf('string');
            expect(serialised.role).toBeTypeOf('string');
        });
    });

    describe('of nested Tiny Types', () => {
        class FirstName extends TinyTypeOf<string>() {
            static fromJSON = (v: string) => new FirstName(v);
        }

        class LastName extends TinyTypeOf<string>() {
            static fromJSON = (v: string) => new LastName(v);
        }

        class Age extends TinyTypeOf<number>() {
            static fromJSON = (v: number) => new Age(v);
        }

        class AnotherPerson extends TinyType {
            public role = 'dev';

            static fromJSON(o: JSONObject): AnotherPerson {
                return new AnotherPerson(
                    FirstName.fromJSON(o.firstName as string),
                    LastName.fromJSON(o.lastName as string),
                    Age.fromJSON(o.age as number),
                );
            }

            constructor(
                public readonly firstName: FirstName,
                public readonly lastName: LastName,
                public readonly age: Age,
            ) {
                super();
            }

            speak() {
                return `Hi, I'm ${ this.firstName } ${ this.lastName }`;
            }
        }

        it('uses only the significant fields and retains the type of their respective values', () => {
            const p = new AnotherPerson(new FirstName('John'), new LastName('Smith'), new Age(42));
            const serialised = p.toJSON() as JSONObject;

            expect(Object.keys(serialised)).toEqual([ 'age', 'firstName', 'lastName', 'role' ]);

            expect(serialised.age).toBeTypeOf('number');
            expect(serialised.firstName).toBeTypeOf('string');
            expect(serialised.lastName).toBeTypeOf('string');
            expect(serialised.role).toBeTypeOf('string');
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
            static fromJSON = (o: JSONObject) => new Allocation(
                EmployeeId.fromJSON(o.employeeId as number),
                DepartmentId.fromJSON(o.departmentId as string),
            )

            constructor(public readonly employeeId: EmployeeId, public readonly departmentId: DepartmentId) {
                super();
            }
        }

        const allocation = new Allocation(new EmployeeId(1), new DepartmentId('engineering'));

        const deserialised = Allocation.fromJSON({ departmentId: 'engineering', employeeId: 1 });

        expect(deserialised.equals(allocation)).toEqual(true);
    });
});
