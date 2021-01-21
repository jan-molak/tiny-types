import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isPlainObject } from '../../src';
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
            () => {},
        ]).
        it('complains if the value is not a plain object', (value: any) => {
            expect(() => ensure('value', value, isPlainObject())).to.throw(`value should be a plain object`);
        });

        it('complains if the value is not a plain object because of a modified constructor prototype', () => {
            const value = new Person('Cindy');
            (value as any).constructor.prototype = undefined;

            expect(() => ensure('value', value, isPlainObject())).to.throw(`value should be a plain object`);
        });
    });
});
