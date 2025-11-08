import { describe, expect, it } from 'vitest';

import { TinyType } from '../../src';
import { ObjectMatcher } from '../../src/pattern-matching';

describe('pattern-matching', () => {
    describe('ObjectMatcher', () => {

        describe('when working with Tiny Types', () => {

            class Name extends TinyType {
                constructor(public readonly value: string) {
                    super();
                }
            }

            class EmailAddress extends TinyType {
                constructor(public readonly value: string) {
                    super();
                }
            }

            it.each([
                [ new Name('Jan'), `matched "Jan"` ],
                [ new Name('John'), `matched "John"` ],
                [ new Name('Sara'), `else, received "Name(value=Sara)"` ],
            ])('matches equal objects', (input: Name, expectedMessage: string) => {
                const result = new ObjectMatcher<TinyType, string>(input)
                    .when(new Name('Jan'), _ => `matched "Jan"`)
                    .when(new Name('John'), _ => `matched "John"`)
                    .else(_ => `else, received "${ _ }"`);

                expect(result).toEqual(expectedMessage);
            });

            it('matches identical objects', () => {
                const input = { field: 'value' };

                const result = new ObjectMatcher(input)
                    .when(input, _ => `matched by identity`)
                    .else(_ => `else, received "${ _ }"`);

                expect(result).toEqual(`matched by identity`);
            });

            it.each([
                [ new Name('Jan'), `matched by equality` ],
                [ new Name('John'), `matched by type` ],
                [ new EmailAddress('jan@example.com'), `else, received "EmailAddress(value=jan@example.com)"` ],
            ])('can be mixed', (input: Name, expectedMessage: string) => {
                const result = new ObjectMatcher<TinyType, string>(input)
                    .when(new Name('Jan'), _ => `matched by equality`)
                    .when(Name, _ => `matched by type`)
                    .else(_ => `else, received "${ _ }"`);

                expect(result).toEqual(expectedMessage);
            });
        });

        describe('when working with regular classes', () => {
            abstract class DomainEvent {
                constructor(public readonly timestamp: Date) {
                }
            }

            class AccountCreated extends DomainEvent {
                constructor(public readonly account_name: string, timestamp: Date) {
                    super(timestamp);
                }
            }

            class AccountConfirmed extends DomainEvent {
                constructor(
                    public readonly account_name: string,
                    public readonly email: string,
                    timestamp: Date,
                ) {
                    super(timestamp);
                }
            }

            class UnclassifiedEvent extends DomainEvent {
            }

            it.each([
                [
                    new AccountCreated('jan-molak', new Date()),
                    `AccountCreated`,
                ],
                [
                    new AccountConfirmed('jan-molak', 'jan.molak@serenity.io', new Date()),
                    `AccountConfirmed`,
                ],
                [
                    new UnclassifiedEvent(new Date()),
                    `UnclassifiedEvent`,
                ],
            ])('matches object by constructor function', (input: DomainEvent, expected_result: string) => {

                const result = new ObjectMatcher<DomainEvent, string>(input)
                    .when(AccountCreated, _ => `AccountCreated`)
                    .when(AccountConfirmed, _ => `AccountConfirmed`)
                    .when(DomainEvent, _ => `UnclassifiedEvent`)
                    .else(_ => `else, received "${ _ }"`);

                expect(result).toEqual(expected_result);
            });

            // todo: mixed constructor/tiny?

            it.each([
                [
                    new AccountCreated('jan-molak', new Date()),
                    `Account created for jan-molak`,
                ],
                [
                    new AccountConfirmed('jan-molak', 'jan.molak@serenity.io', new Date()),
                    `Account confirmed for jan-molak at jan.molak@serenity.io`,
                ],
                [
                    new UnclassifiedEvent(new Date()),
                    `Some DomainEvent received`,
                ],
            ])('matches object by constructor function', (input: DomainEvent, expected_result: string) => {

                const result = new ObjectMatcher<DomainEvent, string>(input)
                    .when(AccountCreated, ({ account_name }: AccountCreated) => {
                        return `Account created for ${ account_name }`;
                    })
                    .when(AccountConfirmed, ({ account_name, email }: AccountConfirmed) => {
                        return `Account confirmed for ${ account_name } at ${ email }`;
                    })
                    .when(DomainEvent, ({ timestamp }: DomainEvent) => `Some DomainEvent received`)
                    .else(_ => `else, received "${ _ }"`);

                expect(result).toEqual(expected_result);
            });
        });
    });
});
