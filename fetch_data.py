#!/usr/bin/env python3
"""
fetch_data.py - 抓取新闻/游戏科技动态/财经数据，更新 data.json
定时任务：每天 08:00 和 18:00（GitHub Actions）
"""

import json
import sys
import os
from datetime import datetime, timedelta
import urllib.request
import urllib.parse
import re

def fetch_toutiao_news():
    """抓取今日头条热搜新闻（免费，无需 API Key）"""
    try:
        url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.toutiao.com/'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('data', [])[:5]
            return [{
                "date": datetime.now().strftime('%Y-%m-%d'),
                "title": item.get("Title", item.get("title", "")),
                "excerpt": item.get("Title", "")[:50] + "...",
                "url": item.get("Url", item.get("url", "#"))
            } for item in items]
    except Exception as e:
        print(f"[警告] 头条新闻抓取失败: {e}")
        return []

def fetch_gaming_news():
    """抓取游戏/科技动态（36Kr/虎嗅 RSS）"""
    try:
        # 使用 36Kr RSS（科技新闻）
        url = "https://36kr.com/feed"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            xml = resp.read().decode('utf-8')
            # 简单解析 XML（不需要额外依赖）
            titles = re.findall(r'<title><!\[CDATA\[(.*?)\]\]></title>', xml)
            links = re.findall(r'<link>(.*?)</link>', xml)
            dates = re.findall(r'<pubDate>(.*?)</pubDate>', xml)
            
            results = []
            for i in range(min(4, len(titles))):
                if i == 0: continue  # 第一个是站点标题
                results.append({
                    "date": datetime.now().strftime('%Y-%m-%d'),
                    "category": "tech",
                    "title": titles[i],
                    "url": links[i] if i < len(links) else "#",
                    "source": "36Kr"
                })
            return results
    except Exception as e:
        print(f"[警告] 游戏科技动态抓取失败: {e}")
        return []

def fetch_finance():
    """抓取股票行情（新浪免费 API）"""
    symbols = {
        "000001.SH": "上证指数",
        "399006.SZ": "创业板指",
        "00700.HK": "腾讯控股",
        "09999.HK": "网易-S",
        "7974.T": "任天堂",
        "NVDA": "英伟达",
        "GOLD": "国际黄金"
    }
    
    results = []
    for symbol, name in symbols.items():
        try:
            if symbol.endswith('.SH') or symbol.endswith('.SZ'):
                # A股
                code = symbol.replace('.SH', 'sh').replace('.SZ', 'sz')
                url = f"https://hq.sinajs.cn/list={code}"
            elif symbol.endswith('.HK'):
                # 港股
                code = symbol.replace('.HK', 'hk')
                url = f"https://hq.sinajs.cn/list=rt_{code}"
            else:
                # 美股/其他
                url = f"https://hq.sinajs.cn/list=gb_{symbol.lower()}"
            
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://finance.sina.com.cn/'
            })
            with urllib.request.urlopen(req, timeout=5) as resp:
                content = resp.read().decode('gbk', errors='ignore')
                # 解析新浪返回格式：var hq_str_xxx="名称,价格,..."
                match = re.search(r'"(.*?)"', content)
                if match:
                    fields = match.group(1).split(',')
                    if len(fields) > 3:
                        price = fields[3] if len(fields) > 3 else fields[0]
                        change = fields[4] if len(fields) > 4 else "0.00"
                        results.append({
                            "symbol": symbol,
                            "name": name,
                            "value": price,
                            "change": change + "%",
                            "dir": "up" if float(change) >= 0 else "down"
                        })
                        continue
            # fallback
            results.append({
                "symbol": symbol,
                "name": name,
                "value": "--",
                "change": "+0.00%",
                "dir": "up"
            })
        except Exception as e:
            print(f"[警告] {name} 抓取失败: {e}")
            results.append({
                "symbol": symbol,
                "name": name,
                "value": "--",
                "change": "+0.00%",
                "dir": "up"
            })
    
    return results

def main():
    print(f"[{datetime.now()}] 开始抓取数据...")
    
    # 读取现有 data.json
    data_path = os.path.join(os.path.dirname(__file__), 'data.json')
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {}
    
    # 抓取新闻
    print("\n[1/3] 抓取头条新闻...")
    news = fetch_toutiao_news()
    if news:
        data['news'] = news
        print(f"  ✅ 获取 {len(news)} 条新闻")
    else:
        print("  ⚠️ 使用现有数据")
    
    # 抓取游戏科技动态
    print("\n[2/3] 抓取游戏科技动态...")
    gaming_news = fetch_gaming_news()
    if gaming_news:
        data['gaming_news'] = gaming_news
        print(f"  ✅ 获取 {len(gaming_news)} 条动态")
    else:
        print("  ⚠️ 使用现有数据")
    
    # 抓取财经数据
    print("\n[3/3] 抓取股票行情...")
    finance = fetch_finance()
    if finance:
        data['finance'] = finance
        print(f"  ✅ 获取 {len(finance)} 条行情")
    else:
        print("  ⚠️ 使用现有数据")
    
    # 更新时间戳
    data['lastUpdated'] = datetime.now().strftime('%Y%m%d%H%M')
    
    # 写入 data.json
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n[{datetime.now()}] 完成！data.json 已更新")

if __name__ == '__main__':
    main()
