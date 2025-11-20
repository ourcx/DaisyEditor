export default class StorageIndexDB {
    private dbName: string = 'collaborativeEditorDB';
    private storeName: string = 'editorDataStore';
    private db: IDBDatabase | null = null;

    constructor() {
        this.init();
    }

    async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    async saveData(data: any, id: string): Promise<void> {
        // 确保数据库已初始化
        if (!this.db) {
            await this.init();
        }

        return new Promise<void>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // 确保数据是可序列化的
            const serializableData = this.makeDataSerializable(data);
            const dataToSave = { 
                id: id, 
                data: serializableData,
                timestamp: new Date().toISOString()
            };
            
            const putRequest = store.put(dataToSave);
            
            putRequest.onsuccess = () => {
                console.log('Data saved successfully with id:', dataToSave.data);
                resolve();
            };
            
            putRequest.onerror = (event) => {
                console.error('Error saving data:', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    async getData(id: string): Promise<any> {
        // 确保数据库已初始化
        if (!this.db) {
            await this.init();
        }

        return new Promise<any>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const getRequest = store.get(id);
            
            getRequest.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result;
                if (result && result.data) {
                    console.log('Data retrieved successfully for id:', id);
                    resolve(result.data);
                } else {
                    console.warn('No data found for id:', id);
                    resolve(null);
                }
            };
            
            getRequest.onerror = (event) => {
                console.error('Error retrieving data:', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    async deleteData(id: string): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise<void>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => {
                console.log('Data deleted successfully for id:', id);
                resolve();
            };
            
            deleteRequest.onerror = (event) => {
                console.error('Error deleting data:', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    async getAllData(): Promise<{id: string, data: any, timestamp: string}[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = (event) => {
                const results = (event.target as IDBRequest).result;
                console.log('Retrieved all data, count:', results.length);
                resolve(results);
            };
            
            getAllRequest.onerror = (event) => {
                console.error('Error retrieving all data:', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    // 确保数据可序列化
    private makeDataSerializable(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }
        
        // 处理数组
        if (Array.isArray(data)) {
            return data.map(item => this.makeDataSerializable(item));
        }
        
        // 处理对象
        if (typeof data === 'object') {
            const serializableObj: any = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    // 跳过函数和无法序列化的属性
                    if (typeof data[key] !== 'function') {
                        serializableObj[key] = this.makeDataSerializable(data[key]);
                    }
                }
            }
            return serializableObj;
        }
        
        // 基本类型直接返回
        return data;
    }

    // 关闭数据库连接
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('Database connection closed');
        }
    }
}

// 创建单例实例
export const storageIndexDB = new StorageIndexDB();