import { describe, expect, it } from 'vitest';

import { ensure, isNotBlank, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isBlank} */
    describe('::isNotBlank', () => {
        class FirstName extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('FirstName', value, isNotBlank());
            }
        }

        it('ensures that the argument in not blank', () => {
            expect(() => new FirstName('Jan')).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            [],
            42,
            ''
        ])('complains if the value is blank or not a string', (value: any) => {
            expect(() => new FirstName(value)).toThrow(`FirstName should not be blank`);
        });
    });
});
