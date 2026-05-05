# UniCloudOps

A unified SaaS platform for managing multi-cloud infrastructure, fetching aggregated billing insights, and orchestrating Infrastructure-as-Code (IaC) deployments using Terraform and AWS CDK across AWS, Azure, and Google Cloud.

## Features

- **Centralized Dashboard**: View real-time aggregated metrics across all integrated accounts.
- **Secure Integration**: Connect AWS, Azure, and GCP accounts using securely encrypted credentials.
- **Billing Intelligence**: Monitor 30-day cost trends with interactive, provider-stacked charts.
- **Resource Monitoring**: Track running compute and active storage resources instantly.
- **Infrastructure-as-Code Pipeline**: Deploy predefined Terraform and AWS CDK templates via isolated Docker-in-Docker execution pipelines backed by Celery and MongoDB.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, Celery, Docker SDK.
- **Databases**: PostgreSQL (Relational Data), MongoDB (Pipeline Logs), Redis (Celery Broker).
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons.
- **DevOps**: Docker, Docker Compose.

## Execution Requirements

This project utilizes Docker-in-Docker to securely execute Terraform and CDK commands in isolated containers. 
To run this application locally, ensure you have:
1. Docker Desktop or Docker Engine installed and running.
2. `docker-compose` installed.

## Spin Up the Platform

1. Clone or navigate to the directory.
2. Start the multi-container stack:
   ```bash
   docker-compose up --build -d
   ```
3. The backend will automatically bind to Port `8000` and generate the SQLite/PostgreSQL schemas. It also seeds initial predefined Terraform/CDK templates.
4. The frontend will bind to Port `5173`.
5. Access the SaaS dashboard at: [http://localhost:5173](http://localhost:5173)

## Accessing the API Docs

Navigate to [http://localhost:8000/docs](http://localhost:8000/docs) to view the auto-generated Swagger OpenAPI specification for the UniCloudOps backend.

## Stopping the Application

```bash
docker-compose down
```
