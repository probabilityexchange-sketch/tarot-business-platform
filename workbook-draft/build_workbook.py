from pathlib import Path
import json, html
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'output/pdf/learning-to-listen-workbook-review.pdf'
DATA = []
def page(section, title, blocks): DATA.append(dict(section=section,title=title,blocks=blocks))
def p(t): return ('p',t)
def q(t): return ('quote',t)
def note(t): return ('note',t)
def field(label,h=90): return ('field',label,h)
def bullets(*items): return ('bullets',list(items))

page('Begin here','A place to listen',[
p('A strong feeling can be a place to begin. It does not have to be the end of the inquiry.'),
p('This workbook invites you to explore what you notice before deciding what it means. Writing gives an impression somewhere to land: a page on which a feeling, a wish, a concern and an observable fact can exist without becoming the same thing.'),
p('Discernment, as used here, is a practice of attending, questioning, checking and revising. It is not a test of whether you are spiritual enough, calm enough or certain enough.'),
p('You may discover that a fear is pointing toward a real concern. You may notice that you want an answer so much that you have stopped asking questions. You may choose a boundary while remaining uncertain about someone else’s intentions.'),
q('You can listen to yourself and still ask questions.'),
p('Begin with an ordinary, manageable question. You do not need to settle the largest question in your life to learn something useful.'),
note('Reflective writing, not a diagnostic tool or a method for proving psychic ability. For consequential decisions involving health, safety, law or money, include verifiable information and appropriate qualified advice. You may pause, skip a prompt or keep your writing private.')])

page('Begin here','Use it in your own time',[
p('There is no schedule to keep and no correct pace. Read the teaching pages, choose the exercises that fit your question, and return when you have something new to consider.'),
bullets('For a first visit: choose one question on page 5, then work through the observation, fear and desire exercises.','For a decision: use the four lenses on page 15 and the decision lab on page 21.','After taking a step: return to pages 22-24 to review what happened.','For an ongoing practice: copy or revisit the check-in on page 26.'),
p('Keep the question small enough to examine. “Can I trust myself?” is a lifetime inquiry. “Do I want to accept this invitation, and what do I need to know first?” gives you something specific to work with.'),
p('Use a notebook for longer answers. The writing spaces in this PDF are fillable in compatible PDF readers, and the pages can also be printed. Save a personal copy before you begin. Some browser PDF viewers handle forms differently; check that your answers remain after saving and reopening.'),
note('Worked situations are hypothetical, not stories about Kali’s clients. No exercise can reliably label a feeling as fear, ego or intuition. You are developing a way to inquire, not a certainty score.'),
q('Leave room on the page for “I don’t know yet.”')])

page('The practice','Four lenses, no verdict',[
p('Fear, ego, desire and intuition can overlap. These words are lenses for writing, not separate boxes into which every experience must fit.'),
p('<b>Fear:</b> what feels threatened, uncertain or potentially costly? Ask what the concern is responding to and what would address it.'),
p('<b>Ego:</b> what image of yourself are you trying to protect? Here, the word means investment in being seen a certain way, not a diagnosis or a bad part of you.'),
p('<b>Desire:</b> what do you want to happen? A wish can be honest and valuable without being evidence that the outcome will happen.'),
p('<b>Intuition:</b> what impression are you noticing before you can fully explain it? Treat the impression as a possibility to explore and compare with what you can observe.'),
p('A calm feeling is not proof of truth. Urgency is not proof of error. Neither bodily intensity nor a spiritual interpretation can establish another person’s motives.'),
q('The useful question is not only “Which voice is this?” It is also “What does this ask me to notice, check or choose?”'),
field('Which lens do I tend to trust immediately? Which do I tend to dismiss?',80)])

page('Your starting point','Choose one question',[
p('Choose an ordinary situation you can explore without forcing an immediate resolution. Write the question in language you could return to a week from now.'),
field('The situation I want to explore is...',75),
field('The question I am actually asking is...',75),
field('What is mine to decide, and what belongs to someone else?',75),
field('What would make this inquiry useful, even if I remain uncertain?',75),
note('If the situation involves immediate danger, give practical safety needs priority. This workbook does not require you to stay in an unsafe situation or test a concern by taking a risk.')])

page('01 / Notice','Observation is not interpretation',[
p('An observation describes something you experienced or could point to. An interpretation explains it. Both belong on the page, but keeping them separate creates room to examine your conclusion.'),
p('<b>Observation:</b> “My friend has not replied to the message I sent yesterday.”<br/><b>Interpretation:</b> “They are angry with me.”<br/><b>Feeling:</b> “I feel unsettled.”<br/><b>Desire:</b> “I want reassurance that we are okay.”'),
p('The interpretation may be right, partly right or wrong. The observation alone does not settle it. Other possibilities include a busy day, a missed notification or a wish to respond later.'),
p('Watch for words such as always, obviously, everyone and definitely. They can signal that an explanation has begun to feel like a fact. You do not have to ban those words; simply ask what supports them.'),
bullets('What happened, in the most specific language I can use?','What did I feel or notice in myself?','What explanation did I add?','What other explanation still fits the available facts?'),
q('A sentence can feel convincing before it has been checked.')])

page('01 / Write','What happened / what I added',[
p('Use your chosen question. Give each part its own space. Describe another person’s observable actions without claiming to know their inner experience.'),
field('What I observed or experienced...',90),
field('The meaning I immediately gave it...',90),
field('Another explanation that also fits...',90),
field('What I could check, and what I cannot currently know...',90)])

page('02 / Make space','Notice the body, leave meaning open',[
p('You may notice a tight stomach, an impulse to speak, a wish to leave, or a sudden sense of ease. You can record that experience without making it prove a conclusion.'),
p('Try describing the sensation before naming its cause: “My shoulders lifted” leaves a different kind of space than “My body knows they are lying.” The first is an observation. The second makes a claim that needs examination.'),
p('If you want to pause, look around the room, change your position or put the page aside. You do not need to close your eyes, control your breathing or make yourself calm in order to use this workbook.'),
field('What am I noticing in my body or attention, without explaining it?',95),
field('What was happening just before I noticed it? What else may be relevant?',95),
note('A sensation deserves attention. Its meaning can remain open. If writing about bodily experience is not useful for you, describe the situation or your thoughts instead.')])

page('03 / Fear','What is fear protecting?',[
p('Fear can respond to something happening now, to an anticipated outcome, or to something familiar from an earlier experience. An unfamiliar opportunity can be uncomfortable; a familiar situation can still contain a real risk.'),
p('Rather than asking fear to disappear, ask it to become specific. “This is wrong” can become “I am worried I will be expected to do more than I have agreed to.” The more specific sentence suggests questions about expectations, time and boundaries.'),
p('You do not need to prove courage by overriding a concern. You also do not need to treat every uncomfortable feeling as a final answer.'),
bullets('Name the outcome you are afraid of.','Separate what has happened from what you predict might happen.','Identify information, support or a boundary that would matter.','Consider whether waiting or declining is the appropriate next step.'),
q('An inquiry is useful when it helps you respond to the concern, not merely rename it.'),
p('In the hypothetical invitation example, you might ask for the group size and the expected preparation before answering. A clearer agreement may address the concern. It is also possible that, with more information, you will choose to decline.')])

page('03 / Write','Make the concern specific',[
field('I am afraid that...',80),
field('What I know right now is...',80),
field('What I am predicting, remembering or assuming is...',80),
field('The information, support or boundary that would matter is...',80),
field('My next choice is to ask, wait, decline, or take this small step...',65)])

page('04 / Ego','The image I am protecting',[
p('Perhaps you want to be the capable one, the generous one, the person who always knows, or the person who never needs help. These identities can carry values you care about. They can also make some answers difficult to consider.'),
p('Here, “ego” is a shorthand for investment in a particular image of yourself. It is not an insult, a diagnosis or a reason to distrust every wish you have.'),
p('Notice when the question moves from “What is happening?” to “What would it mean about me if this were happening?” You may be trying to preserve an identity alongside making a practical decision.'),
p('For example, someone who values being helpful may agree before considering their capacity. The value is real. So is the need to ask what help they can sustainably offer.'),
bullets('What do I want this answer to say about me?','What answer would feel embarrassing or disappointing?','Could I remain a person I respect if I changed my mind?'),
q('You can protect a value without protecting an unchanging story about yourself.')])

page('04 / Write','Make room for an honest answer',[
field('The person I feel I should be in this situation is...',85),
field('If I admitted uncertainty or changed my mind, I fear it would mean...',85),
field('The value underneath that image might be...',85),
field('A way to honor that value without pretending certainty is...',85)])

page('05 / Desire','What do I want to be true?',[
p('Desire does not make you dishonest. Wanting a relationship, a creative opportunity or a sense of belonging is part of being human. Discernment asks you to give that wanting a name.'),
p('Consider the difference between “I want this invitation to be right for me” and “The strength of my excitement proves this invitation is right.” The first is an honest wish. The second turns a wish into evidence.'),
p('You do not need to become indifferent before you can think clearly. You can want something and still ask practical questions about it.'),
field('What I most want to happen is...',90),
field('If that does not happen, what disappointment would I need to acknowledge?',90),
field('One fact I have been reluctant to consider is...',75),
q('Name the wish. Let it be a wish. Then return to the question.')])

page('06 / Intuition','An impression, held lightly',[
p('An intuitive impression may arrive before you have an explanation for it. For the purposes of this workbook, you do not have to decide where the impression came from in order to write it down and examine it.'),
p('Try holding it in provisional language: “I am noticing a hesitation” or “I have a sense that another question would help.” This preserves the experience without turning it into a declaration about another person or the future.'),
p('A meaningful impression can still be incomplete. A satisfying coincidence is not, by itself, confirmation of your interpretation. Look at what you can check, and allow a result to change your understanding.'),
field('The impression, in the simplest language I can use...',90),
field('What would support this interpretation? What would challenge it?',90),
field('What can remain uncertain while I decide how to respond?',75)])

page('Bring the lenses together','Four things can be true at once',[
p('You might feel excited, afraid, protective of your image, and intuitively hesitant about the same invitation. You do not have to identify one “pure” voice before you can choose a thoughtful response.'),
field('FEAR / What am I concerned may happen?',75),
field('EGO / What image of myself am I protecting?',75),
field('DESIRE / What do I want to happen?',75),
field('IMPRESSION / What am I noticing before the explanation?',75),
field('When I read these together, the question that deserves attention is...',65)])

page('Worked situation / hypothetical','The flattering invitation',[
p('<b>The situation:</b> Morgan is invited to lead a small writing gathering. The invitation feels exciting, but the organizer asks for an immediate answer and has not explained the schedule or responsibilities.'),
p('<b>Observation:</b> there is an invitation, a request for a quick answer and missing information. “They will take advantage of me” is an interpretation, not an established fact.'),
p('<b>Fear:</b> Morgan worries about agreeing to work they cannot manage.<br/><b>Ego:</b> being invited feels like proof of being a “real writer.”<br/><b>Desire:</b> Morgan wants the gathering to be a good opportunity.<br/><b>Impression:</b> something feels unfinished about saying yes now.'),
p('<b>A discerning response:</b> “Thank you for thinking of me. Before I decide, could you send the schedule, group size and what you would like me to prepare? I can respond after I have reviewed those details.”'),
p('This does not establish the organizer’s motives. It turns an uncertain impression into an appropriate request for information. Morgan can still decline if the terms or timing do not fit.'),
field('What part of Morgan’s situation resembles a question of my own?',90),
note('The point is not that every hesitation means “ask for details.” The response should fit the facts, your capacity and the actual concern.')])

page('Worked situation / hypothetical','The unanswered message',[
p('<b>The situation:</b> Alex sends a personal message to a friend. By the next afternoon there is no reply. Alex has a strong feeling that the friendship is ending.'),
p('<b>Observation:</b> the message has not received a reply. Alex feels unsettled. Neither fact establishes what the friend thinks.'),
p('<b>Possible influences:</b> fear of disconnection, a wish for reassurance, and an investment in being the friend who does not need reassurance. The impression may be worth noticing without treating it as knowledge of someone else’s mind.'),
p('<b>A discerning response:</b> Alex considers the friend’s usual response pattern, waits until an ordinary time to follow up, and asks a direct question if the concern remains. Alex can also decide what level of contact feels workable over time.'),
p('One delayed reply does not prove an ending. A repeated pattern may still matter. Discernment makes room for both the limits of this single observation and what a larger pattern may reveal.'),
field('What might Alex check rather than assume?',85),
field('What can Alex choose without knowing the friend’s private thoughts?',85)])

page('07 / Boundaries','You do not have to prove a motive',[
p('A boundary describes what you will participate in, offer or accept. It does not require a final explanation of someone else’s character.'),
p('“I cannot take this on this month” makes a different claim from “You are trying to drain my energy.” The first can be true on the basis of your capacity. The second claims knowledge about someone else’s intentions.'),
p('A boundary may be quiet or uncomfortable. It may disappoint someone. None of those features, by itself, decides whether the boundary is appropriate.'),
bullets('Name the observable request or situation.','Identify your capacity, preference or limit.','Choose language that states the limit clearly.','Decide what you will do if the request continues.'),
p('<b>Examples to adapt:</b><br/>“I need more time before I answer.”<br/>“I can offer one hour, but I cannot take responsibility for the whole event.”<br/>“I am not available for that conversation today.”'),
q('A limit can stand without a story about why the other person deserves it.')])

page('07 / Write','A boundary I can actually use',[
field('The request or situation, in observable terms...',80),
field('My capacity, preference or limit...',80),
field('The sentence I could say or write...',95),
field('If the request continues, the action I can take is...',80),
note('Adapt the wording to your circumstances. A script is a starting point, not a requirement to confront someone or explain yourself at length.')])

page('08 / Choose a step','Learn without forcing certainty',[
p('Some decisions need a clear answer now. Others allow a question, a pause or a small step that gives you more information. Look for the scale of response that fits the situation.'),
p('A useful learning step has a purpose, a limit and a time to review. “I will try harder to trust myself” is difficult to observe. “I will share one paragraph with a trusted reader and ask what they understood” gives you something concrete to learn from.'),
bullets('What specific question would the step help answer?','How much time, effort or exposure am I choosing?','Can I stop or change course without creating a larger problem?','What result would make me reconsider?','When will I return to review what happened?'),
p('A small step is not always appropriate. Do not create a risky experiment simply to test whether a concern is “really intuition.” Waiting, declining or seeking relevant advice may be the more thoughtful response.'),
q('The next step can be a question. It can also be “not now.”')])

page('08 / Write','My decision lab',[
field('The decision or question...',65),
field('What I know / what I still need to find out...',90),
field('The next step I choose, and what it could help me learn...',90),
field('The limit: what I will not commit to or risk in this step...',65),
field('I will review this on / I will reconsider sooner if...',65)])

page('09 / Return','Changing your mind is part of listening',[
p('An outcome can teach you something without proving that you were either gifted or foolish. Try to review the specific impression, the interpretation and the action separately.'),
p('You may have noticed that an agreement was unclear and then incorrectly assumed bad intent. The useful part of the impression was the need for clarity. Revising the explanation does not erase that observation.'),
p('You may also discover that an impression was mistaken. You can name that plainly. Discernment becomes more useful when there is room for disconfirming information.'),
bullets('What did I notice before the outcome was known?','What did I predict or assume?','What actually happened?','What remains ambiguous?','What can I learn without making this event prove a story about my identity?'),
p('When you return to old notes, read what you wrote at the time rather than rewriting the impression to match the result. Keep “I felt uneasy” separate from a more specific prediction you did not actually make.'),
q('Self-trust can include the willingness to correct yourself.')])

page('09 / Write','An honest review',[
field('The original impression and interpretation, as I recorded them...',85),
field('The action I took and what actually happened...',85),
field('What supported my interpretation? What did not fit?',85),
field('What remains unknown, and what I would do differently next time...',85)])

page('10 / Patterns','Look across more than one moment',[
p('Use this page for brief notes from several separate situations. This is a reflection record, not a score of how intuitive you are. Include missed impressions and ordinary explanations as well as moments that felt meaningful.'),
field('ENTRY 1 / Date, impression, action, outcome, what I learned...',95),
field('ENTRY 2 / Date, impression, action, outcome, what I learned...',95),
field('ENTRY 3 / Date, impression, action, outcome, what I learned...',95),
field('Across these entries, what pattern deserves another question?',85)])

page('Writing & spiritual reflection','Let a symbol ask a question',[
p('If tarot or another symbolic practice is part of your spiritual life, you can use it here as a writing prompt. A card, image or phrase can open a question without serving as evidence about another person or a guarantee of an outcome.'),
p('Choose a card deliberately, draw one if you wish, or select a line from your own writing. You can also skip the symbol and begin with a word such as threshold, belonging or choice.'),
field('The symbol or phrase I am working with...',60),
field('What does it bring to mind? What story am I connecting to it?',85),
field('What useful question does it open? What does it not establish?',85),
field('What observation or practical question will I return to?',65)])

page('Return to this page','A one-page discernment check-in',[
p('Use this page again with a new situation. You may answer in a few sentences rather than a full essay.'),
field('NOTICE / What happened, and what impression arose?',65),
field('SEPARATE / What is observation, and what is interpretation?',65),
field('NAME / What do I fear, want or feel I need to prove?',65),
field('CHECK / What information or conversation would matter?',65),
field('CHOOSE / What boundary, pause or small step fits?',65),
field('RETURN / When will I review this, and what could change my mind?',65)])

page('Carry it forward','A practice that fits your life',[
p('A practice becomes useful when it is small enough to return to. You do not have to write every day or examine every passing feeling. Choose a scale that leaves room for living.'),
field('The question from this workbook I want to keep close...',80),
field('A situation in which I would like to pause before interpreting...',80),
field('A reminder that would help me be honest about uncertainty...',80),
field('The way I want to use these pages again...',80),
q('I am noticing something, and I am still learning what it means.')])

page('A closing invitation','Keep a little room open',[
p('You do not need to leave these pages with a perfect method for identifying every feeling. You can leave with a more specific question, a clearer boundary or a willingness to look again.'),
p('You can respect an impression without obeying it immediately. You can acknowledge fear without letting it make every decision. You can want something deeply and still ask what is true.'),
p('Some questions take time. Some answers change. A listening practice can make room for both.'),
p('Return to the observation. Name the wish. Ask what can be checked. Choose the next step that fits what you know. Then give yourself permission to learn.'),
q('You can listen to yourself and still ask questions.'),
p('<b>Continue with Kali</b><br/>For Letters from Kali and current private online readings, visit <link href="https://kalimeister.com" color="#653c56">kalimeister.com</link>.'),
note('Editorial review copy. The title, wording, examples and exercises are proposed material for Kali Meister to review and shape before publication or sale.')])

for item in DATA:
    if item['title'] == 'A one-page discernment check-in':
        item['blocks'] = [(block[0], block[1], 55) if block[0] == 'field' else block for block in item['blocks']]

# The cover plus these 27 interior pages form the 28-page review edition.
assert len(DATA)==27, len(DATA)
(ROOT/'workbook-draft/content.json').write_text(json.dumps(DATA,ensure_ascii=False,indent=2))

pdfmetrics.registerFont(TTFont('Body','/usr/share/fonts/truetype/lato/Lato-Regular.ttf'))
pdfmetrics.registerFont(TTFont('BodyBold','/usr/share/fonts/truetype/lato/Lato-Bold.ttf'))
pdfmetrics.registerFont(TTFont('BodyItalic','/usr/share/fonts/truetype/lato/Lato-Italic.ttf'))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='BodyBold',italic='BodyItalic',boldItalic='BodyBold')
pdfmetrics.registerFont(TTFont('Display','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DisplayItalic','/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'))
W,H=612,792; L=54; R=558; WIDTH=R-L
PLUM=HexColor('#653c56'); INK=HexColor('#302731'); MUTED=HexColor('#655b61'); SAND=HexColor('#efe5d6'); CREAM=HexColor('#fcf9f4'); RULE=HexColor('#d8c9cc')
STYLES={
'p':ParagraphStyle('body',fontName='Body',fontSize=11.1,leading=16.6,textColor=INK,spaceAfter=12),
'quote':ParagraphStyle('quote',fontName='DisplayItalic',fontSize=17,leading=24,textColor=PLUM,spaceAfter=15),
'note':ParagraphStyle('note',fontName='Body',fontSize=9.2,leading=13.5,textColor=MUTED,spaceAfter=12),
'label':ParagraphStyle('label',fontName='BodyBold',fontSize=10.2,leading=14.5,textColor=PLUM),
}
fields=[]; metrics=[]
c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('Learning to Listen - Discernment Workbook - Editorial Review');c.setAuthor('Prepared for Kali Meister - review draft');c.setSubject('A self-paced writing workbook on discernment, fear, ego, desire and intuition. Editorial draft, not for sale.')
def textblock(text,x,y,width,style):
    para=Paragraph(text.replace('\u2013','-').replace('\u2014','-').replace('\u2011','-'),style)
    _,height=para.wrap(width,700)
    para.drawOn(c,x,y-height)
    return height

def footer(n):
    c.setStrokeColor(RULE);c.setLineWidth(.5);c.line(L,43,R,43)
    c.setFillColor(MUTED);c.setFont('Body',7.8);c.drawString(L,29,'KALI MEISTER  /  EDITORIAL REVIEW DRAFT - NOT FOR SALE')
    c.drawRightString(R,29,f'{n:02d} / 28')

c.setFillColor(CREAM);c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(PLUM);c.rect(0,H-9,W,9,fill=1,stroke=0)
c.setFont('Body',11);c.drawString(L,716,'K A L I   M E I S T E R')
c.setStrokeColor(RULE);c.setLineWidth(1);c.circle(490,363,175,stroke=1,fill=0);c.circle(490,363,145,stroke=1,fill=0)
textblock('Learning<br/>to Listen',L,624,470,ParagraphStyle('cover',fontName='Display',fontSize=48,leading=59,textColor=PLUM))
textblock('A writing workbook for discernment,<br/>fear, ego, desire and intuition',L,447,440,ParagraphStyle('sub',fontName='Body',fontSize=18,leading=26,textColor=INK))
textblock('Notice. Question. Check. Return.',L,271,450,ParagraphStyle('coverq',fontName='DisplayItalic',fontSize=18,leading=26,textColor=PLUM))
textblock('SELF-PACED  /  PRINTABLE + FILLABLE',L,192,450,STYLES['label'])
textblock('Prepared for Kali’s review<br/>October 2026',L,128,440,STYLES['note'])
footer(1);c.showPage()
for idx,item in enumerate(DATA,start=2):
    c.setFillColor(PLUM);c.rect(L,H-54,28,3,fill=1,stroke=0)
    c.setFont('BodyBold',8.5);c.drawString(L,H-77,item['section'].upper())
    y=H-102
    title_style=ParagraphStyle('title',fontName='Display',fontSize=27,leading=34,textColor=INK)
    y-=textblock(html.escape(item['title']),L,y,WIDTH,title_style)+22
    for bi,block in enumerate(item['blocks']):
        kind=block[0]
        if kind=='field':
            label=block[1];h=block[2];label_h=textblock(html.escape(label),L,y,WIDTH,STYLES['label']);y-=label_h+6
            key=f'p{idx:02d}_field_{bi:02d}';fields.append(key)
            c.acroForm.textfield(name=key,tooltip=label,x=L,y=y-h,width=WIDTH,height=h,borderWidth=.6,borderStyle='solid',borderColor=RULE,fillColor=CREAM,textColor=INK,fontName='Helvetica',fontSize=10,fieldFlags='multiline',maxlen=5000,forceBorder=True)
            y-=h+10
        elif kind=='bullets':
            for line in block[1]:
                y-=textblock('- '+html.escape(line),L+7,y,WIDTH-7,STYLES['p'])+8
            y-=5
        elif kind=='quote':
            y-=9
            top=y
            quote_h=textblock(html.escape(block[1]),L+16,y,WIDTH-20,STYLES['quote'])
            c.setStrokeColor(PLUM);c.setLineWidth(2);c.line(L,top,L,top-quote_h)
            y-=quote_h+18
        elif kind=='note':
            y-=5
            y-=textblock(html.escape(block[1]),L,y,WIDTH,STYLES['note'])+13
        else:
            y-=textblock(block[1],L,y,WIDTH,STYLES['p'])+12
    metrics.append({'page':idx,'bottom':round(y,1),'title':item['title']})
    if y<63: raise RuntimeError(f'Page {idx} overflows: bottom={y:.1f}')
    footer(idx);c.showPage()
c.save()
reader=PdfReader(OUT); actual=reader.get_fields() or {}
assert len(reader.pages)==28
assert set(actual)==set(fields)
assert all(str(value.get('/V',''))=='' for value in actual.values())
widgets=[annot.get_object() for page in reader.pages for annot in page.get('/Annots',[]) if annot.get_object().get('/Subtype')=='/Widget']
assert len(widgets)==len(fields)
assert all(widget.get('/AP',{}).get('/N') is not None for widget in widgets)
writer=PdfWriter();writer.clone_document_from_reader(reader)
values={name:'Review test: I can notice an impression and still ask what I can check.' for name in fields}
writer.update_page_form_field_values(None,values,auto_regenerate=False)
test=ROOT/'tmp/pdfs/form-roundtrip-test.pdf'
with test.open('wb') as f:writer.write(f)
roundtrip=PdfReader(test)
assert all(str(value.get('/V',''))==values[name] for name,value in roundtrip.get_fields().items())
for page in roundtrip.pages:
    for ref in page.get('/Annots',[]):
        widget=ref.get_object()
        if widget.get('/Subtype')=='/Widget':
            assert str(widget.get('/V',''))==values[str(widget['/T'])]
            assert widget.get('/AP',{}).get('/N') is not None
(ROOT/'tmp/pdfs/layout-check.json').write_text(json.dumps(metrics,indent=2))
print(json.dumps({'pages':len(reader.pages),'fillable_fields':len(fields),'lowest_content_point':min(x['bottom'] for x in metrics),'output':str(OUT),'form_roundtrip':'passed'}))
