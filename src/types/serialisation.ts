import { JSONValue } from './json';
import { NonFunctionProps } from './lookup';

export interface Serialisable<S extends JSONValue = JSONValue> {
    toJSON(): S;
}

/**
 * @experimental
 */
export type Serialised<T extends object> = { [P in NonFunctionProps<T>]: JSONValue };
