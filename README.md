# Unstateless

`unstateless` is a shared state management library for React.  It's main design goals are:

- `Zero boilerplate`: Creating and using a shared state variable shouldn't require any code other than the definition of the variable.
- `Natural`: Shared state should be just as easy to use as local state and shouldn't require learning any additional concepts.

## Basic usage example

```typescript
import React from 'react';
import {useSharedState} from "unstateless";
	
const useUsername = useSharedState<string>("Original Name");

export const SomeComponent = (props:any) => {
    const [userName, setUserName] = useUsername();
    
    return <>
        {userName}
        <button onClick={() => {setUserName("A New Name")}>Click!</button>
    </>;
}
```

## Features

- `Drop-in replacement`: React's `useState` hooks can be directly replaced with Unstateless's `useSharedState` to lift a local variable into a shared variable.  In additional, Unstateless's `inject` functionality can be used to directly replace react-redux's `map<X>ToProps` functions.
- `Minimal boilerplate`: Basic shared state requires no boilerplate and no top-level provider wrapping your application.
- `Composable`: Unstateless can be used to create reusable state and effects that can be injected into any component.
- `Extensible`: The `useGlobal` core object can be extended to create custom shared state handlers, and listeners can be used to act on any or all state changes.
- `Hook-based`: Unstateless exposes several custom React hooks for managing shared state.
- `Compatibile`: Unstateless can be used along side other state management libraries such as Redux.

## Detailed usage example

/libs/hooks.ts
```typescript
import { Setter, useLocalStorage, useSharedState } from "unstateless";

// Store the user's current workspace

export interface IWorkspace {
    workspace: string;
    setWorkspace: Setter<string>;
}

export const useWorkspace = useSharedState<string>("");

export const injectWorkspace = <T>(props:T):T & IWorkspace => {
    const [workspace, setWorkspace] = useWorkspace();
    return {...props, workspace, setWorkspace};
}

// Store the user's current screen for each of their workspaces
// This uses useLocalStorage, so will be persisted between sessions.

export interface ICurrentScreen {
    screen: string;
    setScreen: Setter<string>;
}

export const useCurrentScreen = (workspace:string) => useLocalStorage.string(`screen-${workspace}`, "")();

export const injectCurrentScreen = <T extends IWorkspace>(props:T):T & ICurrentScreen => {
    const [screen, setScreen] = useCurrentScreen<string>(props.workspace);
    return {...props, screen, setScreen};
}
```

/components/App/App.tsx
```typescript
import React from 'react';
import { IWorkspace, ICurrentScreen, injectCurrentScreen, injectWorkspace} from "../../libs/hooks";
import { inject, mergeProps } from "unstateless";
import { AppProps} from "./App.d";
import { WorkspaceSelector } from "../WorkspaceSelector";
import { ScreenSelector } from "../ScreenSelector";

// Inject properties into the component
type Props = AppProps & IWorkspace & ICurrentScreen;
const connect = inject(mergeProps(injectWorkspace, injectCurrentScreen));

export const App = connect((props:Props) =>
    <div>
        <h1>{props.workspace} - {props.screen}</h1>

        <WorkspaceSelector />
        <ScreenSelector />
    </div>
);

```

/components/WorkspaceSelector/WorkspaceSelector.tsx
```typescript
import React from 'react';
import { IWorkspace, injectWorkspace} from "../../libs/hooks";
import { inject, mergeProps } from "unstateless";
import { WorkspaceSelectorProps} from "./WorkspaceSelector.d";

// Inject properties into the component
type Props = WorkspaceSelectorProps & IWorkspace;
const connect = inject(mergeProps(injectWorkspace));

const workspaces:string[] = ["Personal", "Work", "School"];

// The WorkplaceSelector component:  Note that since setWorkplace
// comes from a shared state hook, changing the workspace here will
// cause the App component to rerender with the new value automatically
export const WorkspaceSelector = connect((props:Props) =>
    <>
        {workspaces.map((w:string) =>
            <button key={w} onClick={() => {props.setWorkspace(w);}}>
                {w}
            </button>
        )}
    </>
);
```
/components/ScreenSelector/ScreenSelector.tsx
```typescript
import React from 'react';
import { IWorkspace, ICurrentScreen, injectCurrentScreen, injectWorkspace} from "../../libs/hooks";
import { inject, mergeProps } from "unstateless";
import { ScreenSelectorProps} from "./ScreeneSelector.d";

// Inject properties into the component
type Props = ScreenSelectorProps & IWorkspace & ICurrentScreen;
const connect = inject(mergeProps(injectWorkspace, injectCurrentScreen));

const screens = {
    Personal: ["Hobbies", "Chores", "Home Improvements"],
    Work: ["Projects", "Current Tasks", "Notes"],
    School: ["Classes", "Assignments", "Schedule"],
};

// The ScreenSelector component:  Note that since setScreen
// comes from a shared state hook, changing the screen here will
// cause the App component to rerender with the new value automatically
export const ScreenSelector = connect((props:Props) =>
    <>
        {screens[props.workspace].map((s:string) =>
            <button key={s} onClick={() => {props.setScreen(s);}}>
                {s}
            </button>
        )}
    </>
);
```
## Public API

### `useSharedState: <T>(initialValue:T) => () => [T, Setter<T>]`
### `useSharedState: <T>(stateId: string, initialValue:T) => () => [T, Setter<T>]`
The `useSharedState` hook is the simplest way to share state between components.  You can use it directly inside a component,

```typescript
export const MyComponent = (...) => {
    const [myVar, setMyVar] = useSharedState("myVar", defaultValue)();
    ...
}
```

or define a custom hook which allows you to skip defining a stateId.

```typescript
// .../util.ts
export const useMyVar = useSharedState(defaultValue);

// .../MyComponent.ts
import {useMyVar} from ".../util.ts";

export const MyComponent = (...) => {
    const [myVar, setMyVar] = useMyVar();
    ...
}

```

When the shared state is updated by any component, all components hooked up to that state will re-render.

The `useSharedState` function returns a hook that is similar to React's `useState` hook and returns the same tuple (`[value, setValue]`).

---

### `useLocalStorage: <T>(options:{deserialize:Func<string, T>, serialize:Func<T, string>}) => (initialValue:T) => () => [T, Setter<T>]`
### `useLocalStorage: <T>(options:{deserialize:Func<string, T>, serialize:Func<T, string>}) => (stateId: string, initialValue:T) => () => [T, Setter<T>]`
The `useLocalStorage` hook works just like the `useSharedState` hook except that the latest state is persisted in localStorage.  When the app is re-loaded, the `useLocalStorage` hook will first check localStorage for an existing value.  If no value is found in localStorage, the `initialValue` provided will be used to initialize the state.

If you use the `useLocalStorage` function directly, you need to provide a `serialize` function to convert your value into a string, and a `deserialize` function to convert a string back into your value.  Convenience methods are provided for all basic types:

#### `useLocalStorage.string: (initialValue:string) => () => [string, Setter<string>]`
#### `useLocalStorage.string: (stateId: string, initialValue:string) => () => [string, Setter<string>]`

---
#### `useLocalStorage.number: (initialValue:number) => () => [number, Setter<number>]`
#### `useLocalStorage.number: (stateId: string, initialValue:number) => () => [number, Setter<number>]`
---
#### `useLocalStorage.boolean: (initialValue:boolean) => () => [boolean, Setter<boolean>]`
#### `useLocalStorage.boolean: (stateId: string, initialValue:boolean) => () => [boolean, Setter<boolean>]`
---
#### `useLocalStorage.object: <T extends {}>(initialValue:T) => () => [T, Setter<T>]`
#### `useLocalStorage.object: <T extends {}>(stateId: string, initialValue:T) => () => [T, Setter<T>]`

However, you can also use `useLocalStorage` directly if you need custom serialize/deserialize functions.

---

### `useDerivedState: <T>(extractor:((...args:any[]) => T), states:ISharedState<any>[]) => T`

The `useDerivedState` hook allows components to derive new state data from one or more shared state values.  The main purpose of this hook is to prevent unnecessary rerenders;  Even if the source state variables change, components that use the `useDerivedState` hook will not re-render unless the derived data also changes.

The `states` parameter defines which state the hook depends on.  You should pass in the custom hooks that define the shared state variables:

```typescript
const useFoo = useSharedState<string>("some value");
const useBar = useSharedState<string>("another value");

const MyComponent = () => {
    const combined = useDerivedState(
        [useFoo, useBar],
        (foo:string, bar:string) => `${foo} - ${bar}`
    );

    return <div>{combined}</div>;
}

```

The values of those state variables will be passed as arguments in that order to the `extractor` function.

`Note`: The extractor function may run before the shared state variables have been initialized, so it also needs to return a sane value if any or all of the source variables are undefined.

---

### `inject: <A extends {}, B extends {}>(injector:Injector<A, B>) => (Component:React.ComponentType<B>) => (props:A) => JSX.Element`

The `inject` function creates a connector function given an injector function.  The connector function will create a higher-order component that will inject the props into a given component.  It works in a similar manner to react-redux's `connect` function.

Injectors should have the signature `(props:ExistingProps) => ExistingProps & NewProps`.  In other words, injectors should include the existing props in the return object along with any new props it defines.  Note that injectors can also depend on properties from other injectors as long as the required properties are injected first (ie. the injector for the required props is to the left of the injector that requires them.  See the `injectCurrentScreen` example above).

---

### `mergeProps`

The `mergeProps` function is used to chain together several property injectors.  Under the hood, it is simply a function compositor that composites the injectors from left to right.

```typescript
const injector = mergeProps(injectThis, injectThat, injectSomethingElse);
const connect = inject(injector);
const StatelessComponent = (props) => <>...</>;
export const StatefulComponent = connect(StatelessComponent);
```

---

### `useGlobal: <T>(options?:IUseGlobalOptions<T>) => (index: string, initialValue:T) => [T, Setter<T>]`

The base function for both `useSharedState` and `useLocalStorage`.  Use of `useGlobal` directly allows for customized behavior.  There is one optional parameter:

- `loadInitialValue: <T>(index:string, initialValue:T) => T`: Provide a function that customizes how the initial value is calculated from a provided default initial value.

---

### Event Listeners

`unstateless` also provides the `useGlobal.listen` object for hooking into shared state changes.  Whenever a shared variable is initialized or changes, any attached listeners will also run.  For convenience, listeners can also be attached directly to custom hooks

#### `type UpdateSpy<T> = (newVal:T, oldVal:T, index:string) => void`

---

#### `useGlobal.listen.on:  <T>(state:ISharedState<T>, spy:UpdateSpy<T>) => void`
#### `useMyVar.onChange(spy:UpdateSpy<T>)`

This provides a hook into the shared state update process.  Pass in a spy function to listen for state changes.  This is especially useful for logging state changes or persisting values to an API.

#### `useGlobal.listen.onAll:  <T>(spy:UpdateSpy<T>) => void`

Add a listener on all state changes rather than a single state element.

#### `useGlobal.listen.off:  <T>(state:ISharedState<T>, spy:UpdateSpy<T>) => void`
#### `useMyVar.offChange(spy:UpdateSpy<T>)`

Remove a previously added state update listener.

#### `useGlobal.listen.offAll:  <T>(spy:UpdateSpy<T>) => void`

Remove a previously added global state update listener.

#### `useGlobal.listen.clear:  (state:ISharedState<T>) => void`
#### `useMyVar.clearListeners: () => void`
Remove all listeners for a shared value

#### `useGlobal.listen.clearAll:  () => void`

Remove all listeners for all shared values

---

### Misc Functions

#### `useMyVar.getValue: <T>() => T`

Get the current value of the shared state.  This is useful in case the shared state is needed outside the context of a React component where hooks cannot be used, such as passing a login token to an API.

#### `useGlobal.clear(index:string)`
#### `useGlobal.clearAll()`

Clear specified value or all values from the global state.  Note that calling these functions will _not_ update subscribers.  These functions are currently only used internally to clear the global state between tests.

## Injectors

Injector functions are not limited to using `unstateless`'s shared state hooks.  They can contain any kind of React hook, including the standard `useState` and `useEffect` hooks.  The only requirement for an injector is that it needs to return the props passed to it in its return object.

## Recipes

Below are code samples that demonstrate some common use cases

### Logging State Changes

```typescript
useGlobal.listen.onAll((newVal:any, oldVal:any, index:string) => {
  console.log(`${index} - Updating`);
  console.log(`${index} - Old value:`);
  console.log(oldVal);
  console.log(`${index} - New Value:`);
  console.log(newVal);
});
```

### Persist values to a remote server

```typescript
import {memoizePromise} from 'ts-functional';
import {api} from ".../my-app-api";

// Ensure that the product is only loaded once even if multiple
// components request it at the same time
const loadProduct = memoizePromise(
    (productId:number):Promise<IProduct> =>
        api.product.fetch(productId),
    {}
);

const saveProduct = (newProduct:IProduct):Promise<IProduct> =>
    api.product.save(newProduct);

const useProduct = (productId: number) => {
    const [product, setProduct] = useSharedState<IProduct | null>(`product-${productId}`, null)();

    const updateProduct = (newProduct:IProduct) => {
        saveProduct(newProduct)
            .then(setProduct);
    }

    useEffect(() => {
        loadProduct(productId).then(setProduct);
    }, [productId]);

    return [product, updateProduct];
}
```
