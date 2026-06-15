import logging
from datetime import datetime, timedelta
from typing import List, Dict

logger = logging.getLogger(__name__)

class ForecastService:
    def calculate_burn_up(self, historical_data: List[Dict]) -> List[Dict]:
        """
        Calculates a burn-up forecast based on historical daily spend.
        historical_data: List of {'date': 'YYYY-MM-DD', 'provider1': cost, 'provider2': cost, ...}
        """
        if not historical_data:
            return []

        # 1. Calculate cumulative sum and avg daily spend
        processed_data = []
        cumulative_sum = 0
        
        # Sort by date just in case
        sorted_history = sorted(historical_data, key=lambda x: x['date'])
        
        for entry in sorted_history:
            daily_total = sum(v for k, v in entry.items() if k != 'date')
            cumulative_sum += daily_total
            
            new_entry = entry.copy()
            new_entry['cumulative'] = round(cumulative_sum, 2)
            processed_data.append(new_entry)

        # 2. Project next 7 days
        if processed_data:
            last_point = processed_data[-1]
            try:
                last_date = datetime.strptime(last_point['date'], '%Y-%m-%d')
            except ValueError:
                # Handle cases where date might be already formatted for UI (e.g. "May 11")
                # This is a fallback
                last_date = datetime.now()

            avg_daily_spend = cumulative_sum / len(processed_data) if processed_data else 0
            
            for i in range(1, 8):
                forecast_date = (last_date + timedelta(days=i)).strftime('%Y-%m-%d')
                processed_data.append({
                    "date": forecast_date,
                    "forecast": round(cumulative_sum + (avg_daily_spend * i), 2),
                    "is_forecast": True
                })
        
        return processed_data

    def get_project_forecast(self, db, project_id: int) -> Dict:
        """
        Calculate cost forecast and trajectory for a project mission.
        """
        from app.routes.billing import get_project_billing_data
        billing_data = get_project_billing_data(project_id, db)
        history = billing_data.get("history", [])
        
        if not history:
            return {"forecast_7d": "N/A", "trajectory": "stable"}
            
        burn_up = self.calculate_burn_up(history)
        
        # Calculate 7-day forecast
        forecast_points = [p for p in burn_up if p.get('is_forecast')]
        if forecast_points:
            forecast_7d = f"${forecast_points[-1]['forecast']:.2f}"
            
            # Trajectory calculation (compare first point in history with last forecast point)
            first_spend = sum(v for k, v in history[0].items() if k != 'date')
            last_forecast = forecast_points[-1]['forecast']
            
            if last_forecast > first_spend * 1.5:
                trajectory = "high growth"
            elif last_forecast > first_spend * 1.1:
                trajectory = "moderate growth"
            elif last_forecast < first_spend * 0.9:
                trajectory = "declining"
            else:
                trajectory = "stable"
        else:
            forecast_7d = "N/A"
            trajectory = "stable"
            
        return {
            "forecast_7d": forecast_7d,
            "trajectory": trajectory
        }

forecast_service = ForecastService()

