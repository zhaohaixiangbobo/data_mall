import argparse
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed


def http_get(url: str, timeout_s: float) -> tuple[int, float]:
    start = time.perf_counter()
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        resp.read()
        status = getattr(resp, "status", 200)
    return status, (time.perf_counter() - start)


def run(url: str, concurrency: int, requests_total: int, timeout_s: float) -> int:
    latencies = []
    status_count: dict[int, int] = {}
    errors = 0
    start_all = time.perf_counter()

    with ThreadPoolExecutor(max_workers=concurrency) as ex:
        futures = [ex.submit(http_get, url, timeout_s) for _ in range(requests_total)]
        for fut in as_completed(futures):
            try:
                status, latency = fut.result()
                latencies.append(latency)
                status_count[status] = status_count.get(status, 0) + 1
            except Exception:
                errors += 1

    elapsed = time.perf_counter() - start_all
    latencies.sort()

    def pct(p: float) -> float:
        if not latencies:
            return 0.0
        k = int(round((p / 100.0) * (len(latencies) - 1)))
        return latencies[min(max(k, 0), len(latencies) - 1)]

    result = {
        "url": url,
        "concurrency": concurrency,
        "requests_total": requests_total,
        "timeout_s": timeout_s,
        "elapsed_s": round(elapsed, 4),
        "rps": round((requests_total - errors) / elapsed, 2) if elapsed > 0 else 0,
        "errors": errors,
        "status_count": status_count,
        "latency_ms": {
            "p50": round(pct(50) * 1000, 2),
            "p90": round(pct(90) * 1000, 2),
            "p95": round(pct(95) * 1000, 2),
            "p99": round(pct(99) * 1000, 2),
            "max": round((latencies[-1] if latencies else 0.0) * 1000, 2),
        },
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if errors == 0 else 2


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://10.9.14.132:8000/api/apps")
    parser.add_argument("--concurrency", type=int, default=50)
    parser.add_argument("--requests", type=int, default=500)
    parser.add_argument("--timeout", type=float, default=5.0)
    args = parser.parse_args()
    return run(args.url, args.concurrency, args.requests, args.timeout)


if __name__ == "__main__":
    raise SystemExit(main())

