from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
import datetime

# ==============================================================================
# MODULE 1: ENTERPRISE IDENTITY & ACCESS MANAGEMENT (IAM)
# ==============================================================================

class KeycloakMapping(Base):
    __tablename__ = "keycloak_mappings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    keycloak_sub = Column(String(255), unique=True, nullable=False)
    idp_provider = Column(String(100), default="keycloak")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    prefix = Column(String(16), unique=True, nullable=False)
    hashed_key = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    is_active = Column(Boolean, default=True)
    scopes = Column(JSON, nullable=True) # e.g. ["resources:read", "deployments:write"]
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class JITAccessRequest(Base):
    __tablename__ = "jit_access_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    target_project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    requested_role = Column(String(50), nullable=False)
    duration_hours = Column(Integer, default=2)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, EXPIRED, DENIED
    approved_by = Column(Integer, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 2: MULTI-TENANT MSP MODE
# ==============================================================================

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    domain = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 3: FINOPS CENTER
# ==============================================================================

class DailySpend(Base):
    __tablename__ = "daily_spends"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=True, index=True)
    project_id = Column(Integer, nullable=True, index=True)
    provider = Column(String(50), nullable=False)
    service_name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FinOpsBudget(Base):
    __tablename__ = "finops_budgets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    amount_limit = Column(Float, nullable=False)
    project_id = Column(Integer, nullable=True)
    alert_threshold_percentage = Column(Float, default=80.0)
    current_spend = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 4: KUBERNETES CONTROL CENTER
# ==============================================================================

class K8sCluster(Base):
    __tablename__ = "k8s_clusters"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False) # eks, aks, gke, generic
    region = Column(String(50), nullable=True)
    endpoint = Column(String(255), nullable=False)
    kubeconfig_secret_id = Column(String(255), nullable=True)
    status = Column(String(50), default="unknown")
    node_count = Column(Integer, default=0)
    project_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 5: CLOUD GOVERNANCE ENGINE
# ==============================================================================

class GovernancePolicy(Base):
    __tablename__ = "governance_policies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rego_code = Column(Text, nullable=False)
    severity = Column(String(20), default="medium")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PolicyViolation(Base):
    __tablename__ = "policy_violations"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("governance_policies.id", ondelete="CASCADE"))
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(255), nullable=False)
    violating_attributes = Column(Text, nullable=True)
    status = Column(String(50), default="open") # open, excused, remediated
    remediated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 6: TERRAFORM ENTERPRISE MODULE
# ==============================================================================

class TerraformRun(Base):
    __tablename__ = "terraform_runs"
    id = Column(Integer, primary_key=True, index=True)
    deployment_id = Column(Integer, ForeignKey("deployments.id", ondelete="CASCADE"))
    status = Column(String(50), default="planning")
    plan_output = Column(Text, nullable=True)
    apply_output = Column(Text, nullable=True)
    run_type = Column(String(50), default="apply")
    triggered_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InfrastructureDrift(Base):
    __tablename__ = "infrastructure_drifts"
    id = Column(Integer, primary_key=True, index=True)
    deployment_id = Column(Integer, ForeignKey("deployments.id", ondelete="CASCADE"))
    drifted_attributes = Column(JSON, nullable=False)
    is_remediated = Column(Boolean, default=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 7: SECRETS & CREDENTIAL VAULT
# ==============================================================================

class SecureSecret(Base):
    __tablename__ = "secure_secrets"
    id = Column(Integer, primary_key=True, index=True)
    secret_path = Column(String(255), unique=True, index=True, nullable=False)
    encrypted_payload = Column(Text, nullable=False)
    kms_key_arn = Column(String(255), nullable=True)
    project_id = Column(Integer, nullable=True)
    rotation_interval_days = Column(Integer, default=90)
    last_rotated_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 8: OBSERVABILITY CENTER
# ==============================================================================

class MetricThresholdAlert(Base):
    __tablename__ = "metric_threshold_alerts"
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String(100), index=True, nullable=False)
    metric_name = Column(String(50), nullable=False)
    threshold_value = Column(Float, nullable=False)
    comparison_operator = Column(String(5), default=">")
    is_triggered = Column(Integer, default=0)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 9: SECURITY & COMPLIANCE CENTER
# ==============================================================================

class ComplianceAssessment(Base):
    __tablename__ = "compliance_assessments"
    id = Column(Integer, primary_key=True, index=True)
    framework = Column(String(50), nullable=False) # SOC2, ISO27001, CIS, NIST
    compliance_score = Column(Float, default=100.0)
    failed_controls_count = Column(Integer, default=0)
    assessment_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# MODULE 10: AI OPERATIONS CENTER
# ==============================================================================

class AIOpsIncidentAnalysis(Base):
    __tablename__ = "aiops_incident_analyses"
    id = Column(Integer, primary_key=True, index=True)
    incident_source = Column(String(100), nullable=False)
    error_snippet = Column(Text, nullable=False)
    root_cause_summary = Column(Text, nullable=True)
    remediation_suggestion = Column(Text, nullable=True)
    suggested_terraform_code = Column(Text, nullable=True)
    feedback_rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
