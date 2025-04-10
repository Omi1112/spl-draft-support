export abstract class ID<T extends string | number> {
  constructor(readonly value: T) {
    if (!value) {
      throw new Error('ID value cannot be empty');
    }
  }

  equals(id?: ID<T> | null): boolean {
    if (id === undefined || id === null) {
      return false;
    }
    return this.value === id.value;
  }

  toString(): string {
    return String(this.value);
  }
}
