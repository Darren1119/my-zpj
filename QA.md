# Portfolio release checks

The deployed site is static. Critical scripts and refinements CSS are embedded in HTML to avoid a separate download blocking project entry. Keep their editable sources in `assets/`, then regenerate the embedded copies before committing. Keep the folder design and test the critical paths below before promoting a deployment.

## Automated checks

```sh
python3 scripts/build_site.py
python3 scripts/build_site.py --check
python3 scripts/check_site.py
python3 -m http.server 4175 --bind 127.0.0.1
```

The browser test origin supports HTTP byte ranges for MP4 files, matching production media delivery.

Repeatable recruiter-journey checks (Chromium, Firefox, WebKit and two mobile emulations):

```sh
cd qa
npm ci
npx playwright install chromium firefox webkit
npm test
npm run test:performance
```

GitHub Actions runs these checks on pushes and pull requests to main. Browser failures retain traces/screenshots; Lighthouse reports retain all three representative pages. The performance gate requires each page to remain under 3 MiB transfer and CLS 0.1, and accessibility/best-practices/SEO categories to remain at 100. LCP is recorded for diagnosis, not a flaky single-run CI gate. Use three runs of the same mobile profile on Vercel for release LCP comparisons. Automated browser emulation is not physical-device coverage, and Lighthouse does not establish field INP or guarantee accessibility.

Set `PORTFOLIO_URL` to an accessible preview or production origin to run the same checks there. Do not include a trailing slash. CI runs the checked-out commit locally, not the current production deployment.

Run Lighthouse against the **Vercel preview URL** for release measurements (the simple Python server does not compress HTML). Pin the audit version when comparing results:

```sh
npm exec --yes --package=lighthouse@13.6.0 -- lighthouse PREVIEW_URL --output=html --output=json --output-path=./mobile --chrome-flags=--headless
npm exec --yes --package=lighthouse@13.6.0 -- lighthouse PREVIEW_URL --preset=desktop --output=html --output=json --output-path=./desktop --chrome-flags=--headless
npm exec --yes --package=@axe-core/cli@4.14.0 -- axe PREVIEW_URL 'PREVIEW_URL/#project/resource-workshop' 'PREVIEW_URL/#project/paige'
```

The axe CLI needs a ChromeDriver compatible with the installed Chrome; pass `--chromedriver-path` if its bundled driver differs. Keep reports outside the deployed source tree. A scanner pass does not replace the manual checks below.

Release targets: no confirmed axe violations in these representative pages; CLS <0.1; no requests for the original hidden Human PNGs on home; initial home transfer <=3 MiB; no broken derivative assets. Compare LCP on the same network/CPU configuration, aiming for <=2.5s on the mobile lab profile.

## Manual regression paths

- At 320/390/768/1280px, check both languages: navigation separation, work shortcut, company/role/dates, visible keyboard focus, and no page-wide horizontal scroll.
- Tab to each folder; Enter or Space opens it. Tab and Shift+Tab stay within the modal. Arrows or visible previous/next controls change the title and counter. Enter opens the selected project; Escape returns focus to the folder. Verify the first/last control states.
- Open a non-first project from each folder and use the detail Back button: reopen the same folder at the selected card with keyboard focus. Close it and verify focus returns to the folder and page scrolling unlocks. Check browser Back/Forward and refresh the detail before returning. From Paige, follow Metrics and return twice: restore the Paige reading position, then its folder card. A fresh direct project link must offer Back to work without leaving the site. Repeat on mobile and in English.
- Open Life using the keyboard, open a photo, then Escape twice. The first close restores the photo button and keeps the album scroll lock; the second restores the folder and unlocks the page. The original-photo link must use the original asset.
- In Resource Workshop and the AI-team article, use the contents on a cold load and after images finish loading. The chosen heading should settle about 84px below the viewport top. Zoom an illustration, close it and verify focus returns.
- Scroll midway through a long detail; open Home with the fixed logo, then use browser Back. Reading position and expanded sections must restore. A new detail starts at the top.
- While a detail illustration is enlarged, use browser Back, then close the restored folder. No stale illustration may remain. Change language after expanding Paige's build log, then change back: restore the expanded log and reading position. A first visit to the other language starts at its overview because its section structure differs.
- Command/Ctrl-click a related article: a new tab opens and the original article stays in place. Confirm the initial Paige load fetches WebP posters but no MP4 data; each video must still play on request. Video URLs are assigned only by the play button because preload hints vary across browsers. Leaving the article must pause playback.
- Switch languages, refresh a deep link, visit all 18 detail routes and check titles, images and layouts. Confirm browser console has no new errors.
- Test the contact copy buttons. Success requires a resolved clipboard write; on a blocked/unavailable clipboard, the manual-copy dialog must expose selectable text. No email or phone action is necessary to validate their hrefs.
- Verify videos on an actual device, including audio/captions where applicable; check touch swipes, Safari/Firefox, a screen reader and the OS reduced-motion preference before claiming those environments passed.

## Adding images

Retain original files and references (`data-img` / zoom links). With Pillow 11.3+ installed, run:

```sh
python3 scripts/optimize_images.py
python3 scripts/build_site.py
python3 scripts/check_site.py
```

This creates responsive WebP derivatives plus `assets/media-manifest.js`, updates literal image dimensions, and leaves originals intact. Commit the generated assets with source changes. Verify text-heavy screenshots visually at their real display sizes.
