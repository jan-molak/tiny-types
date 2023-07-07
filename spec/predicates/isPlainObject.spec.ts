import 'mocha';

import { given } from 'mocha-testdata';

import { ensure, isPlainObject, isString, property } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isPlainObject} */
    describe('::isPlainObject', () => {

        given([
            {},
            { 'name': 'Alice' },
            Object.create({}),
            Object.create(Object.prototype),
            Object.create(null),
        ]).
        it('ensures that the argument is a plain object', (value: any) => {
            expect(() => ensure('value', value, isPlainObject())).to.not.throw();
        });

        class Person {
            constructor(public readonly name: string) {
            }
        }

        given([
            undefined,
            null,
            [],
            false,
            5,
            'name',
            new Person('Jan'),
            () => {},               // eslint-disable-line @typescript-eslint/no-empty-function
        ]).
        it('complains if the value is not a plain object', (value: any) => {
            expect(() => ensure('value', value, isPlainObject())).to.throw(`value should be a plain object`);
        });

        it('is generic', () => {
            interface Person {
                name: string;
            }

            const person: Person = { name: 'Jan' };

            expect(() => {
                ensure('person', person, isPlainObject<Person>(), property('name', isString()))
            }).to.not.throw();
        });
    });
});
