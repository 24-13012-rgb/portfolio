# Melecio Laurente — Portfolio (static, GitHub Pages)

Plain HTML, CSS and JavaScript. No PHP or database, so it runs on GitHub Pages.
Live: https://24-13012-rgb.github.io/portfolio/

## Files
```
index.html              the whole page (edit text, skills and projects here)
sitemap.xml             lists the page for search engines
css/                    style.css (theme + layout), additions.css (photo, badges, viewer)
js/script.js            theme toggle, menu, nav highlight, copy link, badge viewer
assets/
  profile.jpg           ADD YOUR PHOTO HERE (exact filename, square works best)
  placeholder.svg       shown until profile.jpg exists
  favicon.svg           browser tab icon
  og-image.png          preview image when the link is shared (1200x630)
  achievements/         full-size badges (used for View + Download)
  achievements/thumbs/  small WebP versions shown on the page
```

## Update it
1. Edit `index.html` in VS Code.
2. GitHub Desktop: write a summary, **Commit to main**, then **Push origin**.
3. Wait 1-2 minutes, then refresh (Ctrl+F5).

## Add a project
In `index.html`, copy one whole `<article class="project reveal"> ... </article>`
block, paste it under the last one, and change the text.

## Add a new badge
1. Put the full-size PNG in `assets/achievements/`.
2. Save a 360x360 WebP copy with the same name in `assets/achievements/thumbs/`.
3. Copy one `<button class="achievement-card"> ... </button>` block in `index.html`
   and change the file names and title.

## Theme
Light and dark. The page follows the visitor's device setting until they press
the sun/moon button; their choice is then remembered in their browser.
