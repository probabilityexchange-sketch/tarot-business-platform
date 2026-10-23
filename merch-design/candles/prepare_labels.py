import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageDraw
import cairosvg
import vtracer

root = Path(__file__).parent
manifest = json.loads((root / "label-manifest.json").read_text())
ET.register_namespace("", "http://www.w3.org/2000/svg")
ns = "{http://www.w3.org/2000/svg}"
for item in manifest:
    name = item["id"]
    source = Path(item["source"])
    shutil.copy2(source, root / f"{name}-flat-source.png")
    image = Image.open(source).convert("RGB")
    mask = image.convert("L").point(lambda value: 0 if value < 130 else 255).convert("RGB")
    temporary = Path("/tmp") / f"kali-candle-{name}.png"
    mask.save(temporary)
    traced = Path("/tmp") / f"kali-candle-{name}.svg"
    vtracer.convert_image_to_svg_py(str(temporary), str(traced), colormode="binary",
        mode="spline", filter_speckle=4, corner_threshold=60, length_threshold=3.0,
        max_iterations=10, splice_threshold=45, path_precision=3)
    svg = ET.Element(ns + "svg", {"width":"900", "height":"600", "viewBox":"0 0 900 600"})
    ET.SubElement(svg, ns + "rect", {"width":"900", "height":"600", "fill":"#fcf9f4"})
    w,h = image.size
    group = ET.SubElement(svg, ns + "g", {"transform":f"translate(18 12) scale({864/w} {576/h})"})
    for node in ET.parse(traced).getroot():
        if node.tag == ns + "path":
            node.set("fill", "#653c56")
            group.append(node)
    out = root / f"{name}-label-9oz.svg"
    ET.ElementTree(svg).write(out, encoding="unicode")
    cairosvg.svg2png(url=str(out), write_to=str(root/f"{name}-label-review.png"), output_width=900)
    print(name, out.stat().st_size)

sheet = Image.new("RGB", (1200, 900), "#e8dedf")
draw = ImageDraw.Draw(sheet)
for i,item in enumerate(manifest):
    image = Image.open(root/f"{item['id']}-label-review.png").convert("RGB")
    image.thumbnail((560,250))
    x=(i%2)*600+20; y=(i//2)*300+25
    draw.text((x,y-18),item["title"],fill="#653c56")
    sheet.paste(image,(x,y))
sheet.save(root/"six-labels-review.jpg",quality=92)
