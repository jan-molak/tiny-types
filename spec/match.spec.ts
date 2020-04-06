import 'mocha';
import { given } from 'mocha-testdata';
import { match, TinyType, TinyTypeOf } from '../src';
import { IdentityMatcher, ObjectMatcher, StringMatcher } from '../src/pattern-matching';
import { expect } from './expect';

/** @test {match} */
describe(`::match`, () => {

    /** @test {match} */
    describe('default rules', () => {
        it(`uses the default rule when no identical match is found for a string value`, () => {
            const result = match('four')
                .when('five', _ => `high five`)
                .when('six', _ => `got your six`)
                .else(n => `got ${n}`);

            expect(result).to.equal('got four');
        });

        it(`uses the default rule when no identical match is found for a numerical value`, () => {
            const result = match(4)
                .when(5, _ => `high five`)
                .when(6, _ => `got your six`)
                .else(n => `got ${n}`);

            expect(result).to.equal('got 4');
        });
    });

    describe('when selecting a matcher', () => {
        abstract class DomainEvent {
            constructor(public readonly timestamp: Date = new Date()) {
            }
        }

        class ConcreteEvent extends DomainEvent {
        }

        class EmaiAddress extends TinyType {
            constructor(public readonly value: string) {
                super();
            }
        }

        given([
            { input: 5,                                     pattern: 1,                                     expected_matcher: IdentityMatcher },
            { input: Symbol('some'),                        pattern: Symbol('other'),                       expected_matcher: IdentityMatcher },
            { input: 'hello',                               pattern: 'hello',                               expected_matcher: StringMatcher },
            { input: 'hello',                               pattern: /^[Hh]ello/,                           expected_matcher: StringMatcher },
            { input: new EmaiAddress('user@domain.org'),    pattern: new EmaiAddress('user@domain.org'),    expected_matcher: ObjectMatcher },
            { input: new ConcreteEvent(),                   pattern: ConcreteEvent,                         expected_matcher: ObjectMatcher },
            { input: new ConcreteEvent(),                   pattern: DomainEvent,                           expected_matcher: ObjectMatcher },
        ]).
        it(`uses a matcher appropriate to the input`, ({input, pattern, expected_matcher}) => {
            expect(match(input).when(pattern, _ => _)).to.be.instanceOf(expected_matcher);
        });
    });

    /**
     * @test {match}
     * @test {TinyType}
     * @test {TinyTypeOf}
     */
    describe('when working with TinyTypes', () => {

        class AccountId extends TinyTypeOf<number>() {}
        abstract class Command extends TinyTypeOf<AccountId>() {}
        class OpenAccount extends Command {}
        class CloseAccount extends Command {}
        class SuspendAccount extends Command {}

        given([
            { command: new OpenAccount(new AccountId(42)),      expected: 'Open AccountId(value=42)'                            },
            { command: new CloseAccount(new AccountId(42)),     expected: 'Close AccountId(value=42)'                           },
            { command: new SuspendAccount(new AccountId(42)),   expected: 'Command: SuspendAccount(value=AccountId(value=42))'  },
            { command: null,                                    expected: 'Unrecognised input: null'                            },
        ]).
        it('matches a TinyType by type', ({ command, expected }) => {
            const result = match(command)
                .when(OpenAccount,  ({ value }) => `Open ${ value }`)
                .when(CloseAccount, ({ value }) => `Close ${ value }`)
                .when(Command,      _ => `Command: ${ _ }`)
                .else(_ => `Unrecognised input: ${_}`);

            expect(result).to.equal(expected);
        });

        given([
            { command: new OpenAccount(new AccountId(42)),      expected: 'Open AccountId(value=42)'                            },
            { command: new CloseAccount(new AccountId(42)),     expected: 'Close AccountId(value=42)'                           },
            { command: new SuspendAccount(new AccountId(42)),   expected: 'Command: SuspendAccount(value=AccountId(value=42))'  },
            { command: null,                                    expected: 'Unrecognised input: null'                            },
        ]).
        it('matches a TinyType by value', ({ command, expected }) => {
            const result = match(command)
                .when(new OpenAccount(new AccountId(42)),   ({ value }) => `Open ${ value }`)
                .when(new CloseAccount(new AccountId(42)),  ({ value }) => `Close ${ value }`)
                .when(new SuspendAccount(new AccountId(42)), _ => `Command: ${ _ }`)
                .else(_ => `Unrecognised input: ${_}`);

            expect(result).to.equal(expected);
        });
    });
});
