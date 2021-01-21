import 'mocha';
import { given } from 'mocha-testdata';

import { ensure, isEqualTo, TinyTypeOf } from '../../src';
import { expect } from '../expect';

describe('predicates', () => {

    /** @test {isEqualTo} */
    describe('::isEqualTo', () => {

        /** @test {isEqualTo} */
        describe('when working with Tiny Types', () => {

            class AccountId         extends TinyTypeOf<number>() {}
            class Command           extends TinyTypeOf<AccountId>() {}
            class UpgradeAccount    extends Command {}

            class AccountsService {
                constructor(public readonly loggedInUser: AccountId) {}
                handle(command: Command) {
                    ensure('AccountId', command.value, isEqualTo(this.loggedInUser));
                }
            }

            it('ensures that objects are identical by value', () => {
                const loggedInUser      = new AccountId(42);
                const accounts          = new AccountsService(loggedInUser);

                const upgradeOwnAccount = new UpgradeAccount(loggedInUser);

                // tslint:disable-next-line:no-unused-expression
                expect(() => accounts.handle(upgradeOwnAccount)).to.not.throw();
            });

            it('complains if the objects are not identical by value', () => {
                const hacker            = new AccountId(666);
                const anotherUser       = new AccountId(42);
                const accounts          = new AccountsService(hacker);

                const upgradeAnotherAccount = new UpgradeAccount(anotherUser);

                expect(() => accounts.handle(upgradeAnotherAccount))
                    .to.throw('AccountId should be equal to AccountId(value=666)');
            });
        });

        /** @test {isEqualTo} */
        describe('when working with primitive types', () => {

            given([
                null,
                undefined,
                Infinity,
                1,
                false,
                'string',
                {},
                [],
            ]).
            it('ensures they are equal', (value: any) => {
                // tslint:disable-next-line:no-unused-expression
                expect(() => ensure('Val', value, isEqualTo(value))).to.not.throw();
            });

            given([
                1,
                false,
                'string',
                {},
                [],
            ]).
            it('complains if they are not equal', (value: any) => {
                expect(() => ensure('Value', value, isEqualTo('expected value')))
                    .to.throw('Value should be equal to expected value');
            });
        });
    });
});
