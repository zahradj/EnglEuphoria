# Talk-time meter: privacy and notice drafts

Status: **drafts for legal review. Nothing here is live.** The meter is OFF (`VITE_TALK_TIME`) and stays off until the steps at the end are done.

## What the meter actually does (facts to keep the wording honest)

- It runs in the browser of each person in a live lesson (teacher and student), using the microphone stream the lesson already has. It does not open a second microphone.
- It measures loudness locally and works out "is this person speaking right now". Every ~15 seconds it sends **only a number of seconds** of speech to the server (`record_talk_time`).
- **No audio, no words and no transcript** leave the device or are stored by this feature. A muted microphone counts as silence.
- The server stores, per lesson: seconds spoken by the teacher and by the student, and when each last reported. A client cannot report more speech than real time allows.
- Who can read it: the teacher (their own lessons) and admins. Not students, not parents (unless you decide to show it to them).
- Used for: the teacher's "student talking time" goal on the "My teaching" page (support and coaching, not ranking or pay).
- Not used for: grading the child, assessing the child's pronunciation or language, or building a profile of the child.

## 1. Proposed additions to the Privacy Policy (`PrivacyPolicyPage.tsx`)

**Section 2, Data We Collect, add a bullet**

> **Talking-time counts:** during live lessons, how many seconds each person spoke. We work this out on your device from microphone loudness and send only the number. We do not record, store or analyse the audio or the words.

**Section 5, Camera & Microphone Use, add a paragraph**

> To help teachers give students more chances to speak, your device measures whether you are speaking during a lesson and reports only the total seconds spoken. This uses the microphone your lesson already has switched on. No audio or words are recorded or sent by this feature. The counts are visible to the teacher and to authorised EnglEuphoria staff, and are used to help teachers improve, not to assess students.

**Section 6, Children's Privacy, add a sentence**

> The talking-time counts described in Section 5 are collected for students of all ages, including Playground Hub students, as a number of seconds only. Parents can ask us to stop collecting or to delete these counts for their child at any time by contacting privacy@engleuphoria.com.

**Section 9, Data Retention, add a sentence** (choose the period yourself; 12 months is a sensible default)

> Talking-time counts are kept for 12 months after the lesson and then deleted, or earlier when an account is deleted.

Note: the public policy page is not translated today (see `feedback_translate_all_pages`: all user-facing pages should be). Translate it into the six languages after the English wording is approved, and have local-law review where you operate (the child-consent age differs by country).

## 2. Parent notice (in-app banner on the parent dashboard + one email)

**Subject:** A small change to live lessons: counting talking time

> Hello,
>
> To help teachers make sure children get plenty of chances to speak, live lessons will now count how many seconds the teacher and the student each speak. Your child's device measures this locally and sends only a number. **No audio, words or recordings are made or stored.**
>
> The counts are seen by the teacher and by EnglEuphoria staff, are kept for 12 months, and are used to help teachers improve. They are not used to assess your child.
>
> You can switch this off for your child at any time (reply to this email or write to privacy@engleuphoria.com) and ask us to delete the counts. Our Privacy Policy has the details.

(Needs one real implementation detail before it is true: a per-child opt-out. Today the meter has no per-child switch. See step 4 below.)

## 3. Teacher notice (add to "How we measure")

> **Student talking time** is counted on each person's device from microphone loudness and only a number of seconds is sent. It is used to help you, and it is not used to rank or pay you. Students' and parents' consent settings apply: if a family opts out, their lessons simply have no talking-time data and are not counted against you.

## 4. Before switching it on: the checklist

1. **Approve and publish** the Privacy Policy wording above (and translate it).
2. **Per-child opt-out** (needs a small build): a flag on the student/parent profile, checked by `TalkTimeMeter` so that opted-out students' lessons are not measured on either side. I can build this when you want it.
3. **Retention job**: a scheduled delete of `classroom_talk_time` rows older than the period you chose.
4. **Send the parent notice** (email + banner) and wait a notice period, 14 days is typical, before enabling.
5. **Pilot in one trial class first**: switch on `VITE_TALK_TIME=on` for a preview deployment only, run one lesson with a willing teacher and student, and check the numbers on the teacher's scorecard make sense.
6. **Then enable** in production and keep the "How we measure" page in step.
7. Legal sign-off on all of the above, including the lawful basis in each country you serve.
