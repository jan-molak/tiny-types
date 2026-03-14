import { ensure } from './ensure';
import { equal, significantFieldsOf, stringify, toJSON } from './objects';
import { isDefined } from './predicates';
import { JSONValue, Serialisable } from './types';

/**
 * @desc Symbol used to brand TinyType instances for cross-module identification.
 * Uses Symbol.for() to ensure the same symbol is returned across ESM/CJS boundaries.
 */
const TINY_TYPE_BRAND = Symbol.for('tiny-types/TinyType');

/**
 * @desc Type representing a constructor function that may have a protected constructor.
 * This is needed because TinyType has a protected constructor, but we still need
 * to be able to use it with instanceof checks.
 */
type TinyTypeConstructor<T extends TinyType = TinyType> = Function & { prototype: T };

/**
 * @desc Checks if a value is a TinyType instance, working across ESM/CJS module boundaries.
 * This handles the dual-package hazard where the same class loaded from different module
 * formats creates distinct constructor functions that fail native instanceof checks.
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} true if the value is a TinyType instance
 */
export function isTinyType(value: unknown): value is TinyType {
    return value !== null &&
        typeof value === 'object' &&
        (value as any)[TINY_TYPE_BRAND] === true;
}

/**
 * @desc Checks if a value is an instance of a specific TinyType subclass,
 * working across ESM/CJS module boundaries.
 *
 * @param {unknown} value - The value to check
 * @param {Function} type - The TinyType subclass constructor to check against
 * @returns {boolean} true if the value is an instance of the specified type
 */
export function isTinyTypeOf<T extends TinyType>(value: unknown, type: TinyTypeConstructor<T>): value is T {
    // First try native prototype check (avoids triggering Symbol.hasInstance)
    // This works when the same module format is used
    if (value !== null && typeof value === 'object' && type.prototype.isPrototypeOf(value)) {
        return true;
    }

    // Fall back to brand check for cross-module scenarios
    if (!isTinyType(value)) {
        return false;
    }

    // Check the prototype chain by class name
    const targetName = type.name;
    let proto = Object.getPrototypeOf(value);

    while (proto !== null) {
        if (proto.constructor?.name === targetName) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }

    return false;
}

/**
 * @desc The {@link TinyTypeOf} can be used to define simple
 * single-value {@link TinyType}s on a single line.
 *
 * It contains a check preventing the constructor argument from being undefined (see {@link isDefined});
 *
 * @experimental
 *
 * @example
 * class Username extends TinyTypeOf<string>() {}
 *
 * @example
 * class Age extends TinyTypeOf<number>() {}
 *
 * @returns a dynamically created base class your tiny type can extend from
 */
export function TinyTypeOf<T>(): new(_: T) => { value: T } & TinyType {
    return class extends TinyType {
        constructor(public readonly value: T) {
            super();
            ensure(this.constructor.name, value, isDefined());
        }
    };
}

/**
 * @desc The {@link TinyType} abstract class should be used as a base class for your own Tiny Types.
 *
 * If you want the Tiny Type to wrap a single value use the {@link TinyTypeOf} instead as it will save you some keystrokes.
 *
 * @example
 * class FirstName extends TinyTypeOf<string>() {}
 * class LastName  extends TinyTypeOf<string>() {}
 * class Age       extends TinyTypeOf<number>() {}
 *
 * class Person extends TinyType {
 *   constructor(public readonly firstName: FirstName,
 *               public readonly lastName:  LastName,
 *               public readonly age:       Age,
 *   ) {
 *     super();
 *   }
 * }
 */
export abstract class TinyType implements Serialisable {

    /**
     * @desc Custom instanceof check that works across ESM/CJS module boundaries.
     * When checking `x instanceof SomeClass`, JavaScript calls `SomeClass[Symbol.hasInstance](x)`.
     * Since subclasses inherit this method, `this` refers to the actual class being checked against.
     *
     * This enables native instanceof syntax to work correctly even when the same class
     * is loaded from both ESM and CJS module formats (dual-package hazard).
     *
     * @example
     * class MyEvent extends TinyType {
     *     constructor(public readonly name: string) {
     *         super();
     *     }
     * }
     *
     * const event = new MyEvent('test');
     * event instanceof MyEvent;  // true, even across module boundaries
     *
     * @param {unknown} instance - The value to check
     * @returns {boolean} true if the instance is of this type
     */
    static [Symbol.hasInstance](instance: unknown): boolean {
        return isTinyTypeOf(instance, this);
    }

    /**
     * @desc Brands this instance as a TinyType for cross-module identification.
     * This enables instanceof checks to work across ESM/CJS module boundaries.
     */
    protected constructor() {
        (this as any)[TINY_TYPE_BRAND] = true;
    }

    /**
     * @desc Compares two tiny types by value
     *
     * @example <caption>Comparing simple types</caption>
     * class Id extends TinyTypeOf<string>() {}
     *
     * const id = new Id(`3cc0852d-fda7-4f61-874e-0cfadbd6182a`);
     *
     * id.equals(id) === true
     *
     * @example <caption>Comparing complex types recursively</caption>
     * class FirstName extends TinyTypeOf<string>() {}
     * class LastName  extends TinyTypeOf<string>() {}
     * class Age       extends TinyTypeOf<number>() {}
     *
     * class Person extends TinyType {
     *   constructor(public readonly firstName: FirstName,
     *               public readonly lastName:  LastName,
     *               public readonly age:       Age,
     *   ) {
     *     super();
     *   }
     * }
     *
     * const p1 = new Person(new FirstName('John'), new LastName('Smith'), new Age(42)),
     *       p2 = new Person(new FirstName('John'), new LastName('Smith'), new Age(42));
     *
     * p1.equals(p2) === true
     *
     * @param {TinyType} another
     * @returns {boolean}
     */
    equals(another: TinyType): boolean {
        return equal(this, another);
    }

    /**
     * @desc Serialises the object to its string representation
     *
     * @returns {string}
     */
    toString(): string {
        return stringify(this);
    }

    /**
     * @desc Serialises the object to a JSON representation.
     *
     * @example
     * class FirstName extends TinyTypeOf<string>() {}
     *
     * const name = new FirstName('Jan');
     *
     * name.toJSON() === 'Jan'
     *
     * @example
     * class FirstName extends TinyTypeOf<string>() {}
     * class LastName  extends TinyTypeOf<string>() {}
     * class Age       extends TinyTypeOf<number>() {}
     *
     * class Person extends TinyType {
     *   constructor(public readonly firstName: FirstName,
     *               public readonly lastName:  LastName,
     *               public readonly age:       Age,
     *   ) {
     *     super();
     *   }
     * }
     *
     * const person = new Person(new FirstName('John'), new LastName('Smith'), new Age(42)),
     *
     * person.toJSON() === { firstName: 'John', lastName: 'Smith', age: 42 }
     *
     * @returns {JSONValue}
     */
    toJSON(): JSONValue | undefined {
        const fields = significantFieldsOf(this);

        if (fields.length === 1) {
            return toJSON(this[fields[0]]);
        }

        return fields.reduce((acc, field) => {
            acc[field] = toJSON(this[field]);
            return acc;
        }, {}) as JSONValue;
    }
}
