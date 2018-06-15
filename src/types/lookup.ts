// Here be dragons 🔥🐉

// see https://github.com/Microsoft/TypeScript/issues/18133#issuecomment-325910172
export type Bool = 'true' | 'false';

export type Not<X extends Bool> = {
    true: 'false',
    false: 'true',
}[X];

export type HaveIntersection<S1 extends string, S2 extends string> = (
    { [K in S1]: 'true' } &
    { [key: string]: 'false' }
)[S2];

export type IsNeverWorker<S extends string> = (
    { [K in S]: 'false' } &
    { [key: string]: 'true' }
)[S];

// Worker needed because of https://github.com/Microsoft/TypeScript/issues/18118
export type IsNever<T extends string> = Not<HaveIntersection<IsNeverWorker<T>, 'false'>>;

// http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html
export type IsFunction<T> = IsNever<Extract<keyof T, string>>;

export type NonFunctionProps<T> = {
    [K in keyof T]: {
        'false': K,
        'true': never,
    }[IsFunction<T[K]>]
}[keyof T];
