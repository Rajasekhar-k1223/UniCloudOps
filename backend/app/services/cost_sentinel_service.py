import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class CostSentinelService:
    """
    Tactical Cost Sentinel Service.
    Monitors spend velocity and detects anomalies in real-time.
    """
    
    def detect_spikes(self, historical_data: List[Dict]) -> Dict:
        """
        Analyze historical daily spend to identify cost spikes.
        Threshold: 2.0x average daily spend is considered a 'Critical Spike'.
        """
        if not historical_data or len(historical_data) < 3:
            return {"status": "ok", "spikes": [], "summary": "Insufficient data for anomaly detection."}

        # Calculate daily totals
        daily_totals = []
        for entry in historical_data:
            if 'is_forecast' in entry: continue
            total = sum(v for k, v in entry.items() if k not in ['date', 'cumulative'])
            daily_totals.append(total)

        if not daily_totals:
            return {"status": "ok", "spikes": []}

        avg_daily = sum(daily_totals) / len(daily_totals)
        spikes = []
        
        for i, total in enumerate(daily_totals):
            if total > (avg_daily * 1.5): # 1.5x for Warning, 2.0x for Critical
                severity = "critical" if total > (avg_daily * 2.0) else "warning"
                spikes.append({
                    "date": historical_data[i]['date'],
                    "amount": round(total, 2),
                    "average": round(avg_daily, 2),
                    "multiplier": round(total / avg_daily if avg_daily > 0 else 0, 1),
                    "severity": severity
                })

        # Latest day check
        current_status = "ok"
        latest_spike = None
        if spikes and spikes[-1]['date'] == historical_data[-1]['date']:
            latest_spike = spikes[-1]
            current_status = latest_spike['severity']

        return {
            "status": current_status,
            "average_daily_spend": round(avg_daily, 2),
            "spikes": spikes,
            "summary": f"Detected {len(spikes)} cost anomalies in current billing cycle." if spikes else "Spending velocity within normal operational parameters."
        }

cost_sentinel_service = CostSentinelService()
