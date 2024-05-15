from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import time

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Request body model
class LoadTestRequest(BaseModel):
    url: str
    qps: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the HTTP Load Testing API. Use /loadtest to start a load test."}

@app.post("/loadtest")
def load_test(data: LoadTestRequest):
    url = data.url
    qps = data.qps
    latencies = []
    error_count = 0
    
    # Simulating load test
    for _ in range(qps):
        start_time = time.time()
        try:
            response = requests.get(url)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            error_count += 1
            continue
        latency = time.time() - start_time
        latencies.append(latency)
    
    error_rate = error_count / qps if qps > 0 else 0
    return {"latencies": latencies, "error_rate": error_rate}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
