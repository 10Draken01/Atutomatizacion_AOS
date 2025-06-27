import { randomUUID } from 'crypto';

export class Id {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Id): boolean {
    return this.value === other.getValue();
  }
}