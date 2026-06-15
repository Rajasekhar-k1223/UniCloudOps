import { UnicloudHTTPClient } from '../core/client';

export class IAMService {
    private client: UnicloudHTTPClient;

    constructor(client: UnicloudHTTPClient) {
        this.client = client;
    }

    async generateApiKey(name: string, scopes: string[] = ["read"]): Promise<any> {
        return this.client.post(`/api/v1/iam/keys`, { name, scopes });
    }

    async listRoles(): Promise<any[]> {
        return this.client.get(`/api/v1/iam/roles`);
    }
}
