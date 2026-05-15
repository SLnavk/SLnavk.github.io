type Listener = (...args: any[]) => void;

export class EventBus {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, fn: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(fn);
  }

  off(event: string, fn: Listener): void {
    const fns = this.listeners.get(event);
    if (!fns) return;
    this.listeners.set(event, fns.filter(f => f !== fn));
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }

  clear(): void {
    this.listeners.clear();
  }
}
