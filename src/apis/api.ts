import { AxiosAPIClient } from './axios';
import { FetchAPIClient } from './fetch';

export class BaseAPIClient {
  _cache: Record<string, string> = {};
  _client: any;
  apiKeyName: string = '';

  constructor(_baseUrl: string, apiKeyName?: string, apiKeyValue?: string) {
    if (apiKeyName) {
      this.apiKeyName = apiKeyName;
    }
    if (typeof window !== 'undefined') {
      this._client = new AxiosAPIClient(_baseUrl, apiKeyName, apiKeyValue);
    } else {
      this._client = new FetchAPIClient(_baseUrl, apiKeyName, apiKeyValue);
    }
  }

  _data_set = (key: string, val: string) => {
    this._cache[key] = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, val);
    }
  };

  _data_get = (key: string) => {
    if (this._cache[key]) return this._cache[key];
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem(key);
      if (val) {
        this._data_set(key, val);
      }
      return val;
    }
    return null;
  };

  _data_del = (key: string) => {
    delete this._cache[key];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  };

  _get = async (path: string, params: Record<string, any>, options: Record<string, any> = {}) => {
    console.debug('get:', path, params, options);
    return this._client._get(path, params, options);
  };

  _post = async <T>(path: string, payload: T, options: Record<string, any> = {}) => {
    console.debug('post:', path, payload, options);
    return this._client._post(path, payload, options);
  };

  getTokenOptions = (token: string, prefix = 'Bearer ') => {
    return { headers: { [this.apiKeyName]: prefix + token } };
  };
}
