import { describe, it } from 'vitest';

import { JSONArray, JSONObject, JSONPrimitive, JSONValue } from '../src/types';

describe('JSON', () => {

    const
        Some_String = 'string',
        Some_Number = 1,
        Some_Boolean = false,
        Some_Object = { k1: Some_String, k2: Some_Number },
        Some_Array = [ Some_String, Some_Number, Some_Boolean, Some_Object ];

    /** @test {JSONArray} */
    describe('JSONArray', () => {
        it(`describes an array that's a valid JSON`, () => {
            const array_: JSONArray = Some_Array;
        });
    });

    /** @test {JSONObject} */
    describe('JSONObject', () => {
        it(`describes a JavaScript object serialised to JSON`, () => {
            const object_: JSONObject = {
                string: Some_String,
                number: Some_Number,
                boolean: Some_Boolean,
                object: Some_Object,
                array: Some_Array,
            };
        });
    });

    /** @test {JSONPrimitive} */
    describe('JSONPrimitive', () => {
        it(`describes any primitive that can be part of JSON`, () => {
            const string_: JSONPrimitive = 'string';
            const number_: JSONPrimitive = 42;
            const boolean_: JSONPrimitive = false;
            const null_: JSONPrimitive = null;
        });
    });

    /** @test {JSONValue} */
    describe('JSONValue', () => {
        it('describes any value that can be represented as JSON', () => {
            const string_: JSONValue = Some_String;
            const number_: JSONValue = Some_Number;
            const boolean_: JSONValue = Some_Boolean;
            const object_: JSONValue = Some_Object;
            const array_: JSONValue = Some_Array;
        });
    });
});
