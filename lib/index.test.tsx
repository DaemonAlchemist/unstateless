// Imports go here
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { indexErrorMessage, inject, mergeProps, useDerivedState, useGlobal, useLocalStorage, useSharedState } from '.';
import { curValues } from './useGlobal';

const useTest = useSharedState("test");
const useFoo = useSharedState("foo");
const useCompound = useSharedState({a: 1, b: 2});

const DependentStateTest = () => {
    const [a, setA] = useFoo();
    const [b, setB] = useSharedState<string>(a, "unset")();
    const useStateBar = () => {setA("bar");}
    const useStateFoo = () => {setA("foo");}
    const setBVal = (val:string) => () => {setB(val);}

    return <>
        <div data-testid="a">{a}</div>
        <div data-testid="b">{b}</div>
        <button data-testid="bar-btn" onClick={useStateBar}>Click</button>
        <button data-testid="foo-btn" onClick={useStateFoo}>Click</button>
        <button data-testid="b-btn" onClick={setBVal("clicked")}>Click</button>
        <button data-testid="b-btn2" onClick={setBVal("clicked2")}>Click</button>
    </>;
}

const UnmountTestChild1 = () => {
    const [test, setTest] = useTest();
    const update = () => {setTest("update1");}

    return <>
        <span data-testid="child1-test">{test}</span>
        <button data-testid="child1-btn" onClick={update}>Click!</button>
    </>;
}

const UnmountTestChild2 = () => {
    const [test, setTest] = useTest();
    const update = () => {setTest("update2");}

    return <>
        <span data-testid="child2-test">{test}</span>
        <button data-testid="child2-btn" onClick={update}>Click!</button>
    </>;
}
const UnmountTestParent = () => {
    const [toggle, setToggle] = React.useState<boolean>(false);
    const flip = () => {setToggle(t => !t);}

    return <>
        {toggle && <UnmountTestChild1 />}
        {!toggle && <UnmountTestChild2 />}
        <button data-testid="toggle-btn" onClick={flip} >Click!</button>
    </>;
}

const Test1 = () => {
    const [test, setTest] = useTest();
    const [foo, setFoo] = useFoo();
    const updateTest = () => {setTest("clicked");}
    const updateTest2 = () => {setTest("clicked2");}
    const updateFoo = () => {setFoo("clicked-foo");}
    return <>
        <div data-testid="test1">{test}</div>
        <button data-testid="button1" onClick={updateTest} >Click</button>
        <button data-testid="button1-2" onClick={updateTest2} >Click</button>
        <div data-testid="foo1">{foo}</div>
        <button data-testid="foo-button1" onClick={updateFoo} >Click</button>
    </>;
}
const Test2 = () => {
    const [test, setTest] = useTest();
    const [foo, setFoo] = useFoo();
    const updateTest = () => {setTest("clicked");}
    const updateFoo = () => {setFoo("clicked-foo");}
    return <>
        <div data-testid="test2">{test}</div>
        <button data-testid="button2" onClick={updateTest} >Click</button>
        <div data-testid="foo2">{foo}</div>
        <button data-testid="foo-button2" onClick={updateFoo} >Click</button>
    </>;
}

const Test3 = () => {
    const [test, setTest] = useTest();
    const [foo, setFoo] = useFoo();
    const updateTest = () => {setTest(old => `${old}-clicked`);}
    const updateFoo = () => {setFoo("clicked-foo");}
    return <>
        <div data-testid="test2">{test}</div>
        <button data-testid="button2" onClick={updateTest} >Click</button>
        <div data-testid="foo2">{foo}</div>
        <button data-testid="foo-button2" onClick={updateFoo} >Click</button>
    </>;
}

const Test4 = (props:{onRender:() => void}) => {
    const [test, setTest] = useTest();
    const updateTest = () => {setTest("test");}

    props.onRender();

    return <>
        <div data-testid="test1">{test}</div>
        <button data-testid="button1" onClick={updateTest} >Click</button>
    </>;
}

const TestCompound1 = () => {
    const test = useDerivedState([useCompound], obj => !!obj ? obj.a : 0);

    return <div data-testid="test">{test}</div>
}

const TestCompound2 = () => {
    const [obj, setObj] = useCompound();
    const test = useDerivedState([useCompound], obj => !!obj ? obj.a : 0);

    return <>
        <div data-testid="test-obj">{obj.b}</div>
        <div data-testid="test">{test}</div>
    </>;
}

const TestDerivedChild = (props:{onRender:() => void}) => {
    const test = useDerivedState([useCompound], obj => !!obj ? obj.a : 0);
    props.onRender();
    return <>
        <div data-testid="test">{test}</div>
    </>;
}

const TestDerivedChild2 = (props:{onRender:() => void}) => {
    const [test, setTest] = useCompound();
    const update = () => {
        setTest(old => ({
            ...old,
            b: 5
        }));
    }
props.onRender();
    return <>
        <div data-testid="test-obja">{test.a}</div>
        <div data-testid="test-objb">{test.b}</div>
        <button data-testid="btn" onClick={update}>Click</button>
    </>;
}

const TestDerivedParent = (props:{onRenderChild:() => void, onRenderMain:() => void}) => {
    return <>
        <TestDerivedChild onRender={props.onRenderChild} />
        <TestDerivedChild2 onRender={props.onRenderMain} />
    </>;
}

let usePreset1 = useLocalStorage.string("shouldnt-be-set");
let usePreset2 = useLocalStorage.number(0);
let usePreset3 = useLocalStorage.boolean(false);
let usePresetJson = useLocalStorage.object("presetJson", {a: 3, b: 4});
let useNotSet = useLocalStorage.string("notSet1");

const TestLocalStorage = () => {
    const[preset1, setPreset1] = usePreset1();
    const[preset2, setPreset2] = usePreset2();
    const[preset3, setPreset3] = usePreset3();
    const[notSet, setNotSet] = useNotSet();

    return <>
        <div data-testid="preset1">{preset1}</div>
        <button data-testid="preset1-button" onClick={() => {setPreset1("clicked-preset-1")}}>Click!</button>

        <div data-testid="preset2">{preset2}</div>
        <button data-testid="preset2-button" onClick={() => {setPreset2(2)}}>Click!</button>

        <div data-testid="preset3">{preset3}</div>
        <button data-testid="preset3-button" onClick={() => {setPreset3(false)}}>Click!</button>
        <button data-testid="preset3-button2" onClick={() => {setPreset3(true)}}>Click!</button>

        <div data-testid="notSet1">{notSet}</div>
        <button data-testid="notSet1-button" onClick={() => {setNotSet("clicked-not-set-1")}}>Click!</button>
    </>;
}

const TestLocalStorage2 = () => {
    const[preset1, setPreset1] = usePreset1();
    const[preset2, setPreset2] = usePreset2();
    const[notSet, setNotSet] = useNotSet();
    const[presetJson1, setPresetJson1] = usePresetJson();

    return <>
        <div data-testid="preset1-2">{preset1}</div>
        <button data-testid="preset1-button-2" onClick={() => {setPreset1("clicked-preset-1")}}>Click!</button>

        <div data-testid="preset2-2">{preset2}</div>
        <button data-testid="preset2-button-2" onClick={() => {setPreset2(3)}}>Click!</button>

        <div data-testid="notSet1-2">{notSet}</div>
        <button data-testid="notSet1-button-2" onClick={() => {setNotSet("clicked-not-set-1")}}>Click!</button>

        <div data-testid="a">{presetJson1.a}</div>
        <div data-testid="b">{presetJson1.b}</div>
        <button data-testid="presetjson1-button" onClick={() => {setPresetJson1({a: 5, b: 6})}}>Click!</button>
    </>;
}

const injectA = (props:any) => ({...props, a: "A"});
const injectB = (props:any) => ({...props, b: "B"});
const injectCD = (props:any) => ({...props, c: "C", d: "D"});

interface InjectProps {
    a: string;
    b: string;
    c: string;
    d: string;
}
const TestInjectStateless = (props:InjectProps) => <>
    <div data-testid="a">{props.a}</div>
    <div data-testid="b">{props.b}</div>
    <div data-testid="c">{props.c}</div>
    <div data-testid="d">{props.d}</div>
</>;

const TestInvalidHook = () => {
    const [test, setTest] = useSharedState<string>("oldVal")();

    return <>
        <div>{test}</div>
        <button onClick={() => {setTest("newVal")}}>Click!</button>
    </>;
}

const TestFalseValue = () => {
    const useBool = useSharedState<boolean>("bool-val", false);
    const [test, setTest] = useBool();

    return <>
        <div data-testid="test1">
            {test ? "True" : "False"}
        </div>
        <div data-testid="test-index">{useBool.__index__}</div>
        <button onClick={() => {setTest(true)}}>Click!</button>
    </>;
}

const TestInvalidLocalStorageHook = () => {
    const [test, setTest] = useLocalStorage.string("oldVal")();

    return <>
        <div>{test}</div>
        <button onClick={() => {setTest("newVal")}}>Click!</button>
    </>;
}

const connect = inject<{}, InjectProps>(mergeProps(injectA, injectB, injectCD));
const TestInjectStateful = connect(TestInjectStateless);

beforeEach(() => {
    // Reset spying
    useGlobal.listen.clearAll();

    // Clear all global values
    useGlobal.clearAll();

    // Reset localStorage listeners
    localStorage.clear();
    usePreset1 = useLocalStorage.string("shouldnt-be-set");
    usePreset2 = useLocalStorage.number(0);
    usePreset3 = useLocalStorage.boolean(false);
    usePresetJson = useLocalStorage.object({a: 3, b: 4});
    useNotSet = useLocalStorage.string("notSet1");

    // Setup initial localStorage values
    localStorage.setItem(usePreset1.__index__, "foo1");
    localStorage.setItem(usePreset2.__index__, "1");
    localStorage.setItem(usePreset3.__index__, "1");
    localStorage.setItem(usePresetJson.__index__, JSON.stringify({a: 1, b: 2}));

    // Clear mocks
    jest.clearAllMocks();
});
window.localStorage = localStorage;

describe("unstateless", () => {
    describe("test setup", () => {
        it("should setup localstorage", () => {
            expect(localStorage.getItem(usePreset1.__index__)).toEqual("foo1");
            expect(localStorage.getItem(usePreset2.__index__)).toEqual("1");
            expect(localStorage.getItem(usePreset3.__index__)).toEqual("1");
            expect(localStorage.getItem(usePresetJson.__index__)).toEqual('{"a":1,"b":2}');
        });
    });
    describe("useSharedState", () => {
        it("works within a single component", () => {
            render(<Test1 />);
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("foo-button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("clicked-foo");
        });
        it("saves current values upon initial render", () => {
            render(<Test1 />);
            expect(useTest.getValue()).toEqual("test");
        });
        it("should not rerender if a value does not change", () => {
            const onRender = jest.fn();
            render(<Test4 onRender={onRender}/>);
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(onRender).toHaveBeenCalledTimes(1);
            fireEvent.click(screen.getByTestId("button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(onRender).toHaveBeenCalledTimes(1);
        });
        it("works when components are [re|un]mounted", () => {
            render(<UnmountTestParent />);
            expect(screen.getByTestId("child2-test")).toHaveTextContent("test");
            fireEvent.click(screen.getByTestId("child2-btn"));
            expect(screen.getByTestId("child2-test")).toHaveTextContent("update2");
            fireEvent.click(screen.getByTestId("toggle-btn"));
            expect(screen.getByTestId("child1-test")).toHaveTextContent("update2");
            fireEvent.click(screen.getByTestId("toggle-btn"));
            expect(screen.getByTestId("child2-test")).toHaveTextContent("update2");
        });
        it("shares values with multiple components", () => {
            render(<><Test1 /><Test2 /></>);
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(screen.getByTestId("test2")).toHaveTextContent("test");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            expect(screen.getByTestId("foo2")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("test2")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            expect(screen.getByTestId("foo2")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("foo-button2"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("test2")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("clicked-foo");
            expect(screen.getByTestId("foo2")).toHaveTextContent("clicked-foo");
        });
        it("should allow updating with function", () => {
            render(<Test3 />);
            fireEvent.click(screen.getByTestId("button2"));
            expect(screen.getByTestId("test2")).toHaveTextContent("test-clicked");
        });
        it("should update dependent states", () => {
            render(<DependentStateTest />);
            expect(screen.getByTestId("a")).toHaveTextContent("foo");
            expect(screen.getByTestId("b")).toHaveTextContent("unset");
            fireEvent.click(screen.getByTestId("b-btn"));
            expect(screen.getByTestId("b")).toHaveTextContent("clicked");
            fireEvent.click(screen.getByTestId("bar-btn"));
            expect(screen.getByTestId("a")).toHaveTextContent("bar");
            expect(screen.getByTestId("b")).toHaveTextContent("unset");
            fireEvent.click(screen.getByTestId("b-btn2"));
            expect(screen.getByTestId("b")).toHaveTextContent("clicked2");
            fireEvent.click(screen.getByTestId("foo-btn"));
            expect(screen.getByTestId("a")).toHaveTextContent("foo");
            expect(screen.getByTestId("b")).toHaveTextContent("clicked");
        });
        it("should throw an error if index is not defined for locally defined hook", () => {
            
            expect(() => {
                render(<TestInvalidHook />);
            }).toThrow(indexErrorMessage);
        });
        it("should set the index properly for falsy initial values", () => {
            render(<TestFalseValue />);
            expect(screen.getByTestId("test-index")).toHaveTextContent("bool-val");
            expect(screen.getByTestId("test1")).toHaveTextContent("False");
        });
    });
    describe("useLocalStorage", () => {
        it("should load raw intial values from localstorage if available", () => {
            render(<TestLocalStorage />);

            expect(screen.getByTestId("notSet1")).toHaveTextContent("notSet1");
            expect(screen.getByTestId("preset1")).toHaveTextContent("foo1");
            expect(screen.getByTestId("preset2")).toHaveTextContent("1");
        });
        it("should load JSON intial values from localstorage if available", () => {
            render(<TestLocalStorage2 />);

            expect(screen.getByTestId("a")).toHaveTextContent("1");
            expect(screen.getByTestId("b")).toHaveTextContent("2");
        });
        it("should save to localStorage when updating", () => {
            render(<TestLocalStorage />);

            fireEvent.click(screen.getByTestId("preset1-button"));
            expect(localStorage.setItem).toHaveBeenCalledWith(usePreset1.__index__, "clicked-preset-1");

            fireEvent.click(screen.getByTestId("preset2-button"));
            expect(localStorage.setItem).toHaveBeenCalledWith(usePreset2.__index__, "2");

            fireEvent.click(screen.getByTestId("preset3-button"));
            expect(localStorage.setItem).toHaveBeenCalledWith(usePreset3.__index__, "");

            fireEvent.click(screen.getByTestId("preset3-button2"));
            expect(localStorage.setItem).toHaveBeenCalledWith(usePreset3.__index__, "1");
        });
        it("should rerender all components when updating", () => {
            render(<><TestLocalStorage /><TestLocalStorage2 /></>);

            fireEvent.click(screen.getByTestId("preset1-button"));
            expect(screen.getByTestId("preset1-2")).toHaveTextContent("clicked-preset-1");
        });
        it("should use initialValue if localStorage value is invalid", () => {
            localStorage.setItem(usePresetJson.__index__, "Dfsddf");
            render(<TestLocalStorage2 />);
            expect(screen.getByTestId("a")).toHaveTextContent("3");
            expect(screen.getByTestId("b")).toHaveTextContent("4");
        });
        it("should throw an error if index is not defined for locally defined hook", () => {
            
            expect(() => {
                render(<TestInvalidLocalStorageHook />);
            }).toThrow(indexErrorMessage);
        });
    });
    describe("useDerivedState", () => {
        it("should use an initial value if the state is not set", () => {
            render(<TestCompound1 />);
            expect(screen.getByTestId("test")).toHaveTextContent("0");
        });
        it("should derive state using the specified extractor", () => {
            render(<TestCompound2 />);
            expect(screen.getByTestId("test-obj")).toHaveTextContent("2");
            expect(screen.getByTestId("test")).toHaveTextContent("1");
        });
        it("should not rerender if the derived data does not change", () => {
            const onRenderChild = jest.fn();
            const onRenderMain = jest.fn();
            render(<TestDerivedParent onRenderChild={onRenderChild} onRenderMain={onRenderMain} />);
            expect(screen.getByTestId("test")).toHaveTextContent("1");
            expect(screen.getByTestId("test-obja")).toHaveTextContent("1");
            expect(screen.getByTestId("test-objb")).toHaveTextContent("2");
            expect(onRenderMain).toHaveBeenCalledTimes(1);
            expect(onRenderChild).toHaveBeenCalledTimes(3);
            fireEvent.click(screen.getByTestId("btn"));
            expect(screen.getByTestId("test")).toHaveTextContent("1");
            expect(screen.getByTestId("test-obja")).toHaveTextContent("1");
            expect(screen.getByTestId("test-objb")).toHaveTextContent("5");
            expect(onRenderMain).toHaveBeenCalledTimes(3);
            expect(onRenderChild).toHaveBeenCalledTimes(3);
        })
    });
    describe("inject", () => {
        it("should inject props into components", () => {
            render(<TestInjectStateful />);

            expect(screen.getByTestId("a")).toHaveTextContent("A");
            expect(screen.getByTestId("b")).toHaveTextContent("B");
            expect(screen.getByTestId("c")).toHaveTextContent("C");
            expect(screen.getByTestId("d")).toHaveTextContent("D");
        });
    });
    describe("listen", () => {
        it("should allow hooking into state change events", () => {
            const test = jest.fn();
            useGlobal.listen.on(useTest, test);
            render(<Test1 />);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", useTest.__index__);
        });
        it("should run a new listener if the listened value has already been set", () => {
            const test = jest.fn();
            render(<Test1 />);
            useTest.onChange(test);
            expect(test).toHaveBeenCalledWith("test", "test", useTest.__index__);
        });
        it("should allow removing listen hooks", () => {
            const test = jest.fn();
            useTest.onChange(test);

            render(<Test1 />);
            expect(test).toHaveBeenCalledTimes(1);

            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", useTest.__index__);
            expect(test).toHaveBeenCalledTimes(2);

            useTest.offChange(test);

            fireEvent.click(screen.getByTestId("button1-2"));
            expect(test).toHaveBeenCalledTimes(2);
        });
        it("should allow removing all listen hooks", () => {
            const test1 = jest.fn();
            useTest.onChange(test1);
            const test2 = jest.fn();
            useTest.onChange(test2);

            render(<Test1 />);
            expect(test1).toHaveBeenCalledTimes(1);
            expect(test2).toHaveBeenCalledTimes(1);

            fireEvent.click(screen.getByTestId("button1"));
            expect(test1).toHaveBeenCalledWith("clicked", "test", useTest.__index__);
            expect(test2).toHaveBeenCalledWith("clicked", "test", useTest.__index__);
            expect(test1).toHaveBeenCalledTimes(2);
            expect(test2).toHaveBeenCalledTimes(2);

            useTest.clearListeners();

            fireEvent.click(screen.getByTestId("button1-2"));
            expect(test1).toHaveBeenCalledTimes(2);
            expect(test2).toHaveBeenCalledTimes(2);
        });
        it("should allow hooking into all state change events", () => {
            const test = jest.fn();
            useGlobal.listen.onAll(test);
            render(<Test1 />);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", useTest.__index__);
        });
        it("should run new global listeners immediately if values have been set", () => {
            const test = jest.fn();
            render(<Test1 />);
            useGlobal.listen.onAll(test);
            expect(test).toHaveBeenCalledWith("test", "test", useTest.__index__);
        });
        it("should allow removing global listen hooks", () => {
            const test = jest.fn();
            useGlobal.listen.onAll(test);
            render(<Test1 />);
            expect(test).toHaveBeenCalledTimes(2);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", useTest.__index__);
            expect(test).toHaveBeenCalledTimes(3);
            useGlobal.listen.offAll(test);
            fireEvent.click(screen.getByTestId("button1-2"));
            expect(test).toHaveBeenCalledTimes(3);
        });
    });
});
