export type ToJson<T> = {
    [K in keyof T]: T[K] extends Date
        ? string
        : T[K] extends Record<string, unknown>
          ? ToJson<T[K]>
          : T[K];
};