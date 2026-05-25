import urllib.request
import urllib.parse
import json
import sys
from datetime import datetime

proxy = "http://localhost:19000/proxy/api"
remote_url = "https://jprx.m.qq.com/aizone/skillserver/v1/proxy/teamrouter_neodata/query"

query = "今日 A 股早盘行情 热点板块 资金流向"
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
        print(json.dumps(result, ensure_ascii=False, indent=2))
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)