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
