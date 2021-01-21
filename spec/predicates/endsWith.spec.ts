import 'mocha';
import { given } from 'mocha-testdata';

import { endsWith, ensure, TinyType } from '../../src';
import { expect } from '../expect';

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
            expect(() => new TextFileName('notes.txt')).to.not.throw();
        });

        given([
            undefined,
            null,
            {},
            'string',
            5,
        ]).
        it('complains if the value does not end with a given suffix', (value: any) => {
            expect(() => new TextFileName(value))
                .to.throw(`TextFileName should end with '.txt'`);
        });
    });
});
