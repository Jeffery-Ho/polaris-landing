# Design QA

## Hero typography refinement

- Desktop, 1280 × 720: the category eyebrow is absent; headline renders at 58.88px; the supporting sentence renders as `rgb(65, 107, 240)`.
- Mobile, 390 × 844: the category eyebrow remains absent; the 40px minimum headline size and blue supporting sentence fit without horizontal overflow.

Final result: passed.

## Floating capsule header

- Desktop: the header is centered and capped at 840px with a full-pill radius; it remains part of normal page flow.
- Mobile: the stacked header remains within the viewport without horizontal overflow.
