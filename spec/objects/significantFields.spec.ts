import 'mocha';

import { significantFieldsOf } from '../../src/objects';
import { expect } from '../expect';

/** @test {significantFields} */
describe('significantFields', () => {
    it('returns the names of private and public member fields of an instantiated object', () => {
        class Person {
            private age = 42;
            constructor(public readonly firstName: string, private readonly lastName: string) {}
            toString() {
                return `${this.firstName} ${this.lastName} ${this.age}`;
            }
        }

        const p = new Person('John', 'Smith');

        expect(significantFieldsOf(p)).contain.members(['firstName', 'lastName', 'age']);
    });

    it(`returns the names of object's fields`, () => {
        const p = {
            firstName: 'John',
            lastName: 'Smith',
            age: 42,
            toString: () => `some string`,
        };

        expect(significantFieldsOf(p)).contain.members(['firstName', 'lastName', 'age']);
    });

    it(`returns the keys of an array`, () => {
        const list = [ 'a', 'b', 'c' ];

        expect(significantFieldsOf(list)).contain.members([ '0', '1', '2', 'length' ]);
    });
});
