import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

export class UnicloudHTTPClient {
    public client: AxiosInstance;

    constructor(baseURL: string, apiKey?: string, token?: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'unicloudops-sdk-typescript/2.0.0'
            },
            timeout: 30000,
        });

        if (token) {
            this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else if (apiKey) {
            this.client.defaults.headers.common['X-API-Key'] = apiKey;
        }

        // Add exponential backoff retry logic for 429 and 5xx errors
        axiosRetry(this.client, { 
            retries: 3, 
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            }
        });
    }

    async get<T>(url: string, params?: any): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }
}
