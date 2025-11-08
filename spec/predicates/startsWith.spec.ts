import { describe, expect, it } from 'vitest';

import { ensure, startsWith, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {startsWith} */
    describe('::startsWith', () => {

        class Username extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('Username', value, startsWith('usr'));
            }
        }

        it('ensures that the argument starts with a given prefix', () => {
            expect(() => new Username('usr123')).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            'string',
            5,
        ])('complains if the value does not start with the given prefix', (value: any) => {
            expect(() => new Username(value))
                .toThrow(`Username should start with 'usr'`);
        });
    });
});
