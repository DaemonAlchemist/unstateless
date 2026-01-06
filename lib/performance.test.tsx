/** @jest-environment jsdom */
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { useSharedState, useDerivedState } from "./index";
import { useGlobal } from "./useGlobal";

const useTestState = useSharedState(0);

// Performance thresholds (adjust based on environment, mainly for regression detection)
const CONCURRENCY_THRESHOLD_MS = 50; // 1000 components update time
const LARGE_STATE_THRESHOLD_MS = 1; // 10,000 items update time
const FAN_OUT_THRESHOLD_MS = 50; // 1,000 selectors update time
const RAPID_UPDATE_THRESHOLD_MS = 5; // 100 updates time
const ISOLATION_THRESHOLD_MS = 1; // 1,000 selectors update time
const RENDER_BATCHING_THRESHOLD_MS = 50; 

describe("Performance Stress Tests", () => {
    beforeEach(() => {
        useGlobal.clearAll();
    });

    it("should handle 1,000 subscribers efficiently", () => {
        const Subscriber = () => {
            const [val] = useTestState();
            return <div data-testid="subscriber">{val}</div>;
        };

        const Root = () => {
            return (
                <>
                    {Array.from({ length: 1000 }).map((_, i) => (
                        <Subscriber key={i} />
                    ))}
                </>
            );
        };

        const startRender = performance.now();
        render(<Root />);
        const endRender = performance.now();
        // Initial render logic... 

        const startUpdate = performance.now();
        act(() => {
            useTestState.setValue(1);
        });
        const endUpdate = performance.now();
        
        const updateDuration = endUpdate - startUpdate;
        
        // Assert that all updated
        const items = screen.getAllByTestId("subscriber");
        expect(items[0]).toHaveTextContent("1");
        expect(items.length).toBe(1000);

        // console.log(`1,000 Subscribers Update Time: ${updateDuration.toFixed(2)}ms`);

        // Soft assertion for now to establish baseline
        expect(updateDuration).toBeLessThan(CONCURRENCY_THRESHOLD_MS);
    });

    it("should handle large state objects (10,000 items) efficiently", () => {
        const largeState = Array.from({ length: 10000 }).map((_, i) => ({
            id: i,
            value: `Item ${i}`,
            nested: { data: i * 2 }
        }));

        const useLargeState = useSharedState(largeState);

        const Reader = () => {
            const [val] = useLargeState();
            return <div data-testid="reader">{val[5000].value}</div>;
        };

        render(<Reader />);
        
        const startUpdate = performance.now();
        act(() => {
            const newState = [...largeState];
            newState[5000] = { ...newState[5000], value: "Updated" };
            useLargeState.setValue(newState);
        });
        const endUpdate = performance.now();

        expect(screen.getByTestId("reader")).toHaveTextContent("Updated");
        const duration = endUpdate - startUpdate;
        // console.log(`Large State Update Time: ${duration.toFixed(2)}ms`);
        // Serialization overhead check (should be reasonably fast)
        expect(duration).toBeLessThan(LARGE_STATE_THRESHOLD_MS);
    });

    it("should handle derived state fan-out (1,000 selectors) efficiently", () => {
        const useRoot = useSharedState(0);
        
        // Create 1000 derived states
        const derivedStates = Array.from({ length: 1000 }).map((_, i) => ({
            id: i,
            hook: () => useDerivedState((v:number) => `Derived ${i}: ${v}`, [useRoot])
        }));

        const Consumer = ({ hook }: { hook: () => string }) => {
            const val = hook();
            return <div data-testid="derived">{val}</div>;
        };

        const Root = () => (
            <>
                {derivedStates.map(d => <Consumer key={d.id} hook={d.hook} />)}
            </>
        );

        render(<Root />);

        const start = performance.now();
        act(() => {
            useRoot.setValue(1);
        });
        const duration = performance.now() - start;

        // Verify a sample
        expect(screen.getAllByTestId("derived")[0]).toHaveTextContent("Derived 0: 1");
        expect(screen.getAllByTestId("derived").length).toBe(1000);

        // console.log(`Fan-Out (Width) Update Time: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(FAN_OUT_THRESHOLD_MS); // Evaluating 1000 selectors + render
    });
    it("should handle rapid updates efficiently", async () => {
        const useCounter = useSharedState(0);
        const RenderCounter = jest.fn();

        const Reader = () => {
            const [val] = useCounter();
            RenderCounter(val);
            return <div>{val}</div>;
        };

        render(<Reader />);
        
        const start = performance.now();
        // Trigger 100 updates
        await act(async () => {
            for(let i = 0; i < 100; i++) {
                useCounter.setValue(i);
            }
        });
        const duration = performance.now() - start;

        // In React 18, automatic batching might coalesce these into fewer renders if they happen in same tick.
        // But since we are inside `act` and potentially synchronous loop, it might batch all to 1 or a few.
        // We mainly want to ensure it doesn't crash or take forever (e.g. N^2 listener overhead).
        
        console.log(`Rapid Update Time: ${duration.toFixed(2)}ms, Renders: ${RenderCounter.mock.calls.length}`);
        
        expect(duration).toBeLessThan(RAPID_UPDATE_THRESHOLD_MS); 
    });

    it("should demonstrate isolation (selective rendering)", () => {
        const useStateA = useSharedState("A");
        const useStateB = useSharedState("B");
        const RenderCounterA = jest.fn();

        const ComponentA = () => {
            const [val] = useStateA();
            RenderCounterA(val);
            return <div data-testid="a">{val}</div>;
        };

        const ComponentB = () => {
             const [val] = useStateB();
             return <div data-testid="b">{val}</div>;
        };

        const Root = () => (
            <>
                {Array.from({ length: 1000 }).map((_, i) => <ComponentA key={i} />)}
                <ComponentB />
            </>
        );

        render(<Root />);
        
        // Initial render: 1000 A components rendered 1 time
        expect(RenderCounterA).toHaveBeenCalledTimes(1000);
        RenderCounterA.mockClear();

        const start = performance.now();
        act(() => {
            useStateB.setValue("B Updated");
        });
        const duration = performance.now() - start;

        // Expectation: A components should NOT re-render
        expect(RenderCounterA).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId("b")).toHaveTextContent("B Updated");

        console.log(`Isolation Update Time: ${duration.toFixed(2)}ms`); // Should be very fast, ~1ms
        expect(duration).toBeLessThan(ISOLATION_THRESHOLD_MS);
    });
});
