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

## Sections
Home, About, Skills, Projects (with slideshows), Achievements, Education & Experience, Contact.
To change your school or year, edit the Education card in `index.html` (search for `id="education"`).

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

## Background effect
`js/background.js` draws an original "binary field" on a `<canvas id="bgFx">`: a faint grid of 0s and 1s. Moving the mouse lights up and flips the digits under it and leaves a fading trail; clicking or tapping sends a ripple across the page. It follows light/dark mode, sleeps when nothing is lit, and stays still for visitors who prefer reduced motion. To remove it, delete the `<canvas>` and the `background.js` script tag in `index.html`.

## Resume download effect
Clicking "Download Resume (PDF)" still downloads `assets/Melecio-Laurente-Resume.pdf` as normal. On top of that, a small resume page drops in above the button and fills with lines, then 0s and 1s burst out of the button, and the label changes to "Saved". With reduced motion only the label changes. The code is at the end of `js/script.js`; the styles are at the end of `css/additions.css`.

## Floating stack layer
`js/floating.js` adds a second background layer on `<canvas id="bgFloat">`: small code tags from the stack I use (PHP, MySQL, ping, C++, tickets...) that drift slowly upward behind the page. They sit at different depths, so scrolling and moving the mouse shifts near ones more than far ones. They are very faint, never block clicks, follow light/dark mode, pause when the tab is hidden, and stay still with reduced motion. To remove, delete the `bgFloat` canvas and the `floating.js` script tag in `index.html`.
