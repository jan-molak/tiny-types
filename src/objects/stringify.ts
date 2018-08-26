import { significantFieldsOf } from './significantFields';

const isObject     = (_: any) => new Object(_) === _;
const isDate       = (_: any) => _ instanceof Date;
const isArray      = (_: any) => Array.isArray(_);
const isPrimitive  = (_: any) => ! isObject(_);

/**
 * @access private
 */
export function stringify(v: any): string {
    switch (true) {
        case isArray(v):
            return `${v.constructor.name}(${ v.map(i => stringify(i)).join(', ') })`;

        case isDate(v):
            return v.toISOString();

        case isObject(v):

            const fields = significantFieldsOf(v)
                .map(field => ({ field, value: stringify(v[field]) }))
                .reduce((acc: string[], current: { field: string, value: string }) => {
                    return acc.concat(`${current.field}=${current.value}`);
                }, []);

            return `${v.constructor.name}(${fields.join(', ')})`;

        case isPrimitive(v):
        default:
            return `${ v }`;
    }
}
