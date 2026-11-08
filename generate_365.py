"""
Compiles all curated categories, runs combinatorial selection to build 365 daily unique 4x4 puzzles,
and guarantees 100% strictly 16 unique items per puzzle with no overlaps.
Outputs: src/server/data/puzzles.ts
"""

import json
from datetime import datetime, timedelta
from generate_corpus import RAW_CATEGORIES
from category_pool import get_huge_category_pool

# Combine all distinct categories
seen_titles = set()
all_categories = []

for cat in RAW_CATEGORIES + get_huge_category_pool():
    title = cat["title"].strip().upper()
    if title not in seen_titles:
        seen_titles.add(title)
        items = [i.strip().upper() for i in cat["items"]]
        if len(items) == 4 and len(set(items)) == 4:
            all_categories.append({
                "title": title,
                "difficulty": cat["difficulty"],
                "items": items
            })

print(f"Total unique curated categories: {len(all_categories)}")

# Split by difficulty
easy = [c for c in all_categories if c["difficulty"] == "easy"]
medium = [c for c in all_categories if c["difficulty"] == "medium"]
hard = [c for c in all_categories if c["difficulty"] == "hard"]
expert = [c for c in all_categories if c["difficulty"] == "expert"]

print(f"Counts: Easy={len(easy)}, Medium={len(medium)}, Hard={len(hard)}, Expert={len(expert)}")

start_date = datetime(2026, 11, 8)
puzzles = []

for day in range(1, 366):
    puzzle_date = (start_date + timedelta(days=day - 1)).strftime("%Y-%m-%d")
    
    # Base indices
    e_idx = (day * 3 + 1) % len(easy)
    m_idx = (day * 5 + 2) % len(medium)
    h_idx = (day * 7 + 3) % len(hard)
    x_idx = (day * 11 + 4) % len(expert)
    
    selected_cats = None
    
    # Search all 4 tiers for a clean 16-item combination
    found = False
    for e_off in range(20):
        cand_e = easy[(e_idx + e_off) % len(easy)]
        for m_off in range(20):
            cand_m = medium[(m_idx + m_off) % len(medium)]
            if len(set(cand_e["items"]).intersection(set(cand_m["items"]))) > 0:
                continue
            for h_off in range(20):
                cand_h = hard[(h_idx + h_off) % len(hard)]
                if len(set(cand_e["items"] + cand_m["items"]).intersection(set(cand_h["items"]))) > 0:
                    continue
                for x_off in range(20):
                    cand_x = expert[(x_idx + x_off) % len(expert)]
                    combined = cand_e["items"] + cand_m["items"] + cand_h["items"] + cand_x["items"]
                    if len(set(combined)) == 16:
                        selected_cats = [cand_e, cand_m, cand_h, cand_x]
                        found = True
                        break
                if found:
                    break
            if found:
                break
        if found:
            break
            
    assert selected_cats is not None, f"Could not find 16 disjoint items for Day {day}"

    puzzles.append({
        "id": f"puzzle-day-{day}",
        "dayNumber": day,
        "date": puzzle_date,
        "categories": [
            {
                "title": selected_cats[0]["title"],
                "difficulty": "easy",
                "items": selected_cats[0]["items"]
            },
            {
                "title": selected_cats[1]["title"],
                "difficulty": "medium",
                "items": selected_cats[1]["items"]
            },
            {
                "title": selected_cats[2]["title"],
                "difficulty": "hard",
                "items": selected_cats[2]["items"]
            },
            {
                "title": selected_cats[3]["title"],
                "difficulty": "expert",
                "items": selected_cats[3]["items"]
            }
        ]
    })

print(f"Successfully generated {len(puzzles)} puzzles.")

# Validate every single puzzle
for p in puzzles:
    items = [itm for c in p["categories"] for itm in c["items"]]
    assert len(items) == 16, f"Day {p['dayNumber']} does not have 16 items!"
    assert len(set(items)) == 16, f"Day {p['dayNumber']} has duplicate items!"
    assert len(p["categories"]) == 4, f"Day {p['dayNumber']} does not have 4 categories!"

print("PERFECT: ALL 365 PUZZLES ARE 100% DISJOINT AND STRICTLY VALIDATED!")

ts_content = """import { DailyPuzzle } from '../../shared/types.js';

export const SAMPLE_PUZZLES: DailyPuzzle[] = """ + json.dumps(puzzles, indent=2) + ";\n"

with open("c:/Users/peyog/Documents/antigravity/Open Source Projects/daily-reddit-grid/src/server/data/puzzles.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Saved to src/server/data/puzzles.ts")
