// Test fixture: the Border Desk inspection scene from the first version of B1-S01-E1 (v3). The lesson itself no longer has it (v4 rebuild); the inspect scene kind and its tests still do.
import type { InspectScene } from '../../scenes/inspect/Inspect';

export const BORDER_DESK = { id: 'border-desk', part: 3, kind: 'inspect', plate: 'detective-wall', trains: [4], title: 'Border Desk', look: 'post', chief: 'Vee',
    intro: 'Welcome to the Border Desk. Bucket-list posts arrive three at a time. Check each one against the rulebook, approve it or fix it, then file the batch.',
    rules: [
      { id: 'r1', title: 'A finished time', text: 'A finished time, like last summer, last year or two years ago, needs the past simple.', example: 'I visited Lisbon last summer.' },
      { id: 'r2', title: 'Up to now', text: 'An experience up to now, with no finished time, needs have or has and the past participle.', example: 'I have visited Lisbon.' },
      { id: 'r3', fromBatch: 1, title: 'Asking', text: 'To ask about an experience, say Have you ever and the past participle.', example: 'Have you ever eaten spicy noodles?' },
    ],
    batches: [
      { title: 'Morning posts', items: [
        { id: 'p1', from: 'Mina', doc: ['Last summer I have visited my cousins in Lisbon. We ate fish every day.'],
          fault: { word: 'have visited', fixes: ['visited', 'have visit', 'visit'], correct: 'visited', ruleId: 'r1', why: 'Last summer is a finished time, so we use the past simple: I visited my cousins.' },
          retry: { id: 'p1r', from: 'Karim', doc: ['In 2022 I have broken my arm at a skate park. It healed fast.'], fault: { word: 'have broken', fixes: ['broke', 'have break', 'break'], correct: 'broke', ruleId: 'r1', why: 'In 2022 is a finished time, so we use the past simple: I broke my arm.' } } },
        { id: 'p2', from: 'Tom', doc: ['I have never tried surfing, but I want to give it a go.'], okWhy: 'Never, with no time given, is an experience up to now: have and tried are correct.', okFixes: ['try', 'tryed', 'trying'],
          retry: { id: 'p2r', from: 'Aisha', doc: ['I have never ridden a horse, but my sister has.'], okWhy: 'Never, with no time given, is an experience up to now: have and ridden are correct.', okFixes: ['rode', 'ride', 'rided'] } },
        { id: 'p3', from: 'Leo', doc: ['I have flew to Japan twice, and I loved it.'],
          fault: { word: 'flew', fixes: ['flown', 'fly', 'flied'], correct: 'flown', ruleId: 'r2', why: 'After have we need the past participle: flown, not flew.' },
          retry: { id: 'p3r', from: 'Ines', doc: ['We have ate sushi in Tokyo, and it was great.'], fault: { word: 'ate', fixes: ['eaten', 'eat', 'eated'], correct: 'eaten', ruleId: 'r2', why: 'After have we need the past participle: eaten, not ate.' } } },
      ] },
      { title: 'Afternoon posts', items: [
        { id: 'p4', from: 'Dana', doc: ['Have you ever tried paragliding? I did it in Spain last summer.'], okWhy: 'Have you ever and the participle asks about an experience. Then did it with last summer tells the story in the past simple.', okFixes: ['try', 'tryed', 'did try'],
          retry: { id: 'p4r', from: 'Marco', doc: ['Have you ever eaten snails? I ate them in France last year.'], okWhy: 'Have you ever and the participle asks about an experience. Then ate them with last year tells the story in the past simple.', okFixes: ['eat', 'ate', 'eated'] } },
        { id: 'p5', from: 'Sam', doc: ['Did you ever see the northern lights? I have never seen them.'],
          fault: { word: 'Did you ever see', fixes: ['Have you ever seen', 'Do you ever see', 'Have you ever saw'], correct: 'Have you ever seen', ruleId: 'r3', why: 'To ask about an experience, say Have you ever and the past participle: Have you ever seen the northern lights?' },
          retry: { id: 'p5r', from: 'Yara', doc: ['Did you ever eat durian? I have never tasted it.'], fault: { word: 'Did you ever eat', fixes: ['Have you ever eaten', 'Do you ever eat', 'Have you ever ate'], correct: 'Have you ever eaten', ruleId: 'r3', why: 'To ask about an experience, say Have you ever and the past participle: Have you ever eaten durian?' } } },
        { id: 'p6', from: 'Noor', doc: ['I joined a climbing club two years ago, and I have never regretted it.'], okWhy: 'Two years ago is a finished time, so joined. Never regretted is up to now, so have regretted.', okFixes: ['join', 'have joined', 'regret'],
          retry: { id: 'p6r', from: 'Theo', doc: ['I took a dance class in March, and I have loved it since.'], okWhy: 'In March is a finished time, so took. Loved it since is up to now, so have loved.', okFixes: ['take', 'have took', 'taked'] } },
      ] },
      { title: 'Late posts', items: [
        { id: 'p7', from: 'Eli', doc: ['Yesterday I have tried a new sport. I have loved it ever since.'],
          fault: { word: 'have tried', fixes: ['tried', 'have try', 'try'], correct: 'tried', ruleId: 'r1', why: 'Yesterday is a finished time, so we use the past simple: I tried a new sport.' },
          retry: { id: 'p7r', from: 'Rosa', doc: ['Last Friday I have gone to a concert. It was loud!'], fault: { word: 'have gone', fixes: ['went', 'have go', 'go'], correct: 'went', ruleId: 'r1', why: 'Last Friday is a finished time, so we use the past simple: I went to a concert.' } } },
        { id: 'p8', from: 'Iris', doc: ['I have been to Rome three times. I went first in 2019.'], okWhy: 'Three times, with no date, is an experience up to now: have been. In 2019 is finished: went.', okFixes: ['was', 'have went', 'gone'],
          retry: { id: 'p8r', from: 'Karl', doc: ['I have eaten sushi often. I tried it first in 2020.'], okWhy: 'Often, with no date, is up to now: have eaten. In 2020 is finished: tried.', okFixes: ['ate', 'have tried', 'eated'] } },
        { id: 'p9', from: 'Jon', doc: ['I have never ate insects, and I do not want to.'],
          fault: { word: 'ate', fixes: ['eaten', 'eat', 'eated'], correct: 'eaten', ruleId: 'r2', why: 'After have we need the past participle: eaten, not ate.' },
          retry: { id: 'p9r', from: 'Mira', doc: ['She has never saw a real mountain, but she wants to.'], fault: { word: 'saw', fixes: ['seen', 'see', 'seed'], correct: 'seen', ruleId: 'r2', why: 'After has we need the past participle: seen, not saw.' } } },
      ] },
    ] } as unknown as InspectScene;
