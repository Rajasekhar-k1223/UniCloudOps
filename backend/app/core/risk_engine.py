class RiskEngine:
    """Calculates dynamic risk scores for entities based on incoming threat signals."""

    @staticmethod
    def calculate_risk(base_score: float, signals: list) -> float:
        """
        Calculates a new risk score based on an array of incoming signals.
        Signals could be "failed_login", "public_s3", "critical_cve".
        """
        current_score = base_score

        # Signal Weights
        weights = {
            "failed_login": 5.0,
            "suspicious_ip": 15.0,
            "critical_cve": 40.0,
            "public_s3": 30.0,
            "root_access": 50.0
        }

        for signal in signals:
            current_score += weights.get(signal, 0.0)

        # Cap score at 100
        return min(current_score, 100.0)

    @staticmethod
    def get_risk_level(score: float) -> str:
        """Translates a numerical score into a categorical risk level."""
        if score >= 85:
            return "CRITICAL"
        elif score >= 60:
            return "HIGH"
        elif score >= 30:
            return "MEDIUM"
        else:
            return "LOW"

risk_engine = RiskEngine()
