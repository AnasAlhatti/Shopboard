## Bug 1

- **What I saw:** Catalog product photos looked too large and appeared stretched.
- **Type:** logic
- **How I found it:** Visual inspection of the catalog page after comparing it with the design reference.
- **Cause:** `src/styles/catalog.css:156` forced landscape product crops into square frames, distorting their proportions and using too much vertical space.
- **Fix:** Set the catalog image frame to a 1.65:1 aspect ratio in the base catalog style and its responsive overrides.
- **Did I use AI? For what?** Yes; I used AI to trace the visual issue to the catalog image aspect-ratio rules and update them.

## Bug 2

- **What I saw:** The account page's story image looked stretched, and its appearance changed when switching between login and signup.
- **Type:** logic
- **How I found it:** Compared the account image at desktop width in both modes and added a browser check for its rendered aspect ratio.
- **Cause:** `src/shared/presentation.ts:22` set the sprite image width and height independently from its crop dimensions. The signup form made the grid row taller, which changed the image frame and exposed the distortion.
- **Fix:** Matched the account image frame to a wide, uniformly scaled sprite crop so the signup panel does not enlarge or distort the artwork; added a regression check for both account modes.
- **Did I use AI? For what?** Yes; I used AI to trace the image sizing issue, implement the fix, and add a regression check.
