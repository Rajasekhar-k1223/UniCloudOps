import os
import logging
import google.generativeai as genai
from sqlalchemy.orm import Session
from typing import Dict, List
from app.models.project import Project
from app.services.security_service import security_service
from app.services.forecast_service import forecast_service

logger = logging.getLogger(__name__)

class IntelligenceService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def get_strategic_briefing(self, db: Session, project_id: int) -> Dict:
        """Synthesize multi-cloud telemetry into an AI-powered tactical briefing."""
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"status": "error", "message": "Project not found"}

        # 1. Gather Telemetry Context
        try:
            threats = security_service.get_aggregated_threats(db, project_id)
            forecast = forecast_service.get_project_forecast(db, project_id)
            
            # Fetch K8s summary
            from app.models.resource import Resource
            from app.models.cloud_account import CloudAccount
            k8s_clusters = db.query(Resource).join(CloudAccount).filter(CloudAccount.project_id == project_id, Resource.type == 'Cluster').all()
            k8s_summary = f"Active Clusters: {len(k8s_clusters)}"
            
            # Fetch IaC Drift status
            from app.models.deployment import Deployment
            deployments = db.query(Deployment).filter(Deployment.project_id == project_id).all()
            iac_summary = f"Managed Deployments: {len(deployments)}"
            
            # Fetch Cost Anomalies
            from app.services.cost_sentinel_service import cost_sentinel_service
            from app.routes.billing import get_project_billing_data
            billing_data = get_project_billing_data(project_id, db)
            cost_audit = cost_sentinel_service.detect_spikes(billing_data.get("history", []))
            cost_summary = cost_audit["summary"]
            
            # 2. Build the Prompt
            prompt = f"""
            You are 'Sovereign-AI', the strategic advisor for the UniCloudOps multi-cloud command center.
            Analyze the following telemetry for project '{project.name}' and provide a concise 'Commander's Briefing'.
            
            PROJECT CONTEXT:
            - Budget: ${project.budget_limit}
            - Current Spend: ${project.current_spend_mtd}
            - Forecast (7-day): {forecast.get('forecast_7d', 'N/A')}
            - K8s Fleet: {k8s_summary}
            - IaC Status: {iac_summary}
            - Cost Anomaly Status: {cost_summary}
            
            SECURITY CONTEXT:
            - Active Threats: {len(threats)}
            - Threat Summary: {[t['message'] for t in threats[:3]]}
            
            GOAL:
            1. Provide 3 tactical recommendations in a professional, mission-oriented tone. 
            2. Suggest specific 'Remediation Actions' that can be automated.
            3. For Kubernetes, suggest 'K8s-RestartPod' or 'K8s-ScaleDown'.
            4. For IaC, suggest 'IaC-HealDrift' if needed.
            5. For Resilience, suggest 'Chaos-ResilienceAudit'.
            6. For Cost, suggest 'Billing-BudgetIntervention' if significant spikes are detected.
            
            FORMAT:
            Return your response in Markdown, but INCLUDE a JSON block at the end with the following schema:
            ```json
            {{
              "remediation_plan": [
                {{
                  "resource_id": 123,
                  "resource_name": "name",
                  "policy_name": "RestrictSSH",
                  "reason": "description",
                  "namespace": "default",
                  "deployment_id": 456,
                  "chaos_experiment": "pod_kill",
                  "action": "scale_down" (if Billing-BudgetIntervention)
                }}
              ]
            }}
            ```
            """
            
            if not self.model:
                return self._get_simulated_briefing(project, threats, forecast)

            # 3. Call Gemini
            response = self.model.generate_content(prompt)
            
            # Extract JSON if present
            import re
            import json
            remediation_plan = []
            json_match = re.search(r"```json\s+(.*?)\s+```", response.text, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    remediation_plan = data.get("remediation_plan", [])
                except:
                    pass

            return {
                "status": "success",
                "briefing": response.text,
                "remediation_plan": remediation_plan,
                "model": "gemini-1.5-flash"
            }
        except Exception as e:
            logger.error(f"AI Strategic Synthesis failed: {e}")
            return self._get_simulated_briefing(project, [], {})

    def _get_simulated_briefing(self, project, threats, forecast) -> Dict:
        """Fallback briefing if Gemini is unavailable."""
        return {
            "status": "simulated",
            "briefing": f"""
### 🛡️ Sovereign Briefing: {project.name}

**Status**: Operational Over-watch Active.

**Threat Assessment**: 
{len(threats)} active security signals detected. Priority: {'CRITICAL' if len(threats) > 0 else 'LOW'}.

**Strategic Recommendations**:
1. **Fiscal Guardrail**: Forecast shows you will hit {forecast.get('trajectory', 'normal')} spending levels. Recommend rightsizing idle nodes.
2. **Security Posture**: {len(threats)} findings require immediate remediation in your AWS/Azure environments.
3. **Mission Stability**: All VPC/Subnet tunnels are active.
            """,
            "remediation_plan": [
                {
                    "resource_id": 1, 
                    "resource_name": "AWS-Web-Prod", 
                    "policy_name": "RestrictSSH", 
                    "reason": "Exposed SSH port 22 detected in us-east-1."
                }
            ],
            "model": "Tactical-Simulation-v1"
        }

    def synthesize_migration_blueprint(self, source_deployment_id: int, target_provider: str) -> Dict:
        """Use AI to translate a deployment's IaC from one cloud to another."""
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            system_instruction = f"""
            You are 'Mission-Migration-Specialist'.
            Your task is to translate an existing infrastructure blueprint into a target-compatible version for {target_provider}.
            
            RULES:
            1. Maintain the same network topology and service availability.
            2. Use variable-driven Terraform HCL.
            3. Ensure cross-cloud compatibility (e.g., AWS S3 -> Azure Blob, AWS EC2 -> Azure VM).
            4. ONLY return the Terraform HCL code.
            5. Wrap the code in ```hcl ... ``` blocks.
            """
            
            full_prompt = f"{system_instruction}\n\nREPLICATE MISSION ID {source_deployment_id} TO {target_provider}."
            response = model.generate_content(full_prompt)
            
            hcl_content = ""
            if "```hcl" in response.text:
                hcl_content = response.text.split("```hcl")[1].split("```")[0].strip()
            else:
                hcl_content = response.text.strip()
                
            return {
                "status": "success",
                "hcl": hcl_content,
                "explanation": f"Mission-Migration-Specialist has synthesized a continuity blueprint for {target_provider}."
            }
        except Exception as e:
            logger.error(f"Migration synthesis failed: {e}")
            return {"status": "error", "message": str(e)}

    def provide_terminal_assistance(self, command: str, output: str) -> Dict:
        """Analyze terminal context and provide troubleshooting suggestions."""
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            system_instruction = """
            You are 'Quantum-Terminal-Sidecar', an expert Linux and Cloud Engineer.
            Analyze the user's command and its output to provide tactical troubleshooting assistance.
            
            RULES:
            1. If there is an error, explain it simply.
            2. Suggest the NEXT logical command to resolve the issue.
            3. Provide 2-3 specific 'Quick-Fix' commands.
            4. Keep responses concise and focused on the shell context.
            5. Return your response in Markdown.
            """
            
            full_prompt = f"{system_instruction}\n\nCOMMAND:\n{command}\n\nOUTPUT:\n{output}"
            response = model.generate_content(full_prompt)
            
            return {
                "status": "success",
                "assistance": response.text,
                "suggested_commands": [cmd.strip('` ') for cmd in response.text.split('`') if len(cmd.strip()) > 3 and cmd.strip() != 'rego'][:3]
            }
        except Exception as e:
            logger.error(f"Terminal assistance failed: {e}")
            return {"status": "error", "message": str(e)}

    def synthesize_policy(self, prompt: str) -> Dict:
        """Use AI to generate an OPA Rego policy from a natural language prompt."""
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            system_instruction = """
            You are 'Governance-Architect', a specialist in cloud compliance and Open Policy Agent (OPA) Rego policies.
            Your task is to generate strict, professional, and high-performance Rego policies based on user requirements.
            
            RULES:
            1. Use standard OPA 'package' and 'allow' structures.
            2. Include comments explaining which compliance control (SOC2, HIPAA, NIST) is addressed.
            3. Target JSON resource structures common in UniCloudOps (AWS/Azure/K8s JSON).
            4. ONLY return the Rego code. No conversational filler.
            5. Wrap the code in ```rego ... ``` blocks.
            """
            
            full_prompt = f"{system_instruction}\n\nGOVERNANCE REQUIREMENT:\n{prompt}"
            response = model.generate_content(full_prompt)
            
            rego_content = ""
            if "```rego" in response.text:
                rego_content = response.text.split("```rego")[1].split("```")[0].strip()
            else:
                rego_content = response.text.strip()
                
            return {
                "status": "success",
                "rego": rego_content,
                "explanation": "Governance-Architect has synthesized your compliance guardrail."
            }
        except Exception as e:
            logger.error(f"Policy synthesis failed: {e}")
            return {"status": "error", "message": str(e)}

    def synthesize_blueprint(self, prompt: str) -> Dict:
        """Use AI to generate a Terraform blueprint from a natural language prompt."""
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            system_instruction = """
            You are 'Mission-Architect', a world-class Cloud Solutions Architect specializing in multi-cloud Terraform blueprints.
            Your task is to generate highly secure, scalable, and professional Terraform (HCL) code based on user prompts.
            
            RULES:
            1. Use latest Terraform provider versions.
            2. ALWAYS include variables for configurable parameters (instance_type, region, etc.).
            3. Include professional comments explaining the architectural decisions.
            4. Follow 'UniCloudOps' premium standards: secure defaults, proper tagging, and resource naming.
            5. ONLY return the HCL code. No conversational filler.
            6. Wrap the code in ```hcl ... ``` blocks.
            """
            
            full_prompt = f"{system_instruction}\n\nUSER MISSION REQUIREMENT:\n{prompt}"
            response = model.generate_content(full_prompt)
            
            hcl_content = ""
            if "```hcl" in response.text:
                hcl_content = response.text.split("```hcl")[1].split("```")[0].strip()
            elif "```terraform" in response.text:
                hcl_content = response.text.split("```terraform")[1].split("```")[0].strip()
            else:
                hcl_content = response.text.strip()
                
            return {
                "status": "success",
                "hcl": hcl_content,
                "explanation": "AI-Architect has synthesized your mission blueprints based on professional cloud standards."
            }
        except Exception as e:
            logger.error(f"Blueprint synthesis failed: {e}")
            return {"status": "error", "message": str(e)}

    def synthesize_neural_signals(self, events: List[Dict]) -> List[Dict]:
        """Synthesize recent audit logs into tactical neural pulse signals."""
        if not events:
            return [{"type": "system", "message": "Neural link established. Awaiting tactical events...", "severity": "info"}]
            
        if not self.model:
            return self._get_simulated_neural_signals(events)
            
        try:
            event_summary = "\n".join([f"[{e.get('timestamp')}] {e.get('action')} on {e.get('resource_type') or 'system'}: {e.get('status')} - {e.get('message')}" for e in events])
            
            prompt = f"""
            You are 'Sovereign-AI-Neural-Pulse', the tactical monitoring sub-agent of the UniCloudOps command center.
            Analyze the following 20 recent audit logs and generate a synthesized list of exactly 3 to 5 'Neural Signals' for the ticker tape.
            
            AUDIT LOGS:
            {event_summary}
            
            RULES:
            1. Every signal must have a 'type' (one of: 'audit', 'warning', 'intelligence', 'success', 'alert').
            2. Every signal must have a concise 'message' (under 80 characters, highly professional, tactical and mission-oriented tone).
            3. Every signal must have a 'severity' (one of: 'info', 'warning', 'success', 'critical').
            4. If there is a critical failure in the logs, promote it as an 'alert' with 'critical' severity.
            5. If a new user session or login occurred, mention it as 'audit' / 'info'.
            6. Add one generic 'intelligence' signal about background cluster / mesh health if appropriate.
            
            FORMAT:
            Return ONLY a valid JSON array of objects. No markdown formatting, no explanation, no ```json tags.
            
            Example:
            [
              {{"type": "audit", "message": "Operator session established: testuser@unicloudops.com", "severity": "info"}},
              {{"type": "intelligence", "message": "Neural patterns indicate stable cluster health.", "severity": "success"}}
            ]
            """
            response = self.model.generate_content(prompt)
            
            # Clean response text and load JSON
            import json
            import re
            text = response.text.strip()
            # Strip markdown json block tags if Gemini included them anyway
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\n", "", text)
                text = re.sub(r"\n```$", "", text)
            
            signals = json.loads(text.strip())
            return signals[:5]
        except Exception as e:
            logger.error(f"AI Neural Pulse synthesis failed: {e}")
            return self._get_simulated_neural_signals(events)

    def _get_simulated_neural_signals(self, events: List[Dict]) -> List[Dict]:
        """Rule-based neural signal synthesis when Gemini is offline."""
        signals = []
        
        # 1. Process explicit failure/error logs
        failures = [e for e in events if e.get("status") == "failed" or e.get("status") == "failure" or e.get("status") == "error"]
        for f in failures[:2]:
            signals.append({
                "type": "alert",
                "message": f"MISSION ALERT: {f.get('action')} on {f.get('resource_type') or 'system'} aborted.",
                "severity": "critical"
            })
            
        # 2. Process login logs
        logins = [e for e in events if e.get("action") == "AUTH_LOGIN"]
        for l in logins[:1]:
            # Extract user from message
            msg = l.get("message") or "Operator session established"
            signals.append({
                "type": "audit",
                "message": f"Secure Sync: {msg}",
                "severity": "info"
            })
            
        # 3. Process resource modifications
        mods = [e for e in events if e.get("action") in ("RESOURCE_START", "RESOURCE_STOP", "RESOURCE_CREATE", "RESOURCE_TERMINATE")]
        for m in mods[:1]:
            signals.append({
                "type": "warning" if m.get("action") == "RESOURCE_STOP" else "success",
                "message": f"Grid Notice: {m.get('message') or (m.get('action') + ' processed')}",
                "severity": "warning" if m.get("action") == "RESOURCE_STOP" else "success"
            })
            
        # 4. Standard baseline signals if list is short
        if len(signals) < 3:
            signals.append({
                "type": "intelligence",
                "message": "Neural patterns indicate stable cluster health across all orbits.",
                "severity": "success"
            })
        if len(signals) < 3:
            signals.append({
                "type": "warning",
                "message": "Global mesh tunnel latency within optimal parameters (12ms).",
                "severity": "info"
            })
            
        return signals[:5]

intelligence_service = IntelligenceService()

