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

## Theme ("Cream & Red")
The look lives in `css/theme.css`, loaded after the other stylesheets: cream paper background, one red accent, huge condensed headlines (Anton), monospace labels (Space Mono), thick outlines with hard shadows, sticker tags and hand-drawn scribbles around the photo. Dark mode is an ink-brown version of the same palette. Fonts are self-hosted in `assets/fonts/`, so no external font requests. Change the colours in the `:root` block at the top of `theme.css`. The scrolling red strip under the hero is decorative and only repeats words already on the page.

## Slide mode
`js/deck.js` + `css/deck.css` turn each section into its own slide. Move with the bottom bar (arrows and numbered tabs), the "Next: ..." button at the end of each slide, the top menu, the left/right arrow keys, or by swiping on a phone. The address updates (#projects etc.), so a link opens on that slide and the browser Back button works. If JavaScript is off, the page is one normal scrolling page. To go back to scrolling, remove the `deck.css` and `deck.js` lines in `index.html`.

## Motion
`css/motion.css` + `js/motion.js` add the animations: a moving background of drifting red/yellow/ink shapes (they also shift slightly with the mouse), things that pop and rise in one after another each time a slide opens, a floating photo, a wobbling sticker, a pulsing "View Projects" button and hover wiggles. With "reduce motion" turned on in the visitor's device, the loops stop. To remove, delete the `motion.css` and `motion.js` lines and the `bg-shapes` block in `index.html`.

## Smoothness notes
Switching slides jumps to the top instantly (no gliding scroll), a sideways scrollbar can't appear during the slide-in, pictures on the other slides are fetched once the page is idle, fonts are preloaded, the slides stay hidden for a split second at load so the whole page never flashes, and the floating tags draw at about 30 fps. The pulsing button animates a ring (not a box-shadow), which is much cheaper to draw.

## New features (features.css / features.js)
- **What I did** (Problem / What I built / Result) on every project card. Edit the text in the `<div class="did">` blocks.
- **Case study slide** for ElectroPOS (`#casestudy`) with screenshots that open the viewer at that slide.
- **Quick facts** card and **How I work** steps on the About slide.
- **Goal line** sticker on the hero photo (`<p class="hero__goal">`).
- **Skill bars**: change `data-level="1|2|3"` (learning / comfortable / strong) on each `.skill-tag__meter`.
- **Looping previews** on the project cards (cycles through that project's screenshots; pauses on hover).
- **Resume preview** pop-up next to the download button.
- **Contact form**: works now by opening Gmail with the message filled in. To send straight to your inbox, make a free form at formspree.io and paste its URL into `data-endpoint=""` on `<form id="contactForm">`.
- **Keyboard hint** that fades after a few seconds (shown once per visit, desktop only).
- **Red wipe** between slides (skipped when "reduce motion" is on).
- **Awards / certificates**: copy an `achievement-card` button in the Achievements slide (a comment shows where).

## Case studies (slide 04)
The Case studies slide has one panel per project (ElectroPOS, HR Ticket System, School Library System, Connect4), each with The problem / What I built / The result, a line about my part, and three screenshots that open the viewer at that screen plus a "Show the project" button. Switch with the chips (they also work with the left/right arrow keys). Each project card has a "Read the case study" link that opens the matching panel. To edit, change the text inside `<div class="case-panel" id="case-...">` in `index.html`.
