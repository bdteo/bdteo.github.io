# Cover Prompts

One `*.prompt.txt` file per article, holding the exact FLUX.2 prompt used to
generate the currently installed `featuredImage` under `content/blog/<slug>/`.
The filename matches the article slug.

## Why this directory exists

To give future-me (or a fresh session) a durable reference point when
regenerating, refining, or matching the voice of a new cover.

## Methodology — the standard recipe

- **Model**: FLUX.2 \[max\] (Black Forest Labs)
- **Endpoint**: `https://api.bfl.ai/v1/flux-2-max` (via `x-key` auth)
- **Tool**: `FluxImage` utility at
  `/Users/boris/DevEnvs/boris/MacShellUtils/.ButtercupZsh/Utils/FluxImage`
  (reads prompt from stdin by default; also accepts positional arg or `--file`)
- **Aspect ratio**: 3:2 (`-r 3:2` → 1920×1280)
- **Encoding for the blog**:
  - JPEG q92 (`sips -s format jpeg -s formatOptions 92`) for articles whose
    frontmatter uses `featured.jpg`
  - WebP q88 (`cwebp -q 88`) for articles whose frontmatter uses `featured.webp`
- **Masters** (full-resolution PNGs, suitable for printing or reuse):
  `/Users/boris/Pictures/Art/`

## Voice — what every prompt hard-codes

- Intimate documentary still life; 35 mm or medium-format analog film feel
- Lived-in, not staged; warm–cool palette interplay; single visual hero
- Faces not visible (hands / forearms OK)
- Specific analog camera + lens + film stock (pick from: Leica M6 + 35 mm
  Summicron, Mamiya 7II + 80 mm f/4, Hasselblad 500C/M + 80 mm Zeiss Planar,
  Pentax 67 + 105 mm f/2.4 Takumar, Contax T2 + 38 mm Zeiss Sonnar, Canon AE-1
  + 50 mm f/1.4, Nikon F3 + 35 mm f/2)
- Specific film stock (pick from: Kodak Portra 400, Kodak Tri-X 400 BW,
  Cinestill 800T, Fuji Pro 400H)
- Shallow depth of field, natural film grain
- Palette expressed with ≥ 4 hex color codes
- Generous negative space above for headline placement
- Guardrails in every prompt: no readable text, no typography, no logos, no
  brand marks, no cracks, no stains, objects pristine

## Workflow — to regenerate or refresh a cover

1. Pick the article's prompt file as a starting point, or write a new set of 4
   metaphor directions (letters A–D) with varied camera + film across the set.
2. Drop the prompt files at `/tmp/<slug>-prompts/{A,B,C,D}.txt`.
3. In bash, run all four in parallel:
   ```bash
   FLUX=/Users/boris/DevEnvs/boris/MacShellUtils/.ButtercupZsh/Utils/FluxImage
   mkdir -p ~/Temporary/<slug>-covers/round-N/{prompts}
   cd ~/Temporary/<slug>-covers/round-N
   cat /tmp/<slug>-prompts/A.txt | "$FLUX" -o "A-name.png" -r 3:2 &
   cat /tmp/<slug>-prompts/B.txt | "$FLUX" -o "B-name.png" -r 3:2 &
   cat /tmp/<slug>-prompts/C.txt | "$FLUX" -o "C-name.png" -r 3:2 &
   cat /tmp/<slug>-prompts/D.txt | "$FLUX" -o "D-name.png" -r 3:2 &
   wait
   ```
4. Failing job? BFL sometimes drops tasks under load — the script times out
   after 150 polls (~5 min). Just re-submit; the retry usually lands.
5. Pick → copy the PNG master to `/Users/boris/Pictures/Art/<clean-kebab>.png`
   → encode (sips / cwebp) into
   `content/blog/<slug>/images/featured.{jpg,webp}` → update `imageCaption` in
   the article's frontmatter if it still reads as AI-stock-art.
6. After all swaps: commit, then `make gh-deploy` (pushing alone does not
   trigger the VPS deploy; only `workflow_dispatch` does).

## Index — currently installed covers

| Article slug | Metaphor installed | Stock / camera (from prompt) |
| --- | --- | --- |
| [the-pillar-and-the-ivy](the-pillar-and-the-ivy.prompt.txt) | weathered fieldstone gatepost with ivy in dawn mist | Hasselblad 500C/M 80 mm Planar, Portra 400 |
| [where-all-sciences-meet](where-all-sciences-meet.prompt.txt) | open notebook at dawn with blank right page glowing | Fujifilm X-T5 35 mm f/2 *(digital reference, film-grain aesthetic)* |
| [wash-one-more-plate-refactoring-philosophy](wash-one-more-plate-refactoring-philosophy.prompt.txt) | stack of five clean plates + one extra beside them (the "one more") | Fujifilm X-T5 35 mm f/2 |
| [the-queue-that-never-stopped](the-queue-that-never-stopped.prompt.txt) | modern polished-chrome faucet dripping, sink just overflowing | Mamiya 7II 80 mm f/4, Portra 400 |
| [essential-guide-effective-pull-request-reviews](essential-guide-effective-pull-request-reviews.prompt.txt) | typeset proof sheet marked up; two pencils, brass loupe, tea | Leica M6 50 mm Summilux f/1.4, Portra 400 |
| [the-city-that-wasnt-there](the-city-that-wasnt-there.prompt.txt) | hollow card-catalog drawer with one lone card remaining | (see prompt) |
| [the-model-that-wasnt-there](the-model-that-wasnt-there.prompt.txt) | velvet rope + empty museum pedestal | (see prompt) |
| [todo-bulk-deletion-nuclear-option](todo-bulk-deletion-nuclear-option.prompt.txt) | two hands lifting preserved herb sprigs above trimmed stems | (see prompt) |
| [type-0-refactoring-step-before-step-one](type-0-refactoring-step-before-step-one.prompt.txt) | chef's mise en place: ramekins in a calm arc on marble | Hasselblad 500C/M 80 mm Planar, Fuji Pro 400H |
| [unlocking-the-power-of-git-grep](unlocking-the-power-of-git-grep.prompt.txt) | card-catalog drawer pulled open, one card standing proud | (see prompt) |
| [docker-compose-major-changes-since-october-2023](docker-compose-major-changes-since-october-2023.prompt.txt) | row of small wooden shipping crates on a harbor dock at dawn | Mamiya 7II 80 mm f/4, Portra 400 |
| [huawei-watch-d2-proprietary-protocol-vendor-lockin](huawei-watch-d2-proprietary-protocol-vendor-lockin.prompt.txt) | calm canary perched in an ornate brass cage, backlit | Nikon F3 35 mm f/2, Cinestill 800T |
| [php-8-5-new-features-pipe-operator-guide](php-8-5-new-features-pipe-operator-guide.prompt.txt) | copper conduit elbow joining two runs into one | (see prompt) |
| [discrete-representations-reinforcement-learning-insights](discrete-representations-reinforcement-learning-insights.prompt.txt) | fanned arc of plain-backed cards, a hand lifting one | Leica M6 35 mm Summicron, Portra 400 |
| [what-is-good-code-coverage-real-world-guide](what-is-good-code-coverage-real-world-guide.prompt.txt) | picket fence around one cultivated bed, open meadow beyond | Mamiya 7II 80 mm f/4, Fuji Pro 400H |
| [m1-mac-android-emulator-bluetooth-passthrough-bumble](m1-mac-android-emulator-bluetooth-passthrough-bumble.prompt.txt) | two modern phones face-down on marble, faint cyan halo crossing the gap | Mamiya 7II 80 mm f/4, Fuji Pro 400H *(modern subject on analog film)* |
| [understanding-class-namespace-changes-shopware-6-5-developers-guide](understanding-class-namespace-changes-shopware-6-5-developers-guide.prompt.txt) | hand tying a fresh blank cloth tag onto a pantry jar, old tag set aside | (see prompt) |
| [installing-php-8-3-6-with-imap-on-macos-using-phpenv](installing-php-8-3-6-with-imap-on-macos-using-phpenv.prompt.txt) | phone on marble with a pale cyan notification halo + folded letter + fountain pen | Mamiya 7II 80 mm f/4, Fuji Pro 400H *(modern subject on analog film)* |
| [laravel-sail-vs-laradock-choosing-right-docker-solution](laravel-sail-vs-laradock-choosing-right-docker-solution.prompt.txt) | two modern wireless mice side by side on white marble | Leica M6 35 mm Summicron, Portra 400 *(modern subject on analog film)* |
| [pushing-the-stable-diffussion-limits](pushing-the-stable-diffussion-limits.prompt.txt) | painter's well-used wooden palette, mixed color tests, palette knife mid-blend | Hasselblad 500C/M 80 mm Planar, Portra 400 |
| [stable-difussion-cheat-sheet](stable-difussion-cheat-sheet.prompt.txt) | dog-eared ivory index-card stack on linen with amber rubber band | Leica M6 35 mm Summicron, Tri-X 400 BW |
| [google-ai-ambitions-historical-analysis-promises-stock-market-impact](google-ai-ambitions-historical-analysis-promises-stock-market-impact.prompt.txt) | open notebook on oak with a subtle hand-drawn pencil line chart, pen, tea | Mamiya 7II 80 mm f/4, Portra 400 *(modern minimalist)* |
| [shadow-weaver-redemption-journey](shadow-weaver-redemption-journey.prompt.txt) | antique wooden loom in moonlit stone chamber, silver thread being woven | Hasselblad 500C/M 80 mm Planar, Portra 400 — cinematic fantasy grade |
| [worst-hypocrite-rubber-duck-tale](worst-hypocrite-rubber-duck-tale.prompt.txt) | two yellow rubber ducks on a warm wooden bathroom shelf in sunbeams | Leica M6 35 mm Summicron, Portra 400 |
| [the-sorceress-and-the-forgotten-stardust](the-sorceress-and-the-forgotten-stardust.prompt.txt) | young sorceress meditating above a pink rune circle, holding a glowing pink orb | Modern digital fantasy illustration style (magical-girl streetwear) |
