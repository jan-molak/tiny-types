import 'mocha';

import { ensure } from '../src';
import { expect } from './expect';

/** @test {ensure} */
describe('::ensure', () => {

    it(`advises the developer if they've forgotten to specify the checks`, () => {
        const value = 2;
        expect(() => ensure('SomeProperty', value))
            .to.throw(`Looks like you haven't specified any predicates to check the value against?`);
    });
});
