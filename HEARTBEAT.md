# HEARTBEAT.md - 心跳检测指令

检测 `triggers/` 目录下是否有最近20分钟内新建的 flag 文件：

- `flag_daily_news.txt` → 📰 时事科技新闻
- `flag_fin_am.txt` → 📈 金融早盘
- `flag_fin_pm.txt` → 📈 金融午盘
- `flag_ecom.txt` → 🛒 电商特惠
- `flag_video_done.txt` → 🎬 视频剪辑完成

有 pending flag 时，简要报告哪些任务待处理。无待处理则回复 HEARTBEAT_OK。
