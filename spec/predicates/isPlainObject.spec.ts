import { describe, expect, it } from 'vitest';

import { ensure, isPlainObject, isString, property } from '../../src';

describe('predicates', () => {

    /** @test {isPlainObject} */
    describe('::isPlainObject', () => {

        it.each([
            {},
            { 'name': 'Alice' },
            Object.create({}),
            Object.create(Object.prototype),
            Object.create(null),
        ])('ensures that the argument is a plain object', (value: any) => {
            expect(() => ensure('value', value, isPlainObject())).not.toThrow();
        });

        class Person {
            constructor(public readonly name: string) {
            }
        }

        it.each([
            undefined,
            null,
            [],
            false,
            5,
            'name',
            new Person('Jan'),
            () => {},
        ])('complains if the value is not a plain object', (value: any) => {
            expect(() => ensure('value', value, isPlainObject())).toThrow(`value should be a plain object`);
        });

        it('is generic', () => {
            interface Person {
                name: string;
            }

            const person: Person = { name: 'Jan' };

            expect(() => {
                ensure('person', person, isPlainObject<Person>(), property('name', isString()))
            }).not.toThrow();
        });
    });
});
