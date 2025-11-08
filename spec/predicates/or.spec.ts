import { describe, expect, it } from 'vitest';

import { ensure, isDefined, isEqualTo, isGreaterThan, isInteger, isLessThan, or, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {or} */
    describe('::or', () => {

        class Percentage extends TinyType {
            constructor(public readonly value: number) {
                super();
                ensure('Percentage', value,
                    isDefined(),
                    isInteger(),
                    or(isEqualTo(0), isGreaterThan(0)),
                    or(isLessThan(100), isEqualTo(100)),
                );
            }
        }

        it.each([
            0,
            1,
            99,
            100
        ])('ensures that at least one of the `or` predicates is met', (value: number) => {
            expect(() => new Percentage(value)).not.toThrow();
        });

        it.each([
            [ -1, 'Percentage should either be equal to 0 or be greater than 0' ],
            [ 101, 'Percentage should either be less than 100 or be equal to 100' ],
        ])('complains if at least one of the `or` predicates is not met', (value: number, errorMessage: string) => {
            expect(() => new Percentage(value))
                .toThrow(errorMessage);
        });

        it('complains if there are no predicates specified', () => {
            expect(() => or()).toThrow(`Looks like you haven't specified any predicates to check the value against?`);
        });

        it('concatenates the error messages in a human-friendly way', () => {
            expect(() => ensure('Project name', 'node.js',
                or(isEqualTo('Serenity/JS'), isEqualTo('TinyTypes'), isEqualTo('Build Monitor')),
            )).toThrow(
                'Project name should either be equal to Serenity/JS, be equal to TinyTypes or be equal to Build Monitor',
            );
        });
    });
});
