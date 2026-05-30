// Single seam for ID generation so the rest of the app stays pure/testable.
export function newId(): string {
  return crypto.randomUUID();
}
