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

    private fields() {
        return Object.getOwnPropertyNames(this)
            .filter(field => typeof this[field] !== 'function');
    }
}
