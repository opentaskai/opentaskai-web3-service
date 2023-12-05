import { Axios } from 'axios';

export class AxiosAPIClient {
    apiKey?: string;
    apiBaseURL: string;
    httpClient: Axios;
    headers: any = {
        'Content-Type': 'application/json; charset=utf-8'
    };

    constructor(apiBaseURL: string, apiKeyName?: string, apiKeyValue?: string) {
        this.apiBaseURL = apiBaseURL;
        // console.debug('AxiosAPIClient.apiBaseURL', this.apiBaseURL);
        this.apiKey = apiKeyValue ?? '';
        if (apiKeyValue && apiKeyName) {
            this.headers[apiKeyName] = apiKeyValue;
        } else if (apiKeyValue) {
            this.headers['Authorization'] = apiKeyValue;
        }

        // if (typeof process !== 'undefined') {
        //   axios.defaults.adapter = require('axios/lib/adapters/http');
        // }
        this.httpClient = new Axios({
            withCredentials: true,
            baseURL: this.apiBaseURL,
            timeout: 60_000
        });
    }

    _get = async (path: string, params: Record<string, string>, _options: Record<string, any> = {}) => {
        console.debug('_get...', this.apiBaseURL + path, params, this.headers);
        const options: any = {
            params,
            headers: this.headers
        };
        Object.assign(options, _options);
        const resp = await this.httpClient.get(path, options);

        return await this._handleResponse(resp);
    };

    _post = async <T>(path: string, params: T, _options: Record<string, any> = {}) => {
        // console.debug('_post...', this.apiBaseURL + path, params, this.headers);
        const options: any = {
            headers: this.headers
        };
        Object.assign(options, _options);
        const resp = await this.httpClient.post(path, JSON.stringify(params), {
            headers: this.headers
        });
        return await this._handleResponse(resp);
    };

    _handleResponse = async (resp: any) => {
        const path = resp?.config?.baseURL + resp?.config?.url;
        let result: any = {
            code: resp?.status,
            msg: resp?.statusText,
            data: path
        };

        try {
            const data = JSON.parse(resp.data);
            if (resp.status >= 300 || resp.status < 200) {
                // console.debug('req config:', resp?.config);
                // console.debug('req data:', resp?.config?.data);
                // console.debug('resp data:', resp?.data);
                data.code = resp.status;
            }
            result = data;
        } catch (e) {
            console.error('response, fail parse json:', path);
            return resp.data;
        }

        if (result?.code !== undefined && result?.code !== 0) {
            console.error('fail to:', path, result);
        }
        if (result && result?.msg) {
            if (result.msg.indexOf('__AI_MSG__') === 0) {
                result.msg = result.msg.substring(10);
            }
        }
        return result;
    };
}
