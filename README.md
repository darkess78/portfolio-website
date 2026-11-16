# Portfolio Website

Personal portfolio site for Zach Adams — a senior at Utah Valley University majoring in Computational Data Science, focused on automation and systems engineering.

Live at: **https://neety.me**

## Structure

Static HTML/CSS/JS site — no build step required.

```
portfolio-website/
├── index.html          # Home / hero page
├── about.html          # Background and workflow
├── skills.html         # Languages, platforms, and domains
├── projects.html       # Project showcase with modal detail views
├── education.html      # Degree track and coursework
├── contact.html        # Contact information
├── script.js           # Theme picker, accessibility menu, project modal logic
├── styles/
│   ├── styles.css          # Default theme
│   ├── styles-aurora.css
│   ├── styles-carbon.css
│   ├── styles-ember.css
│   ├── styles-lagoon.css
│   ├── styles-meadow.css
│   ├── styles-mono.css
│   ├── styles-night.css
│   └── styles-paper.css
├── images/             # Project screenshots and assets
├── favicon.ico
├── favicon.svg
└── deploy-portfolio.ps1  # Deployment script
```

## Features

- **9 themes** — switchable via the header theme picker; selection persists in `localStorage` and syncs across page navigation via query param
- **Accessibility menu** — toggles for larger text, high contrast, reduced motion, and underlined links; state persists in `localStorage`
- **Project modals** — FLIP-animated detail overlays with focus trap, keyboard navigation, and screenshot lightbox
- **No dependencies** — vanilla HTML, CSS, and JS; no frameworks or build tools

## Deployment

Deployment is handled by `deploy-portfolio.ps1`, which archives the site, uploads it via `scp`, and syncs it to the remote web root using `rsync`.

Create a `.env.local` file in the project root with your server details:

```
REMOTE_USER=your_user
REMOTE_HOST=your_host
REMOTE_DIR=/path/to/web/root
```

Then run:

```powershell
.\deploy-portfolio.ps1
```

The script excludes `.env.local`, `.git`, and other non-site files from the deployed archive.

## Local Development

No build step needed. Open any `.html` file directly in a browser, or serve locally with any static file server:

```bash
npx serve .
# or
python -m http.server
```
