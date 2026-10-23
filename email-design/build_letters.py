import html
import json
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).parent
LETTERS = [
    (1, "01", "A writing practice for exploring intuition, fear, and what we want to believe.", "Try finishing these four sentences:", "What I can actually check is…", "You can listen to yourself and still ask questions."),
    (3, "02", "A writing practice to explore what fear is responding to—and what you need next.", "Take a page and write:", "What would help me understand this better?", "Both can be thoughtful choices."),
    (4, "03", "A writing practice to explore desire, certainty, and the room to change your mind.", "Choose a question you’re sitting with and write:", "What remains uncertain?", "I’m noticing something, and I’m still learning what it means."),
]

class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ("style", "script", "head"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("style", "script", "head"):
            self.skip -= 1

    def handle_data(self, value):
        value = value.strip()
        if not self.skip and value and value != "\u00ad":
            self.parts.append(value)

def paragraph(text):
    return f'<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.75;color:#494048">{html.escape(text)}</p>'

for template_id, number, preheader, prompt_start, prompt_end, emphasis in LETTERS:
    source = json.loads((ROOT / "brevo-backup" / f"template-{template_id}.json").read_text())
    parser = Text()
    parser.feed(source["htmlContent"])
    parts = parser.parts
    title = parts[1]
    signature = parts.index("Kali", 2)
    body = parts[2:signature]
    footer = parts[signature + 1:]
    start, end = body.index(prompt_start), body.index(prompt_end)
    content = ""
    index = 0
    while index < len(body):
        text = body[index]
        if index == start:
            prompts = "".join(paragraph(value) for value in body[start:end + 1])
            content += f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;background:#efe5d6;border-left:3px solid #744b65"><tr><td style="padding:24px"><p style="margin:0 0 16px;font:11px Arial,sans-serif;letter-spacing:2px;color:#744b65">A MOMENT ON THE PAGE</p>{prompts}</td></tr></table>'
            index = end + 1
        else:
            content += f'<p style="margin:28px 0;font:italic 26px/1.4 Georgia,serif;color:#653c56">{html.escape(text)}</p>' if text == emphasis else paragraph(text)
            index += 1
    footer_text = "".join(f'<p style="margin:0 0 6px">{html.escape(value)}</p>' for value in footer if value != "Unsubscribe")
    document = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(source["subject"])}</title><style>@media only screen and (max-width:620px){{.letter{{padding-left:24px!important;padding-right:24px!important}}.title{{font-size:32px!important}}.outer{{padding:16px 8px!important}}}}</style></head>
<body style="margin:0;background:#e8dedf;color:#302731"><div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">{html.escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8dedf"><tr><td class="outer" align="center" style="padding:40px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fcf9f4;border-collapse:collapse">
<tr><td style="height:6px;background:#653c56;font-size:0">&nbsp;</td></tr>
<tr><td class="letter" style="padding:40px 48px 24px"><p style="margin:0 0 12px;font:11px Arial,sans-serif;letter-spacing:2px;color:#744b65">WRITING · TAROT · SPIRITUAL REFLECTION</p><p style="margin:0;font:32px/1.2 Georgia,serif;color:#302731">Letters from Kali</p><div style="height:1px;background:#d9ccd2;margin:24px 0 28px"></div><p style="margin:0 0 14px;font:11px Arial,sans-serif;letter-spacing:2px;color:#744b65">ON DISCERNMENT · LETTER {number}</p><h1 class="title" style="margin:0;font:normal 38px/1.15 Georgia,serif;color:#653c56">{html.escape(title)}</h1></td></tr>
<tr><td class="letter" style="padding:0 48px 40px">{content}<p style="margin:30px 0 0;font:italic 30px Georgia,serif;color:#653c56">Kali</p></td></tr>
<tr><td class="letter" style="padding:26px 48px;background:#f5f0e8;border-top:1px solid #d9ccd2;text-align:center;font:12px/1.8 Arial,sans-serif;color:#655b61">{footer_text}<p style="margin:12px 0 0"><a href="{{{{ unsubscribe }}}}" style="color:#653c56;text-decoration:underline">Unsubscribe</a></p></td></tr>
</table></td></tr></table></body></html>'''
    verify = Text()
    verify.feed(document)
    assert all(value in verify.parts for value in body), "Saved wording was changed"
    assert "{{ unsubscribe }}" in document
    (ROOT / f"letters-from-kali-{number}.html").write_text(document)
    (ROOT / f"letters-from-kali-{number}.txt").write_text("\n\n".join(body + ["Kali"]))
    print(f"Generated letter {number}: preserved {len(body)} body paragraphs and existing footer details")
