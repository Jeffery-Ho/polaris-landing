# Polaris Landing

Static GitHub Pages source for the Polaris support landing page.

Published at [jeffery-ho.github.io/polaris-landing](https://jeffery-ho.github.io/polaris-landing/).

## Assets

- `assets/polaris-introduction.mp4` is the muted autoplay video.
- `assets/polaris-introduction-thumbnail.jpg` remains visible until the browser has buffered the complete video.
- `support-config.js` contains the video URL, PayPal URL, and GA4 Measurement ID.

## Analytics and privacy

- The page does not load Google Analytics until a visitor explicitly chooses “Allow analytics”.
- Once enabled, GA4 receives only the support-entry arrival from Polaris and a click on the video loading play button; automatic page views are disabled. It never receives AI conversation content, extension settings, or PayPal payment details.
- Visitors can change this choice from “Analytics settings” in the footer. The full disclosure is available at [privacy.html](privacy.html).

## Design

Hero typography rules are recorded in [design-guideline.md](design-guideline.md).
