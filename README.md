# Unstateless

`unstateless` is a state management library for React that allows the creation of injectable, persistent, shared state hooks.  With `unstateless`, stateless components can be "upgraded" into stateful components by injecting React hooks as props.  `unstateless` is intended to be an alternative to other state management libraries such as Redux, although it can be used in conjunction with them.  `unstateless` exports several functions that work together to manage your application's state:

- `useSharedState`: A React hook that allows state to be shared among several components.  Changing the state anywhere will cause all components that use that hook to rerender.
- `useLocalStorage`:  The same as useSharedState, except the current value is persisted in localStorage.
- `mergeProps`: A function that allows property injector functions to be chained together.
- `inject`:  A function that creates a higher-order component that injects the specified props into a component.
- `useGlobal.listen`: Provides hooks into shared state changes.  Use this to log state updates or provide middle-ware like logic on state changes.

Note that unlike other libraries that use React's context management infrastructure to pass global values down to components, `unstateless` does *not* require your application to be wrapped in a custom provider component.  `useSharedState` and `useLocalStorage` can be directly used in existing React components without any extra boilerplate.  They are also independent hooks, and do not need to be used with `mergeProps` and `inject`.

## Basic Usage Example

/libs/hooks.ts
```typescript
import { Setter, useLocalStorage, useSharedState } from "unstateless";

// Store the user's current workspace

export interface IWorkspace {
    workspace: string;
    setWorkspace: Setter<string>;
}

export const useWorkspace = () => useSharedState<string>("workspace", "");

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

export const useCurrentScreen = (workspace:string) => useLocalStorage.string(`screen-${workspace}`, "");

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

### `useSharedState: <T>(stateId: string, initialValue:T) => [T, Setter<T>]`

The `useSharedState` hook works the same as the standard React `useState` hook.  The only difference is that you need to provide an `stateId` parameter to hook up to the correct global state.  The first value of the returned tuple will be the current value of the state.  The second value of the tuple will be a setter function that takes either a new `T` value or a function `(old:T) => T` that calculates the new value from the old value.  When the state is updated, all components hooked up to that state will re-render.

### `useLocalStorage: <T>(options:{deserialize:Func<string, T>, serialize:Func<T, string>}) => (stateId: string, initialValue:T) => [T, Setter<T>]`

The `useLocalStorage` hook works the same as the `useSharedState` hook.  The only difference is that the latest state is persisted in localStorage.  When the app is re-loaded, this hook will first check localStorage for an existing value to use as the initial value.  If no value is found in localStorage, this hook will use the provided `initialValue` instead to bootstrap the state.  You need to provide a `serialize` function to convert your value into a string, and a `deserialize` function to convert a string back into your value.  Convenience methods are provided for all basic types:

#### `useLocalStorage.string: (stateId: string, initialValue:string) => [string, Setter<string>]`

#### `useLocalStorage.number: (stateId: string, initialValue:number) => [number, Setter<number>]`

#### `useLocalStorage.boolean: (stateId: string, initialValue:boolean) => [boolean, Setter<boolean>]`

#### `useLocalStorage.object: <T extends {}>(stateId: string, initialValue:T) => [T, Setter<T>]`

However, you can also use `useLocalStorage` directly if you need custom serialize/deserialize functions.

### `mergeProps`

The `mergeProps` function is used to chain together several property injectors.  Under the hood, it is simply a function compositor that composites the injectors from left to right.  It expects the injector functions to have the signature `(props:ExistingProps) => ExistingProps & NewProps`.  In other words, an injector function should include the existing props in the return object along with any new props it defines.  Note that injectors can also depend on properties from other injectors as long as the required properties are injected first (ie. the injector for the required props is to the left of the injector that requires them.  See the `injectCurrentScreen` example above).

### `inject: <A extends {}, B extends {}>(injector:Injector<A, B>) => (Component:React.ComponentType<B>) => (props:A) => JSX.Element`

The `inject` function creates a connector function given an injector function.  The connector function will create a higher-order component that will inject the props into a given component.  It works in a similar manner to Redux's `connect` function.

```typescript
const injector = mergeProps(injectThis, injectThat, injectSomethingElse);
const connect = inject(injector);
const StatelessComponent = (props) => <>...</>;
export const StatefulComponent = connect(StatelessComponent);
```
### `useGlobal: <T>(options?:IUseGlobalOptions<T>) => (index: string, initialValue:T) => [T, Setter<T>]`

The base function for both `useSharedState` and `useLocalStorage`.  Use of `useGlobal` directly allows for customized behavior.  There are two optional parameters:

- `loadInitialValue: <T>(index:string, initialValue:T) => T`: Provide a function that customizes how the initial value is calculated from a provided default initial value.
- `onUpdate: <T>(index:string, newValue:T) => void`:  Provide a function that runs after a new value has been updated.

### Event Listeners

`unstateless` also provides the `useGlobal.listen` object for hooking into shared state changes.

#### `useGlobal.listen.on:  <T>(index:string, spy:UpdateSpy<T>) => void`

This provides a hook into the shared state update process.  Pass in a spy function `(oldVal:T, newVal:T) => void` to listen for state changes.  This is especially useful for logging state changes or persisting values to an API.

#### `useGlobal.listen.off:  <T>(index:string, spy:UpdateSpy<T>) => void`

Remove a previously added state update listener.

#### `useGlobal.listen.clear:  (index:string) => void`

Remove all listeners for a shared value

#### `useGlobal.listen.clearAll:  () => void`

Remove all listeners for all shared values

#### `useGlobal.clear(index:string), useGlobal.clearAll()`

Clear specified value from the global state, or clear all values from the global state.  Note that calling these functions will _not_ update subscribers.  These functions are currently only used to clear the global state between tests.

## Injectors

Injector functions are not limited to using `unstateless`'s shared state hooks.  They can contain any kind of React hook, including the standard `useState` and `useEffect` hooks.  The only requirement for an injector is that it needs to return the props passed to it in its return object.
