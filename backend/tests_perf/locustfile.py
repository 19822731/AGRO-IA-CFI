from locust import HttpUser, task, between

class PRDUser(HttpUser):
    wait_time = between(0.2, 1.0)

    @task(8)
    def read_prd(self):
        self.client.get("/api/prd")

    @task(2)
    def run_prd(self):
        self.client.post("/api/prd/run", json={
            "stock_open": 120000,
            "domestic_demand": 95000,
            "forecast_meta": {"horizon_days": 30}
        })
