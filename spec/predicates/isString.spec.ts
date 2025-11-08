import { describe, expect, it } from 'vitest';

import { ensure, isString, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isString} */
    describe('::isString', () => {
        class FirstName extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('FirstName', value, isString());
            }
        }

        it('ensures that the argument is a string', () => {
            expect(() => new FirstName('Jan')).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            [],
            42,
        ])('complains if the value is not a string', (value: any) => {
            expect(() => new FirstName(value)).toThrow(`FirstName should be a string`);
        });
    });
});
