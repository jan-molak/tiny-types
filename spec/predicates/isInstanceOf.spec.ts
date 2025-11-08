import { describe, expect, it } from 'vitest';

import { ensure, isInstanceOf, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {isInstanceOf} */
    describe('::isInstanceOf', () => {
        class Birthday extends TinyType {
            constructor(public readonly value: Date) {
                super();

                ensure('Birthday', value, isInstanceOf(Date));
            }
        }

        it('ensures that the argument is an instance of Date', () => {
            expect(() => new Birthday(new Date())).not.toThrow();
        });

        it.each([
            '2018-10-10',
            undefined,
            null,
            {},
            'string',
        ])('complains if the value does not meet the predicate', (value: any) => {
            expect(() => new Birthday(value)).toThrow(`Birthday should be instance of Date`);
        });
    });
});
