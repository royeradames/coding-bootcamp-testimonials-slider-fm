# Coding bootcamp testimonials slider

An implementation of the [Frontend Mentor coding bootcamp testimonials slider challenge](https://www.frontendmentor.io/challenges/coding-bootcamp-testimonials-slider-4FNyLA8JL), using its supplied portraits, patterns, copy and design references.

Two testimonials, Tanya Sinclair and John Tarkpor, switch with the previous and next buttons, the left and right arrow keys while focus is in the slider, or a horizontal swipe. There are no forms, accounts or network writes.

## Development

Node 22.13 or later. Use `npm ci`, `npm run dev`, `npm run lint`, `npm run build`, `npm run typecheck` and `npm test`. Browser tests use installed Chrome and own port 4571.

Next 16.3.6, React 19.2.8, TypeScript 5.9.3 and Tailwind 4.2.1 are pinned to the family baseline. The slider is the only client component.

## Sources

Original challenge files are preserved under `reference/`; supplied images moved byte-for-byte to `public/images/`. Layout, spacing, colours, shadows and type follow the decoded Figma frames Desktop (1440), Tablet (768) and Mobile (375). Inter 300/500/700 is served through `next/font`.

## Implementation choices

- The slider follows the WAI carousel pattern: a labelled `carousel` region, `slide` groups labelled "1 of 2", inactive slides hidden and inert, and a polite status line that names the new testimonial after each change. It never rotates on its own.
- Transitions run only with `prefers-reduced-motion: no-preference`.
- Both slides share one grid cell, so the layout doesn't jump between the shorter and longer quote.
- The design's 15px mobile name and role are raised to the 16px family floor. The mobile arrow pill grows from 80×40 to 88×44 so each button meets the 44px target floor.
- The design's role colour, Gray 400 `#b9b9ce`, is about 1.9:1 on white. It's darkened to `hsl(240 18% 50%)` (about 5:1) so the job titles pass WCAG AA. The arrows keep the supplied `#8585ac` and darken to navy on hover and focus.
- On desktop the Figma quote column (165→800 at 1440) runs over the photo, which put quote lines on the portrait at narrower desktop widths. The column now ends where the photo starts (165→735, with 24px of padding), so the quote wraps one line more at 1440 but never sits on the image (width sweep, October 8, 2026).
- Without JavaScript, the first testimonial renders in full.
- One site name, "Coding bootcamp testimonials slider", appears in the footer, `og:site_name` and `WebSite` JSON-LD. The canonical URL is the planned `coding-bootcamp-testimonials-slider-fm.royeradames.com` production domain, which isn't attached yet.
