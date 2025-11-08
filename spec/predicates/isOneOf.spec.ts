import { describe, expect, it } from 'vitest';

import { ensure, isOneOf, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isOneOf} */
    describe('::isOneOf', () => {

        class StreetLight extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('StreetLight', value, isOneOf('red', 'yellow', 'green'));
            }
        }

        it.each([
            'red',
            'yellow',
            'green'
        ])('ensures that the value is equal to one of the allowed values', (value: string) => {
            expect(() => new StreetLight(value)).not.toThrow();
        });

        it('complains if the value not one the allowed ones', () => {
            expect(() => new StreetLight('green-ish'))
                .toThrow(`StreetLight should either be equal to red, be equal to yellow or be equal to green`);
        });

        it.each([
            undefined,
            null,
            {},
            false,
        ])('complains if the value is of a wrong type', (value: any) => {
            expect(() => new StreetLight(value))
                .toThrow(`StreetLight should either be equal to red, be equal to yellow or be equal to green`);
        });
    });
});
