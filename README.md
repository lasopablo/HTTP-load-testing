# HTTP Load Tester

This project is a general-purpose HTTP load-testing and benchmarking tool. It includes a frontend interface for visualizing load test results and a backend API for conducting the load tests.

## Features

- Reports latencies and error rates
- Supports a `--qps` flag to generate requests at a given fixed QPS (queries per second)
- Real-time graphical representation of latencies and error rates
- Dockerized for easy deployment

## Requirements

- Docker
- Docker Compose

## Installation and Usage

### Clone the Repository

```sh
git clone <repository-url>
cd [http_load_tester](https://github.com/lasopablo/HTTP-load-testing.git)
```
### Running with Docker

1. **Pull the Docker images:**

   ```sh
   docker pull pablaso/http_load_tester_frontend:frontend_ready
   docker pull pablaso/http_load_tester_backend:frontend_ready
   ```
