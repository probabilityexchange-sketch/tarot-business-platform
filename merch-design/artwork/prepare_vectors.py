import json
import shutil
from pathlib import Path
from PIL import Image, ImageDraw
import cairosvg
import vtracer

root = Path(__file__).parent
manifest = json.loads((root / "production-manifest.json").read_text())
for item in manifest:
    name = item["id"]
    if item.get("rejected", False):
        continue
    source = Path(item["source"])
    shutil.copy2(source, root / f"{name}-isolated.png")
    image = Image.open(source).convert("RGBA")
    mask = Image.new("RGB", image.size, "white")
    mask.putdata([
        (0, 0, 0) if a >= 160 and g < 130 and r < 180 else (255, 255, 255)
        for r, g, b, a in image.getdata()
    ])
    temporary = Path("/tmp") / f"kali-{name}-trace.png"
    mask.save(temporary)
    output = root / f"{name}-plum.svg"
    vtracer.convert_image_to_svg_py(
        str(temporary), str(output), colormode="binary", mode="spline",
        filter_speckle=4, corner_threshold=60, length_threshold=3.0,
        max_iterations=10, splice_threshold=45, path_precision=3,
    )
    text = output.read_text().replace('fill="#000000"', 'fill="#653c56"')
    output.write_text(text)
    (root / f"{name}-ivory.svg").write_text(text.replace("#653c56", "#f5efdf"))
    cairosvg.svg2png(url=str(output), write_to=str(root / f"{name}-review.png"),
                    output_width=600, background_color="#f5efdf")
    print(name, output.stat().st_size)

reviews = [root / f"{item['id']}-review.png" for item in manifest if not item.get("rejected", False)]
sheet = Image.new("RGB", (1200, ((len(reviews) + 3) // 4) * 360), "#f5efdf")
draw = ImageDraw.Draw(sheet)
for index, path in enumerate(reviews):
    image = Image.open(path).convert("RGB")
    image.thumbnail((280, 325))
    x = (index % 4) * 300
    y = (index // 4) * 360
    sheet.paste(image, (x + (300 - image.width) // 2, y + 25))
    draw.text((x + 10, y + 5), path.stem, fill="#653c56")
sheet.save(root / "zodiac-vector-contact-sheet.jpg", quality=92)
