import { describe, expect, it } from 'vitest';

import { ensure, isArray, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isArray} */
    describe('::isArray', () => {

        class Strings extends TinyType {
            constructor(public readonly values: string[]) {
                super();

                ensure('Collection', values, isArray());
            }
        }

        it('ensures that the argument is an array', () => {
            expect(() => new Strings([ 'lorem', 'ipsum' ])).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            false,
            5,
        ])('complains if the value is not an array', (value: any) => {
            expect(() => new Strings(value)).toThrow(`Collection should be an array`);
        });
    });
});
