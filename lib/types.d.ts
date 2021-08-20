import { Func } from "ts-functional/dist/types";

export declare interface IUseGlobalOptions<T> {
    loadInitialValue?: (index:string, initialValue:T) => T;
}

export declare type Setter<T> = Func<T | Func<T, T>, void>;
export declare type UpdateSpy<T> = (newVal:T, oldVal:T, index:string) => void;

export declare type Injector<A extends {}, B extends {}> = Func<A, A & B>;

export declare interface ISharedState<T> {
    (): [T, Setter<T>];
    onChange: (spy:UpdateSpy<T>) => void;
    offChange: (spy:UpdateSpy<T>) => void;
    clearListeners: () => void;
    __index__: string;
}

export declare interface ISharedStateFunction<T> {
    (initialValue: T | string, i?:T | string): ISharedState<T>;
}