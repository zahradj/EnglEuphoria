#!/usr/bin/env python3
"""Sound-level pronunciation audit of every baked voice clip.

Word transcription (voice-audit-run.mjs) cannot judge one short word: a speech
recogniser guesses the most likely WORD, so "hat" said as "hot" may still come
back as "hat" (or vice versa). This audit listens to the SOUNDS instead:
a phoneme recogniser (wav2vec2 trained on espeak IPA) writes down what the
clip actually says, e.g. /hɑt/, and we compare it with the dictionary
pronunciation of the text (espeak-ng, General American), e.g. /hæt/.

Input:  docs/voice-audit/manifest.json (generate-voice-cache.mjs --manifest)
Output: docs/voice-audit/phonemes.json, every clip with expected/heard IPA,
        phoneme error rate (per) and vowel mismatches, worst first.
"""
import json, subprocess, sys, unicodedata
import numpy as np
import torch
from transformers import AutoProcessor, AutoModelForCTC
from phonemizer import phonemize
from phonemizer.separator import Separator

OUT = 'docs/voice-audit'
MODEL = 'facebook/wav2vec2-lv-60-espeak-cv-ft'

# Fold symbols that are the same sound for our purpose (allophones, notation),
# but keep the vowel contrasts we teach (æ vs ɑ, ɪ vs i, ʊ vs u, ɛ vs æ ...).
FOLD = [('ɚ', 'əɹ'), ('ɝ', 'ɜɹ'), ('ɐ', 'ə'), ('ʌ', 'ə'), ('ᵻ', 'ɪ'), ('ɾ', 't'), ('ɡ', 'g'),
        ('r', 'ɹ'), ('ɫ', 'l'), ('ʔ', 't'), ('oʊ', 'o'), ('eɪ', 'e'), ('ɔ', 'ɑ'), ('ɒ', 'ɑ'), ('ɜ', 'ə')]
DROP = set('ˈˌː. |‿-')
VOWELS = set('aeiouæɑɒɔəɛɜɪʊʌɐᵻ')


def fold(ipa: str) -> list[str]:
    s = unicodedata.normalize('NFC', ipa)
    for a, b in FOLD:
        s = s.replace(a, b)
    return [c for c in s if c not in DROP and not c.isspace()]


def edits(a, b):
    d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev = cur
    return d[-1]


# Forced choice for one- and two-word lines: free decoding drifts into other
# languages on a lone syllable, so instead score the right pronunciation
# against the same word with each other vowel ("hat" /hæt/ vs /hɑt/, /hɛt/,
# /hʌt/, /hɪt/ ...) and see which one the audio fits best (CTC loss).
CHOICE_VOWELS = ['æ', 'ɑː', 'ɛ', 'ʌ', 'ɪ', 'iː', 'ɔː', 'ʊ', 'uː', 'eɪ', 'oʊ', 'a']


def forced_choice(model_logits, tokenizer, phones):
    """phones: espeak tokens of the expected line. Returns (best_alt, margin)
    where margin > 0 means an alternative fits the audio better than expected."""
    vocab = tokenizer.get_vocab()
    if any(p not in vocab for p in phones):
        return None, None
    log_probs = model_logits.log_softmax(-1).transpose(0, 1)  # (T, 1, C)
    T = log_probs.shape[0]
    blank = tokenizer.pad_token_id

    def loss(seq):
        if any(p not in vocab for p in seq) or len(seq) > T:
            return float('inf')
        tgt = torch.tensor([[vocab[p] for p in seq]])
        return torch.nn.functional.ctc_loss(log_probs, tgt, torch.tensor([T]), torch.tensor([len(seq)]),
                                            blank=blank, reduction='sum', zero_infinity=True).item()

    base = loss(phones)
    best, best_loss = None, base
    for i, p in enumerate(phones):
        if p not in CHOICE_VOWELS:
            continue
        for v in CHOICE_VOWELS:
            if v == p:
                continue
            alt = phones[:i] + [v] + phones[i + 1:]
            l = loss(alt)
            if l < best_loss:
                best, best_loss = ' '.join(alt), l
    return best, round(base - best_loss, 2)


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main():
    manifest = [c for c in json.load(open(f'{OUT}/manifest.json')) if c.get('exists')]
    seen, clips = set(), []
    for c in manifest:
        if c['file'] not in seen:
            seen.add(c['file']); clips.append(c)
    texts = [c.get('synth') or c['text'] for c in clips]
    expected = phonemize(texts, language='en-us', backend='espeak', strip=True, with_stress=False,
                         preserve_punctuation=False, separator=Separator(phone='', word=' '), njobs=4)
    tokens = phonemize(texts, language='en-us', backend='espeak', strip=True, with_stress=False,
                       preserve_punctuation=False, separator=Separator(phone=' ', word=' '), njobs=4)
    proc = AutoProcessor.from_pretrained(MODEL)
    model = AutoModelForCTC.from_pretrained(MODEL).eval()
    torch.set_num_threads(4)
    out = []
    for n, (c, exp, tok) in enumerate(zip(clips, expected, tokens)):
        try:
            audio = load(f"public/audio-cache/{c['file']}")
            with torch.no_grad():
                logits = model(proc(audio, sampling_rate=16000, return_tensors='pt').input_values).logits
            heard = proc.batch_decode(torch.argmax(logits, dim=-1))[0]
        except Exception as e:  # noqa: BLE001
            out.append({**c, 'error': str(e)}); continue
        e, h = fold(exp), fold(heard)
        alt, margin = (None, None)
        if len(exp.split()) <= 2:
            alt, margin = forced_choice(logits, proc.tokenizer, tok.split())
        ev, hv = [x for x in e if x in VOWELS], [x for x in h if x in VOWELS]
        out.append({
            'file': c['file'], 'voice': c['character'], 'text': c['text'], 'expected': exp, 'heard': heard,
            'per': round(edits(e, h) / max(1, len(e)), 3),
            'vowelMismatch': ev != hv, 'words': len(exp.split()),
            'bestAlternative': alt, 'altMargin': margin,
        })
        if n % 100 == 0:
            print(f'{n}/{len(clips)}', flush=True)
    out.sort(key=lambda r: (-(r.get('per') or 0)))
    json.dump(out, open(f'{OUT}/phonemes.json', 'w'), ensure_ascii=False, indent=1)
    bad = [r for r in out if r.get('per', 0) >= 0.34 or (r.get('altMargin') or 0) > 1.0]
    print(f'{len(out)} clips checked; {len(bad)} flagged')


if __name__ == '__main__':
    sys.exit(main())
