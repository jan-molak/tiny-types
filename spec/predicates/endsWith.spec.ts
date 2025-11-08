import { describe, expect, it } from 'vitest';

import { endsWith, ensure, TinyType } from '../../src';

describe('predicates', () => {

    /** @test {endsWith} */
    describe('::endsWith', () => {

        class TextFileName extends TinyType {
            constructor(public readonly value: string) {
                super();

                ensure('TextFileName', value, endsWith('.txt'));
            }
        }

        it('ensures that the argument ends with a given suffix', () => {
            expect(() => new TextFileName('notes.txt')).not.toThrow();
        });

        it.each([
            undefined,
            null,
            {},
            'string',
            5,
        ])('complains if the value does not end with a given suffix', (value: any) => {
            expect(() => new TextFileName(value))
                .toThrow(`TextFileName should end with '.txt'`);
        });
    });
});
