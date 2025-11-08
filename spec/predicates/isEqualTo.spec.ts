import { describe, expect, it } from 'vitest';

import { ensure, isEqualTo, TinyTypeOf } from '../../src';

describe('predicates', () => {

    /** @test {isEqualTo} */
    describe('::isEqualTo', () => {

        /** @test {isEqualTo} */
        describe('when working with Tiny Types', () => {

            class AccountId extends TinyTypeOf<number>() {
            }

            class Command extends TinyTypeOf<AccountId>() {
            }

            class UpgradeAccount extends Command {
            }

            class AccountsService {
                constructor(public readonly loggedInUser: AccountId) {
                }

                handle(command: Command) {
                    ensure('AccountId', command.value, isEqualTo(this.loggedInUser));
                }
            }

            it('ensures that objects are identical by value', () => {
                const loggedInUser = new AccountId(42);
                const accounts = new AccountsService(loggedInUser);

                const upgradeOwnAccount = new UpgradeAccount(loggedInUser);

                expect(() => accounts.handle(upgradeOwnAccount)).not.toThrow();
            });

            it('complains if the objects are not identical by value', () => {
                const hacker = new AccountId(666);
                const anotherUser = new AccountId(42);
                const accounts = new AccountsService(hacker);

                const upgradeAnotherAccount = new UpgradeAccount(anotherUser);

                expect(() => accounts.handle(upgradeAnotherAccount))
                    .toThrow('AccountId should be equal to AccountId(value=666)');
            });
        });

        /** @test {isEqualTo} */
        describe('when working with primitive types', () => {

            it.each([
                null,
                undefined,
                Number.POSITIVE_INFINITY,
                1,
                false,
                'string',
                {},
                [],
            ])('ensures they are equal', (value: any) => {
                expect(() => ensure('Val', value, isEqualTo(value))).not.toThrow();
            });

            it.each([
                1,
                false,
                'string',
                {},
                [],
            ])('complains if they are not equal', (value: any) => {
                expect(() => ensure('Value', value, isEqualTo('expected value')))
                    .toThrow('Value should be equal to expected value');
            });
        });
    });
});
