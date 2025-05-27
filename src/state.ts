import { AttackNode } from './types.js';

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Refresh by removing and re-adding
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = Array.from(this.cache.keys())[0];
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    // Add new value
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

export class StateManager {
  private cache: LRUCache<string, AttackNode>;
  private nodes = new Map<string, AttackNode>();

  constructor(cacheSize: number) {
    this.cache = new LRUCache(cacheSize);
  }

  async getNode(id: string): Promise<AttackNode | undefined> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached) return cached;

    // Check main storage
    const node = this.nodes.get(id);
    if (node) {
      this.cache.set(id, node);
      return node;
    }

    return undefined;
  }

  async saveNode(node: AttackNode): Promise<void> {
    this.nodes.set(node.id, node);
    this.cache.set(node.id, node);
  }

  async getChildren(nodeId: string): Promise<AttackNode[]> {
    const node = await this.getNode(nodeId);
    if (!node || !node.children) return [];
    return node.children;
  }

  async getPath(nodeId: string): Promise<AttackNode[]> {
    const path: AttackNode[] = [];
    let current = await this.getNode(nodeId);
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  async getAllNodes(): Promise<AttackNode[]> {
    return Array.from(this.nodes.values());
  }

  clear(): void {
    this.nodes.clear();
    this.cache.clear();
  }
}
