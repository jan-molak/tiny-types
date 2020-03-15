import 'mocha';
import { given } from 'mocha-testdata';
import { MatchesAnything } from '../../../src/pattern-matching/rules';
import { expect } from '../../expect';

describe('pattern-matching', () => {

    describe('rules', () => {

        describe('MatchesAnything', () => {

            given([
                1,
                false,
                {},
            ]).it('is always executed', (input: any) => {
                const rule = new MatchesAnything(_ => _);

                expect(rule.matches(input)).to.be.true;                              // tslint:disable-line:no-unused-expression
            });
        });
    });
});
