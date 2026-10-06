import axios from 'axios';

// Hna kat-7et l-lien d Render wa7ed marra safi!
const API = axios.create({
  baseURL: 'https://alugestion.onrender.com',
});

const OFFLINE_QUEUE_KEY = 'alugestion_offline_request_queue';
const QUEUEABLE_METHODS = new Set(['post', 'put', 'patch']);
let isSyncingOfflineQueue = false;

const readOfflineQueue = () => {
  const storedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!storedQueue) return [];

  const queue = JSON.parse(storedQueue);
  if (!Array.isArray(queue)) {
    throw new Error('The saved offline request queue is invalid.');
  }
  return queue;
};

const writeOfflineQueue = (queue) => {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const isLoginRequest = (url = '') =>
  url.split('?')[0].replace(/\/+$/, '').endsWith('/login');

const isNetworkError = (error) =>
  !error.response &&
  (error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    (typeof navigator !== 'undefined' && !navigator.onLine));

const createOfflineQueueEntry = (config) => {
  const headers = typeof config.headers?.toJSON === 'function'
    ? config.headers.toJSON()
    : { ...config.headers };

  Object.keys(headers).forEach((name) => {
    if (['authorization', 'cookie', 'set-cookie'].includes(name.toLowerCase())) {
      delete headers[name];
    }
  });

  return {
    id: globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    config: {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers,
    },
  };
};

const enqueueOfflineRequest = (config) => {
  const entry = createOfflineQueueEntry(config);
  writeOfflineQueue([...readOfflineQueue(), entry]);

  const error = new Error('Network error. Request saved locally and will sync when connection returns.');
  error.name = 'OfflineQueuedError';
  error.isOfflineQueued = true;
  error.queueId = entry.id;
  return error;
};

const removeSyncedRequest = (id) => {
  writeOfflineQueue(readOfflineQueue().filter((entry) => entry.id !== id));
};

const syncOfflineData = async () => {
  if (isSyncingOfflineQueue || typeof window === 'undefined' || !navigator.onLine) return;

  isSyncingOfflineQueue = true;
  try {
    const queue = readOfflineQueue();
    for (const entry of queue) {
      if (!navigator.onLine) break;

      try {
        await API.request({ ...entry.config, _skipOfflineQueue: true });
        removeSyncedRequest(entry.id);
      } catch (error) {
        console.error('Offline request sync failed; the request remains queued:', error);
        break;
      }
    }
  } catch (error) {
    console.error('Unable to read or update the offline request queue:', error);
  } finally {
    isSyncingOfflineQueue = false;
  }
};

API.interceptors.request.use((config) => {
  if (
    !config._skipOfflineQueue &&
    typeof navigator !== 'undefined' &&
    navigator.onLine &&
    !isLoginRequest(config.url)
  ) {
    void syncOfflineData();
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    if (
      config &&
      !config._skipOfflineQueue &&
      QUEUEABLE_METHODS.has((config.method || '').toLowerCase()) &&
      !isLoginRequest(config.url) &&
      isNetworkError(error)
    ) {
      return Promise.reject(enqueueOfflineRequest(config));
    }
    return Promise.reject(error);
  },
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
  void syncOfflineData();
}

export default API;