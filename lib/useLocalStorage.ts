import { useGlobal } from "./useGlobal";
import { Func } from "ts-functional/dist/types";

const loadLocalStorageValue = <T>(deserialize:Func<string, T>) => (index:string, initialValue:T) => {
    const localVal = window.localStorage.getItem(index);
    let parsedVal:T | undefined;
    if(localVal === null) {
        if(initialValue !== null && initialValue !== undefined){
            window.localStorage.setItem(index, JSON.stringify(initialValue));
        }
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

const saveLocalStorageValue = <T>(serialize:Func<T, string>) => (index:string, newValue:T) => {
    window.localStorage.setItem(index, serialize(newValue));
}

const useLocalStorageRaw = <T>(options:{deserialize:Func<string, T>, serialize:Func<T, string>}) => useGlobal<T>({
    loadInitialValue: loadLocalStorageValue<T>(options.deserialize),
    onUpdate: saveLocalStorageValue<T>(options.serialize),
});

useLocalStorageRaw.string = (index: string, i:string) =>
    useLocalStorageRaw<string>({deserialize: (a:string) => a, serialize:(a:string) => a})(index, i);
useLocalStorageRaw.number = (index: string, i:number) =>
    useLocalStorageRaw<number>({deserialize: (a:string) => +a, serialize:(a:number) => `${a}`})(index, i);
useLocalStorageRaw.boolean = (index: string, i:boolean) =>
    useLocalStorageRaw<boolean>({deserialize: (a:string) => !!a, serialize:(a:boolean) => a ? "1" : ""})(index, i);
useLocalStorageRaw.object = <T extends {}>(index: string, i:T) =>
    useLocalStorageRaw<T>({deserialize: JSON.parse, serialize: JSON.stringify})(index, i);

export const useLocalStorage = useLocalStorageRaw;
