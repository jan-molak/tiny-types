import 'mocha';
import { given } from 'mocha-testdata';

import { check, hasLengthOf, isArray, isDefined, isGreaterThan, isInteger, TinyType } from '../src';
import { expect } from './expect';

/** @test {check} */
describe('::check', () => {

    it(`advises the developer if they've forgotten to specify the checks`, () => {
        const value = 2;
        expect(() => check('SomeProperty', value))
            .to.throw(`Looks like you haven't specified any predicates to check the value against?`);
    });
});
