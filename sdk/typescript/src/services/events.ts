import { UnicloudHTTPClient } from '../core/client';

export class EventsService {
    private client: UnicloudHTTPClient;

    constructor(client: UnicloudHTTPClient) {
        this.client = client;
    }

    async getLogs(limit: number = 100): Promise<any[]> {
        return this.client.get(`/api/v1/events/fabric/logs`, { limit });
    }

    async getDlq(): Promise<any[]> {
        return this.client.get(`/api/v1/events/fabric/dlq`);
    }

    async requeueDlq(eventId: number): Promise<any> {
        return this.client.post(`/api/v1/events/fabric/dlq/${eventId}/requeue`);
    }

    async publish(subject: string, source: string, eventType: string, data: any): Promise<any> {
        const payload = {
            subject,
            source,
            event_type: eventType,
            data
        };
        return this.client.post(`/api/v1/events/fabric/publish`, payload);
    }
}
