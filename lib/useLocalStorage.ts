import { Func } from "ts-functional/dist/types";
import { ISharedState, ISharedStateFunction } from './types';
import { addSharedState, initSharedState, useGlobal } from "./useGlobal";

const loadLocalStorageValue = <T>(deserialize:Func<string, T>, serialize:Func<T, string>) => (index:string, initialValue:T) => {
    const localVal = window.localStorage.getItem(index);
    let parsedVal:T | undefined;
    if(localVal === null) {
        window.localStorage.setItem(index, serialize(initialValue));
        parsedVal = initialValue;
    } else {
        try {
            parsedVal = deserialize(localVal);
        } catch (e) {
            parsedVal = initialValue;
        }
    }
    return parsedVal;
};

const saveLocalStorageValue = <T>(serialize:Func<T, string>) => (newValue:T, oldVal:T, index:string) => {
    window.localStorage.setItem(index, serialize(newValue));
}

const useLocalStorageRaw = <T>(options:{deserialize:Func<string, T>, serialize:Func<T, string>}):ISharedStateFunction<T> => {
    const save = saveLocalStorageValue<T>(options.serialize);
    const loadInitialValue = loadLocalStorageValue<T>(options.deserialize, options.serialize);
    return (initialValue:T | string, i?:T | string):ISharedState<T> => {
        const {initial, index} = initSharedState<T>(initialValue, i);
        const f = addSharedState<T>(index, () => useGlobal<T>({loadInitialValue})(index, initial));
        f.onChange(save);
        return f;
    };
}
useLocalStorageRaw.string  = <T extends string = string>(initial:T | string, i?:T | string) =>
    useLocalStorageRaw<T>({deserialize: (a:string):T => a as T,   serialize:(a:T) => a})(initial, i);
useLocalStorageRaw.number  = useLocalStorageRaw<number >({deserialize: (a:string) => +a,  serialize:(a:number) => `${a}`       });
useLocalStorageRaw.boolean = useLocalStorageRaw<boolean>({deserialize: (a:string) => !!a, serialize:(a:boolean) => a ? "1" : ""});
useLocalStorageRaw.object = <T extends {}>(initial:T | string, i?:T | string) =>
    useLocalStorageRaw<T>({deserialize: JSON.parse, serialize: JSON.stringify})(initial, i);

export const useLocalStorage = useLocalStorageRaw;
