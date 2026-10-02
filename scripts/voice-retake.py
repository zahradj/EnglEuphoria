#!/usr/bin/env python3
"""Re-take picker for one- and two-word clips with a wrong vowel.

For every short clip the sound-level audit flags (docs/voice-audit/phonemes.json:
a wrong vowel fits the audio clearly better than the right one), record several
candidate takes through the temporary `voice-audit` edge function — English-only
models with and without the dictionary pronunciation tag, different seeds — score
each with the same forced-choice vowel check as the audit, and keep the take that
fits the right pronunciation best (only if it beats the current clip).

Writes the winning takes over public/audio-cache/<file> (same file name, so the
app picks them up) and a log to docs/voice-audit/retakes.json.
"""
import base64, importlib.util, json, os, re, sys, time, urllib.request
import torch
from phonemizer import phonemize
from phonemizer.separator import Separator

spec = importlib.util.spec_from_file_location('audit', 'scripts/voice-phoneme-audit.py')
audit = importlib.util.module_from_spec(spec); spec.loader.exec_module(audit)


FN = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/voice-audit'
ANON = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s')
TOKEN = os.environ['AUDIT_TOKEN']
# Mirrors unit1/audio.ts VOICE_ID (approved voices).
VOICE_ID = {'pip': 'MF3mGyEYCl7XYWbV9V6O', 'mia': 'cgSgspJ2msm6clMCkdW9', 'bella': 'XrExE9yKIg1WjnnlVkGX',
            'willow': 'piTKgcLEGmPE4e6mEKli', 'leo': 'TX3LPaxmHKxFdv7VOQHJ', 'teacher': 'jsCqWAovK2LkecY7zXl4',
            'narrator': 'jsCqWAovK2LkecY7zXl4'}
ARPABET = dict(re.findall(r"^\s+\"?([a-z']+)\"?: '([A-Z0-9 ]+)',$", open('src/lib/pronunciations.ts').read(), re.M))
# Normal American variants, not errors (cot-caught merger, "carrot" /kɛɹət/ ...).
BENIGN = [('ɔː', 'ɑː'), ('kæɹət', 'ɛ'), ('ɡʊdbaɪ', 'ʌ'), ('tuːzdeɪ', 'iː')]
OUT = 'docs/voice-audit'


def with_phonemes(text):
    return re.sub(r"[A-Za-z][A-Za-z']*", lambda m: (f'<phoneme alphabet="cmu-arpabet" ph="{ARPABET[m.group(0).lower()]}">{m.group(0)}</phoneme>'
                                                    if m.group(0).lower() in ARPABET else m.group(0)), text)


def candidates(text, voice):
    ph = with_phonemes(text)
    c = []
    for seed in (11, 22, 33):
        c.append({'text': ph, 'model': 'eleven_turbo_v2', 'seed': seed})
    for seed in (11, 22):
        c.append({'text': ph, 'model': 'eleven_flash_v2', 'seed': seed})
    c.append({'text': text, 'model': 'eleven_turbo_v2', 'seed': 11})
    c.append({'text': ph, 'model': 'eleven_turbo_v2', 'seed': 44, 'stability': 0.75})
    c.append({'text': text, 'model': 'eleven_turbo_v2_5', 'lang': True, 'seed': 11})
    for x in c:
        x['voiceId'] = voice
    return c


def synth(batch):
    req = urllib.request.Request(FN, data=json.dumps({'token': TOKEN, 'tts_audio': batch}).encode(),
                                 headers={'Content-Type': 'application/json', 'apikey': ANON, 'Authorization': f'Bearer {ANON}'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())['results']
        except Exception as e:  # noqa: BLE001
            print('synth retry', attempt, e, flush=True); time.sleep(5 * (attempt + 1))
    return []


def main():
    rows = [r for r in json.load(open(f'{OUT}/phonemes.json')) if r.get('altMargin') is not None and r.get('words', 9) <= 2]
    def benign(r):
        return any(k in r['expected'] and v in (r.get('bestAlternative') or '') for k, v in BENIGN)
    todo = [r for r in rows if r['altMargin'] > 1.5 and not benign(r)]
    manifest = {c['file']: c for c in json.load(open(f'{OUT}/manifest.json'))}
    print(f'{len(todo)} clips to re-take', flush=True)
    proc = audit.AutoProcessor.from_pretrained(audit.MODEL)
    model = audit.AutoModelForCTC.from_pretrained(audit.MODEL).eval()

    def score(path_or_bytes, tokens):
        if isinstance(path_or_bytes, bytes):
            tmp = '/tmp/take.mp3'; open(tmp, 'wb').write(path_or_bytes); path_or_bytes = tmp
        audio = audit.load(path_or_bytes)
        with torch.no_grad():
            logits = model(proc(audio, sampling_rate=16000, return_tensors='pt').input_values).logits
        alt, margin = audit.forced_choice(logits, proc.tokenizer, tokens)
        return margin if margin is not None else 99.0, alt

    log = []
    for r in todo:
        clip = manifest.get(r['file'])
        if not clip or clip['character'] not in VOICE_ID:
            continue
        synth_text = clip.get('synth') or clip['text']
        tok = phonemize([synth_text], language='en-us', backend='espeak', strip=True, with_stress=False,
                        preserve_punctuation=False, separator=Separator(phone=' ', word=' | '))[0]
        tokens = [t for t in tok.split() if t != '|']
        path = f"public/audio-cache/{r['file']}"
        cur, _ = score(path, tokens)
        best = (cur, None, None)
        cands = candidates(synth_text, VOICE_ID[clip['character']])
        takes = []
        for i in range(0, len(cands), 4):
            takes += synth(cands[i:i + 4])
        for t in takes:
            if not t.get('audio'):
                continue
            data = base64.b64decode(t['audio'])
            m, alt = score(data, tokens)
            if m < best[0]:
                best = (m, data, {k: t[k] for k in ('model', 'seed') if k in t} | {'phonemes': '<phoneme' in t['text']})
        entry = {'file': r['file'], 'voice': clip['character'], 'text': clip['text'], 'before': cur, 'after': best[0], 'take': best[2]}
        if best[1] is not None and best[0] < cur - 0.5:
            open(path, 'wb').write(best[1])
            entry['replaced'] = True
        log.append(entry)
        print(json.dumps(entry, ensure_ascii=False), flush=True)
    json.dump(log, open(f'{OUT}/retakes.json', 'w'), ensure_ascii=False, indent=1)
    print(f"replaced {sum(1 for e in log if e.get('replaced'))} of {len(log)}")


if __name__ == '__main__':
    sys.exit(main())
