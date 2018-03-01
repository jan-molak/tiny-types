import { ensure } from './ensure';
import { equal, significantFieldsOf } from './objects';
import { isDefined } from './predicates';
import { JSONObject, JSONValue, NonNullJSONPrimitive, Serialisable, Serialised } from './types';

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
export function TinyTypeOf<T>(): { new(_: T): { value: T } & TinyType } {
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

    // todo: can I make all fields `readonly` without making it a dictionary?

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
    equals(another: TinyType) {
        return equal(this, another);
    }

    toString() {
        const fields = significantFieldsOf(this).reduce((acc: string[], field: string) => {
            return acc.concat(`${field}=${this[field]}`);
        }, []);

        return `${this.constructor.name}(${fields.join(', ')})`;
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
    toJSON(): JSONObject | NonNullJSONPrimitive {
        const isPrimitive = (value: any) => Object(value) !== value;
        function toJSON(value: any): JSONObject | NonNullJSONPrimitive {
            switch (true) {
                case value && !! value.toJSON:
                    return value.toJSON();
                case value && Array.isArray(value):
                    return value.map(v => toJSON(v));
                case value && ! isPrimitive(value):
                    return JSON.stringify(value);
                default:
                    return value;       // todo: could this ever be a null?
            }
        }

        const fields = significantFieldsOf(this);

        if (fields.length === 1) {
            return toJSON(this[fields[0]]);
        }

        return fields.reduce((acc, field) => {
            acc[field] = toJSON(this[field]);
            return acc;
        }, {}) as Serialised<this>;
    }
}
