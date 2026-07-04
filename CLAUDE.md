# Claude Code Handoff

This is Xie Songlun's portfolio website. The user is not a developer, so prefer direct edits, clear summaries, and avoid asking them to run code unless necessary.

## Project Location

- Local project folder: `/Users/xiesonglun/Documents/New project 5`
- Main file to edit: `/Users/xiesonglun/Documents/New project 5/index.html`
- Static assets folder: `/Users/xiesonglun/Documents/New project 5/assets`
- Resume PDF: `/Users/xiesonglun/Documents/New project 5/personal-info.pdf`

This is a static website. There is no framework build step required for local preview.

## GitHub

- Repository: `git@github.com:Darren1119/my-zpj.git`
- GitHub web URL: `https://github.com/Darren1119/my-zpj`
- Branch used for production: `main`

Typical publish flow:

```bash
cd "/Users/xiesonglun/Documents/New project 5"
git status --short
git add index.html assets personal-info.pdf README.md CLAUDE.md
git commit -m "Update portfolio"
git push origin main
```

Only stage files that are actually part of the requested change. At the time this file was created, these local items were untracked and should not be committed unless the user explicitly asks:

- `social-card-agent-harness-xhs/`
- `social-card-ai-input-cover/`
- `social-card-system-visibility-cover/`
- `xie_songlun_portfolio_redesign.html`

## Vercel

- Production URL: `https://xiesonglun-portfolio.vercel.app`
- Vercel project name: `xiesonglun-portfolio`
- Last known production alias: `https://xiesonglun-portfolio.vercel.app`
- Previous GitHub Pages URL may still exist: `https://darren1119.github.io/my-zpj/`

Deploy command:

```bash
cd "/Users/xiesonglun/Documents/New project 5"
npx vercel --prod --yes
```

After deploying, verify the production page:

```bash
curl -L https://xiesonglun-portfolio.vercel.app/ | rg "谢松伦|Agent Harness|Paige"
```

## Local Preview

Use a simple static server:

```bash
cd "/Users/xiesonglun/Documents/New project 5"
python3 -m http.server 4174
```

Then open:

```text
http://127.0.0.1:4174/
```

If port `4174` is busy, use another port such as `4175`.

## Current Site Structure

- Home: overview, contact, work experience, section cards.
- Next: AI and Agent Harness related work, including Paige.
- Archive: earlier B2B/product design work.
- Signal: writing and thinking.
- Human: personal interests and non-work material.

Important current positioning:

- The portfolio is being tuned for an `Agent Harness` product direction.
- Paige should be described truthfully as an AI-assisted business interface generation and editing environment, not as a fully autonomous Agent.
- Paige is closer to a focused Agent Harness experiment around requirement-to-interface work: input organization, tool constraints, evaluation, failure logs, and human feedback.

## Important Asset Notes

- Paige videos live in: `/Users/xiesonglun/Documents/New project 5/assets/videos/paige/`
- Correct Human page music lives in: `/Users/xiesonglun/Documents/New project 5/assets/audio/音乐修正/`
- Paige images should use Paige-specific assets under: `/Users/xiesonglun/Documents/New project 5/assets/images/projects/paige/`
- Do not accidentally use Babi images in the Next/Paige sections.

## Style Notes

- Keep the tone factual, calm, and portfolio-like.
- Avoid overclaiming Agent capability.
- Avoid calling readers "外行"; use normal explanatory wording such as "背景说明", "使用场景", "它解决什么问题".
- User prefers plain, direct Chinese copy, not exaggerated or sentimental writing.
- Preserve the current visual language: black border, paper background, red accent, strong typographic hierarchy.

## Last Known Production Update

- Commit: `d27f11c`
- Message: `Strengthen contact and Next homepage card`
- Production URL after deployment: `https://xiesonglun-portfolio.vercel.app`
