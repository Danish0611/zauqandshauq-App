ZAUQ & SHAUQ  -  LOGO MARK (vector rebuild)
==========================================
svg/   Master vector files (infinitely scalable, ~4 KB each). Use these on the website.
png/   Transparent PNGs, 2048 px tall (use only where SVG is not supported, e.g. email, social).
favicon/  favicon.svg, favicon.ico, 16/32 px, apple-touch-icon (180), android-chrome 192/512.

WHICH COLOUR WHERE
  maroon  (#3F1A1F)  light/ivory backgrounds
  ivory   (#F5EFE6)  deep olive/dark backgrounds (navbar, hero, intro)
  gold    (#C9A96E)  accents, loader, footer, favicon
  black   (#111111)  print / one-colour use
  currentcolor       inline SVG in Angular: colour it with CSS  (color: var(--gold))

ANGULAR / HTML
  <img src="assets/logo/svg/zauq-shauq-mark-ivory.svg" alt="Zauq & Shauq" height="44">

  Favicons in index.html <head>:
  <link rel="icon" href="favicon/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="favicon/favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="favicon/apple-touch-icon.png">

MINIMUM SIZE: 24 px tall. Keep clear space around the mark equal to about 25% of its height.
