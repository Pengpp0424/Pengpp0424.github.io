#!/usr/bin/env python3
"""验证B站BV号是否有效"""

import requests

headers = {'User-Agent': 'Mozilla/5.0'}
bvs = {
    "作品3": "BV1ccUxBbEvH",
    "作品4": "BV1BCPuzUEYZ",
    "作品5": "BV1WERRBcE6L"
}

print("🔍 验证BV号...")
for work, bv in bvs.items():
    try:
        r = requests.get(f'https://api.bilibili.com/x/web-interface/view?bvid={bv}', headers=headers, timeout=5)
        data = r.json()
        if data['code'] == 0:
            title = data['data']['title']
            print(f"✅ {work} ({bv}): {title}")
        else:
            print(f"❌ {work} ({bv}): 无效 ({data['message']})")
    except Exception as e:
        print(f"⚠️ {work} ({bv}): 请求失败 ({e})")

print("\n完成！")
