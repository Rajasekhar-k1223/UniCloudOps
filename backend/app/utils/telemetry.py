import random
import time
from typing import List, Dict

def generate_simulated_metrics(metric_name: str, instance_id: str, count: int = 24) -> List[Dict]:
    """
    Generates high-fidelity simulated time-series data for the UI dashboard.
    Ensures that different metrics have different 'shapes' (e.g. CPU vs Network).
    """
    data = []
    now = int(time.time())
    
    # Use instance_id as a seed for consistent 'vibe' for a specific machine
    seed = sum(ord(c) for c in instance_id)
    random.seed(seed + hash(metric_name))
    
    base_value = 0
    volatility = 0
    
    if "CPU" in metric_name:
        base_value = random.uniform(5, 25)
        volatility = 5
    elif "Network" in metric_name:
        base_value = random.uniform(100, 1000)
        volatility = 200
    elif "Disk" in metric_name:
        base_value = random.uniform(0, 50)
        volatility = 10
    else:
        base_value = 1
        volatility = 0.5

    for i in range(count):
        # 5-minute intervals
        timestamp = now - (count - i) * 300
        time_str = time.strftime("%H:%M", time.localtime(timestamp))
        
        # Random walk for realism
        base_value += random.uniform(-volatility/2, volatility/2)
        base_value = max(0, base_value)
        
        data.append({
            "time": time_str,
            "value": round(base_value, 2)
        })
        
    return data

def get_standard_telemetry(instance_id: str) -> Dict:
    """Returns a full suite of high-fidelity metrics for any cloud resource."""
    return {
        "CPUUsage": {"label": "CPU Usage", "unit": "%", "data": generate_simulated_metrics("CPU", instance_id)},
        "MemoryUsage": {"label": "Memory Usage", "unit": "%", "data": generate_simulated_metrics("Memory", instance_id)},
        "NetworkThroughput": {"label": "Network In/Out", "unit": "Mbps", "data": generate_simulated_metrics("Network", instance_id)}
    }
