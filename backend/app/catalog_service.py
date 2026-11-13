"""Load and query the component catalog from JSON seed files."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from backend.app.catalog_schemas import Category, Component, Platform


def _catalog_dir() -> Path:
    here = Path(__file__).resolve()
    candidates = [
        here.parents[2] / "catalog",
        here.parents[3] / "catalog",
        Path.cwd() / "catalog",
        here.parent.parent / "data" / "catalog",
    ]
    for p in candidates:
        if (p / "components.json").exists() or (p / "components_part1.json").exists():
            return p
    return candidates[0]


def _load_json_list(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def _load_all() -> tuple[list[dict], list[dict], list[dict]]:
    base = _catalog_dir()
    cats = _load_json_list(base / "categories.json")
    plats = _load_json_list(base / "platforms.json")
    comps = _load_json_list(base / "components.json")
    if not comps:
        comps = _load_json_list(base / "components_part1.json") + _load_json_list(
            base / "components_part2.json"
        )
    return cats, plats, comps


def list_categories() -> list[Category]:
    cats, _, _ = _load_all()
    return [Category.model_validate(c) for c in cats]


def list_platforms() -> list[Platform]:
    _, plats, _ = _load_all()
    return [Platform.model_validate(p) for p in plats]


def list_components(
    q: str | None = None,
    category_id: str | None = None,
    platform_id: str | None = None,
    kind: str | None = None,
    tag: str | None = None,
) -> list[Component]:
    _, _, comps = _load_all()
    results: list[Component] = []
    q_norm = (q or "").strip().lower()
    for raw in comps:
        if category_id:
            cid = str(raw.get("category_id", ""))
            if cid != category_id and not cid.startswith(category_id):
                continue
        if platform_id and platform_id not in raw.get("compatible_platforms", []):
            continue
        if kind and raw.get("component_kind") != kind:
            continue
        if tag and tag not in raw.get("tags", []):
            continue
        if q_norm:
            blob = " ".join([
                str(raw.get("id", "")),
                str(raw.get("name_fa", "")),
                str(raw.get("name_en", "")),
                " ".join(raw.get("tags", [])),
                str(raw.get("description_fa", "")),
            ]).lower()
            if q_norm not in blob:
                continue
        results.append(Component.model_validate(raw))
    return results


def get_component(component_id: str) -> Component | None:
    _, _, comps = _load_all()
    for raw in comps:
        if raw.get("id") == component_id:
            return Component.model_validate(raw)
    return None
