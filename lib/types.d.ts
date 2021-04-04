import { Func } from "ts-functional/dist/types";

export declare interface IUseGlobalOptions<T> {
    loadInitialValue?: (index:string, initialValue:T) => T;
    onUpdate?: (index:string, newValue:T) => void;
}

export declare type Setter<T> = Func<T | Func<T, T>, void>;

export declare type Injector<A extends {}, B extends {}> = Func<A, A & B>;
