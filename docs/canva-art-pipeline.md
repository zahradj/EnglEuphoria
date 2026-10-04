# Lesson pictures with Canva (owner's rule, 2026-10-04)

Pictures are made with **Canva only**; videos with **Higgsfield only**. Never generate pictures with Higgsfield.

The session's container cannot reach canva.com directly, so pictures travel like this:

1. **References → Canva.** Import the cast/style reference from the public repo with `upload-asset-from-url`
   (`https://raw.githubusercontent.com/zahradj/EnglEuphoria/main/public/lep1/...`). The cast reference is
   already in Canva as media `MAHXAQM0DMo` (bg-l5-roleplay-friends.jpg: Pip, Mia, Leo, Bella, Willow).
2. **Generate.** `generate-image` with the prompt, `aspectRatio` (`LANDSCAPE_16_9` for scenes, `SQUARE_1_1`
   for stickers on a plain white background) and `imageReferences` = the reference media ids. Poll
   `get-generate-image-job`; look at the result before using it.
3. **Place on the holder design.** One Canva design holds every lesson picture, one page each:
   **"EnglEuphoria lesson art"** (`DAHXATpO_n4`). `read-design` with `open_transaction` → `edit-design`
   (`add_page` 1920x1080 for scenes / 1024x1024 for stickers, then `insert_fill` the image over the whole
   page) → `commit` (owner approved saving this design freely).
4. **Export.** `export-design` PNG of that page (`pages: [n]`, `width` 1920 or 1024) → a signed download URL
   (valid a few hours).
5. **Into the repo.** Write `scripts/canva-art-request.json` = `[{url, out, sticker}]` and push. The
   **Fetch Canva art** workflow (`.github/workflows/canva-art.yml`, `scripts/fetch-canva-art.py`) downloads
   it, saves the PNG at lesson size (scenes 1376x768, stickers 1024x1024 with the white background cut
   out) and commits it.
6. Check the committed picture against the lesson (lesson-quality-gate, semantic pass) before wiring it in.

Videos: start frame = a Canva picture → Higgsfield image-to-video (`scripts/generate-story-video.mjs`,
`video-gen.yml`); game loops → `scripts/make-game-loops.py`.
