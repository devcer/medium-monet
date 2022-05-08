// Define your storage data here
export interface Storage {} // eslint-disable-line

/**
 *
 * @returns Promise
 */
export function getStorageData(): Promise<Storage> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve(result as Storage);
    });
  });
}

/**
 *
 * @param data The data to set
 * @returns Promise
 */
export function setStorageData(data: Storage): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve();
    });
  });
}

/**
 *
 * @param key The key to get
 * @returns Promise
 */
export function getStorageItem<Key extends keyof Storage>(
  key: Key,
): Promise<Storage[Key]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve((result as Storage)[key]);
    });
  });
}

/**
 *
 * @param key The key to which value to be set
 * @param value The value to set
 * @returns Promise
 */
export function setStorageItem<Key extends keyof Storage>(
  key: Key,
  value: Storage[Key],
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve();
    });
  });
}

/**
 *
 * @param defaults The defaults to set
 */
export async function initializeStorageWithDefaults(defaults: Storage) {
  const currentStorageData = await getStorageData();
  const newStorageData = Object.assign({}, defaults, currentStorageData);
  await setStorageData(newStorageData);
}
