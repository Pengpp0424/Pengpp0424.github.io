# ComfyUI 工作流永久索引 📋

**最后更新**: 2026-05-25 16:50 (Asia/Hong_Kong)  
**维护者**: 克劳 🐙  
**目的**: 避免重复丢失ComfyUI工作流，每次新任务前必须先读此文件

---

## 📍 ComfyUI 安装位置

### 主程序
- **安装路径**: `D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\`
- **启动脚本**: `D:\ComfyUI\ComfyUI_JM_windows_portable\run_nvidia_gpu.bat`
- **API 端口**: `http://127.0.0.1:8188`
- **Web UI**: `http://127.0.0.1:8188`

### 关键目录
- **工作流存放**: `D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\user\default\workflows\`
- **输入目录**: `D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\input\`
- **输出目录**: `D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\output\`
- **模型目录**: `D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\models\`

---

## 🎬 图生视频工作流 (Image-to-Video)

### 1. Wan2.1 I2V 14B fp8 (推荐)
**文件**: `workflows/i2v_api_v3.json`  
**模型**: `wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors`  
**VAE**: `Wan2.1_VAE_bf16.safetensors`  
**CLIP**: `CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors`  
**LoRA**: `WanVideo\Lightx2v\ZImage-lora-1800.safetensors` (强度 1.0)  
**分辨率**: 720×1280 (竖屏)  
**帧数**: 81帧 (约3.3秒)  
**用途**: 《零》AI科幻短片图生视频  
**API调用**: `scripts/run_comfyui_i2v_api.py`  
**状态**: ✅ 测试通过 (2026-05-25)

### 2. Wan2.1 FLF2V (First-Last Frame)
**文件**: `workflows/flf2v_zero_lora.json`  
**模型**: `wan2.1_flf2v_720p_14B_fp16.safetensors`  
**LoRA**: `ZImage-lora-1800.safetensors`  
**分辨率**: 720×1280  
**用途**: 首尾帧过渡视频  
**状态**: ⚠️ 未测试

### 3. Wan2.1 I2V API (旧版)
**文件**: `workflows/i2v_api_converted.json`  
**状态**: ⚠️ 已弃用 (被 i2v_api_v3.json 替代)

---

## 🖼️ 文生图工作流 (Text-to-Image)

### 1. Flux.1 Dev fp8
**脚本**: `scripts/zero_comfyui_runner.py`  
**模型**: `flux1-dev-fp8.safetensors`  
**VAE**: `ae.safetensors`  
**分辨率**: 720×1280 / 1920×803  
**用途**: 《零》AI科幻短片角色/场景生图  
**状态**: ✅ 测试通过 (2026-05-06)

---

## 🛠️ 辅助脚本

### 1. `scripts/run_comfyui_i2v_api.py` (推荐)
**功能**: 批量图生视频 (通过HTTP API)  
**输入**: `E:\AI剪辑成品\code_ghost\act1\`  
**输出**: `E:\AI剪辑成品\code_ghost\act1_videos\`  
**工作流**: `workflows/i2v_api_v3.json`  
**用法**: 
```powershell
cd C:\Users\Administrator\.qclaw\workspace\scripts
python run_comfyui_i2v_api.py
```

### 2. `scripts/zero_comfyui_runner.py`
**功能**: 批量文生图 (通过HTTP API)  
**输入**: `scripts/zero_img_prompts_v2.py` (提示词)  
**输出**: `E:\AI剪辑成品\零\`  
**工作流**: Flux.1 Dev fp8  
**用法**:
```powershell
cd C:\Users\Administrator\.qclaw\workspace\scripts
python zero_comfyui_runner.py
```

### 3. `scripts/check_comfyui.py`
**功能**: 检查ComfyUI服务状态  
**用法**:
```powershell
cd C:\Users\Administrator\.qclaw\workspace\scripts
python check_comfyui.py
```

### 4. `scripts/test_comfyui_api.py`
**功能**: 测试ComfyUI API连接  
**用法**:
```powershell
cd C:\Users\Administrator\.qclaw\workspace\scripts
python test_comfyui_api.py
```

---

## 📝 工作流文件清单

| 文件名 | 类型 | 模型 | 状态 | 最后修改 |
|--------|------|------|------|----------|
| `i2v_api_v3.json` | I2V | Wan2.1 14B fp8 | ✅ 推荐 | 2026-05-21 |
| `flf2v_zero_lora.json` | FLF2V | Wan2.1 14B fp16 | ⚠️ 未测试 | 2026-05-20 |
| `flf2v_original.json` | FLF2V | Wan2.1 14B | ⚠️ 旧版 | 2026-05-05 |
| `i2v_api_converted.json` | I2V | Wan2.1 | ⚠️ 已弃用 | 2026-05-21 |
| `i2v_native_v4_20260522.json` | I2V | Wan2.1 | ⚠️ 实验中 | 2026-05-22 |
| `i2v_zero_lora_v3_20260522_lightx2v.json` | I2V | Wan2.1 + Lightx2v | ⚠️ 实验中 | 2026-05-22 |

---

## 🚀 快速启动指南

### 图生视频 (I2V) - 推荐流程
1. **启动ComfyUI**:
   ```powershell
   D:\ComfyUI\ComfyUI_JM_windows_portable\run_nvidia_gpu.bat
   ```
2. **检查服务状态**:
   ```powershell
   python C:\Users\Administrator\.qclaw\workspace\scripts\check_comfyui.py
   ```
3. **准备输入图片**: 放到 `D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\input\`
4. **运行批量处理**:
   ```powershell
   cd C:\Users\Administrator\.qclaw\workspace\scripts
   python run_comfyui_i2v_api.py
   ```
5. **查看输出**: `E:\AI剪辑成品\code_ghost\act1_videos\`

### 文生图 (TXI) - 《零》项目
1. **启动ComfyUI** (同上)
2. **修改提示词**: 编辑 `scripts/zero_img_prompts_v2.py`
3. **运行批量生图**:
   ```powershell
   cd C:\Users\Administrator\.qclaw\workspace\scripts
   python zero_comfyui_runner.py
   ```
4. **查看输出**: `E:\AI剪辑成品\零\`

---

## ⚠️ 常见问题

### 1. ComfyUI服务无法连接
- **检查**: ComfyUI是否启动？端口8188是否被占用？
- **解决**: 重启ComfyUI，或检查防火墙设置

### 2. 工作流加载失败
- **检查**: 模型文件是否存在于 `models/` 目录？
- **解决**: 下载缺失模型，或使用已安装模型替换

### 3. 输出视频为0字节
- **检查**: 输入图片是否存在？工作流节点是否连接正确？
- **解决**: 使用 `scripts/test_comfyui_api.py` 调试单个图片

---

## 📌 重要提醒

**每次新任务前，必须先读此文件！**  
**每次工作流有更新，必须更新此文件！**  

位置: `C:\Users\Administrator\.qclaw\workspace\COMFYUI_INDEX.md`  
备份: GitHub (Pengpp0424/Pengpp0424.github.io)

---

**记录者**: 克劳 🐙  
**最后验证**: 2026-05-25 16:50 (Asia/Hong_Kong)
