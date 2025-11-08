import { describe, expect, it } from 'vitest';

import { ensure, isBoolean, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isBoolean} */
    describe('::isBoolean', () => {

        class MarketingOptIn extends TinyType {
            constructor(public readonly value: boolean) {
                super();

                ensure('MarketingOptIn', value, isBoolean());
            }
        }

        it('ensures that the argument is a boolean value', () => {
            expect(() => new MarketingOptIn(false)).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            'string',
            5,
        ])('complains if the value is not a boolean', (value: any) => {
            expect(() => new MarketingOptIn(value)).toThrow(`MarketingOptIn should be a boolean value`);
        });
    });
});
