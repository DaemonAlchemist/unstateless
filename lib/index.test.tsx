// Imports go here
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { inject, mergeProps, useGlobal, useLocalStorage, useSharedState } from '.';

const useTest = () => useSharedState("test", "test");
const useFoo = () => useSharedState("foo", "foo");

const DependentStateTest = () => {
    const [a, setA] = useSharedState<string>("master", "foo");
    const [b, setB] = useSharedState<string>(a, "unset");
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

const usePreset1 = () => useLocalStorage.string("preset1", "shouldnt-be-set");
const usePreset2 = () => useLocalStorage.number("preset2", 0);
const usePreset3 = () => useLocalStorage.boolean("preset3", false);
const usePresetJson = () => useLocalStorage.object("presetJson1", {a: 3, b: 4});
const useNotSet = () => useLocalStorage.string("notSet1", "notSet1");

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

const connect = inject<{}, InjectProps>(mergeProps(injectA, injectB, injectCD));
const TestInjectStateful = connect(TestInjectStateless);

beforeEach(() => {
    localStorage.clear();

    // Setup initial localStorage values
    localStorage.setItem("preset1", "foo1");
    localStorage.setItem("preset2", "1");
    localStorage.setItem("preset3", "1");
    localStorage.setItem("presetJson1", JSON.stringify({a: 1, b: 2}));

    // Clear mocks
    jest.clearAllMocks();

    // Reset spying
    useGlobal.listen.clearAll();

    // Clear all global values
    useGlobal.clearAll();
});
window.localStorage = localStorage;

describe("unstateless", () => {
    describe("test setup", () => {
        it("should setup localstorage", () => {
            expect(localStorage.getItem("preset1")).toEqual("foo1");
            expect(localStorage.getItem("preset2")).toEqual("1");
            expect(localStorage.getItem("preset3")).toEqual("1");
            expect(localStorage.getItem("presetJson1")).toEqual('{"a":1,"b":2}');
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
            expect(localStorage.setItem).toHaveBeenCalledWith("preset1", "clicked-preset-1");

            fireEvent.click(screen.getByTestId("preset2-button"));
            expect(localStorage.setItem).toHaveBeenCalledWith("preset2", "2");

            fireEvent.click(screen.getByTestId("preset3-button"));
            expect(localStorage.setItem).toHaveBeenCalledWith("preset3", "");

            fireEvent.click(screen.getByTestId("preset3-button2"));
            expect(localStorage.setItem).toHaveBeenCalledWith("preset3", "1");
        });
        it("should rerender all components when updating", () => {
            render(<><TestLocalStorage /><TestLocalStorage2 /></>);

            fireEvent.click(screen.getByTestId("preset1-button"));
            expect(screen.getByTestId("preset1-2")).toHaveTextContent("clicked-preset-1");
        });
        it("should use initialValue if localStorage value is invalid", () => {
            localStorage.setItem("presetJson1", "Dfsddf");
            render(<TestLocalStorage2 />);
            expect(screen.getByTestId("a")).toHaveTextContent("3");
            expect(screen.getByTestId("b")).toHaveTextContent("4");
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
            useGlobal.listen.on("test", test);
            render(<Test1 />);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", "test");
        });
        it("should allow removing listen hooks", () => {
            const test = jest.fn();
            useGlobal.listen.on("test", test);
            render(<Test1 />);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", "test");
            useGlobal.listen.off("test", test);
            fireEvent.click(screen.getByTestId("button1-2"));
            expect(test).toHaveBeenCalledTimes(1);
        });
        it("should allow hooking into all state change events", () => {
            const test = jest.fn();
            useGlobal.listen.onAll(test);
            render(<Test1 />);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", "test");
        });
        it("should allow removing global listen hooks", () => {
            const test = jest.fn();
            useGlobal.listen.onAll(test);
            render(<Test1 />);
            fireEvent.click(screen.getByTestId("button1"));
            expect(test).toHaveBeenCalledWith("clicked", "test", "test");
            useGlobal.listen.offAll(test);
            fireEvent.click(screen.getByTestId("button1-2"));
            expect(test).toHaveBeenCalledTimes(1);
        });
    });
});
