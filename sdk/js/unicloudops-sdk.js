class UniCloudOpsClient {
    /**
     * UniCloudOps JS Client SDK.
     * Compatible with browser environments and Node.js (v18+).
     * @param {string} baseUrl - Root endpoint of UniCloudOps API
     */
    constructor(baseUrl = "http://localhost:8085/api/v1") {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.token = null;
    }

    /**
     * Authenticate and cache access token.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    async authenticate(email, password) {
        const url = `${this.baseUrl}/auth/login`;
        // OAuth2 Password Grant Form Parameters
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                return true;
            } else {
                const errText = await response.text();
                throw new Error(`Auth failed [${response.status}]: ${errText}`);
            }
        } catch (error) {
            console.error("Auth Exception:", error);
            return false;
        }
    }

    /**
     * Helper to perform authenticated requests.
     */
    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            ...(options.headers || {}),
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Request failed [${response.status}]: ${errorMsg}`);
        }
        return response.json();
    }

    /**
     * Fetch active compute, database, and storage assets.
     */
    async getResources() {
        return this._request("/resources");
    }

    /**
     * Fetch cost trend across cloud providers.
     */
    async getDailyCosts(days = 7) {
        return this._request(`/billing/daily-costs?days=${days}`);
    }

    /**
     * Retrieve active threat scans.
     */
    async getActiveThreats() {
        return this._request("/threats/active");
    }

    /**
     * Trigger autonomous threat scanning simulation.
     */
    async simulateZeroDay() {
        return this._request("/threats/simulate", { method: "POST" });
    }

    /**
     * Fetch cognitive biometric vitals.
     */
    async getOperatorTelemetry() {
        return this._request("/biolink/telemetry");
    }

    /**
     * Trigger Global Security lockdown.
     */
    async triggerLockdown() {
        return this._request("/biolink/lockdown", { method: "POST" });
    }

    /**
     * Consult the Strategic Advisor.
     * @param {string} query
     */
    async chatWithAdvisor(query) {
        return this._request("/advisor/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });
    }
}

// Export for ES modules or Node
if (typeof module !== "undefined" && module.exports) {
    module.exports = { UniCloudOpsClient };
}
