# AGENTS.md

## Project overview

- Static Korean service website for Cloudflare Pages.
- The main feature converts an uploaded image into downloadable pixel art in the browser.
- No build step or backend is required.

## Local development

- Open the repository with VS Code.
- Run `index.html` with the Live Server extension.
- Keep all URLs relative so the site works in local previews and on Cloudflare Pages.

## Structure

- `index.html`: landing page and pixel-art tool.
- `privacy.html`: privacy policy.
- `about.html`: service introduction and operating principles.
- `assets/css/styles.css`: shared visual styles.
- `assets/js/config.js`: site-level settings such as AdSense IDs.
- `assets/js/app.js`: upload, canvas conversion, controls, and download behavior.

## Code style

- Use semantic HTML and accessible labels.
- Use plain CSS and vanilla JavaScript; do not add a framework without a clear need.
- Prefer small functions and data attributes over inline event handlers.
- Keep user image processing local to the browser.
- Keep Korean user-facing copy concise and natural.

## Verification

- Test with VS Code Live Server, not only by opening `file://`.
- Check desktop and mobile layouts.
- Verify image upload, drag and drop, reset, controls, and PNG download.
- Check the browser console for errors.
- Do not claim that uploaded images are sent to a server unless the implementation changes.

## Deployment

- Cloudflare Pages build command: none.
- Cloudflare Pages output directory: repository root.
- Update the production domain in SEO metadata after connecting a custom domain.
- Add the real AdSense publisher and slot IDs in `assets/js/config.js` only after approval.
