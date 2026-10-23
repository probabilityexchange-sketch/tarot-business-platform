import html
import json
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).parent
base = (ROOT / "letters-from-kali-01.html").read_text()
letters = json.loads((ROOT / "new-letters.json").read_text())

class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, value):
        if value.strip():
            self.parts.append(value.strip())

def paragraph(value):
    return f'<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.75;color:#494048">{html.escape(value)}</p>'

for letter in letters:
    body = letter["body"]
    start = body.index(letter["promptStart"])
    end = body.index(letter["promptEnd"])
    content = ""
    index = 0
    while index < len(body):
        if index == start:
            prompts = "".join(paragraph(value) for value in body[start:end + 1])
            content += f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;background:#efe5d6;border-left:3px solid #744b65"><tr><td style="padding:24px"><p style="margin:0 0 16px;font:11px Arial,sans-serif;letter-spacing:2px;color:#744b65">A MOMENT ON THE PAGE</p>{prompts}</td></tr></table>'
            index = end + 1
        else:
            value = body[index]
            content += f'<p style="margin:28px 0;font:italic 26px/1.4 Georgia,serif;color:#653c56">{html.escape(value)}</p>' if value == letter["emphasis"] else paragraph(value)
            index += 1
    if letter.get("link"):
        link = letter["link"]
        content += f'<p style="margin:26px 0"><a href="{html.escape(link["url"], quote=True)}" style="font:16px Arial,sans-serif;color:#653c56;text-decoration:underline">{html.escape(link["label"])}</a></p>'
    content += '<p style="margin:30px 0 0;font:italic 30px Georgia,serif;color:#653c56">Kali</p>'
    document = re.sub(r"<title>.*?</title>", lambda _: f'<title>{html.escape(letter["subject"])}</title>', base)
    document = re.sub(r'(<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">).*?(</div>)', lambda m: m[1] + html.escape(letter["preheader"]) + m[2], document)
    document = document.replace("ON DISCERNMENT · LETTER 01", html.escape(letter["label"]))
    document = re.sub(r'(<h1 class="title"[^>]*>).*?(</h1>)', lambda m: m[1] + html.escape(letter["title"]) + m[2], document)
    body_open = '<tr><td class="letter" style="padding:0 48px 40px">'
    footer_open = '<tr><td class="letter" style="padding:26px 48px;'
    body_at = document.index(body_open) + len(body_open)
    footer_at = document.index(footer_open, body_at)
    document = document[:body_at] + content + '</td></tr>\n' + document[footer_at:]
    verify = Text()
    verify.feed(document)
    assert all(value in verify.parts for value in body)
    assert verify.parts.count("Kali") == 1, "Old letter content remained in the new draft"
    assert "{{ unsubscribe }}" in document
    assert letter["title"] in html.unescape(document)
    (ROOT / f'letters-from-kali-{letter["slug"]}.html').write_text(document)
    (ROOT / f'letters-from-kali-{letter["slug"]}.txt').write_text("\n\n".join(body + ["Kali"]))
    print(f'Generated {letter["slug"]}: {len(body)} paragraphs verified')

cards = "".join(f'<li style="margin:18px 0"><a style="color:#653c56" href="letters-from-kali-{letter["slug"]}.html">{html.escape(letter["subject"])}</a><p style="margin:6px 0;color:#655b61">{html.escape(letter["preheader"])}</p></li>' for letter in letters)
(ROOT / "new-letters-preview.html").write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Letters from Kali drafts</title></head><body style="margin:0;background:#f5f0e8;color:#302731;font:17px/1.6 Arial,sans-serif"><main style="max-width:760px;padding:40px 24px;margin:auto"><p style="color:#744b65;font-size:12px;letter-spacing:2px">FIVE NEW DRAFTS · FOR KALI TO REVIEW</p><h1 style="font:38px Georgia,serif;color:#653c56">Letters from Kali</h1><p>Three new discernment letters, a welcome email, and an April 2027 North Georgia retreat-interest draft.</p><ul style="padding-left:24px">{cards}</ul></main></body></html>')
