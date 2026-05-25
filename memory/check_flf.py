import requests, glob, os
from PIL import Image

API = 'http://127.0.0.1:8188'
OUT = r'D:\ComfyUI\ComfyUI_JM_windows_portable\ComfyUI\output'
shots = ['S1A','S2A','S3A','S3B','S4A','S5A','S5B','S6A','S6B','S7A','S7B','S8A','S8B','S9A','S9B','S10A','S10B']

try:
    q = requests.get(f'{API}/queue', timeout=5).json()
    print(f'queue: running={len(q.get("queue_running",[]))} pending={len(q.get("queue_pending",[]))}')
except:
    print('queue: error')

done, miss = 0, 0
for s in shots:
    webps = glob.glob(os.path.join(OUT, '*flf_' + s.lower() + '_*.webp'))
    if webps:
        best = max(webps, key=lambda f: os.path.getsize(f))
        with Image.open(best) as img:
            frames = img.n_frames
            size = os.path.getsize(best) // 1024
            if frames >= 40:
                print(f'OK {s}: {frames}f {size}KB')
                done += 1
            else:
                print(f'SHORT {s}: {frames}f {size}KB')
    else:
        print(f'MISS {s}: --')
        miss += 1

print(f'Total: {done}/17 done, {miss} missing')