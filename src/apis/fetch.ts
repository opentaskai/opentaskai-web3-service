export class FetchAPIClient {
    apiKey?: string;
    apiBaseURL: string;
    headers: any = {
        'Content-Type': 'application/json; charset=utf-8'
    };

    constructor(apiBaseURL: string, apiKeyName?: string, apiKeyValue?: string) {
        this.apiBaseURL = apiBaseURL;
        console.debug('FetchAPIClient.apiBaseURL', this.apiBaseURL);
        this.apiKey = apiKeyValue ?? '';
        if (apiKeyValue && apiKeyName) {
            this.headers[apiKeyName] = apiKeyValue;
        } else if (apiKeyValue) {
            this.headers['Authorization'] = apiKeyValue;
        }
    }

    _get = async (path: string, params: Record<string, any> = {}, _options: Record<string, any> = {}) => {
        let url = this.apiBaseURL + path + '?_rnd=' + Date.now();
        const query = new URLSearchParams();
        for (let k in params) {
            query.append(k, params[k]);
        }

        if (Object.keys(params).length) {
            url += '&' + query.toString();
        }

        const options: any = {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            cache: 'default',
            redirect: 'follow',
            keepalive: false,
            headers: new Headers(this.headers)
        };

        console.debug('fetch _options:', _options);
        if (_options && _options?.headers) {
            _options.headers = new Headers(_options.headers);
        }
        Object.assign(options, _options);
        console.debug('fetch get:', url, options);
        const res: any = await fetch(url, options);
        return await this._handleResponse(res);
    };

    _post = async (path: string, params: any, _options: Record<string, any> = {}) => {
        const url = this.apiBaseURL + path;

        const options: any = {
            method: 'POST',
            body: JSON.stringify(params),
            mode: 'cors',
            credentials: 'include',
            cache: 'default',
            redirect: 'follow',
            keepalive: false,
            headers: new Headers(this.headers)
        };

        if (_options && _options?.headers) {
            _options.headers = new Headers(_options.headers);
        }
        Object.assign(options, _options);

        const res: any = await fetch(url, options);
        return await this._handleResponse(res);
    };

    _handleResponse = async (res: any) => {
        let result: any = {
            code: res?.status,
            msg: res?.statusText,
            data: res.url
        };

        try {
            const data = await res.json();
            if (res?.status < 200 || res?.status >= 300) {
                // This will activate the closest `error.js` Error Boundary
                // console.error('Failed to fetch result: ', data);
                data.code = res.status;
            }
            result = data;
        } catch (e) {
            console.error('response, fail parse json:', res.url);
            return await res.text();
        }

        if (result?.code !== undefined && result?.code !== 0) {
            console.error('fail to:', res?.url, result);
        }
        if (result?.msg && result.msg.indexOf('__AI_MSG__') === 0) {
            result.msg = result.msg.substring(10);
        }
        return result;
    };
}
