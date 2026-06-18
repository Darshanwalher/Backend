# EKS Deployment Guide for Windows (PowerShell)
Domain: `code-spaces.online` | Region: `ap-south-1` (Mumbai) | AWS Account: `571600833132`

This guide outlines the step-by-step commands to deploy the CodeSpaces microservices backend and frontend to AWS. All commands are formatted specifically for **Windows PowerShell**.

---

## Step 1 — ECR Repository Setup

Create the ECR repositories for all 8 microservices.

```powershell
$svcNames = @("ai-orchestration", "auth", "notification", "agent", "sync-agent", "router", "sandbox", "template")
foreach ($svc in $svcNames) {
    Write-Host "Creating repository: $svc"
    aws ecr create-repository --repository-name $svc --region ap-south-1
}
```

---

## Step 2 — Authenticate Docker to Amazon ECR

Log in your local Docker client to the ECR registry. Token expires after 12 hours.

```powershell
(aws ecr get-login-password --region ap-south-1) | docker login --username AWS --password-stdin 571600833132.dkr.ecr.ap-south-1.amazonaws.com
```

---

## Step 3 — Deploy Backend Services via Skaffold

Run Skaffold to build your optimized container images, tag them, push them to ECR, and apply the Kubernetes manifests to your cluster.

```powershell
skaffold run -f skaffold-eks.yml
```

### Verify running resources:
```powershell
# Watch pod status (press Ctrl+C to exit)
kubectl get pods -w

# Check all deployed services
kubectl get svc
```

---

## Step 4 — Install Nginx Ingress Controller

Deploy the Ingress Controller to route traffic according to `K8s/ingress.yml` configurations:

```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml
```

Wait 1–2 minutes, then retrieve the public load balancer address:
```powershell
kubectl get service -n ingress-nginx
# Look for the EXTERNAL-IP (e.g. k8s-xxx.elb.ap-south-1.amazonaws.com)
```

Test that the load balancer correctly routes backend API requests:
```powershell
# Replace <EXTERNAL-IP> with your load balancer hostname
curl -I http://<EXTERNAL-IP>/api/auth
```

### Configure SSL Termination on the EKS Load Balancer (for Wildcard Sandboxes)
To support secure HTTPS connection for sandbox agents (`*.agent.code-spaces.online` and `*.preview.code-spaces.online`), the EKS Classic Load Balancer must be patched to terminate SSL using the local ACM certificate (created in `ap-south-1` covering `*.agent.code-spaces.online`):

```powershell
# Patch the Service to attach the ACM cert and route decrypted HTTP traffic internally
kubectl patch service ingress-nginx-controller -n ingress-nginx -p '{\"metadata\":{\"annotations\":{\"service.beta.kubernetes.io/aws-load-balancer-ssl-cert\":\"arn:aws:acm:ap-south-1:571600833132:certificate/98403ef7-1ef2-48e6-9f39-f646d5fbee8c\",\"service.beta.kubernetes.io/aws-load-balancer-ssl-ports\":\"443\",\"service.beta.kubernetes.io/aws-load-balancer-backend-protocol\":\"tcp\"}},\"spec\":{\"ports\":[{\"name\":\"http\",\"port\":80,\"targetPort\":\"http\"},{\"name\":\"https\",\"port\":443,\"targetPort\":\"http\"}]}}'
```

---

## Step 5 — SSL Certificate Setup (AWS ACM)

CloudFront requires ACM certificates to be requested and verified in **`us-east-1` (N. Virginia)**.

### 1. Request Certificate
```powershell
aws acm request-certificate --domain-name code-spaces.online --subject-alternative-names "*.code-spaces.online" --validation-method DNS --region us-east-1
```
*Save the `CertificateArn` returned in the response.*

### 2. Get DNS CNAME Validation details
```powershell
# Replace <YOUR_CERT_ARN> with the Arn from the step above
aws acm describe-certificate --certificate-arn <YOUR_CERT_ARN> --region us-east-1 --query "Certificate.DomainValidationOptions"
```

### 3. Add CNAME in your DNS provider
Go to your domain provider (e.g., GoDaddy, Namecheap, Route 53) and add the CNAME record returned above:
- **Type**: `CNAME`
- **Name**: Use the subdomain prefix of the record `Name` (e.g., for `_xxx.code-spaces.online.`, use `_xxx` without the domain suffix).
- **Value**: The full string in `Value` (e.g., `_yyy.acm-validations.aws.`).

### 4. Wait for Issuance
```powershell
aws acm describe-certificate --certificate-arn <YOUR_CERT_ARN> --region us-east-1 --query "Certificate.Status"
# Wait until this returns "ISSUED" (takes ~5-15 mins)
```

---

## Step 6 — S3 Bucket Setup for React Frontend

### 1. Build the React application
```powershell
cd frontend
npm run build
cd ..
```

### 2. Create the S3 Bucket in Mumbai
```powershell
aws s3 mb s3://code-spaces-frontend-571600833132 --region ap-south-1
```

### 3. Configure Bucket to Allow Public Access
```powershell
aws s3api put-public-access-block --bucket code-spaces-frontend-571600833132 --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### 4. Enable Static Website Hosting
```powershell
aws s3 website s3://code-spaces-frontend-571600833132 --index-document index.html --error-document index.html
```

### 5. Attach Public Read Bucket Policy
```powershell
aws s3api put-bucket-policy --bucket code-spaces-frontend-571600833132 --policy '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"PublicReadGetObject\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::code-spaces-frontend-571600833132/*\"}]}'
```

### 6. Upload static assets to S3
```powershell
aws s3 sync frontend/dist/ s3://code-spaces-frontend-571600833132 --delete
```

---

## Step 7 — CloudFront CDN Setup (Single Domain Routing)

It is recommended to set up CloudFront via the **AWS Console** for ease of use.

### 1. Create Distribution
- **Origin Domain**: Select your S3 website endpoint (e.g., `code-spaces-frontend-571600833132.s3-website-ap-south-1.amazonaws.com`). *Do NOT select the default S3 bucket REST endpoint.*
- **Protocol**: HTTP only (S3 static hosting doesn't support direct HTTPS).
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS.
- **Alternate Domain Names (CNAMEs)**: `www.code-spaces.online`
- **Custom SSL Certificate**: Select your ACM certificate from the dropdown list.
- **Default Root Object**: `index.html`

### 2. Configure React Router Fallbacks
- Go to the **Error Pages** tab in your distribution dashboard.
- Create custom error responses:
  - **403 Forbidden**: Customize error response → Set path to `/index.html` and response status code to `200`.
  - **404 Not Found**: Customize error response → Set path to `/index.html` and response status code to `200`.

### 3. Add Ingress Load Balancer Origin
- Go to the **Origins** tab and click **Create origin**.
- **Origin Domain**: Paste your Ingress Load Balancer external IP address (e.g. `k8s-xxx.elb.ap-south-1.amazonaws.com`).
- **Protocol**: HTTP only (nginx-ingress receives on port 80).
- **Name**: `EKS-backend`

### 4. Create Behavior Rule for `/api/*`
- Go to the **Behaviors** tab and click **Create behavior**.
- **Path Pattern**: `/api/*`
- **Origin**: `EKS-backend`
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
- **Cache Policy**: `CachingDisabled`
- **Origin Request Policy**: `AllViewer` (important: forwards auth headers/cookies)

---

## Step 8 — DNS Routing setup (CNAMEs)

Add the following DNS records under your domain registrar panel:

| Type | Name / Host | Value | Purpose |
| :--- | :--- | :--- | :--- |
| `CNAME` | `www` | `<your-distribution-id>.cloudfront.net` | Routes traffic to CloudFront (Frontend + API routing) |
| `CNAME` | `*.agent` | `<your-ingress-load-balancer-hostname>` | Wildcard routing for agent sandboxes directly to EKS |
| `CNAME` | `*.preview` | `<your-ingress-load-balancer-hostname>` | Wildcard routing for sandbox previews directly to EKS |

---

## Step 9 — Autoscaling

### 1. Metrics Server
```powershell
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. Pod Autoscaler (HPA)
```powershell
kubectl autoscale deployment auth-deployment --min=1 --max=5 --cpu-percent=50
```

### 3. Cluster Node Autoscaling
```powershell
# 1. Associate OIDC provider
eksctl utils associate-iam-oidc-provider --cluster codespace-cluster --region ap-south-1 --approve

# 2. IAM Service Account
eksctl create iamserviceaccount --cluster codespace-cluster --namespace kube-system --name cluster-autoscaler --attach-policy-arn arn:aws:iam::aws:policy/AutoScalingFullAccess --approve

# 3. Apply autoscaler components
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# 4. Bind cluster name environment variable
kubectl -n kube-system set env deployment/cluster-autoscaler OIDC_PROVIDER=codespace-cluster
```

---

## Step 10 — Cleanup & Stopping AWS Charges

> [!WARNING]
> **EKS worker nodes cost ~$0.04/hr per node plus ~$0.10/hr for the control plane. CloudFront and S3 are cheap but not free. Always tear down resources when you stop using them.**

### 1. Delete the entire EKS cluster
Deletes the cluster, all EC2 nodes, VPC, subnets, IAM roles — everything `eksctl` created.
```powershell
eksctl delete cluster --name codespace-cluster --region ap-south-1
```

### 2. Delete CloudFront + S3
1. **Disable CloudFront distribution first** (takes ~15 mins):
   Console: CloudFront &rarr; Distributions &rarr; Select distribution &rarr; Click **Disable** &rarr; Wait for Status to become "Deployed" &rarr; Click **Delete**.
2. **Empty and delete the S3 bucket**:
   ```powershell
   aws s3 rm s3://code-spaces-frontend --recursive
   aws s3 rb s3://code-spaces-frontend
   ```

### 3. Delete ECR repositories
Delete the repositories for all 8 microservices:
```powershell
$svcNames = @("ai-orchestration", "auth", "notification", "agent", "sync-agent", "router", "sandbox", "template")
foreach ($svc in $svcNames) {
    aws ecr delete-repository --repository-name $svc --region ap-south-1 --force
}
```

### 4. Remove only the app (keep cluster running)
Removes everything that `skaffold-eks.yml` applied (Deployments, Services, Ingress):
```powershell
skaffold delete -f skaffold-eks.yml
```
