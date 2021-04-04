import { useGlobal } from "./useGlobal";
import { Func } from "ts-functional/dist/types";

const loadLocalStorageValue = <T>(postLoad:Func<string, T>) => (index:string, initialValue:T) => {
    const localVal = window.localStorage.getItem(index);
    let parsedVal:T | undefined;
    if(localVal === null) {
        if(initialValue !== null && initialValue !== undefined){
            window.localStorage.setItem(index, JSON.stringify(initialValue));
        }
        parsedVal = initialValue;
    } else {
        try {
            parsedVal = postLoad(localVal);
        } catch (e) {
            parsedVal = initialValue;
        }
    }
    return parsedVal;
};

const saveLocalStorageValue = <T>(preSave:Func<T, string>) => (index:string, newValue:T) => {
    window.localStorage.setItem(index, preSave(newValue));
}

const useLocalStorageRaw = <T>(options:{postLoad:Func<string, T>, preSave:Func<T, string>}) => useGlobal<T>({
    loadInitialValue: loadLocalStorageValue<T>(options.postLoad),
    onUpdate: saveLocalStorageValue<T>(options.preSave),
});

useLocalStorageRaw.string = (index: string, i:string) =>
    useLocalStorageRaw<string>({postLoad: (a:string) => a, preSave:(a:string) => a})(index, i);
useLocalStorageRaw.number = (index: string, i:number) =>
    useLocalStorageRaw<number>({postLoad: (a:string) => +a, preSave:(a:number) => `${a}`})(index, i);
useLocalStorageRaw.boolean = (index: string, i:boolean) =>
    useLocalStorageRaw<boolean>({postLoad: (a:string) => !!a, preSave:(a:boolean) => a ? "1" : ""})(index, i);
useLocalStorageRaw.object = <T extends {}>(index: string, i:T) =>
    useLocalStorageRaw<T>({postLoad: JSON.parse, preSave: JSON.stringify})(index, i);

export const useLocalStorage = useLocalStorageRaw;