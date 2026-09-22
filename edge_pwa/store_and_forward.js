/**
 * NagarNetra Store-and-Forward Queue for Phone PWA Node
 * Stores telemetry offline when connectivity is intermittent.
 */
class StoreAndForwardQueue {
  constructor(dbName = "NagarNetraEdgeDB", storeName = "event_queue") {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => reject(e);
    });
  }

  async enqueue(event) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], "readwrite");
      const store = tx.objectStore(this.storeName);
      store.put(event);
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e);
    });
  }

  async flush(apiEndpoint) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = async () => {
        const events = request.result;
        let sentCount = 0;
        for (const ev of events) {
          try {
            const res = await fetch(apiEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ev)
            });
            if (res.ok) {
              const delTx = this.db.transaction([this.storeName], "readwrite");
              delTx.objectStore(this.storeName).delete(ev.id);
              sentCount++;
            }
          } catch {
            break; // Network still disconnected
          }
        }
        resolve(sentCount);
      };
      request.onerror = (e) => reject(e);
    });
  }
}

if (typeof window !== "undefined") {
  window.StoreAndForwardQueue = StoreAndForwardQueue;
}
