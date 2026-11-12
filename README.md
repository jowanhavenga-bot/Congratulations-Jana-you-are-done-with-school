# A Little Something for You — GitHub Pages

A small, self-contained website for GitHub Pages. No build tools, packages, or command line are required.

## 1. Add your six images

Open the `assets` folder and put your images inside it. Keep the filenames exactly as written (including lowercase letters and `.png`):

```text
assets/
├── lily-1.png
├── panda.png
├── lily-3.png
├── gift-closeup.png
├── next-button.png
└── paper-background.png
```

All six paths are already referenced in the site. You do not need to edit `index.html`, `styles.css`, or `script.js` when you add them. The two lily files are used throughout the opening flower layer; the other four are used for the panda, gift close-up, Next button and paper texture.

Transparent PNGs are supported. Keep the original transparent PNG exports for the panda, gift and button.

## 2. Upload to GitHub

1. Download and extract the ZIP.
2. Open the extracted `lily-gift-site-v2` folder.
3. Upload the *contents* of that folder to the root of a new GitHub repository. `index.html` must be at the repository root, and `assets` must remain a folder beside it.
4. Commit the files.
5. In the repository, open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select the `main` branch and `/(root)`, then save.
8. Open the URL GitHub Pages displays.

## 3. The final Jetour photograph

The ending uses a real photograph of a white Jetour X70 Plus viewed from behind on a coastal road. It is loaded directly from Jetour Pakistan's public image host, so the website needs an internet connection to show it. If that address becomes unavailable, the code automatically tries a rear-view Jetour X70 photograph from Wikimedia Commons.

Primary photo: Jetour Pakistan, X70 Plus model imagery — https://jetour.com.pk/assets/p5_2-BqIYE-27.webp
Fallback photo: Jengtingchen, “Jetour X70 002.jpg”, Wikimedia Commons, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Jetour_X70_002.jpg

The primary photograph includes its own coastal setting. It is not a transparent vehicle cut-out, so the final scene shows the complete photograph in the centre, with a softly blurred extension of the same photograph filling the sides. This keeps the vehicle photographic instead of placing a white-background car rectangle over a different beach scene.

## 4. What each scene does

1. Lilies — swipe left or tap to move the flowers away.
2. Panda — the message types out, then the gift button becomes available.
3. Gift — shows the enlarged gift artwork.
4. Fireworks — pastel pink, champagne gold, occasional blue and heart bursts build to a faster climax, then calm down. Your supplied Next image appears when the display ends.
5. Letter — displays the message and a “Tap if you're done reading” control.
6. Final scene — fades into the real rear-view Jetour photograph.

The project uses only HTML, CSS and JavaScript. It has no external JavaScript libraries.
