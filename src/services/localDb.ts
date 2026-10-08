// Robust IndexedDB layer for storing large files and certificates
// Avoids the 5MB browser localStorage quota limitation completely.
import { Certificate } from '../types';

const DB_NAME = 'nexgen_certificate_db';
const DB_VERSION = 1;
const STORE_CERTIFICATES = 'certificates';
const STORE_FILES = 'certificate_files';

let dbPromise: Promise<IDBDatabase> | null = null;
const memoryCertificates = new Map<string, Certificate>();
const memoryFiles = new Map<string, string | Blob>();

function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB not supported in this environment.'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for certificates
        if (!db.objectStoreNames.contains(STORE_CERTIFICATES)) {
          const certStore = db.createObjectStore(STORE_CERTIFICATES, { keyPath: 'id' });
          certStore.createIndex('certificate_number', 'certificate_number', { unique: false });
          certStore.createIndex('student_name', 'student_name', { unique: false });
          certStore.createIndex('course', 'course', { unique: false });
          certStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Store for raw files / Blobs / Data URLs
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('Failed to open IndexedDB, falling back to in-memory store:', request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB blocked by other connections.');
      };
    } catch (err) {
      reject(err);
    }
  });

  return dbPromise;
}

export const localDb = {
  async saveCertificate(cert: Certificate): Promise<void> {
    memoryCertificates.set(cert.id, cert);

    if (!isIndexedDBSupported()) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_CERTIFICATES], 'readwrite');
        const store = tx.objectStore(STORE_CERTIFICATES);
        const req = store.put(cert);

        req.onsuccess = () => resolve();
        req.onerror = () => {
          console.warn('IndexedDB put certificate error:', req.error);
          resolve(); // don't reject to preserve memory cache
        };
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('IndexedDB save error, cached in memory:', err);
    }
  },

  async saveCertificates(certs: Certificate[]): Promise<void> {
    for (const c of certs) {
      memoryCertificates.set(c.id, c);
    }

    if (!isIndexedDBSupported()) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve) => {
        const tx = db.transaction([STORE_CERTIFICATES], 'readwrite');
        const store = tx.objectStore(STORE_CERTIFICATES);

        for (const c of certs) {
          store.put(c);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('IndexedDB saveCertificates error:', err);
    }
  },

  async getAllCertificates(): Promise<Certificate[]> {
    if (!isIndexedDBSupported()) {
      return Array.from(memoryCertificates.values());
    }

    try {
      const db = await openDatabase();
      return new Promise<Certificate[]>((resolve) => {
        const tx = db.transaction([STORE_CERTIFICATES], 'readonly');
        const store = tx.objectStore(STORE_CERTIFICATES);
        const req = store.getAll();

        req.onsuccess = () => {
          const results: Certificate[] = req.result || [];
          for (const c of results) {
            memoryCertificates.set(c.id, c);
          }
          resolve(results);
        };

        req.onerror = () => {
          resolve(Array.from(memoryCertificates.values()));
        };
      });
    } catch (err) {
      return Array.from(memoryCertificates.values());
    }
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    if (memoryCertificates.has(id)) {
      return memoryCertificates.get(id) || null;
    }

    if (!isIndexedDBSupported()) return null;

    try {
      const db = await openDatabase();
      return new Promise<Certificate | null>((resolve) => {
        const tx = db.transaction([STORE_CERTIFICATES], 'readonly');
        const store = tx.objectStore(STORE_CERTIFICATES);
        const req = store.get(id);

        req.onsuccess = () => {
          const res = (req.result as Certificate) || null;
          if (res) memoryCertificates.set(res.id, res);
          resolve(res);
        };

        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  },

  async getCertificateByNumber(certNumber: string): Promise<Certificate | null> {
    const cleanNum = certNumber.trim().toUpperCase();
    for (const c of memoryCertificates.values()) {
      if (c.certificate_number.toUpperCase() === cleanNum) return c;
    }

    const all = await this.getAllCertificates();
    const found = all.find((c) => c.certificate_number.toUpperCase() === cleanNum);
    return found || null;
  },

  async deleteCertificate(id: string): Promise<void> {
    memoryCertificates.delete(id);

    if (!isIndexedDBSupported()) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve) => {
        const tx = db.transaction([STORE_CERTIFICATES], 'readwrite');
        const store = tx.objectStore(STORE_CERTIFICATES);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        tx.oncomplete = () => resolve();
      });
    } catch (err) {
      console.warn('IndexedDB delete error:', err);
    }
  },

  async saveFile(fileId: string, data: string | Blob): Promise<void> {
    memoryFiles.set(fileId, data);

    if (!isIndexedDBSupported()) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve) => {
        const tx = db.transaction([STORE_FILES], 'readwrite');
        const store = tx.objectStore(STORE_FILES);
        store.put(data, fileId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('IndexedDB saveFile error:', err);
    }
  },

  async getFile(fileId: string): Promise<string | Blob | null> {
    if (memoryFiles.has(fileId)) {
      return memoryFiles.get(fileId) || null;
    }

    if (!isIndexedDBSupported()) return null;

    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_FILES], 'readonly');
        const store = tx.objectStore(STORE_FILES);
        const req = store.get(fileId);

        req.onsuccess = () => {
          const val = req.result;
          if (val) memoryFiles.set(fileId, val);
          resolve(val || null);
        };

        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    memoryCertificates.clear();
    memoryFiles.clear();

    if (!isIndexedDBSupported()) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve) => {
        const tx = db.transaction([STORE_CERTIFICATES, STORE_FILES], 'readwrite');
        tx.objectStore(STORE_CERTIFICATES).clear();
        tx.objectStore(STORE_FILES).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('IndexedDB clear error:', err);
    }
  },
};
