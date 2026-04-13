"""
컷씬 이미지 일괄 생성 스크립트
OpenAI DALL-E API를 사용하여 게임 컷씬 이미지를 일괄 생성합니다.

사용법:
1. OPENAI_API_KEY 환경변수 설정
   export OPENAI_API_KEY="sk-..."
2. 실행
   python tools/generate_cutscenes.py
3. 결과물은 assets/cutscenes/ 폴더에 저장됩니다

프롬프트 수정:
- CUTSCENE_PROMPTS 리스트에서 각 컷씬의 프롬프트를 수정하세요
- 공통 스타일은 STYLE_PREFIX에 정의되어 있습니다
"""

import os
import sys
import json
import time
import urllib.request
from pathlib import Path

# OpenAI API 설정
API_KEY = os.environ.get("OPENAI_API_KEY", "")
API_URL = "https://api.openai.com/v1/images/generations"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "cutscenes"

# 공통 스타일 프리픽스 (실루엣 스타일)
STYLE_PREFIX = "Dark silhouette art style, backlit, atmospheric, 2D game cutscene, minimalist, dramatic lighting, "

# 컷씬 프롬프트 목록
CUTSCENE_PROMPTS = [
    # ==========================================
    # 오프닝
    # ==========================================
    {
        "id": "opening_01_city",
        "prompt": STYLE_PREFIX + "night cityscape, person walking alone on street, neon lights in distance, lonely atmosphere",
        "size": "1792x1024",
    },
    {
        "id": "opening_02_building",
        "prompt": STYLE_PREFIX + "person entering a building at night, warm light from inside, dark street",
        "size": "1792x1024",
    },
    {
        "id": "opening_03_party",
        "prompt": STYLE_PREFIX + "birthday party scene, silhouettes of friends, cake with candles, warm interior",
        "size": "1792x1024",
    },
    {
        "id": "opening_04_bathroom",
        "prompt": STYLE_PREFIX + "person alone in bathroom, mirror with fog, fluorescent light, eerie atmosphere",
        "size": "1792x1024",
    },
    {
        "id": "opening_05_midnight",
        "prompt": STYLE_PREFIX + "digital clock showing 00:00:00, white flash, reality distortion, horror",
        "size": "1792x1024",
    },

    # ==========================================
    # 노멀 클리어 컷씬
    # ==========================================
    {
        "id": "normal_1_ancient",
        "prompt": STYLE_PREFIX + "ancient noble mansion on hill, peasants in chains walking below, sunset, oppression",
        "size": "1792x1024",
    },
    {
        "id": "normal_2_medieval",
        "prompt": STYLE_PREFIX + "dark medieval alley, body on ground, cloaked figure walking away, blood drops",
        "size": "1792x1024",
    },
    {
        "id": "normal_3_modern_edu",
        "prompt": STYLE_PREFIX + "bright room, child's drawing on table, adult hand placing small knife, child's hand hesitating",
        "size": "1792x1024",
    },
    {
        "id": "normal_4_experiment",
        "prompt": STYLE_PREFIX + "white sterile room, person strapped to bed, doctors with clipboards watching, cold fluorescent light",
        "size": "1792x1024",
    },
    {
        "id": "normal_5_facility",
        "prompt": STYLE_PREFIX + "futuristic containment pod, person inside with eyes open, blue light, workers passing by ignoring",
        "size": "1792x1024",
    },

    # ==========================================
    # 엔딩 A (거울)
    # ==========================================
    {
        "id": "ending_a_01_bathroom",
        "prompt": STYLE_PREFIX + "bathroom mirror with fog slowly clearing, fluorescent light, eerie",
        "size": "1792x1024",
    },
    {
        "id": "ending_a_02_face",
        "prompt": STYLE_PREFIX + "mirror reflection showing different face than the viewer, sinister smile, cracking mirror",
        "size": "1792x1024",
    },

    # ==========================================
    # 레드 클리어 컷씬
    # ==========================================
    {
        "id": "red_1_birth",
        "prompt": STYLE_PREFIX + "warm small room, newborn baby, mother looking down with tears of joy, gentle light",
        "size": "1792x1024",
    },
    {
        "id": "red_2_sacrifice",
        "prompt": STYLE_PREFIX + "fire scene, silhouette carrying child out of flames, back burning, nobody coming to help",
        "size": "1792x1024",
    },
    {
        "id": "red_3_captive",
        "prompt": STYLE_PREFIX + "dark room from floor perspective, faces looking down, expressionless, ropes tightening",
        "size": "1792x1024",
    },
    {
        "id": "red_4_execution",
        "prompt": STYLE_PREFIX + "rapid flashing images of weapons, person curled up on floor, someone standing above saying casual words",
        "size": "1792x1024",
    },
    {
        "id": "red_5_escape",
        "prompt": STYLE_PREFIX + "containment pod cracking from inside, red glowing eyes, alarms, people running",
        "size": "1792x1024",
    },

    # ==========================================
    # 엔딩 B
    # ==========================================
    {
        "id": "ending_b_question",
        "prompt": STYLE_PREFIX + "two silhouettes facing each other in void, one with ancient eyes in young face",
        "size": "1792x1024",
    },

    # ==========================================
    # 진레드 컷씬
    # ==========================================
    {
        "id": "true_red_1_death",
        "prompt": STYLE_PREFIX + "countless deaths montage, same person dying over and over, time distortion",
        "size": "1792x1024",
    },
    {
        "id": "true_red_2_clan",
        "prompt": STYLE_PREFIX + "different clan symbol, same persecution, different era same fate, hopelessness",
        "size": "1792x1024",
    },
    {
        "id": "true_red_3_prison",
        "prompt": STYLE_PREFIX + "figure searching through corridors, empty rooms, cannot find what looking for, despair",
        "size": "1792x1024",
    },
    {
        "id": "true_red_4_collapse",
        "prompt": STYLE_PREFIX + "time distortion event, reality cracking, figure reaching toward unreachable light",
        "size": "1792x1024",
    },
    {
        "id": "true_red_5_city",
        "prompt": STYLE_PREFIX + "same night cityscape as opening, but from different perspective, watching someone walk into building",
        "size": "1792x1024",
    },

    # ==========================================
    # 엔딩 C
    # ==========================================
    {
        "id": "ending_c_01_sitting",
        "prompt": STYLE_PREFIX + "figure sitting down for first time, tired, 3000 years of exhaustion, peaceful resignation",
        "size": "1792x1024",
    },
    {
        "id": "ending_c_02_fade",
        "prompt": STYLE_PREFIX + "figure becoming transparent, fading away, peaceful expression, particles dissolving",
        "size": "1792x1024",
    },
    {
        "id": "ending_c_03_birthday",
        "prompt": STYLE_PREFIX + "bright birthday party, happy faces, cake, warm light, completely normal and happy, bittersweet",
        "size": "1792x1024",
    },
]


def generate_image(prompt_data):
    """OpenAI API로 이미지 생성"""
    if not API_KEY:
        print("ERROR: OPENAI_API_KEY 환경변수를 설정하세요.")
        sys.exit(1)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    body = json.dumps({
        "model": "dall-e-3",
        "prompt": prompt_data["prompt"],
        "n": 1,
        "size": prompt_data.get("size", "1792x1024"),
        "quality": "standard",
    }).encode("utf-8")

    req = urllib.request.Request(API_URL, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["data"][0]["url"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"  API 오류: {e.code} - {error_body}")
        return None


def download_image(url, filepath):
    """URL에서 이미지 다운로드"""
    urllib.request.urlretrieve(url, filepath)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"총 {len(CUTSCENE_PROMPTS)}개의 컷씬 이미지를 생성합니다.")
    print(f"출력 폴더: {OUTPUT_DIR}")
    print()

    # 이미 생성된 파일 스킵
    existing = set(f.stem for f in OUTPUT_DIR.glob("*.png"))

    for i, prompt_data in enumerate(CUTSCENE_PROMPTS):
        img_id = prompt_data["id"]

        if img_id in existing:
            print(f"[{i+1}/{len(CUTSCENE_PROMPTS)}] {img_id} — 이미 존재, 스킵")
            continue

        print(f"[{i+1}/{len(CUTSCENE_PROMPTS)}] {img_id} — 생성 중...")

        url = generate_image(prompt_data)
        if url:
            filepath = OUTPUT_DIR / f"{img_id}.png"
            download_image(url, filepath)
            print(f"  저장: {filepath}")
        else:
            print(f"  실패!")

        # API 레이트 리밋 방지
        time.sleep(2)

    print()
    print("완료!")
    print(f"생성된 이미지: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
