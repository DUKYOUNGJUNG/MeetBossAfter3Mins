#!/usr/bin/env python3
"""
컷씬 이미지 일괄 생성 스크립트 (OpenAI DALL-E 3)
사용법: OPENAI_API_KEY=sk-xxx python3 tools/generate_cutscenes.py
"""

import os
import sys
import requests
from pathlib import Path

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    print("❌ OPENAI_API_KEY 환경변수를 설정해주세요.")
    print("   export OPENAI_API_KEY=sk-...")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "cutscenes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 공통 스타일 프리픽스 (실루엣 스타일)
STYLE_PREFIX = "Dark silhouette art style, backlit, atmospheric, 2D game cutscene, minimalist, dramatic lighting, "

# 컷씬 프롬프트 목록
CUTSCENES = {
    # 오프닝
    "opening_01_city": STYLE_PREFIX + "night cityscape, person walking alone on street, neon lights in distance, lonely atmosphere",
    "opening_02_building": STYLE_PREFIX + "person entering a building at night, warm light from inside, dark street",
    "opening_03_party": STYLE_PREFIX + "birthday party scene, silhouettes of friends, cake with candles, warm interior",
    "opening_04_bathroom": STYLE_PREFIX + "person alone in bathroom, mirror with fog, fluorescent light, eerie atmosphere",
    "opening_05_midnight": STYLE_PREFIX + "digital clock showing 00:00:00, white flash, reality distortion, horror",

    # 노멀 클리어
    "normal_1_ancient": STYLE_PREFIX + "ancient noble mansion on hill, peasants in chains walking below, sunset, oppression",
    "normal_2_medieval": STYLE_PREFIX + "dark medieval alley at night, lone cloaked figure walking away into fog, cobblestone street, ominous mood",
    "normal_3_modern_edu": STYLE_PREFIX + "bright room, child's colorful drawing on table, adult hand reaching toward it, shadow falling over the drawing",
    "normal_4_experiment": STYLE_PREFIX + "white sterile room, person strapped to bed, doctors with clipboards watching, cold fluorescent light",
    "normal_5_facility": STYLE_PREFIX + "futuristic containment pod, person inside with eyes open, blue light, workers passing by ignoring",

    # 엔딩 A
    "ending_a_01_bathroom": STYLE_PREFIX + "bathroom mirror with fog slowly clearing, fluorescent light, eerie",
    "ending_a_02_face": STYLE_PREFIX + "mirror reflection showing different face than the viewer, sinister smile, cracking mirror",

    # 레드 클리어
    "red_1_birth": STYLE_PREFIX + "warm small room, newborn baby, mother looking down with tears of joy, gentle light",
    "red_2_sacrifice": STYLE_PREFIX + "silhouette of person emerging from bright flames carrying something precious, heroic but tragic, nobody waiting outside",
    "red_3_captive": STYLE_PREFIX + "dark room seen from low angle, shadowy figures standing in circle looking down, cold expressions, oppressive atmosphere",
    "red_4_execution": STYLE_PREFIX + "person sitting alone in dark room, single light from above, overwhelming loneliness, someone standing casually in doorway ignoring them",
    "red_5_escape": STYLE_PREFIX + "containment pod cracking from inside, red glowing eyes, alarms, people running",

    # 엔딩 B
    "ending_b_question": STYLE_PREFIX + "two silhouettes facing each other in void, one with ancient eyes in young face",

    # 진레드
    "true_red_1_death": STYLE_PREFIX + "same silhouette figure repeated infinitely in mirror-like reflections, each slightly different, time loop feeling, existential dread",
    "true_red_2_clan": STYLE_PREFIX + "different clan symbol, same persecution, different era same fate, hopelessness",
    "true_red_3_prison": STYLE_PREFIX + "figure searching through corridors, empty rooms, cannot find what looking for, despair",
    "true_red_4_collapse": STYLE_PREFIX + "time distortion event, reality cracking, figure reaching toward unreachable light",
    "true_red_5_city": STYLE_PREFIX + "same night cityscape as opening, but from different perspective, watching someone walk into building",

    # 엔딩 C
    "ending_c_01_sitting": STYLE_PREFIX + "figure sitting down for first time, tired, 3000 years of exhaustion, peaceful resignation",
    "ending_c_02_fade": STYLE_PREFIX + "figure becoming transparent, fading away, peaceful expression, particles dissolving",
    "ending_c_03_birthday": STYLE_PREFIX + "bright birthday party, happy faces, cake, warm light, completely normal and happy, bittersweet",
}


def generate_image(name, prompt):
    output_path = OUTPUT_DIR / f"{name}.png"
    if output_path.exists():
        print(f"⏭️  {name} — 이미 존재, 스킵")
        return

    print(f"🎨 {name} 생성 중...")

    resp = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "dall-e-3",
            "prompt": prompt,
            "n": 1,
            "size": "1792x1024",
            "quality": "standard",
        },
        timeout=120,
    )

    if resp.status_code != 200:
        print(f"❌ {name} 실패: {resp.status_code} {resp.text[:200]}")
        return

    image_url = resp.json()["data"][0]["url"]

    img_resp = requests.get(image_url, timeout=60)
    if img_resp.status_code == 200:
        output_path.write_bytes(img_resp.content)
        print(f"✅ {name} → {output_path}")
    else:
        print(f"❌ {name} 다운로드 실패: {img_resp.status_code}")


def main():
    print(f"📁 출력 폴더: {OUTPUT_DIR}")
    print(f"🔑 API Key: {API_KEY[:8]}...{API_KEY[-4:]}")
    print(f"📋 생성할 이미지: {len(CUTSCENES)}개\n")

    targets = sys.argv[1:] if len(sys.argv) > 1 else list(CUTSCENES.keys())

    for name in targets:
        if name not in CUTSCENES:
            print(f"⚠️  {name} — 프롬프트 없음, 스킵")
            continue
        generate_image(name, CUTSCENES[name])

    print(f"\n🏁 완료! {OUTPUT_DIR} 폴더를 확인하세요.")


if __name__ == "__main__":
    main()
