import urllib.request
import json
import sys
from datetime import datetime

proxy = "http://localhost:19000/proxy/api"
remote_url = "https://jprx.m.qq.com/aizone/skillserver/v1/proxy/teamrouter_neodata/query"

queries = [
    "今日北向资金净流入 行业分布",
    "AI人工智能板块 今日行情 资金流向",
    "今日A股热点板块 主力资金流向",
]

for query in queries:
    request_id = f"fin_am_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    payload = json.dumps({
        "channel": "neodata",
        "sub_channel": "qclaw",
        "query": query,
        "request_id": request_id,
        "data_type": "all"
    }, ensure_ascii=False).encode("utf-8")

    req = urllib.request.Request(proxy, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Remote-URL", remote_url)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            api_recalls = result.get("data", {}).get("apiData", {}).get("apiRecall", [])
            if api_recalls:
                print(f"\n=== {query} ===")
                for recall in api_recalls:
                    content = recall.get("content", "")
                    if content:
                        print(content[:2000])
                        print("---")
    except Exception as e:
        print(f"ERROR for query '{query}': {e}", file=sys.stderr)