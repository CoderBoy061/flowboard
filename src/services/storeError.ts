export type StoreErrorCode = "FORBIDDEN" | "NOT_FOUND" | "VALIDATION";

export interface StoreErrorShape {
  error: {
    code: StoreErrorCode;
    message: string;
  };
}

export class StoreOperationError extends Error implements StoreErrorShape {
  error: StoreErrorShape["error"];

  constructor(code: StoreErrorCode, message: string) {
    super(message);
    this.name = "StoreOperationError";
    this.error = { code, message };
  }
}

export function createStoreError(code: StoreErrorCode, message: string) {
  return new StoreOperationError(code, message);
}
