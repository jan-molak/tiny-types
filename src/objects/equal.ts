import { isTinyType } from '../TinyType.js';
import { significantFieldsOf } from './significantFields.js';

/**
 * @access private
 */
export function equal(v1: any, v2: any): boolean {  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    switch (true) {
        case ! sameType(v1, v2):
            return false;
        case both(arePrimitives, v1, v2):
            return checkIdentityOf(v1, v2);
        case both(areObjects, v1, v2) && sameClass(v1, v2) && both(areDates, v1, v2):
            return checkTimestamps(v1, v2);
        case both(areObjects, v1, v2) && sameClass(v1, v2):
            return checkSignificantFieldsOf(v1, v2);
    }

    return false;
}

const areObjects     = (_: any) => new Object(_) === _;
const areDates       = (_: any) => _ instanceof Date;
const arePrimitives  = (_: any) => ! areObjects(_); // arrays are objects

function both(condition: (_: any) => boolean, v1: any, v2: any): boolean {
    return condition(v1) && condition(v2);
}

const sameType  = (v1: any, v2: any) => typeof v1 === typeof v2;

/**
 * Gets all class names in the prototype chain of an object.
 */
function getClassNamesInChain(instance: any): string[] {
    const names: string[] = [];
    let proto = Object.getPrototypeOf(instance);
    while (proto !== null && proto.constructor) {
        names.push(proto.constructor.name);
        proto = Object.getPrototypeOf(proto);
    }
    return names;
}

/**
 * Checks if two objects are of the same class or related by inheritance.
 * For TinyType instances, checks the prototype chain by class name to handle ESM/CJS dual-package hazard.
 */
const sameClass = (v1: any, v2: any) => {
    // For TinyType instances, check if they share a class relationship
    if (isTinyType(v1) && isTinyType(v2)) {
        const v1Name = v1.constructor.name;
        const v2Name = v2.constructor.name;

        // Same class
        if (v1Name === v2Name) {
            return true;
        }

        // Check inheritance: v1's class is in v2's chain or vice versa
        const v1Chain = getClassNamesInChain(v1);
        const v2Chain = getClassNamesInChain(v2);

        return v2Chain.includes(v1Name) || v1Chain.includes(v2Name);
    }
    // Fall back to instanceof for non-TinyType objects
    return (v1.constructor && v2 instanceof v1.constructor) || (v2.constructor && v1 instanceof v2.constructor);
};

const sameLength = (v1: { length: number }, v2: { length: number }) => v1.length === v2.length;

function checkIdentityOf(v1: any, v2: any) {
    return v1 === v2;
}

function checkTimestamps(v1: Date, v2: Date) {
    return v1.getTime() === v2.getTime();
}

function checkSignificantFieldsOf(o1: object, o2: object) {
    const
        fieldsOfObject1 = significantFieldsOf(o1),
        fieldsOfObject2 = significantFieldsOf(o2);

    if (! sameLength(fieldsOfObject1, fieldsOfObject2)) {
        return false;
    }

    return fieldsOfObject1.reduce((previousFieldsAreEqual: boolean, field: string) => {
        const currentFieldIsEqual = equal(o1[field], o2[field]);
        return previousFieldsAreEqual && currentFieldIsEqual;
    }, true);
}
