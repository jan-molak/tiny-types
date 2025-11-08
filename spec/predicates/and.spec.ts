import { describe, expect, it, vi } from 'vitest';

import { and, ensure, isDefined, isGreaterThan, isInteger, isLessThan, Predicate, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {and} */
    describe('::and', () => {

        class InvestmentLengthInYears extends TinyType {
            constructor(public readonly value: number) {
                super();
                ensure('InvestmentLengthInYears', value, and(
                    isDefined(),
                    isInteger(),
                    isGreaterThan(0),
                    isLessThan(50),
                ));
            }
        }

        it('ensures that all the predicates are met', () => {
            expect(() => new InvestmentLengthInYears(10)).not.toThrow();
        });

        it.each([
            [ null, 'InvestmentLengthInYears should be defined' ],
            [ 0.2, 'InvestmentLengthInYears should be an integer' ],
            [ -2, 'InvestmentLengthInYears should be greater than 0' ],
            [ 52, 'InvestmentLengthInYears should be less than 50' ],
        ])('complains upon the first unmet predicate', (value: any, errorMessage: string) => {
            expect(() => new InvestmentLengthInYears(value))
                .toThrow(errorMessage);
        });

        it('complains if there are no predicates specified', () => {
            expect(() => and()).toThrow(`Looks like you haven't specified any predicates to check the value against?`);
        });

        it('stops evaluating the predicates upon the first failure', () => {
            const predicateEvaluated = vi.fn();
            const predicateReturning = (result: boolean) => Predicate.to(result ? 'pass' : 'fail', (value: any) => {
                predicateEvaluated();
                return result;
            });

            expect(() => ensure('value', null, and(
                predicateReturning(true),
                predicateReturning(false),
                predicateReturning(true),
            ))).toThrow('value should fail');

            expect(predicateEvaluated.mock.calls.length).toEqual(2);
        });
    });
});
