import { ensure } from './ensure';
import { equal, isRecord, significantFieldsOf, stringify } from './objects';
import { isDefined } from './predicates';
import { JSONObject, JSONValue, NonNullJSONPrimitive, Serialisable } from './types';

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
    toJSON(): JSONValue {
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

function toJSON(value: any): JSONObject | NonNullJSONPrimitive {
    switch (true) {
        case value && !! value.toJSON:
            return value.toJSON();
        case value && Array.isArray(value):
            return value.map(v => toJSON(v));
        case value && value instanceof Map:
            return mapToJSON(value);
        case value && value instanceof Set:
            return toJSON(Array.from(value));
        case value && isRecord(value):
            return recordToJSON(value);
        case value && value instanceof Error:
            return errorToJSON(value);
        case isSerialisablePrimitive(value):
            return value;
        default:
            return JSON.stringify(value);
    }
}

function mapToJSON(map: Map<any, any>): JSONObject {
    const serialised = Array.from(map, ([key, value]) => [ toJSON(key), toJSON(value) ]);

    return Object.fromEntries(serialised);
}

function recordToJSON(value: Record<any, any>): JSONObject {
    const serialised = Object.entries(value)
        .map(([ k, v ]) => [ toJSON(k), toJSON(v) ]);

    return Object.fromEntries(serialised);
}

function errorToJSON(value: Error): JSONObject {
    return Object.getOwnPropertyNames(value)
        .reduce((serialised, key) => {
            serialised[key] = toJSON(value[key])
            return serialised;
        }, { }) as JSONObject;
}

function isSerialisableNumber(value: unknown): value is number {
    return typeof value === 'number'
        && ! Number.isNaN(value)
        && value !== Number.NEGATIVE_INFINITY
        && value !== Number.POSITIVE_INFINITY;
}

function isSerialisablePrimitive(value: unknown): value is string | boolean | number | null | undefined {
    if (['string', 'boolean'].includes(typeof value)) {
        return true;
    }

    if (value === null || value === undefined) {
        return true;
    }

    return isSerialisableNumber(value);
}
