import { describe, expect, it } from 'vitest';

import { ensure } from '../src';

/** @test {ensure} */
describe('::ensure', () => {

    it(`advises the developer if they've forgotten to specify the checks`, () => {
        const value = 2;
        expect(() => ensure('SomeProperty', value))
            .toThrow(`Looks like you haven't specified any predicates to check the value against?`);
    });
});
