# 2026-04-23：记忆系统启用 & 老鹏的配置

## 用户信息
- 姓名：老鹏
- 联系方式：QQ (通过 QQ Bot 交流)
- 邮箱：105945357@qq.com
- 网盘号：ruyo458

## 身份确认
- 我的名字：克劳

## 视频剪辑素材
- 视频：F:\适合剪辑\（ELDEN RING™、God of War Ragnarök、Marvel's Spider-Man Remastered、RESIDENT EVIL requiem）
- BGM：Movavi自带96首（32分类）+ Steam音乐库78个目录

## LiblibAI API 配置（扣积分最低优先）
- Base URL: https://openapi.liblibai.cloud
- AccessKey: v65alMS2ZZ7vT4m1bKl06A
- SecretKey: MUM--K4wm_w5GNzusE3SlH9QKKMhbIU0
- 计费: 文生图 5积分/张（默认SDXL），消耗最低的优先
- 脚本: scripts\liblib_api.py
- 已验证: 签名算法正确，接口可用
2. 视频剪辑脚本（KlaouVideoClip.py）已暂停维护，不再执行
- 历史问题：moviepy太慢被SIGKILL、ffmpeg filter_complex语法bug、字幕PNG生成0字节

## QQ推送配置（待补充）
- 私聊目标格式：qqbot:c2c:openid
- 群聊目标格式：qqbot:group:groupid

## 技术笔记
- Gateway API端口：28789（无法自主重启，杀掉进程后新进程启动失败）
- openclaw.json可能存在格式问题（node验证通过但PowerShell测试失败）
1. QQ推送目标配置：缺少老鹏的QQ openid或groupid
2. KlaouVideoClip.py v5 已修复主要bug，并行锁机制已实装，但视频剪辑任务已暂停（移交微信Agent）
- Ollama 本地模型端口：11434，已拉取 qwen2.5:3b（中文解说词）和 gemma3:4b（英文场景描写）
- Step 7混音架构缺陷：65条TTS MP3直接进ffmpeg filter_complex 导致SIGKILL。修复方案：先用ffmpeg concat demuxer合并所有TTS为单条音轨，再进混音（减少filter_complex节点数）；加重试逻辑（最多3次）；输出后用ffprobe验证3轨是否齐全
- smart_commentary.py 三层架构（Tier 1=视觉分析+AI生成/Tier 2=HUD检测+AI/Tier 3=场景模板），已替代narrative_rhythm.py 生成解说词。核心优势：先用模型分析关键帧画面内容，再生成贴切的解说词，而非仅靠关键词匹配
- AI视频工作流：ComfyUI本地生图 + LiblibAI图生视频（网页端LibTV）
- LiblibAI图生视频暂无公开API，仅限LibTV网页端操作

## 用户身份与偏好

- 监控偏好：不需要持续监控，只需在任务执行时间点检查，执行后10分钟内检查有无报错
- 视频处理任务偏好：串行执行（单进程逐个跑）比多进程并行更稳定高效
- 视频成品偏好：原声、配音、BGM使用独立音轨分轨处理，减少混音bug
- BGM使用三原则：场景变换时换BGM、切换用淡入淡出过渡、对话讲解时BGM退到背景或静音
- 剪辑风格：剧情/战斗向默认过滤角色死亡/失败画面；幽默搞笑向则故意收集出糗片段
- 日常主业：视频剪辑（游戏向）继续练习
- 配音策略：旁白统一一种人声，各角色对白启用不同人声以增加辨识度（老鹏08:32明确修正）
- 「零」AI科幻短片：主角「零」必须以女性形象呈现（用户明确强调最重要的一点）
- 视频模型偏好（本地可用）：Wan2.1 i2v 14B fp8、LTX-Video 2B、SVD-XT
- Boss战解说词个性化已完成：smart_commentary.py Tier 1架构（视觉分析+AI生成）+ boss_identity.py（gemma3:4b识别具体Boss名字，如「玛尔基特终于倒下了！」），已在忍龙4剪辑中验证（4场Boss战，32条TTS解说）
- 视频剪辑任务已暂停（老鹏交给微信agent处理）；「零」AI短片项目由我独立负责，ComfyUI本地FLF工作流已验证可用（720×1280，81帧/镜头），LiblibAI图生视频仍为网页端LibTV操作，暂无可用API
- 《代码幽灵》项目（新项目，替代暂停的《零》）：
- 题材：赛博朋克 + AI觉醒 + 动作
- 主角「凌」（Lin）：22岁女性，东方人特征，大眼长睫毛，代码虹膜，瓜子脸，超模身材
- **服装风格（重要！老鹏2026-05-25反馈）**：深色、功能性、符合剧情。❌不能花哨（像女团演唱会）。✅正确：黑色哑光紧身战术服（肩部LED灯条）/ 深灰战损款连体衣（手臂电路纹理）/ 炭黑纳米外套（内部线路透蓝光）
- 主角「零」设定（已暂停）
- B站：子弹傀儡
- 小红书：232赞藏
- 快手：子弹傀儡
- AI回复简洁直接，不要虚报进度

## 剪辑六大核心原则（老鹏经验，2026-04-28）

1. **素材预检**：标题一致、类型相同、时间顺序合理
2. **实机优先**：剧情动画少用（魔改除外），实机操作保流畅，避免断切/死亡结尾
3. **静态画面三可用**：高光特写、绝美风景、重要奖励/物品说明；其他少用
4. **解说词策略**：战斗向→技术分析+攻略；剧情向→剧情解说+深度解析；用DeepSeek按素材名+类型+方向搜索生成，再按关键帧裁剪
5. **搞笑类**：抓取操作失误/上手困难/迷路等蹩脚时刻，配搞笑解说+搞笑BGM
6. **BGM选配**：有解说→按解说选；无解说→按类型风格选（战斗激烈→大气/平稳→舒缓/剧情→悬疑奇幻温暖悲伤）；判断不了先出草稿给老鹏审定
- 解说词生成改进：先视觉分析画面内容（游戏名/Boss/战斗阶段），再根据实际内容生成匹配解说词，避免套话和内容错配
- 解说词片头禁止俗套开场白（大家好/欢迎来到等），片头主副标题后直接切入解说内容
- 片尾固定话术：感谢观看，制作不易，请点赞收藏+关注，仅放片尾，禁止放片头

## 当前项目与关注

- Desktop文件夹用于存放网络下载的优秀视频参考资源（B站/YouTube等下载的视频统一归入此文件夹）
- 游戏视频轻量化理解方案：game_video_understanding.py（HSV颜色检测游戏HUD元素，识别combat/exploration/cutscene/dungeon/menu场景）
- 智能解说词引擎 smart_commentary.py：三层架构Tier 1(AI生成)→Tier 2(HUD检测+AI)→Tier 3(模板兜底)，固定配音策略（全片统一一种声音）
- 《零》AI科幻短片项目已暂停（I2V无法保证角色一致性，ZImage LoRA仅T2V可用）
- 老鹏的另一台电脑配置：CPU=Intel Xeon E3-1230 v3 @ 3.30GHz（Haswell 2014），主板=七彩虹 C.Z97 X5，内存=16GB DDR3，显卡=GTX 970 4GB，硬盘=2TB机械盘；无法安装Win11（CPU不在支持列表+无fTPM 2.0）

## ComfyUI 工作流永久索引 📋

**⚠️ 重要：每次使用ComfyUI前，必须先读此文件！**

- **索引文件**: `C:\Users\Administrator\.qclaw\workspace\COMFYUI_INDEX.md`
- **创建时间**: 2026-05-25 16:50 (Asia/Hong_Kong)
- **目的**: 避免重复丢失ComfyUI工作流（老鹏2026-05-25再次提醒此问题）
- **包含内容**:
- ComfyUI安装位置 (`D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\`)
- 所有工作流文件清单（I2V/FLF2V/T2I）及状态
- 辅助脚本清单及用法
- 快速启动指南
- 常见问题解决方案
- **维护规则**:
- 每次新工作流测试通过后，立即更新此索引
- 每次脚本修改后，立即更新用法说明
- 每次新任务前，先读此索引（强制执行）

---

## 技术规范偏好

- 大规模文件下载（如模型），永远用浏览器多线程，不要用curl命令行走代理（实测浏览器比curl快几百倍）
- Ollama 中文生成必须用 Python 调用（PowerShell JSON 会破坏中文编码）
- 配音策略：整片固定一种声音，根据游戏风格主动判断，不等待用户指示；卡通可爱/二次元→可爱男声（YunxiaNeural）；战斗硬核→激情男声（YunjianNeural）；探索冒险→阳光男声（YunxiNeural）；恐怖悬疑→温暖女声（XiaoxiaoNeural）；专业分析→专业男声（YunyangNeural）；法式艺术/文学感→深沉男声（YunxiaNeural）；幽默搞笑→东北话女声（XiaobeiNeural）；不再按场景切换声音（全片统一）
