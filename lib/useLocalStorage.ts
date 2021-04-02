import { memoize } from "ts-functional";
import { useGlobal } from "./useGlobal";

const loadLocalStorageValue = memoize(<T>(index:string, initialValue:T) => {
    return ():T => {
        const localVal = window.localStorage.getItem(index);
        let parsedVal:T | undefined;
        if(localVal === null) {
            if(initialValue !== null && initialValue !== undefined){
                window.localStorage.setItem(index, JSON.stringify(initialValue));
            }
            parsedVal = initialValue;
        } else {
            try {
                parsedVal = JSON.parse(localVal) as T;
            } catch (e) {
                parsedVal = initialValue;
            }
        }
        return parsedVal;
    };
}, {});

const saveLocalStorageValue = <T>(index:string, newValue:T) => {
    window.localStorage.setItem(index, JSON.stringify(newValue));
}

export const useLocalStorage = useGlobal({
    loadInitialValue: loadLocalStorageValue,
    onUpdate: saveLocalStorageValue,
});
