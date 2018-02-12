import { JSONValue } from './types';

export function TinyTypeOf<T>(): { new(_: T): { value: T } & TinyType } {
    return class extends TinyType {
        constructor(public readonly value: T) {
            super();
        }
    };
}

export abstract class TinyType {

    equals(another: TinyType) {
        if (another === this) {
            return true;
        }

        if (! (another instanceof this.constructor)) {
            return false;
        }

        return this.fields().reduce((previousFieldsAreEqual: boolean, field: string) => {

            const currentFieldIsEqual = (this[field].equals
                ? this[field].equals(another[field])
                : this[field] === another[field]);

            return previousFieldsAreEqual && currentFieldIsEqual;
        }, true);
    }

    toString() {
        const fields = this.fields().reduce((acc: string[], field: string) => {
            return acc.concat(`${field}=${this[field]}`);
        }, []);

        return `${this.constructor.name}(${fields.join(', ')})`;
    }

    toJSON(): JSONValue {
        const isPrimitive = (value: any) => Object(value) !== value;
        function toJSON(value: any) {
            switch (true) {
                case value && !! value.toJSON:
                    return value.toJSON();
                case value && ! isPrimitive(value):
                    return JSON.stringify(value);
                default:
                    return value;
            }
        }

        const fields = this.fields();

        if (fields.length === 1) {
            return toJSON(this[fields[0]]);
        }

        return fields.reduce((acc, field) => {
            acc[field] = toJSON(this[field]);
            return acc;
        }, {});
    }

    private fields() {
        return Object.getOwnPropertyNames(this)
            .filter(field => typeof this[field] !== 'function')
            .sort();
    }
}
