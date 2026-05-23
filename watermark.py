from PIL import Image, ImageDraw, ImageFont
import os

# 创建 150x150 透明图片
size = 150
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 尝试加载字体
font_size = 90
try:
    font = ImageFont.truetype("msyh.ttc", font_size)
except:
    try:
        font = ImageFont.truetype("simhei.ttf", font_size)
    except:
        font = ImageFont.load_default()

# 绘制圆形渐变背景
center = (size // 2, size // 2)
radius = 65
for i in range(radius, 0, -1):
    ratio = (radius - i) / radius
    r = int(139 + (236 - 139) * ratio)
    g = int(92 + (72 - 92) * ratio)
    b = int(246 + (153 - 246) * ratio)
    draw.ellipse([center[0]-i, center[1]-i, center[0]+i, center[1]+i],
                 fill=(r, g, b, 255))

# 绘制"鹏"字
text = "鹏"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
text_x = (size - text_width) // 2 - 3
text_y = (size - text_height) // 2 - bbox[1] - 5
draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))

# 保存
output_path = r"C:\Users\Administrator\.qclaw\workspace\website\youtube-watermark.png"
img.save(output_path, "PNG")
print(f"Watermark saved: {output_path}")
print(f"Size: {size}x{size}")
print(f"File size: {os.path.getsize(output_path)} bytes")