# Chest Lab: Blender → Browser

A small React Three Fiber website using an imported treasure chest. Click the model or the button to open or close the lid. Use the slider to choose an angle; turn on the hinge marker or wireframe to inspect it. Switch between JavaScript rotation and Blender-authored animation clips.

For a guided walkthrough of every part, read the [Chest Lab study guide](../docs/chest-study-guide.md).

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
- `blender/animate_chest.py`: add the Blender timeline and export named clips.
- `public/models/chest-preview.png`: rendered loading preview.
- `build.mjs`: validates the GLB and copies the static website into `dist/`.
- `server.mjs`: local static server.

## What is animated?

The **Animate with** selector compares two approaches:

- **JavaScript rotation:** `Chest` finds the named `Lid` and changes its local X rotation each frame. Zero is closed; −100 degrees is open.
- **Blender animation clips:** Three.js's `AnimationMixer` evaluates `OpenChest` or `CloseChest`, which were authored as Blender keyframes and exported in the GLB. The browser seeks through the selected clip to support the angle slider and interrupted/reversed motion.

Both approaches share the hinge, target-angle controls, and smooth-motion setting. The body, lock, and treasure stay still. The lock is decorative; we are not simulating its mechanics.

The downloaded model comes posed open. The preparation script normalizes it to a closed pose while preserving the hinge. Blender uses Z-up and glTF uses Y-up; the exporter converts between them.

## Play the animation in Blender

Open `blender/treasure-chest.blend`, place the pointer over the Timeline or 3D Viewport, and press **Space**. Frames 1–41 open the lid, 41–61 hold it open, and 61–101 close it. Press Space to pause. **Shift + Left Arrow** returns to the first frame. The two actions are arranged as NLA strips so the whole sequence plays in the scene while the exported GLB contains separate clips.

## Make a small Blender tweak

1. Open `blender/treasure-chest.blend`.
2. Select a chest part. Change a material's Base Color, or adjust the shape in Edit Mode.
3. Keep the `Lid` name and hinge origin. Return to frame 1 before exporting. Its rotation is driven by keyframes; edit its shape in Edit Mode or modify the animation in the Action Editor rather than changing its Object Mode rotation.
4. Select `TreasureChest` and its children, then File → Export → glTF 2.0. Export GLB with Selected Objects and Animation enabled, with Animation Mode set to Actions and Slide to Zero enabled. Replace `public/models/treasure-chest.glb` and preserve the `OpenChest`/`CloseChest` names.
5. Save the `.blend` source and refresh the browser.

Avoid moving the lid independently unless you intend to change the hinge. Save a copy before experimenting.

## Model source and terms

Model: [Low-Poly Treasure Chest by Shuriken Studio](https://shuriken.studio/models/props/low-poly-treasure-chest), downloaded 2026-11-15.

License: [Free model license, version 2026-11-13](https://shuriken.studio/legal/models). Allows use and modification within projects, including sharing project source. Prohibits redistributing the model as a standalone asset or asset pack. The model is third-party artwork; the repository uses it as part of this interactive exercise. Do not apply a blanket open-source license to the model files.

## Check and build

```sh
npm run check
npm run build
```

The build validates the named lid, its closed rest pose, both clips' rotation targets, clip times and endpoint quaternions, and required files. It then creates `dist/`, which can be served by a static host. Syntax/data checks do not replace testing interaction and appearance in a browser.

The authoring environment blocked local server sockets and could not reach the Sites source-hosting endpoint. The reserved Site identity is recorded in `.openai/hosting.json`; it has not been published. Run locally using the instructions above.

## Recreate the assets

In a fresh Blender scene, run `blender/prepare_chest.py`, then `blender/animate_chest.py`. Keep the original GLB in its documented path. Both scripts refuse to overwrite pre-existing objects or animation with conflicting names.
