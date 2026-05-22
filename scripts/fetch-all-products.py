"""Fetch all SK Organic Farms products into data/all-products.json"""
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "all-products.json"
BASE = "https://www.skorganicfarms.com/collections/all/products.json?limit=250&page="


def parse_price(price_str):
    """Shopify collections API returns prices in rupees (e.g. '900.00')."""
    if not price_str:
        return 0.0
    return float(price_str)


def normalize(product):
    variants = product.get("variants") or []
    prices = [parse_price(v["price"]) for v in variants if v.get("price")]
    compare = [
        parse_price(v["compare_at_price"])
        for v in variants
        if v.get("compare_at_price")
    ]
    price_min = min(prices) if prices else 0
    price_max = max(prices) if prices else 0
    images = product.get("images") or []
    image = images[0]["src"] if images else ""
    image_secondary = images[1]["src"] if len(images) > 1 else None
    in_stock = any(v.get("available") for v in variants) or product.get("available", True)
    on_sale = bool(compare) or any(
        v.get("compare_at_price") for v in variants if v.get("compare_at_price")
    )
    options_count = len(product.get("options") or [])
    variant_count = len(variants)
    has_real_options = options_count > 1 or (
        options_count == 1
        and (product.get("options") or [{}])[0].get("name", "").lower() != "title"
    )
    action = "options" if variant_count > 1 or has_real_options else "add"
    tags = product.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    return {
        "handle": product["handle"],
        "title": product["title"],
        "priceMin": price_min,
        "priceMax": price_max,
        "image": image,
        "imageSecondary": image_secondary,
        "inStock": in_stock,
        "sale": on_sale,
        "action": action,
        "badge": None,
        "url": f"https://www.skorganicfarms.com/products/{product['handle']}",
        "type": product.get("product_type") or "",
        "vendor": product.get("vendor") or "",
        "tags": tags,
    }


def main():
    all_raw = []
    page = 1
    while True:
        url = BASE + str(page)
        print(f"Fetching page {page}...")
        with urllib.request.urlopen(url) as res:
            data = json.loads(res.read().decode("utf-8"))
        batch = data.get("products") or []
        all_raw.extend(batch)
        if len(batch) < 250:
            break
        page += 1

    products = [normalize(p) for p in all_raw]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"count": len(products), "products": products}, f, ensure_ascii=False)

    print(f"Saved {len(products)} products to {OUT}")
    print("Open catalog.html in your browser to view all products.")


if __name__ == "__main__":
    main()
