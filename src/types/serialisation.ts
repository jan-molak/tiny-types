import { JSONValue } from './json';

export interface Serialisable<S extends JSONValue = JSONValue> {
    toJSON(): S;
}

/**
 * @experimental
 */
export type Serialised<T extends object> = JSONValue;
