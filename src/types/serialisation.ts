import { JSONValue } from './json.js';

export interface Serialisable<S extends JSONValue = JSONValue> {
    toJSON(): S | undefined;
}
