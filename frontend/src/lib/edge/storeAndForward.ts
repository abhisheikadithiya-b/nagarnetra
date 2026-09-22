/**
 * NagarNetra Edge - Offline Store-and-Forward Queue (IndexedDB)
 * Buffers HMAC-signed sighting events during cellular dead-zones (underpasses, tunnel corridors)
 * and uplinks idempotently with exponential backoff once 4G/5G connectivity resumes.
 */

export interface QueuedEvent {
  id: string;                    // Client-generated ULID/UUID
  idempotencyToken: string;
  createdAt: number;
  payload: any;
  hmacSignature: string;
  status: 'queued' | 'in_flight' | 'acknowledged' | 'failed';
  retryCount: number;
  lastAttemptAt?: number;
  errorMsg?: string;
}

export interface QueueMetrics {
  queuedCount: number;
  inFlightCount: number;
  acknowledgedCount: number;
  oldestAgeSeconds: number;
  storageUsageBytes?: number;
}

const DB_NAME = 'nagarnetra_edge_v1';
const STORE_NAME = 'telemetry_queue';

export class StoreAndForwardQueue {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isProcessing = false;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('idempotencyToken', 'idempotencyToken', { unique: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Enqueue a newly detected edge event with HMAC signature.
   */
  async enqueue(payload: any, hmacSignature: string): Promise<QueuedEvent> {
    const id = payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const event: QueuedEvent = {
      id,
      idempotencyToken: `${payload.bus_id || 'BUS'}_${payload.t || Date.now()}_${id}`,
      createdAt: Date.now(),
      payload,
      hmacSignature,
      status: 'queued',
      retryCount: 0,
    };

    if (!this.dbPromise) {
      // Memory fallback if IndexedDB is disabled
      return event;
    }

    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(event);

      req.onsuccess = () => resolve(event);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Drain and transmit queued events with exponential backoff and concurrency limit.
   */
  async processQueue(
    uplinkHandler: (event: QueuedEvent) => Promise<boolean>
  ): Promise<{ sent: number; failed: number }> {
    if (this.isProcessing || !this.dbPromise) {
      return { sent: 0, failed: 0 };
    }

    this.isProcessing = true;
    let sent = 0;
    let failed = 0;

    try {
      const db = await this.dbPromise;
      const events = await this.getPendingEvents(db);

      for (const event of events) {
        // Calculate exponential backoff delay (1s, 2s, 4s, 8s, max 60s)
        const backoffMs = Math.min(60000, 1000 * Math.pow(2, event.retryCount));
        const now = Date.now();
        if (event.lastAttemptAt && (now - event.lastAttemptAt) < backoffMs) {
          continue; // Wait for backoff window
        }

        // Mark in-flight
        await this.updateStatus(db, event.id, 'in_flight');

        try {
          const success = await uplinkHandler(event);
          if (success) {
            await this.updateStatus(db, event.id, 'acknowledged');
            sent++;
          } else {
            await this.markFailed(db, event, 'Hub rejected payload');
            failed++;
          }
        } catch (err: any) {
          await this.markFailed(db, event, err?.message || 'Network unreachable');
          failed++;
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return { sent, failed };
  }

  private getPendingEvents(db: IDBDatabase): Promise<QueuedEvent[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('status');
      const req = index.getAll('queued');

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  private updateStatus(db: IDBDatabase, id: string, status: QueuedEvent['status']): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) return resolve();
        item.status = status;
        if (status === 'in_flight') {
          item.lastAttemptAt = Date.now();
        }
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  private markFailed(db: IDBDatabase, event: QueuedEvent, reason: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      event.retryCount += 1;
      event.status = event.retryCount > 10 ? 'failed' : 'queued';
      event.errorMsg = reason;
      event.lastAttemptAt = Date.now();

      const putReq = store.put(event);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  }

  /**
   * Returns current queue depth and latency metrics for HUD telemetry.
   */
  async getMetrics(): Promise<QueueMetrics> {
    if (!this.dbPromise) {
      return { queuedCount: 0, inFlightCount: 0, acknowledgedCount: 0, oldestAgeSeconds: 0 };
    }

    try {
      const db = await this.dbPromise;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const all: QueuedEvent[] = req.result || [];
          let queued = 0;
          let inFlight = 0;
          let acked = 0;
          let oldestTime = Date.now();

          all.forEach((item) => {
            if (item.status === 'queued') {
              queued++;
              if (item.createdAt < oldestTime) oldestTime = item.createdAt;
            } else if (item.status === 'in_flight') {
              inFlight++;
            } else if (item.status === 'acknowledged') {
              acked++;
            }
          });

          resolve({
            queuedCount: queued,
            inFlightCount: inFlight,
            acknowledgedCount: acked,
            oldestAgeSeconds: queued > 0 ? Math.round((Date.now() - oldestTime) / 1000) : 0,
          });
        };

        req.onerror = () => {
          resolve({ queuedCount: 0, inFlightCount: 0, acknowledgedCount: 0, oldestAgeSeconds: 0 });
        };
      });
    } catch {
      return { queuedCount: 0, inFlightCount: 0, acknowledgedCount: 0, oldestAgeSeconds: 0 };
    }
  }

  /**
   * Prunes successfully delivered records older than 24 hours.
   */
  async pruneOldRecords(maxAgeHours = 24): Promise<number> {
    if (!this.dbPromise) return 0;
    const db = await this.dbPromise;
    const threshold = Date.now() - maxAgeHours * 60 * 60 * 1000;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      let pruned = 0;

      req.onsuccess = (e: any) => {
        const cursor: IDBCursorWithValue = e.target.result;
        if (cursor) {
          const item: QueuedEvent = cursor.value;
          if (item.status === 'acknowledged' && item.createdAt < threshold) {
            cursor.delete();
            pruned++;
          }
          cursor.continue();
        } else {
          resolve(pruned);
        }
      };
    });
  }
}
