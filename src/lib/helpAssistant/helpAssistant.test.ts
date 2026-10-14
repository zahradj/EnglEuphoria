import { describe, expect, it } from 'vitest';
import { ACTION_LABELS, BILLING_EMAIL, HELP_LANGS, HELP_TOPICS, SUPPORT_EMAIL, UI } from './knowledge';
import { matchQuestion, normalize, toHelpLang } from './matcher';

describe('help assistant knowledge base is complete', () => {
  it('has unique topic ids', () => {
    const ids = HELP_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a question, answer and keywords in every language for every topic', () => {
    for (const t of HELP_TOPICS) {
      for (const l of HELP_LANGS) {
        expect(t.q[l]?.trim(), `${t.id}.q.${l}`).toBeTruthy();
        expect(t.a[l]?.trim(), `${t.id}.a.${l}`).toBeTruthy();
        expect(t.keywords[l]?.length, `${t.id}.keywords.${l}`).toBeGreaterThan(0);
      }
    }
  });

  it('has every interface string and action label in every language', () => {
    for (const [key, v] of Object.entries(UI)) for (const l of HELP_LANGS) expect(v[l]?.trim(), `UI.${key}.${l}`).toBeTruthy();
    for (const [key, v] of Object.entries(ACTION_LABELS)) for (const l of HELP_LANGS) expect(v[l]?.trim(), `ACTION.${key}.${l}`).toBeTruthy();
  });

  it('only references known actions', () => {
    for (const t of HELP_TOPICS) for (const a of t.actions ?? []) expect(ACTION_LABELS[a], `${t.id} -> ${a}`).toBeDefined();
  });

  it('offers a sensible set of starter chips', () => {
    const starters = HELP_TOPICS.filter((t) => t.starter);
    expect(starters.length).toBeGreaterThanOrEqual(4);
    expect(starters.length).toBeLessThanOrEqual(6);
  });
});

describe('the 5-day rule is stated the same way everywhere (Refund Policy = 120 hours)', () => {
  for (const id of ['cancel', 'reschedule', 'refund']) {
    it(`${id}: mentions 5 days in every language`, () => {
      const t = HELP_TOPICS.find((x) => x.id === id)!;
      for (const l of HELP_LANGS) expect(t.a[l], `${id}.${l}`).toMatch(/\b5\b/);
    });
  }
  it('refund answer cites 120 hours and the billing address', () => {
    const t = HELP_TOPICS.find((x) => x.id === 'refund')!;
    for (const l of HELP_LANGS) {
      expect(t.a[l]).toContain('120');
      expect(t.a[l]).toContain(BILLING_EMAIL);
    }
  });
  it('never repeats the old, wrong "24 hours" rule', () => {
    for (const t of HELP_TOPICS) for (const l of HELP_LANGS) expect(t.a[l]).not.toMatch(/\b24 ?(hours|heures|horas|saat)\b/i);
  });
  it('uses one support address', () => {
    expect(SUPPORT_EMAIL).toBe('support@engleuphoria.com');
  });
});

describe('normalize', () => {
  it('ignores case, accents, punctuation, Turkish dotted/dotless i and Arabic diacritics', () => {
    expect(normalize('  Annuler ?! ')).toBe('annuler');
    expect(normalize('Réservé')).toBe('reserve');
    expect(normalize('İADE ıı')).toBe('iade ii');
    expect(normalize('إلغاءٌ')).toBe('الغاء');
  });
  it('maps language codes', () => {
    expect(toHelpLang('fr-FR')).toBe('fr');
    expect(toHelpLang('AR')).toBe('ar');
    expect(toHelpLang('de')).toBe('en');
    expect(toHelpLang(undefined)).toBe('en');
  });
});

type Case = [lang: (typeof HELP_LANGS)[number], question: string, expected: string];
const CASES: Case[] = [
  // English
  ['en', 'How do I cancel my class?', 'cancel'],
  ['en', 'I want a refund', 'refund'],
  ['en', 'can I get my money back if I cancel', 'refund'],
  ['en', 'how to reschedule', 'reschedule'],
  ['en', 'I need to change the time of my lesson', 'reschedule'],
  ['en', 'How do I book a lesson with a teacher?', 'book'],
  ['en', 'is the first lesson free', 'trial'],
  ['en', 'how do I pay for lessons', 'buy'],
  ['en', 'how many credits do I have left', 'credits'],
  ['en', 'how long is a lesson', 'length'],
  ['en', 'I can’t hear anything in class', 'tech'],
  ['en', 'where is my homework', 'homework'],
  ['en', 'how do I join my class', 'join'],
  ['en', 'I forgot my password', 'account'],
  ['en', 'how do I add my second child', 'family'],
  ['en', 'thank you', 'hello'],
  ['en', 'can I cancel and get a refund', 'refund'],
  ['fr', 'Puis-je annuler et être remboursé ?', 'refund'],
  ['es', 'quiero cancelar y que me devuelvan el dinero', 'refund'],
  ['en', 'cancel my lesson', 'cancel'],
  ['en', 'I signed up as an individual, can I convert to a family account?', 'convert'],
  ['en', 'how do I add my second child', 'family'],
  ['fr', 'comment passer mon compte individuel en compte famille', 'convert'],
  ['es', 'quiero pasar a cuenta familiar', 'convert'],
  ['tr', 'bireysel hesabımı aile hesabına çevirmek istiyorum', 'convert'],
  ['ar', 'أريد تحويل حسابي إلى حساب عائلة', 'convert'],
  // Français
  ['fr', 'Comment annuler mon cours ?', 'cancel'],
  ['fr', 'Je veux être remboursé', 'refund'],
  ['fr', 'Puis-je reprogrammer mon cours ?', 'reschedule'],
  ['fr', 'Comment réserver un cours', 'book'],
  ['fr', 'Le premier cours est gratuit ?', 'trial'],
  ['fr', 'Combien coûte un pack ?', 'buy'],
  ['fr', 'Mon micro ne marche pas', 'tech'],
  ['fr', 'Où sont mes devoirs ?', 'homework'],
  ['fr', 'comment rejoindre la classe', 'join'],
  ['fr', 'Il me reste combien de crédits ?', 'credits'],
  ['fr', 'j’ai oublié mon mot de passe', 'account'],
  ['fr', 'Bonjour', 'hello'],
  // Español
  ['es', '¿Cómo cancelo una clase?', 'cancel'],
  ['es', 'Quiero un reembolso', 'refund'],
  ['es', 'quiero cambiar la hora de mi clase', 'reschedule'],
  ['es', 'cómo reservo una clase', 'book'],
  ['es', '¿Cuánto dura una clase?', 'length'],
  ['es', 'mi micrófono no funciona', 'tech'],
  ['es', 'dónde están los juegos', 'games'],
  // العربية
  ['ar', 'كيف ألغي درسا؟', 'cancel'],
  ['ar', 'أريد استرداد المبلغ', 'refund'],
  ['ar', 'أريد تغيير الموعد', 'reschedule'],
  ['ar', 'كيف أحجز درسا', 'book'],
  ['ar', 'أين واجباتي', 'homework'],
  ['ar', 'كم مدة الدرس', 'length'],
  // Türkçe
  ['tr', 'Dersi nasıl iptal ederim', 'cancel'],
  ['tr', 'İade istiyorum', 'refund'],
  ['tr', 'saati değiştirmek istiyorum', 'reschedule'],
  ['tr', 'nasıl ders ayırtırım', 'book'],
  ['tr', 'ilk ders ücretsiz mi', 'trial'],
  ['tr', 'oyunlar nerede', 'games'],
];

describe('matchQuestion routes real questions to the right topic', () => {
  for (const [lang, question, expected] of CASES) {
    it(`[${lang}] ${question} -> ${expected}`, () => {
      expect(matchQuestion(question, lang).best?.id).toBe(expected);
    });
  }

  it('answers in the language the question was written in, not only the interface language', () => {
    const r = matchQuestion('I want a refund', 'fr');
    expect(r.best?.id).toBe('refund');
    expect(r.lang).toBe('en');
  });

  it('offers related topics', () => {
    const r = matchQuestion('can I get my money back if I cancel', 'en');
    expect(r.related.map((t) => t.id)).toContain('cancel');
  });

  it('returns null for gibberish and empty input (so the UI can offer the support team)', () => {
    expect(matchQuestion('asdf qwerty zxcv', 'en').best).toBeNull();
    expect(matchQuestion('   ', 'fr').best).toBeNull();
  });

  it('does not treat short greetings as a prefix of other words', () => {
    expect(matchQuestion('this is a thing', 'en').best?.id).not.toBe('hello');
  });

  it('every topic’s own suggestion chip routes back to that topic', () => {
    const wrong: string[] = [];
    for (const t of HELP_TOPICS) {
      for (const l of HELP_LANGS) {
        const got = matchQuestion(t.q[l], l).best?.id;
        if (got !== t.id) wrong.push(`${t.id} [${l}] "${t.q[l]}" -> ${got}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});
