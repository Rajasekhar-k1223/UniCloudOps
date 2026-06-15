FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl gnupg unzip jq ca-certificates && \
    apt-get clean

# Install AWS CLI (Added -k/-L and combined steps for resilience)
RUN curl -k -L --retry 10 --retry-delay 5 "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && ./aws/install && rm -rf awscliv2.zip aws

# Install Kubectl
RUN curl -k -L --retry 10 --retry-delay 5 "https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl" -o "/usr/local/bin/kubectl" && \
    chmod +x /usr/local/bin/kubectl

# Install Azure CLI (Using a more direct method that often bypasses some TLS issues)
RUN curl -k -sL https://aka.ms/InstallAzureCLIDeb | bash || \
    (apt-get update && apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg && \
     mkdir -p /etc/apt/keyrings && \
     curl -k -sLS https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | tee /etc/apt/keyrings/microsoft.gpg > /dev/null && \
     chmod go+r /etc/apt/keyrings/microsoft.gpg && \
     AZ_REPO=$(lsb_release -cs) && \
     echo "deb [arch=`dpkg --print-architecture` signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | tee /etc/apt/sources.list.d/azure-cli.list && \
     apt-get update && apt-get install -y azure-cli)

# Install AWS Session Manager Plugin
RUN curl -k -L --retry 10 --retry-delay 5 "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb" && \
    dpkg -i session-manager-plugin.deb && rm session-manager-plugin.deb && \
    apt-get clean

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --no-build-isolation -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8085", "--reload"]

