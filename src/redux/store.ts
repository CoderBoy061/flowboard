import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./reducers/workspaceSlice";
import { permissionMiddleware } from "./permissionMiddleware";

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(permissionMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
