const { UniCloudOpsClient } = require("./unicloudops-sdk");

async function runDiagnostics() {
    console.log("====================================================");
    console.log("Starting UniCloudOps JavaScript SDK Diagnostics...");
    console.log("====================================================");

    const client = new UniCloudOpsClient("http://localhost:8085/api/v1");

    const email = "admin@unicloudops.com";
    const password = "change-me";

    console.log(`\n1. Authenticating as ${email}...`);
    const success = await client.authenticate(email, password);
    if (!success) {
        console.error("[-] Authentication failed! Ensure the uvicorn backend is running.");
        process.exit(1);
    }
    console.log("[+] Authenticated successfully.");

    try {
        console.log("\n2. Fetching Cloud Resources...");
        const resources = await client.getResources();
        console.log(`[+] Discovered ${resources.length} active resources.`);
        if (resources.length > 0) {
            console.log(` - First Resource: [${resources[0].provider.toUpperCase()}] ${resources[0].name} (${resources[0].status})`);
        }

        console.log("\n3. Fetching Biometric Telemetry...");
        const bio = await client.getOperatorTelemetry();
        console.log(`[+] Operator Stability Index: ${bio.cognitive_stability}% | Lockdown: ${bio.lockdown_status}`);

        console.log("\n4. Consulting Neural Advisor...");
        const advisor = await client.chatWithAdvisor("Optimize global mesh latency");
        console.log(`[+] AI Advisor: "${advisor.response}"`);

        console.log("\n====================================================");
        console.log("JS SDK Diagnostics Completed Successfully!");
        console.log("====================================================");
    } catch (err) {
        console.error("[-] Diagnostic Exception occurred:", err.message);
        process.exit(1);
    }
}

runDiagnostics();
