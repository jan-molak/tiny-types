import 'mocha';

import * as sinon from 'sinon';

import { deprecated } from '../../src/objects';
import { expect } from '../expect';

/** @test {deprecated} */
describe('deprecated', () => {

    describe('when used to annotate a class', () => {
        it('logs a warning when the class is constructed', () => {
            const consoleWarn = sinon.spy();

            @deprecated(undefined, consoleWarn)
            class Foo {
            }

            const foo_ = new Foo();

            expect(consoleWarn)
                .to.have.been.calledWith('Foo has been deprecated.');
        });

        it('can provide additional suggestion on what other class should be used instead', () => {
            const consoleWarn = sinon.spy();

            @deprecated('Please use Bar instead.', consoleWarn)
            class Foo {
            }

            const foo_ = new Foo();

            expect(consoleWarn)
                .to.have.been.calledWith('Foo has been deprecated. Please use Bar instead.');
        });

        it('maintains the type and behaviour of the annotated class', () => {
            const consoleWarn = sinon.spy();

            @deprecated('Please use Client instead.', consoleWarn)
            class Person {
                constructor(public readonly name: string) {
                }
            }

            const p = new Person('Alice');

            expect(consoleWarn)
                .to.have.been.calledWith('Person has been deprecated. Please use Client instead.');

            expect(p).to.be.instanceOf(Person);
        });
    });

    describe('when used to annotate a method', () => {

        it('logs a warning when the method is used', () => {
            const consoleWarn = sinon.spy();

            class Person {
                @deprecated('', consoleWarn)
                greet()   { return null; }
                welcome() { return null; }
            }

            const p = new Person();
            p.greet();

            expect(consoleWarn)
                .to.have.been.calledWith('Person#greet has been deprecated.');
        });

        it('can provide additional suggestion on what other method should be used instead', () => {
            const consoleWarn = sinon.spy();

            class Person {

                @deprecated('Please use Person#welcome instead.', consoleWarn)
                greet()   { return null; }
                welcome() { return null; }
            }

            const p = new Person();
            p.greet();

            expect(consoleWarn)
                .to.have.been.calledWith('Person#greet has been deprecated. Please use Person#welcome instead.');
        });

        it('maintains the behaviour of the annotated method', () => {
            const consoleWarn = sinon.spy();

            class Person {
                constructor(public readonly name: string) {
                }

                @deprecated('Please use Person#welcome instead.', consoleWarn)
                greet(greeting: string) {
                    return `${ greeting }, my name is ${this.name}`;
                }
            }

            const p = new Person('Alice');

            expect(p.greet('Hi')).to.equal('Hi, my name is Alice');

            expect(consoleWarn)
                .to.have.been.calledWith('Person#greet has been deprecated. Please use Person#welcome instead.');
        });
    });

    describe('when used to deprecate a function', () => {
        it('logs a warning when the function is used', () => {
            const consoleWarn = sinon.spy();

            // eslint-disable-next-line unicorn/consistent-function-scoping
            function foo() {
                return null;
            }

            const deprecatedFoo = deprecated('Please use bar instead.', consoleWarn)(foo);

            deprecatedFoo();

            expect(consoleWarn)
                .to.have.been.calledWith('foo has been deprecated. Please use bar instead.');

        });

        it('logs a warning when an arrow function is used', () => {
            const consoleWarn = sinon.spy();

            // eslint-disable-next-line unicorn/consistent-function-scoping
            const foo = () => null;

            const deprecatedFoo = deprecated('Please use bar instead.', consoleWarn)(foo);

            deprecatedFoo();

            expect(consoleWarn)
                .to.have.been.calledWith('foo has been deprecated. Please use bar instead.');
        });
    });

    describe('when used incorrectly', () => {

        it('complains', () => {
            expect(() => deprecated('something that does not make sense')(42))
                .to.throw(`Only a class, method or function can be marked as deprecated. number given.`);
        });
    })
});
