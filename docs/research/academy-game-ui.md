# Research log — game-style UX/UI for Academy lessons (searched 2026-10-09)

Quality: [V] peer-reviewed or large study · [P] practitioner · [T] teardown or vendor blog.

| Claim | Source | Quality | Use |
|---|---|---|---|
| "Juicy" feedback is held to make games enjoyable; in a pre-registered CHI 2024 experiment (1,699 participants) feedback that depended on success raised enjoyment and motives, while amplification reduced felt competence; curiosity was the strongest predictor of enjoyment. | "How does juicy game feedback motivate? Testing curiosity, competence, and effectance" (Imperial College repository, CHI 2024) | [V] | Reward only on success; keep it short; no fanfare for wrong answers. |
| Feedback in learning games should tell the learner right/wrong/in between and guide to the correct content. | Karl Kapp, "Feedback Essential for Video Games and Learning" | [P] | Every reaction carries information. |
| Short visual and sound cues for right/wrong help; motion makes elearning games more engaging. | Sponge Learning, "How to use game juice in elearning" | [P] | Motion on the learning object, proportionate. |
| Self-determination theory: game elements support or thwart autonomy, competence, relatedness depending on context; leaderboards can demotivate low-ranked learners; perceived competence and autonomy tracked enjoyment. | 2019 SDT gamification study (Zenodo record 3675994); JISE 2021 leaderboard-math study | [V] (mostly university samples) | Choices, own-best progress, cast relatedness; no rankings. |
| Teens are goal-oriented, give up quickly, expect ease; reading skills weaker. NN/g report has 124 guidelines (paywalled; table of contents only seen). | NN/g "UX Design for Teenagers (Ages 13-17)" | [P] | Short text, one action per screen, big targets. |
| Visual-novel games in EFL: small studies (3 to 39 learners) report higher motivation and engagement for reading and vocabulary; the effect of illustration/animation is not isolated. | Indonesian ninth-grade vocabulary study; Taiwan junior-high action research; Surabaya tenth-grade reading study | [V, small] | Story scenes as the spine; no stronger claim. |
| Coherence principle: removing interesting but irrelevant material improves transfer; meta-analysis found the largest effects for removing seductive details, modality, personalization; animation effects were less consistent (smaller for facts, larger for inference/transfer). | Mayer et al. coherence studies; Cambridge Handbook of Multimedia Learning chapters; multimedia-principles meta-analysis | [V] (lab evidence; classroom transfer not guaranteed) | Art and motion serve the sentence and the learning object. |
| Duolingo and Khan Academy Kids: bite-size lessons, rewards, tap-to-translate; Khan notes sparkles on first-try success and that delight must not undermine assessment validity. | UXPlanet and Khan Academy blog | [T]/[P] | Pattern ideas only. |

## Limits

No study found that isolates the effect of illustrations or animation on A1 teen language learning. Gamification evidence is mostly university students. Duolingo/Khan material is teardown or blog level. The NN/g teen report was not readable beyond its contents. These are design guidelines, not proof of learning gains.

## Addendum 2026-10-10 — "alive" characters and game-screen anatomy (owner: "doesn't look like a well designed animated video game")

| Claim | Source | Quality | Use |
|---|---|---|---|
| Duolingo animates its characters in Rive: a **state machine** decides which animation plays and blends them; lip-sync is driven by audio timing triggering mouth shapes (visemes), idle behaviour (blink, nod, brows) lives in the same machine, and the final reaction depends on right/wrong. | Duolingo blog "world character visemes" | [T] primary (vendor engineering blog) | Our characters get a small state machine: idle / speaking / happy / concerned, with blink, head-nod and mouth swap. Mouth timing from audio only once recorded clips exist. |
| A "puppet vs puppeteer" split: the animation file holds the states, app code only sends inputs. 12-15 discrete mouth shapes for accurate lip-sync; amplitude-driven single-blend is a cheaper approximation. | Rive tutorials (dev.to/uianimation) | [T] third party, generic | Keep character motion in one component driven by a `state` input; do not scatter animation across slides. |
| Skeletal/2D rig tools (Spine, Rive) animate a layered character by moving parts (bones) and blending loops such as idle-breathe under other motion. | Esoteric Software "What is Spine?" | [T] vendor | We have flat expression pictures, not layers: approximate with head/body split (nod and breathe separately) plus expression swaps. Real rigs need layered art from the owner's Canva pipeline. |
| Rive reported far smaller files and higher frame rate than Lottie on mobile; interactive state machines are its core feature. Vendor-written; no independent web benchmark found. | Callstack benchmark; rive.app; lottiefiles.com | [T] | If real rigs are ever made, prefer Rive. Not adopted now (needs an editor and owner-approved assets). |
| Game feel: feedback loops between input and response; too much feedback overwhelms. Diegetic UI raises immersion but players enjoyed non-diegetic UI more when it was clumsy. | DiGRA 2018 "Good Game Feel"; Finnish thesis on diegetic UI (theseus.fi) | [V]/[T] small | Clear HUD on top, objects in the scene stay simple to tap; juice stays proportionate. |
| Lingokids: pre-literate kids cannot read instructions, so every interaction is visual, gestural, intuitive; prototypes go playable in about a week and only 20-30% reach production. | Lingokids Studios job pages / help centre | [T] vendor claims | Test every game by playing; cut mechanics that do not feel good. |

Limits: no source here shows learning gains from animation; Duolingo's exact viseme set and input names are not public. These are craft guidelines.
