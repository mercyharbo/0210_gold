import json
from functools import lru_cache
from pathlib import Path


@lru_cache
def nigeria_locations() -> dict[str, list[str]]:
    return json.loads((Path(__file__).parents[1] / "data" / "nigeria_locations.json").read_text(encoding="utf-8"))
