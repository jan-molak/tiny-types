import 'mocha';
import { given } from 'mocha-testdata';
import { match, TinyType } from '../src';
import { IdentityMatcher, ObjectMatcher, StringMatcher } from '../src/pattern-matching';
import { expect } from './expect';

describe(`match`, () => {

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

    it(`uses the default rule if a more specific one has not been defined`, () => {
        const result = match('four')
            .when('five', _ => `high five`)
            .when('six', _ => `got your six`)
            .else(n => `got ${n}`);

        expect(result).to.equal('got four');
    });

    it(`uses the default rule if a more specific one has not been defined`, () => {
        const result = match(4)
            .when(5, _ => `high five`)
            .when(6, _ => `got your six`)
            .else(n => `got ${n}`);

        expect(result).to.equal('got 4');
    });
});
