export type ThenArg<T> = T extends Promise<infer U> ? U : T;
export type PickFieldsOfType<T extends object, FieldT> = {
  [K in keyof T]: T[K] extends FieldT ? K : never;
}[keyof T];
