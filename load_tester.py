import requests
import time
import argparse

def send_request(url):
    try:
        start_time = time.time()
        response = requests.get(url)
        latency = time.time() - start_time
        return latency, response.status_code
    except requests.RequestException as e:
        return None, str(e)

def main(url, qps):
    latencies = []
    errors = 0
    interval = 1 / qps
    while True:
        latency, status = send_request(url)
        if latency is not None:
            latencies.append(latency)
        else:
            errors += 1
        time.sleep(interval)
        print(f"Latencies: {latencies}, Errors: {errors}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HTTP Load Tester")
    parser.add_argument("url", type=str, help="The URL to load test")
    parser.add_argument("--qps", type=int, default=1, help="Queries per second")
    args = parser.parse_args()
    main(args.url, args.qps)
