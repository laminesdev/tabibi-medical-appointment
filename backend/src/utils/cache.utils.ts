interface CacheItem {
   value: any;
   expiresAt: number;
}

export class CacheUtils {
   private static cache = new Map<string, CacheItem>();
   private static readonly DEFAULT_TTL = 300; // 5 minutes in seconds
   private static warningLogged = false;

   static async get<T>(key: string): Promise<T | null> {
      if (!this.warningLogged) {
         console.warn('WARNING: Using in-memory cache. For production, switch to Redis or distributed cache.');
         this.warningLogged = true;
      }
      
      const item = this.cache.get(key);

      if (!item) {
         return null;
      }

      if (Date.now() > item.expiresAt) {
         this.cache.delete(key);
         return null;
      }

      return item.value as T;
   }

   static async set<T>(
      key: string,
      value: T,
      ttlSeconds: number = this.DEFAULT_TTL
   ): Promise<void> {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.cache.set(key, { value, expiresAt });
   }

   static async getOrSet<T>(
      key: string,
      fetchFn: () => Promise<T>,
      ttlSeconds: number = this.DEFAULT_TTL
   ): Promise<T> {
      const cached = await this.get<T>(key);

      if (cached !== null) {
         return cached;
      }

      const data = await fetchFn();
      await this.set(key, data, ttlSeconds);
      return data;
   }

   static async delete(key: string): Promise<void> {
      this.cache.delete(key);
   }

   static async deleteByPattern(pattern: string): Promise<void> {
      // FIXED: Escape regex special characters and handle wildcards properly
      const escapedPattern = pattern
         .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape regex chars
         .replace(/\\\*/g, '.*');                 // Convert * to .*
      
      const regex = new RegExp(`^${escapedPattern}$`);
      
      for (const key of Array.from(this.cache.keys())) {
         if (regex.test(key)) {
            this.cache.delete(key);
         }
      }
   }

   static async clearAll(): Promise<void> {
      this.cache.clear();
   }

   static async has(key: string): Promise<boolean> {
      const item = this.cache.get(key);
      if (!item) return false;

      if (Date.now() > item.expiresAt) {
         this.cache.delete(key);
         return false;
      }

      return true;
   }

   static getStats(): { size: number; keys: string[] } {
      this.cleanExpired();

      return {
         size: this.cache.size,
         keys: Array.from(this.cache.keys()),
      };
   }

   private static cleanExpired(): void {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
         if (now > item.expiresAt) {
            this.cache.delete(key);
         }
      }
   }
}
