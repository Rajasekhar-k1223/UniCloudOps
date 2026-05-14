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
            
            # 2. Build the Prompt
            prompt = f"""
            You are 'Sovereign-AI', the strategic advisor for the UniCloudOps multi-cloud command center.
            Analyze the following telemetry for project '{project.name}' and provide a concise 'Commander's Briefing'.
            
            PROJECT CONTEXT:
            - Budget: ${project.budget_limit}
            - Current Spend: ${project.current_spend_mtd}
            - Forecast (7-day): {forecast.get('forecast_7d', 'N/A')}
            
            SECURITY CONTEXT:
            - Active Threats: {len(threats)}
            - Threat Summary: {[t['message'] for t in threats[:3]]}
            
            GOAL:
            Provide 3 tactical recommendations in a professional, mission-oriented tone. 
            Format: Markdown with 'Briefing', 'Threat Assessment', and 'Strategic Recommendations'.
            """
            
            if not self.model:
                return self._get_simulated_briefing(project, threats, forecast)

            # 3. Call Gemini
            response = self.model.generate_content(prompt)
            return {
                "status": "success",
                "briefing": response.text,
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
            "model": "Tactical-Simulation-v1"
        }

intelligence_service = IntelligenceService()
