# UniCloudOps JavaScript SDK

An ES6 client library to query UniCloudOps platform data from other Node.js or browser portals.

## Installation

No external packages needed (uses standard `fetch` API under Node.js v18+ or any modern browser).

## Quick Start

### Node.js

```javascript
const { UniCloudOpsClient } = require("./unicloudops-sdk");

const client = new UniCloudOpsClient("http://localhost:8085/api/v1");

async function run() {
    if (await client.authenticate("admin@unicloudops.com", "change-me")) {
        const resources = await client.getResources();
        console.log(resources);
    }
}
run();
```
