import { UnicloudHTTPClient } from './core/client';
import { FinOpsService } from './services/finops';
import { IAMService } from './services/iam';
import { EventsService } from './services/events';

export interface UnicloudClientOptions {
    baseURL?: string;
    apiKey?: string;
    token?: string;
}

export class UnicloudClient {
    private httpClient: UnicloudHTTPClient;
    public finops: FinOpsService;
    public iam: IAMService;
    public events: EventsService;

    constructor(options: UnicloudClientOptions = {}) {
        const baseURL = options.baseURL || process.env.UNICLOUD_BASE_URL || 'http://localhost:8085';
        const apiKey = options.apiKey || process.env.UNICLOUD_API_KEY;
        const token = options.token || process.env.UNICLOUD_TOKEN;

        if (!apiKey && !token) {
            throw new Error('Authentication requires either an apiKey or a token.');
        }

        this.httpClient = new UnicloudHTTPClient(baseURL, apiKey, token);
        
        // Initialize services
        this.finops = new FinOpsService(this.httpClient);
        this.iam = new IAMService(this.httpClient);
        this.events = new EventsService(this.httpClient);
    }
}

// Export specific classes and types
export { UnicloudHTTPClient } from './core/client';
export { FinOpsService } from './services/finops';
export { IAMService } from './services/iam';
export { EventsService } from './services/events';
