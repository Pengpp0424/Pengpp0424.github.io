#!/usr/bin/env python3
"""
获取网站动态数据（新闻、财经）
- 游戏科技新闻：从RSS feeds获取
- 财经数据：从Yahoo Finance获取
"""

import json
import requests
from datetime import datetime
import feedparser
from pathlib import Path

# 配置
DATA_JSON_PATH = Path.home() / ".qclaw" / "workspace" / "website" / "data.json"
OUTPUT_PATH = DATA_JSON_PATH  # 直接更新原文件

# RSS feeds (游戏科技新闻)
RSS_FEEDS = [
    "https://www.ithome.com/rss/",
    "https://www.3dmgame.com/rss/news.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
]

# 股票代码 (游戏科技相关)
STOCK_SYMBOLS = {
    "0700.HK": "腾讯控股",
    "9999.HK": "网易-S",
    "NTDOY": "任天堂",
    "SONY": "索尼集团",
    "EA": "艺电",
    "RDDT": "Reddit",
    "NVDA": "英伟达",
    "KRAFTON": "Krafton",
}


def fetch_news():
    """从RSS feeds获取新闻"""
    print("📰 获取新闻...")
    news_items = []

    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:3]:  # 每个源取3条
                # 过滤游戏/科技相关关键词
                title = entry.get("title", "")
                summary = entry.get("summary", "")

                # 简单关键词过滤
                keywords = ["游戏", "Game", "AI", "科技", "Tech", "显卡", "GPU", "CPU", "主机", "PlayStation", "Xbox", "Nintendo"]
                if any(kw in title or kw in summary for kw in keywords):
                    news_items.append({
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "title": title[:80],  # 限制长度
                        "excerpt": summary[:120],
                        "url": entry.get("link", "")
                    })
        except Exception as e:
            print(f"  ⚠️ 获取 {feed_url} 失败: {e}")

    # 去重 + 限制数量
    seen_titles = set()
    unique_news = []
    for item in news_items:
        if item["title"] not in seen_titles:
            seen_titles.add(item["title"])
            unique_news.append(item)

    print(f"  ✅ 获取到 {len(unique_news)} 条新闻")
    return unique_news[:8]  # 最多8条


def fetch_finance():
    """获取股票数据 (Yahoo Finance)"""
    print("📈 获取财经数据...")
    finance_data = []

    for symbol, name in STOCK_SYMBOLS.items():
        try:
            # 使用Yahoo Finance API (无需API key)
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            resp = requests.get(url, timeout=5)
            data = resp.json()

            if "chart" in data and "result" in data["chart"]:
                result = data["chart"]["result"][0]
                meta = result.get("meta", {})

                # 获取当前价格和变化
                current_price = meta.get("regularMarketPrice", 0)
                prev_close = meta.get("previousClose", 0)

                if prev_close and current_price:
                    change_pct = ((current_price - prev_close) / prev_close) * 100
                    dir = "up" if change_pct > 0 else "down"

                    finance_data.append({
                        "symbol": symbol,
                        "name": name,
                        "change": f"{change_pct:+.2f}%",
                        "dir": dir
                    })
                else:
                    # 默认值
                    finance_data.append({
                        "symbol": symbol,
                        "name": name,
                        "change": "0.00%",
                        "dir": "up"
                    })
            else:
                raise ValueError("Invalid response")

        except Exception as e:
            print(f"  ⚠️ 获取 {symbol} 失败: {e}")
            # 使用默认值
            finance_data.append({
                "symbol": symbol,
                "name": name,
                "change": "N/A",
                "dir": "up"
            })

    print(f"  ✅ 获取到 {len(finance_data)} 只股票数据")
    return finance_data


def main():
    print("=" * 60)
    print("🔄 开始获取网站动态数据...")
    print("=" * 60)

    # 读取现有 data.json
    if DATA_JSON_PATH.exists():
        with open(DATA_JSON_PATH, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    else:
        data = {}

    # 更新新闻
    news = fetch_news()
    if news:
        data["news"] = news
        data["gaming_news"] = news  # 同时更新 gaming_news

    # 更新财经数据
    finance = fetch_finance()
    if finance:
        data["finance"] = finance

    # 更新时间戳
    data["lastUpdated"] = datetime.now().strftime("%Y-%m-%d")

    # 保存
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print("=" * 60)
    print(f"✅ 数据已更新: {OUTPUT_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
