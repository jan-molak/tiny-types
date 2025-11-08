import { describe, expect, it } from 'vitest';

import { ensure, isDefined, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isDefined} */
    describe('::isDefined', () => {
        class UserName extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('UserName', value, isDefined());
            }
        }

        it('ensures that the value is defined', () => {
            expect(() => new UserName('Jan')).not.toThrow();
        });

        it.each<any>([
            'Jan',
            '',
            true,
            false,
        ])('works for any defined value, even the "falsy" ones', (value: any) => {
            expect(() => new UserName(value)).not.toThrow();
        });
    });
});
