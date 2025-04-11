import { v4 as uuidv4 } from 'uuid';

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

  /**
   * UUID生成して新しいIDを作成
   * @returns 新しいID
   */
  static create<U extends ID<string>>(this: new (id: string) => U): U {
    return new this(uuidv4());
  }

  /**
   * 既存のIDから復元
   * @param id ID文字列
   * @returns 復元されたID
   */
  static reconstruct<U extends ID<string>>(this: new (id: string) => U, id: string): U {
    return new this(id);
  }
}
