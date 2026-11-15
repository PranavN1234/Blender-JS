# Chest Lab: Blender → Browser

A small React Three Fiber website using an imported treasure chest. Click the model or the button to open or close the lid. Use the slider to choose an angle; turn on the hinge marker or wireframe to inspect it.

## Run

Requires Node.js (18 or newer) and an internet connection for pinned JavaScript dependencies and optional fonts.

```sh
cd learning-demo
npm run dev
```

Open http://localhost:5173. No `npm install` or build is needed: the page uses browser ES modules and an import map. It cannot be opened directly with `file://` because the model is fetched over HTTP.

## Files

- `public/index.html`: page shell and pinned dependency URLs.
- `public/app.mjs`: React UI, Three.js scene, and lid animation.
- `public/style.css`: responsive layout.
- `public/models/treasure-chest.glb`: corrected closed-pose browser model.
- `public/models/treasure-chest-original.glb`: untouched downloaded source.
- `blender/treasure-chest.blend`: editable Blender scene.
- `blender/prepare_chest.py`: repeatable import and export script.
- `server.mjs`: local static server.

## What is animated?

This first exercise animates **in JavaScript**, not with a Blender animation clip. `Chest` finds the node named `Lid` and changes its local X rotation each frame. Zero is closed; −100 degrees is open. The lid already has its origin at the hinge. The body, lock, and treasure stay still. The lock is decorative; we are not simulating its mechanics.

The downloaded model comes posed open. The preparation script normalizes it to a closed pose while preserving the hinge. Blender uses Z-up and glTF uses Y-up; the exporter converts between them.

## Make a small Blender tweak

1. Open `blender/treasure-chest.blend`.
2. Select a chest part. Change a material's Base Color, or adjust the shape in Edit Mode.
3. Keep the `Lid` name and its hinge origin. In Object Mode, rotate it on X to preview opening, then return its rotation to zero before export.
4. Select `TreasureChest` and its children, then File → Export → glTF 2.0. Export GLB with Selected Objects, replacing `public/models/treasure-chest.glb`.
5. Save the `.blend` source and refresh the browser.

Avoid moving the lid independently unless you intend to change the hinge. Save a copy before experimenting.

## Model source and terms

Model: [Low-Poly Treasure Chest by Shuriken Studio](https://shuriken.studio/models/props/low-poly-treasure-chest), downloaded 2026-11-15.

License: [Free model license, version 2026-11-13](https://shuriken.studio/legal/models). Allows use and modification within projects, including sharing project source. Prohibits redistributing the model as a standalone asset or asset pack. The model is third-party artwork; the repository uses it as part of this interactive exercise. Do not apply a blanket open-source license to the model files.

## Next lesson

Author an opening clip in Blender and trigger it with Three.js's animation system. That is separate from the code-driven hinge in this first exercise.
