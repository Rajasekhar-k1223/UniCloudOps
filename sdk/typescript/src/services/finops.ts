import { UnicloudHTTPClient } from '../core/client';

export class FinOpsService {
    private client: UnicloudHTTPClient;

    constructor(client: UnicloudHTTPClient) {
        this.client = client;
    }

    async getCosts(timeRange: string = "7d"): Promise<any> {
        return this.client.get(`/api/v1/finops/analytics/costs`, { time_range: timeRange });
    }

    async getBudgets(): Promise<any[]> {
        return this.client.get(`/api/v1/finops/analytics/budgets`);
    }

    async getRecommendations(): Promise<any[]> {
        return this.client.get(`/api/v1/finops/analytics/recommendations`);
    }
}
