export function emailGuide(unsubscribeUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>A little room for discernment</title></head>
<body style="margin:0;background:#f5f0e8;color:#302731;font-family:Arial,sans-serif;line-height:1.7;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:24px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;"><tr><td style="padding:24px;">
<p style="font-size:12px;letter-spacing:2px;color:#744b65;">LETTERS FROM KALI</p>
<h1 style="font-family:Georgia,serif;font-size:36px;line-height:1.2;font-weight:normal;color:#653c56;">A little room<br /><em>for discernment.</em></h1>
<p>Thank you for joining me here. This guide is an invitation to pause, write, and look again. You don’t have to identify every feeling perfectly before taking a thoughtful next step.</p>
<h2 style="font-family:Georgia,serif;font-weight:normal;color:#653c56;">1. Notice the feeling.</h2>
<p>Choose a small decision you’re considering. Write what happened, what you noticed, and what you think it means as three separate sentences. An observation and its interpretation can feel like the same thing until we put them on the page.</p>
<p><em>Try writing: “What I observed was ___. The story I’m telling about it is ___.”</em></p>
<h2 style="font-family:Georgia,serif;font-weight:normal;color:#653c56;">2. Make room for another explanation.</h2>
<p>Fear, self-image, desire and intuition can overlap. Ask what you’re afraid of losing, what you hope will happen, and what information you might be missing. Feeling calm or feeling certain does not, by itself, prove an interpretation true.</p>
<p><em>Try writing: “Another possible explanation is ___. What would help me check it is ___.”</em></p>
<h2 style="font-family:Georgia,serif;font-weight:normal;color:#653c56;">3. Choose one small next step.</h2>
<p>Look for a step you can revisit: ask a question, gather a missing fact, or give yourself time before committing. Then return to your notes. What did you expect? What actually happened? What would you take into the next decision?</p>
<p><em>Try writing: “One small step I can take is ___. I’ll revisit this when ___.”</em></p>
<p>You can return to these questions whenever you need them. Discernment can be a practice of paying attention, rather than a demand to be certain.</p>
<p>Your welcome letter follows, then a weekly series exploring these questions in more depth. If you’d like to share what you noticed, you can reply.</p>
<p style="font-family:Georgia,serif;font-size:24px;font-style:italic;color:#653c56;">Kali</p>
<p><a href="https://kalimeister.com/readings" style="color:#653c56;">Explore a private tarot reading</a></p>
<p style="margin-top:32px;border-top:1px solid #d8c9ce;padding-top:20px;font-size:12px;color:#655b61;">You’re receiving this guide because you confirmed your signup at kalimeister.com. <a href="${unsubscribeUrl}" style="color:#653c56;">Unsubscribe</a><br />Kali Meister · Writing, tarot &amp; spiritual reflection</p>
</td></tr></table></td></tr></table></body></html>`;
}
