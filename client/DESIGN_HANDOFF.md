# Design Handoff

## Overall Aesthetic and Mood
The application should feel like a modern, dark, chat-first product: calm, clean, slightly technical, and confident. The mood is understated rather than flashy. It should suggest speed, clarity, and reliability, with a subtle Telegram-like familiarity but its own identity through the blue brand treatment and italic wordmark.

The atmosphere is dark and immersive, but not heavy. Panels float above a deep blue-black background. Accents are cool blue, not neon. The interface should feel fast, polished, and purposeful.

## Design Philosophy
The visual language is based on restraint. Use a small number of strong decisions and keep everything consistent. Prioritize readability, spaciousness, and gentle contrast over decorative complexity.

The UI should communicate:
- Speed without aggression
- Confidence without clutter
- Warmth without softness becoming childish
- A product feel that is polished, direct, and easy to use

Do not introduce visual styles that feel generic, playful, glassy, purple, or overly enterprise-like.

## Visual Goals
- Keep the interface dark and calm.
- Keep brand presence visible but not overwhelming.
- Make action areas obvious through color and contrast.
- Use cards for primary content surfaces.
- Keep motion minimal and smooth.
- Preserve a strong chat-app identity.

## Color Palette and Usage
The palette is built around deep blue-black backgrounds and cool blue accents.

### Exact values to preserve
```css
--bg-0: #0b141a;
--bg-1: #111b21;
--bg-2: #18222d;
--surface: #1f2c38;
--surface-soft: #223241;
--border: #2e3f4f;
--text: #d7e4ef;
--text-soft: #90a7bb;
--accent: #49a9ea;
--accent-strong: #6fbaf0;
```

### Practical usage
- Page background uses a vertical dark gradient with soft blue radial glows.
- Panels use `#1f2c38` to `#223241` style surfaces.
- Borders stay muted and slate-blue rather than bright or pure black.
- Primary blue is the main action/focus color.
- Brand and interactive emphasis should stay in the `#49a9ea` / `#6fbaf0` range.
- Error treatment should remain subdued, using a muted red fill and soft red text rather than bright danger red.

### Core colors
- Background base: very dark blue-black.
- Surface cards: slightly lighter blue-gray panels.
- Borders: muted slate-blue separators.
- Main text: soft off-white with a cool tint.
- Secondary text: muted blue-gray.
- Accent blue: the primary brand and interactive color.
- Strong accent blue: used for emphasis and gradients.

### Usage rules
- Backgrounds should stay dark and layered.
- Accent blue should be reserved for important interactive elements, brand marks, focus states, and selected emphasis.
- Button gradients should stay within the blue family.
- Error states should use muted red tones only for feedback, not as a theme.
- Avoid warm colors unless used sparingly for specific status meanings.

## Typography Choices
The current tone depends heavily on typography.

### Exact values to preserve
- Primary font: `IBM Plex Sans`, with `Segoe UI` as fallback.
- Body weight: 400.
- Supporting text often uses 500 or 600.
- Brand wordmark uses 800 weight, italic styling, and a slight skew.
- Brand wordmark size is currently `1.9rem`.
- Main panel headings are around `clamp(1.8rem, 4vw, 2.2rem)`.
- Body line-height is `1.4`.

### Usage rules
- Headings should stay bold and compact, not decorative.
- Body copy should remain readable and calm.
- The brand mark is the only strongly stylized text element.

- Primary typeface: IBM Plex Sans or a similarly clean, modern sans-serif.
- Brand wordmark: italic, heavier weight, slightly slanted to suggest motion and speed.
- Headings: bold but not oversized; they should be readable and stable.
- Body text: clear, moderate line-height, no decorative treatment.

Typography should feel crisp, not rounded or bubbly. The brand mark should remain the most stylized text element.

## Spacing Philosophy
Spacing is generous but controlled.

### Exact spacing values to preserve
- Global body padding: `1.25rem`.
- Auth page outer padding: `2rem 1.25rem`.
- Main panel padding: `2rem`.
- Panel content gap: roughly `1rem` to `1.5rem` depending on section.
- Form field gap: `0.75rem`.
- Button stack gap on landing: `0.8rem`.
- Corner brand offset: `0.9rem` from top/left.
- Home link margin-top: about `0.9rem`.

- Use roomy padding inside cards.
- Keep form fields and buttons separated enough to breathe.
- Maintain consistent vertical rhythm across all auth screens.
- Avoid tight stacking that feels cramped.
- Use a small number of spacing scales and reuse them consistently.

The layout should feel open even when content is minimal.

## Border Radius and Shadows
The design uses soft, rounded geometry without becoming pill-heavy everywhere.

### Exact values to preserve
- Cards/panels: `20px` radius.
- Inputs and buttons: `12px` radius.
- Loading dots: fully round (`999px`).
- Main panel shadow: `0 24px 40px rgba(3, 8, 12, 0.45)`.
- Inner highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.04)`.
- Focus ring: `0 0 0 4px rgba(73, 169, 234, 0.16)`.
- Brand mark shadow/glow: a subtle blue glow only, never a strong neon bloom.

### Border radius
- Cards: medium-large radius, around 20px feel.
- Buttons and inputs: rounded but more restrained, around 12px feel.
- The loading dots are fully round.

### Shadows
- Shadows are soft and atmospheric, not harsh.
- Primary panels should appear raised from the background.
- Shadows should be dark and subtle, supporting depth rather than calling attention to themselves.
- Avoid heavy neon glows or strong drop shadows.

## Layout Principles
The current structure is centered and minimal.

### Exact layout values to preserve
- Auth page content is centered with a single primary panel.
- Panels are constrained to about `430px` on login/signup and `460px` on landing.
- Loading state is full-screen centered and stripped down.
- The brand mark sits at the page corner, outside the card.
- The home page placeholder should remain simple until the real chat shell exists.

- Auth pages should center the primary panel in the viewport.
- The brand mark belongs at the top-left of the page, outside the card.
- The card content should be vertically ordered and easy to scan.
- The landing screen should present one clear decision point with stacked actions.
- The home screen should remain simple until the real app shell is introduced.

Use a single primary card as the focal point. Do not split attention across multiple competing surfaces.

## Component Style

### Buttons
- Buttons should feel solid, direct, and easy to recognize.
- Primary buttons use the blue accent and can carry a subtle gradient.
- Secondary buttons should remain dark and bordered.
- Hover states should be small and controlled, usually a slight lift or border emphasis.
- Disabled states should clearly reduce brightness and remove motion cues.

### Exact button values to preserve
- Radius: `12px`.
- Padding: `0.82rem 1rem`.
- Hover transition: `0.2s ease`.
- Primary gradient: `linear-gradient(180deg, #6fbaf0, #49a9ea)`.
- Secondary button background: `#1b2732` or `var(--surface)`.

### Cards / Panels
- Cards are dark, slightly lighter than the background, and softly bordered.
- Use subtle depth and rounded corners.
- Keep card interiors clean and uncluttered.

### Exact card values to preserve
- Background: `linear-gradient(180deg, rgba(34, 50, 65, 0.92), rgba(24, 34, 45, 0.96))`.
- Widths: `380px` loading panel, `430px` login/signup, `460px` landing.

### Inputs
- Inputs should feel calm and precise.
- Borders are muted until focus.
- Focus states should use the accent blue with a soft ring.
- Placeholder text should be subdued.

### Exact input values to preserve
- Radius: `12px`.
- Padding: `0.78rem 0.9rem`.
- Placeholder color: `#6d8598`.


### Navigation / Links
- Links should not feel flashy.
- Inline links should use the accent blue and be obvious on hover.
- Auth navigation links should remain understated and helpful.

### Brand Logo
- The logo is a wordmark, not an icon badge.
- It should appear in accent blue.
- It should be italic and feel fast.
- The visual separator between words should resemble a stylized equal-sign form: two horizontal blue bars, not a pipe character.
- The brand should always sit in the top-left corner of the page, outside the main card.

### Exact brand logo values to preserve
- Word size: `1.9rem`.
- Word weight: `800`.
- Word style: italic with `skewX(-12deg)`.
- Separator width: about `2.8rem`.
- Separator bar height: `0.2rem`.
- Separator gap: `0.22rem`.
- Corner offset: `0.9rem`.

### Loading
- Loading should be extremely minimal.
- The current style is only three animated dots.
- No card background, no text, no extra brand panel.
- The dots should stay consistent with the blue accent and bounce gently.

### Exact loading values to preserve
- Dot size: `0.8rem`.
- Dot gap: `0.5rem`.
- Animation duration: `0.9s`.
- Bounce offset: `-0.4rem`.

### Errors
- Errors should be visible but restrained.
- Use a soft red-tinted background with light red text.
- Error messages should be legible and compact.
- Do not use aggressive colors, large icons, or loud banners.

### Exact error values to preserve
- Background: `rgba(116, 28, 39, 0.35)`.
- Border: `rgba(255, 112, 112, 0.4)`.
- Text: `#ffb7bf`.
- Radius: `10px`.

## Animation and Transition Style
Motion should be subtle and limited.

### Exact motion values to preserve
- Panel entrance: `0.45s ease-out`.
- Hover transitions: `0.2s ease`.
- Loading bounce: `0.9s infinite ease-in-out`.
- Hover lift is very small, only about `translateY(-1px)`.

- Card entrances should use a very small fade/slide/scale combination.
- Hover motion should be slight and quick.
- Loading dots should bounce gently and rhythmically.
- Avoid bouncy, elastic, or overly playful transitions.
- No complex page transitions, parallax, or dramatic sequences.

The motion style should support the feeling of speed, not distract from it.

## Empty States, Loading States, and Errors

### Empty states
Empty states should be minimal, calm, and informative. They should not feel like promotional sections. Keep them sparse and direct.

### Loading states
Use the existing dot loader style. It should remain stripped down and unobtrusive. Loading is a temporary state, not a destination.

### Errors
Errors should be compact and readable, with enough contrast to be noticed without hijacking the screen.

## Responsive Design Philosophy
The interface should remain stable across desktop and mobile.

### Responsive values to preserve
- Default page padding stays around `1.25rem` on the outer edges.
- Cards should continue to scale by width, not by changing the whole layout pattern.
- Brand placement should remain top-left even on smaller screens.
- Auth panels should never stretch to full width on desktop.

- Keep cards centered and responsive.
- Maintain consistent page padding on smaller screens.
- Allow the brand mark to scale proportionally without crowding the edges.
- Avoid layouts that depend on wide viewports to function well.
- Buttons should stack cleanly on narrow screens.

Responsive behavior should preserve the same hierarchy and emotional tone, not become a different design at smaller sizes.

## UI Patterns That Should Remain Consistent
These patterns should stay uniform across future work:

- Dark background with blue-tinted surfaces.
- Accent blue used for primary actions and focus.
- Soft borders and rounded cards.
- Top-left brand mark outside the main card.
- Centered primary panel for auth screens.
- Minimal loading states.
- Calm error presentation.
- Italic brand wordmark with the two-bar separator.
- Small hover lifts and subtle focus rings.

## Things That Should Never Change Unless Explicitly Requested
- The dark, blue-forward visual identity.
- The italic Socket | Talk wordmark style.
- The top-left brand placement.
- The restrained, low-noise loading treatment.
- The centered card-based auth layout.
- The soft panel depth and muted borders.
- The minimalist motion language.
- The use of cool blue accents as the primary interactive color.
- The overall chat-app mood: calm, fast, and clean.

## Overall Feel
The application should feel like a polished, modern messaging product that is fast and confident without looking flashy. It should feel approachable, but not casual; sharp, but not cold; minimal, but not empty.

If future work respects the current dark palette, blue accent system, restrained motion, and brand placement, the visual identity will stay coherent.
