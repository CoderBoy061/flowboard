import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { mockTasks } from "../data/mockData";
import { permissionMiddleware } from "../redux/permissionMiddleware";
import workspaceReducer, {
  switchUser,
  updateTask,
} from "../redux/reducers/workspaceSlice";

function createTestStore() {
  return configureStore({
    reducer: { workspace: workspaceReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(permissionMiddleware),
  });
}

describe("permission middleware", () => {
  it("returns a structured FORBIDDEN error for a denied task mutation", () => {
    const store = createTestStore();
    const deniedTask = mockTasks.find((task) => task.id === "task-6");

    expect(deniedTask).toBeDefined();
    store.dispatch(switchUser("user-bob"));

    let thrown: unknown;
    try {
      store.dispatch(updateTask({ ...deniedTask!, title: "Blocked update" }));
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toMatchObject({
      error: {
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
      },
    });
  });
});
