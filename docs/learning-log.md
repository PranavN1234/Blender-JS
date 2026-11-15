# Learning log

## 2026-11-15 — Setup and direction

- Reviewed the portfolio room brief.
- Verified the live Blender MCP connection to Blender 5.3.0.
- The starting scene contains the default cube, camera, and light.
- Selected an interactive treasure chest as the proposed first exercise.
- Planned to learn code-driven animation first, then Blender-authored animation clips.
- Selected `PranavN1234/Blender-JS` as the GitHub repository for this work.

## Concepts to cover

- Meshes, materials, transforms, parenting, and pivots.
- `.blend` as the editable source; `.glb` as the browser asset.
- Three.js rendering and React Three Fiber components.
- Click interactions and frame-based animation.
- Blender keyframes and exported animation playback.

## 2026-11-15 — Imported chest and browser exercise

- Downloaded Shuriken Studio's Low-Poly Treasure Chest and reviewed its project-use license.
- Imported it through the live Blender MCP. The hierarchy has `TreasureChest`, `Chest_Body`, `Lid`, `Lock`, and `Treasure`.
- Inspected the open model, normalized its lid orientation to zero in the closed pose, and kept the hinge origin.
- Visually checked the closed pose and a -100-degree open pose in Blender.
- Saved `learning-demo/blender/treasure-chest.blend` and the original/prepared GLBs.
- Implemented a React Three Fiber browser demo with click-to-open, an angle slider, orbit/zoom/reset, hinge visualization, wireframe, and a reduced-motion-aware setting.
- This exercise animates the lid in JavaScript. Blender-authored clips are a later lesson.
- JavaScript syntax and GLB hierarchy/closed-transform checks pass.
- Browser verification is pending: local sockets are blocked (`listen EPERM`).
- Private Sites registration is recorded in the demo manifest, but publication is blocked because the shell cannot resolve the hosting Git endpoint. No live URL is available yet.
- Work is authored in the original writable `Documents/blender` workspace; the user's separate `Documents/Blender-JS` checkout must pull the GitHub commit.

## 2026-11-15 — Complete animation comparison

- Added `OpenChest` and `CloseChest` keyframe actions to the Blender file and exported them to GLB.
- Arranged NLA strips into a playable open/hold/close timeline (frames 1–101, 30 fps).
- Added a website selector comparing code-driven rotation with sampling Blender-authored clips through Three.js's animation mixer. Both modes support the slider, reversals, and reduced motion.
- Added a Blender-rendered loading preview and a dependency-free static build.
- Build checks verify both clips, their lid-only targets, increasing keyframe times, zero closed pose, and 100-degree opening quaternions.
- Ran both asset scripts in a fresh background Blender process and confirmed the resulting geometry, hierarchy, animations, and accessors match the delivered GLB.
- Browser execution and hosted publication remain unverified due to the previously recorded environment restrictions.

## 2026-11-15 — Study guide

- Added `docs/chest-study-guide.md` with a file-by-file learning path across Blender, Python asset preparation, keyframes/NLA, GLB, React state, Three.js interaction, animation playback, and build validation.
- Included progressive exercises, self-check answers, official references, and debugging guidance for module-loading failures.
- The reported startup error did not include a browser error trace, so its specific cause remains unconfirmed. A move to locally installed dependencies was discussed but not implemented; the guide describes the actual CDN-based setup.
