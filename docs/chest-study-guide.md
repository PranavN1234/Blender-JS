# Chest Lab study guide: Blender → Python → GLB → JavaScript

This guide explains the project you can actually open and edit in this repository. Keep the website and Blender open while reading. Each lesson ends with a small experiment and a question you should be able to answer before moving on.

You do not need to understand every section before making changes. Start with lessons 1–3, then follow one click through the browser code in lessons 4–6. Save the math and build internals for later.

## Quick navigation

- [1. See the whole pipeline](#1-see-the-whole-pipeline)
- [2. Understand the Blender model](#2-understand-the-blender-model)
- [3. Play and inspect the Blender animation](#3-play-and-inspect-the-blender-animation)
- [4. Find your way around the website](#4-find-your-way-around-the-website)
- [5. Follow one click](#5-follow-one-click)
- [6. Understand the two animation modes](#6-understand-the-two-animation-modes)
- [7. Read the Python preparation script](#7-read-the-python-preparation-script)
- [8. Read the Python animation script](#8-read-the-python-animation-script)
- [9. Understand export and GLB](#9-understand-export-and-glb)
- [10. Understand the server and build](#10-understand-the-server-and-build)
- [11. Make a change from Blender to browser](#11-make-a-change-from-blender-to-browser)
- [12. Debug by following the pipeline](#12-debug-by-following-the-pipeline)
- [13. Apply this to the portfolio room](#13-apply-this-to-the-portfolio-room)
- [Practice ladder](#practice-ladder)
- [Glossary](#glossary)

## 1. See the whole pipeline

```text
Original chest GLB
    ↓ prepare_chest.py, running inside Blender
Editable chest with a clean hinge and closed rest pose
    ↓ animate_chest.py, running inside Blender
Blender source (.blend) + exported model and clips (.glb)
    ↓ local HTTP server serves the files
Browser loads app.mjs + GLB
    ↓ React tracks clicks and target angles
React Three Fiber / Three.js updates and draws the scene
```

| Component | What it does here | What it does not do here |
| --- | --- | --- |
| Blender | Edits geometry, materials, origins, and keyframes | Does not listen for website clicks |
| Python / `bpy` | Automates Blender imports, transforms, animation, and export | Does not run on every browser frame |
| `.blend` | Saves editable Blender project data | Is not loaded by the website |
| `.glb` | Transfers the meshes, materials, hierarchy, and clips | Does not include our JavaScript click handlers |
| React | Holds the target angle and renders buttons, labels, and settings | Does not calculate the mesh geometry |
| React Three Fiber | Connects React components, pointer events, and the Three.js render loop | Is not a separate modeling tool |
| Three.js | Loads assets, manages the camera and lights, and animates scene objects | Does not run Blender Python |
| WebGL | Lets the browser draw the scene through the graphics system | Is not something we call directly in this exercise |
| Node.js | Runs the local file server and build checks | Is not required to calculate the lid angle in a visitor's browser |
| Blender MCP | Let the assistant inspect and edit the live Blender application | Is not required for the finished website to run |

The original artwork is [Shuriken Studio's chest](https://shuriken.studio/models/props/low-poly-treasure-chest). Our exercise adds asset preparation, animation, interaction, and the website. The project's [README](../learning-demo/README.md#model-source-and-terms) records its source and terms.

**Try:** Close Blender while leaving the website running. The website can still animate its loaded model. Reopen the `.blend` file afterward.

**Check:** Why does a visitor not need Blender or Python installed?

## 2. Understand the Blender model

Open [`treasure-chest.blend`](../learning-demo/blender/treasure-chest.blend). The important hierarchy is:

```text
TreasureChest       ← parent Empty: a transform/group, with no visible mesh
├── Chest_Body      ← wood and metal body
├── Lid             ← independently movable lid
├── Lock            ← decorative lock
└── Treasure        ← coins and gems
```

Other camera, light, or default objects in the Blender file are not part of the exported chest. The export scripts explicitly select the chest hierarchy.

### The concepts you need first

| Concept | Meaning in this model |
| --- | --- |
| Mesh | Vertices, edges, and faces defining a visible shape |
| Object | A scene item that references a mesh or another kind of data and has its own transform |
| Material | Surface appearance: color, roughness, metalness, and other shading inputs |
| Transform | Position, rotation, and scale |
| Origin | The object's local reference point; the lid rotates about this point |
| Parent | An object whose transform affects its children |
| Collection | Blender organization; grouping objects in a collection alone does not make them inherit transforms |

The hinge works because the lid is a separate object and its origin is at the back edge. Rotating a lid around its center would make it tumble. Rotating it around its hinge makes it open.

The body and lid are siblings. Moving `TreasureChest` moves both. Rotating `Lid` leaves the body still. The lock is decorative and stays with the body; this demo does not simulate unlocking hardware.

### Object Mode and Edit Mode

**Object Mode** changes an entire object's transform. **Edit Mode** changes the geometry relative to the object's origin. Editing the lid's shape without moving its origin is a useful way to change its proportions while preserving the hinge.

| Default shortcut | Purpose |
| --- | --- |
| `G`, `R`, `S` | Move, rotate, scale |
| Then `X`, `Y`, or `Z` | Restrict that operation to one axis |
| `Tab` | Switch Object/Edit Mode for a mesh |
| `N` | Open the sidebar with numeric transforms |
| `F3` | Search for commands |
| `Space` | Play/pause the animation |

Keep experiments in a copy of the file. The lid now has animation, so changing its Object Mode rotation can be overwritten when the timeline evaluates. Inspect its motion by scrubbing frames; edit the keys when you want to change the animation.

**Try:** Select `Lid` in the Outliner. Scrub the timeline while watching its X rotation in the sidebar. Then select `Chest_Body` and observe that its transform remains unchanged.

**Check:** What is the difference between parenting objects and placing them in the same collection?

## 3. Play and inspect the Blender animation

Put your pointer over the Timeline or 3D Viewport and press **Space**. **Shift + Left Arrow** returns to the beginning.

| Scene frames | Result |
| --- | --- |
| 1–41 | Lid opens from 0° to −100° |
| 41–61 | Lid stays open |
| 61–101 | Lid closes from −100° to 0° |

The scene is 30 frames per second. Opening takes `(41 - 1) / 30`, approximately **1.33 seconds**. A frame number is a point in time; the interval between the first and last frames determines duration.

### Keyframe → curve → action → NLA strip

- A **keyframe** records a property's value at a particular frame.
- An **F-curve** describes one changing channel, such as X rotation.
- An **action** collects animation data. We have `OpenChest` and `CloseChest`.
- An **NLA strip** places an action on the scene timeline. NLA means Nonlinear Animation.

Each action has its own keys at frames 1 and 41. The close action is placed later in the scene, at frames 61–101. This lets Blender play a sequence while the browser receives two reusable clips.

The Python script uses **linear interpolation**. Halfway through the opening action, the lid is halfway through its rotation. Smoother motion in the website is added separately by the browser's easing toward a target angle.

Use the Action Editor to inspect an action's keys. Use the NLA Editor to inspect how the two actions are arranged. The active action can be empty because the NLA strips are driving playback.

**Try:** Inspect frames 1, 21, and 41. Expect approximately 0°, −50°, and −100°. Inspect frame 81: the lid should be halfway closed.

**Check:** How can the close action start at frame 1 in its own data but start at frame 61 in the scene?

Reference: [Blender animation and rigging](https://docs.blender.org/manual/en/latest/animation/).

## 4. Find your way around the website

Start the website from your checkout:

```sh
cd ~/Documents/Blender-JS/learning-demo
npm run dev
```

Open `http://localhost:5173`. The current exercise loads pinned browser libraries through an import map, so it needs internet access for those dependencies. It does not currently use Vite or require `npm install`.

### File map

| File | Read it to understand |
| --- | --- |
| [`public/index.html`](../learning-demo/public/index.html) | The page shell, module import map, and startup error handler |
| [`public/app.mjs`](../learning-demo/public/app.mjs) | React state, 3D rendering, controls, clicks, and both animation modes |
| [`public/style.css`](../learning-demo/public/style.css) | Layout, colors, responsive behavior, and the controls' appearance |
| [`public/models/`](../learning-demo/public/models) | Original GLB, prepared GLB, and rendered loading image |
| [`server.mjs`](../learning-demo/server.mjs) | Serving files over local HTTP |
| [`package.json`](../learning-demo/package.json) | The commands invoked by `npm run ...` |
| [`build.mjs`](../learning-demo/build.mjs) | Asset validation and copying files into `dist/` |
| [`.openai/hosting.json`](../learning-demo/.openai/hosting.json) | Reserved hosting identity and output directory; not evidence of a live deployment |

`.mjs` means JavaScript using ES modules: `import` and `export`.

### The component map inside app.mjs

| Component | Responsibility |
| --- | --- |
| `App` | Target angle, animation source, settings, and page layout |
| `Toggle` | Reusable checkbox control |
| `SceneBoundary` | Displays an error message if the scene fails |
| `Scene` | Canvas, lights, ground, camera settings, and model placement |
| `Chest` | Loads the GLB, handles chest clicks, changes appearance, and animates the lid |
| `CameraControls` | Creates orbit controls, updates them each frame, resets the camera, and cleans up listeners |

The file uses `const h = React.createElement` rather than JSX. These express the same component structure:

```js
h('button', { onClick: toggle }, 'Open the chest')
```

```jsx
<button onClick={toggle}>Open the chest</button>
```

Inside the Canvas, `h('mesh', ...)` creates a Three.js mesh through React Three Fiber. Outside it, `h('button', ...)` creates a normal HTML button through React DOM.

**Try:** Change only the title text in `App`, then refresh. You have changed the interface without changing the model.

**Check:** Which file would you edit to change button spacing? Which component would you inspect to change camera zoom limits?

## 5. Follow one click

Read `App` and `Chest` in `app.mjs` together.

### A. State stores the target

```js
const [angle, setAngle] = useState(0);
const toggle = () => setAngle((current) => current > 50 ? 0 : 100);
```

`angle` is the target in degrees: 0 means closed and 100 means fully open. `setAngle` requests a state update. The functional updater receives the latest target, which is useful when clicks arrive quickly.

The label and slider reflect this target; they do not measure the instantaneous lid position during an easing transition. The threshold is 50: a target above 50 toggles closed; a target at or below 50 toggles fully open.

The HTML button calls `toggle` directly. The 3D chest uses this handler:

```js
onClick: (event) => {
  if (event.delta > 5) return;
  event.stopPropagation();
  onToggle();
}
```

React Three Fiber uses raycasting to connect a screen pointer to intersected objects in the 3D scene. The handler is attached to the loaded model's scene object; events from its child meshes can bubble up to it. [Pointer-event reference](https://r3f.docs.pmnd.rs/api/events)

`event.delta` measures pointer travel between down and up. The filter helps distinguish a click from dragging the camera. `stopPropagation()` prevents this handled event from continuing to other eligible objects/ancestors.

### B. Props deliver the target to the scene

`App` passes `angle` and settings into `Scene`, which passes them into `Chest`. Props are inputs to a component. Neither the GLB nor Blender is contacted when the button is clicked.

### C. A ref stores the displayed angle

```js
const shownAngle = useRef(0);
```

This value changes each frame while the lid moves toward the target. A ref retains a value without asking React to render the HTML interface again whenever it changes.

Use React state for decisions the UI needs to reflect. Use refs for mutable animation bookkeeping. We do not call `setAngle` on every frame.

**Try:** Drag the slider to 35°, then click Open. It goes toward 100°. Click again during motion: the target reverses.

**Check:** Why do we need both a target angle and a displayed angle?

References: [React state](https://react.dev/learn/state-a-components-memory), [React Three Fiber hooks](https://r3f.docs.pmnd.rs/api/hooks).

## 6. Understand the two animation modes

Both modes use `useFrame`, which runs before each rendered frame and receives elapsed time, `delta`, in seconds. It is used by components inside the Canvas. [Hook reference](https://r3f.docs.pmnd.rs/api/hooks)

### Shared timing

```js
const next = motion
  ? MathUtils.damp(shownAngle.current, angle, 8, Math.min(delta, 0.05))
  : angle;

shownAngle.current = Math.abs(next - angle) < 0.02 ? angle : next;
```

The browser eases the displayed angle toward the target. A higher damping rate makes the response faster; a lower one makes it more gradual. `delta` makes the motion depend on elapsed time rather than a fixed increment per frame. The cap limits the step after a long frame, and the small snap threshold lets the lid settle exactly at its target.

When Smooth motion is off, the target is applied immediately. The initial setting respects the visitor's reduced-motion preference.

### Mode A: JavaScript rotation

```js
lid.rotation.x = -MathUtils.degToRad(shownAngle.current);
```

Three.js expects radians: `radians = degrees × π / 180`. The minus sign opens this particular model backward around its local X axis. Another model's hinge may need a different axis or sign.

This mode only needs the separate lid and correct origin. It does not need animation keyframes.

### Mode B: Blender clips

The model loader returns both a `scene` and `animations`. We find the exported clips by their names and create an `AnimationMixer`:

```js
const mixer = new AnimationMixer(scene);
const open = animations.find((clip) => clip.name === 'OpenChest');
const action = mixer.clipAction(open);
```

A **clip** contains the recorded animation data. An **action** controls how a clip is applied. A **mixer** evaluates actions against scene objects. [AnimationMixer reference](https://threejs.org/docs/pages/AnimationMixer.html)

Our demo intentionally supports scrubbing rather than simply letting a clip run uninterrupted:

```js
action.paused = true;
action.time = progress * action.getClip().duration;
player.mixer.update(0);
```

Here `progress` is between 0 and 1. We manually choose the action time, then evaluate the pose without advancing the clock. When closing, the code chooses `CloseChest` and maps the remaining angle to that clip's progress. The full implementation also switches actions and stops the old one.

**Important:** The browser's smooth setting controls how quickly progress changes. It therefore does not reproduce the Blender timeline's exact open/hold/close timing. It samples the same poses in response to interaction. Ordinary automatic playback would instead advance an unpaused mixer with `mixer.update(delta)`. [AnimationAction reference](https://threejs.org/docs/pages/AnimationAction.html)

### Why cleanup matters

`useEffect` cleanup stops and uncaches the animation mixer when the component goes away. `CameraControls` similarly disposes its orbit controls. Effects handle setup/cleanup; `useMemo` keeps the mixer/actions available across renders; `useRef` retains per-frame values.

### Camera, lighting, and inspection helpers

| Feature | Where to look | What to change experimentally |
| --- | --- | --- |
| Opening viewpoint | `HOME`, `TARGET`, and Canvas camera | Change the camera position slightly |
| Orbit and zoom | `CameraControls` | Inspect `minDistance`, `maxDistance`, and polar-angle limits |
| Lighting | `Scene` | Adjust one light's intensity, then restore it |
| Ground/shadows | Ground mesh and `castShadow`/`receiveShadow` | Observe why a model feels grounded |
| Wireframe | Material traversal in `Chest` | See that one object may have several materials |
| Hinge marker | Conditional helper group in `Chest` | Match its position to `lid.position` |
| Loading/errors | `Suspense`, fallback image, `SceneBoundary`, index startup handler | Separate loading from a failed import |

**Try:** Choose Blender clips, set 50°, switch to JavaScript rotation, and compare the pose. Then disable Smooth motion and repeat.

**Check:** Why is the action paused even though the website is visibly animating?

## 7. Read the Python preparation script

File: [`prepare_chest.py`](../learning-demo/blender/prepare_chest.py).

This script runs in **Blender's Python environment**. A normal `python3` process usually does not have `bpy`. For this project, use Blender's Scripting workspace or Blender's own command-line executable.

### Three parts of the API

| API | Example | Meaning |
| --- | --- | --- |
| `bpy.data` | `bpy.data.objects['Lid']` | Access stored project data |
| `bpy.context` | `bpy.context.scene` | Access the current scene, selection, and editing context |
| `bpy.ops` | `bpy.ops.import_scene.gltf(...)` | Invoke an operation, similar to a UI command |

Some operators require a particular selection, mode, or editor context. Direct data access is often clearer for reading and setting specific properties. [Blender Python quickstart](https://docs.blender.org/api/current/info_quickstart.html)

### Walk through the script

1. **Resolve the project path.** `Path` builds filesystem paths without manually concatenating slashes.
2. **Check for name conflicts.** Existing `TreasureChest` or `Lid` objects cause a refusal instead of silently editing the wrong object.
3. **Record objects before import.** A set difference identifies only objects created by the import.
4. **Import the original GLB.** This creates Blender objects and materials.
5. **Organize the imported objects.** They are linked to a dedicated collection and unlinked from their old collections; this does not delete their data.
6. **Normalize the lid.** The downloaded lid has an open orientation. Matrix operations prepare a closed mesh and clear the object rotation while retaining the hinge location.
7. **Use XYZ rotation mode.** This makes the later X-rotation keyframes explicit.
8. **Select only the imported objects.** `use_selection=True` keeps unrelated scene objects out of the export.
9. **Export the prepared GLB.** This first stage intentionally exports without animation.

### Object transforms versus mesh transforms

```python
lid.rotation_euler = (0, 0, 0)
```

changes the object's rotation. This is different from:

```python
lid.data.transform(some_matrix)
```

which changes the vertex coordinates in its mesh data.

The preparation script combines these carefully. It neutralizes the imported open orientation, bakes the appropriate transform into the mesh, and resets the object to a closed zero rotation. It also clears the quaternion rotation because the imported object originally used quaternion mode; an Euler display of zero alone does not establish the active rotation.

You can initially treat these matrix lines as an asset-specific preparation step. Applying them repeatedly or to an arbitrary different chest is not a general repair algorithm.

The `if __name__ == '__main__'` block runs the function when the script is executed as a file. Importing/loading it under another name lets you call its function explicitly with a chosen project path.

**Try, read-only:** In Blender's Python Console, evaluate:

```python
bpy.data.objects['Lid'].name
tuple(bpy.data.objects['Lid'].location)
bpy.data.objects['Lid'].rotation_mode
```

**Check:** Why does the script compare the object set before and after import?

## 8. Read the Python animation script

File: [`animate_chest.py`](../learning-demo/blender/animate_chest.py).

Run this after preparation in a fresh scene. The delivered `.blend` already has these animations; rerunning it there intentionally refuses to overwrite them.

### The action specification

```python
('OpenChest', 0, -100, 1)
('CloseChest', -100, 0, 61)
```

Each tuple means `(action name, start angle, end angle, scene strip start)`.

The script creates each action, assigns it temporarily, and inserts rotation keys:

```python
lid.rotation_euler = (math.radians(degrees), 0, 0)
lid.keyframe_insert(
    data_path='rotation_euler',
    frame=frame,
    group='Lid hinge',
)
```

`data_path` identifies the animated property. Inserting the whole Euler property creates X, Y, and Z curves, although only X changes here. The nested loops over layers, strips, channel bags, and curves set their keys to linear interpolation; these reflect the layered action API used by our Blender 5.3 setup.

After creating keys, the script clears the active action assignment and creates an NLA track and strip that reference the action. Clearing the assignment does not delete the action. The opening strip holds its last pose forward so the lid stays open before the closing strip begins.

It then sets the scene range, frame rate, and markers; selects the chest; exports the named actions; returns to frame 1; and saves the `.blend` source.

**Try:** Read the script and find the four independent decisions: opening angle, opening duration, pause duration, and scene frame rate. Predict what happens if the frame rate changes without moving the keys.

**Check:** Why do we save both the `.blend` and `.glb` after adding animation?

## 9. Understand export and GLB

The website loads `treasure-chest.glb`, not `treasure-chest-original.glb`. The original is retained so we can reproduce our preparation.

A GLB packages scene descriptions and binary data into one file. Relevant pieces include:

| glTF term | What it represents here |
| --- | --- |
| Node | Named hierarchy/transform entry such as `Lid` |
| Mesh / primitive | Geometry, with primitives assigning material groups |
| Material | Exported surface properties |
| Animation channel | Which node/property a sampler affects |
| Sampler | Key times, values, and interpolation |
| Accessor | How a typed array of values is interpreted |
| Buffer view | A byte range within the binary data |

The loader turns those records into usable Three.js objects. That is why this works:

```js
const { scene, animations } = useLoader(GLTFLoader, MODEL_URL);
const lid = scene.getObjectByName('Lid');
```

### The contract between Blender and the website

The prepared model must retain:

- A separately addressable `Lid` node.
- A hinge origin at the back edge.
- A closed default pose with zero lid rotation.
- Clips named `OpenChest` and `CloseChest` affecting that lid.
- A 100-degree opening range if the current slider mapping is to remain accurate.

Changing any of these may require a matching code change. Object and clip names act like an interface between tools.

### Axes and rotation representations

Blender uses Z as up; glTF/Three.js use Y as up. The exporter converts coordinates. Do not manually swap coordinates again after export. The hinge's X axis remains convenient in this particular model.

Blender's authored keys use Euler angles; the GLB stores the lid's rotation as quaternions. For a pure X rotation, glTF's quaternion order is `[x, y, z, w]`:

```text
q = [sin(angle / 2), 0, 0, cos(angle / 2)]
```

The identity quaternion is `[0, 0, 0, 1]`. Blender's Python `rotation_quaternion` tuple uses the different order `(w, x, y, z)`. You do not need to manipulate quaternions for the first tweaks; this distinction explains part of the build validation.

Some Blender-specific shaders, constraints, or procedural effects require conversion/baking and will not transfer unchanged into a browser. This model uses a simple pipeline. [Blender glTF exporter reference](https://docs.blender.org/manual/en/5.1/addons/import_export/scene_gltf2.html)

**Check:** Why might renaming `Lid` make a visually unchanged model fail to load in this app?

## 10. Understand the server and build

### Development server

`npm run dev` runs `node server.mjs`. Node serves files from `public/` at port 5173. It sends MIME types so the browser recognizes JavaScript, CSS, images, and GLB data. The model is fetched over HTTP; opening the HTML through `file://` is not the supported workflow.

The server runs locally at `127.0.0.1`. A local server is not a public website deployment. Changes generally require refreshing the browser; this small server does not provide a hot-reload system.

### Dependencies

The import map in `index.html` maps names such as `react`, `three`, and `@react-three/fiber` to pinned esm.sh URLs. Imports in `app.mjs` use those mappings. Google Fonts is another external request, with CSS fallback fonts available.

This keeps the exercise free of an installation/build-tool prerequisite, but dependency loading can fail when the CDN is unreachable or a browser rejects one of its modules. A bundled npm-based setup is a possible later improvement; it is not implemented in this version.

### Validation and packaging

```sh
npm run check
npm run build
```

`check` parses the JavaScript files for syntax errors. `build` additionally reads the GLB and verifies assumptions the app relies on:

- Valid glTF header/version and file length.
- Named lid and a closed default transform.
- Both named clips, targeting only lid rotation.
- Increasing sample times beginning at zero.
- Closed identity quaternion and the expected signed 100-degree opening rotation.
- Required website files and preview image.

It then copies `public/` into `dist/`. This build is a validator and static-file packager, not a JavaScript bundler. Its parser is tailored to this exported asset, not a general glTF validator. Passing it does not prove browser module loading, pointer behavior, or visual appearance.

**Try:** Run both commands. Inspect `dist/` and match its contents to `public/`. Make changes in the source files, not generated `dist/` files.

**Check:** How could these checks pass while the browser still fails at startup?

## 11. Make a change from Blender to browser

Start with a material-color change rather than changing the hinge or clips.

1. Save a copy of the Blender file before experimenting.
2. Select a chest part and change the appropriate material's shader Base Color. Changing a shared material can affect several parts.
3. Save the `.blend` file. This alone does not update the website.
4. Return to frame 1 and select `TreasureChest` and all of its children.
5. Export as GLB with Selected Objects and Animation enabled. Use Actions mode and Slide to Zero. Preserve the clip names and replace `learning-demo/public/models/treasure-chest.glb`.
6. Run `npm run build` from `learning-demo`.
7. Refresh the website. The model is cached in memory after loading, so a page refresh is the simplest way to pick up a new GLB.
8. Test opening, closing, both animation modes, and the slider.
9. Review `git status` and `git diff` for text changes. Binary models do not produce a useful line-by-line diff, so review them visually before committing.

Our Python scripts can reproduce the original prepared exercise from the downloaded model. They do not automatically preserve subsequent hand-made edits if you rebuild the model from scratch.

**Check:** What happens if you save Blender but forget to export?

## 12. Debug by following the pipeline

| Symptom | First place to inspect |
| --- | --- |
| Localhost does not open | Terminal: is `npm run dev` still running, and is the port correct? |
| “Workshop could not load” | Browser Console and Network panels: which module request or import failed? |
| Page loads but 3D errors | Scene error message, GLB request, and WebGL availability |
| Missing `Lid` or clip error | Exported names/hierarchy and animation export settings |
| Lid rotates around its center | Origin/hinge placement in Blender |
| Lid opens in the wrong direction | Rotation axis/sign and source orientation |
| Whole chest moves with the lid | Parenting or animation channels targeting the wrong objects |
| Blender Space does nothing | Scene frame range, NLA tracks, and whether playback is actually running |
| Rotation edits disappear when scrubbing | Existing keyframes/NLA are re-evaluating the pose |
| Browser shows an old model | Export destination and page refresh |
| Python says `No module named bpy` | Script was run in ordinary Python rather than Blender |
| Python reports existing objects/actions | Guardrail worked; use a fresh scene for reproduction |
| Color differs between Blender and browser | Material export, lighting, and color-management differences |

The startup error in `index.html` is a generic catch for a failed app import. Its suggestion to check esm.sh is not proof of a network outage. The specific Console error and failed Network request distinguish a CDN problem from a missing module or JavaScript failure. The initial issue's cause was not confirmed from a browser error trace.

## 13. Apply this to the portfolio room

| Chest lesson | Portfolio use |
| --- | --- |
| Named `Lid` node | Named monitor, bulletin board, journal, and chair pivot |
| Hinge origin | Chair swivel pivot with its base kept stationary |
| Click → React state | Prop click and navigation button opening the same section |
| Interpolated transform | Moving the camera toward a selected object |
| Blender actions | Typing, turning to the visitor, and expressive character gestures |
| HTML controls beside the Canvas | Readable Experience, Projects, and Contact panels |
| Reduced-motion setting | Skip or shorten motion while keeping content reachable |
| Asset checks | Catch renamed targets or missing clips before publishing |

For a bulletin board, the interaction could set `activeSection = 'experience'`, move the camera toward a saved viewpoint, animate the board's cards, and reveal readable HTML/SVG illustrations. Closing would restore the overview. That is a future composition of these building blocks; it is not implemented in the chest project.

## Practice ladder

Do these one at a time, restoring or committing a working version between exercises.

| Exercise | What you learn | Success check |
| --- | --- | --- |
| 1. Change the page heading | React element structure | New text appears after refresh |
| 2. Change button spacing | CSS | Layout still works on a narrow window |
| 3. Change a light's intensity | Scene lighting | Appearance changes without editing geometry |
| 4. Adjust camera zoom limits | Camera controls | Orbit still works and Reset view restores the opening shot |
| 5. Change damping rate 8 to 4 | Timing | Both modes move more gradually; Smooth motion off still snaps |
| 6. Recolor wood in Blender and export | Asset handoff | Browser color changes and build checks pass |
| 7. Inspect action keys and NLA strips | Authored animation | You can explain the open/pause/close sequence |
| 8. Reproduce assets in a fresh scene | Python automation | Both named clips are exported and build checks pass |
| 9. Add an HTML Reset chest button | State-driven interaction | Button sets target angle to 0 in either mode |

Do not change the maximum opening angle as the very first exercise. It is currently shared across Python keys, browser controls/progress mapping, and build assertions; changing it is a later exercise in keeping an asset interface consistent.

## Check your understanding

| Question | Expected idea |
| --- | --- |
| Why can the browser run without Blender? | The exported asset and JavaScript contain what runtime needs |
| What makes the hinge work? | Separate object, origin at the hinge, and correct rotation axis |
| State or ref for the target angle? | State, because UI controls/labels depend on it |
| State or ref for each animation-frame value? | Ref, so per-frame bookkeeping does not re-render the HTML UI |
| What is a clip versus an action? | Stored animation data versus a playback controller |
| Why pause an action in this demo? | Its time is set manually to support scrubbing/reversal |
| Does saving a `.blend` update the website? | No; export the GLB and refresh |
| What do Python scripts automate? | Blender asset preparation and animation/export, not browser clicks |
| What does a passing build establish? | Syntax/asset assumptions and packaged output, not browser behavior |

## Glossary

| Term | Meaning |
| --- | --- |
| Asset | A model, image, or other content used by the application |
| Rest pose | The model's default pose before animation is applied |
| Local coordinates | Coordinates relative to an object's own frame and parent |
| World coordinates | Coordinates after the hierarchy's transforms are applied |
| Euler angles | Rotation represented as angles around axes |
| Quaternion | Four-number rotation representation used by glTF animation |
| Interpolation | Computing values between samples/keyframes |
| Damping | A smooth approach toward a target over time |
| Raycasting | Testing a ray against scene geometry to determine hits |
| Scrubbing | Manually choosing a time/pose in an animation |
| Props | Inputs passed to a React component |
| Effect | Setup/cleanup synchronized with a component's lifecycle or dependencies |
| Canvas | The website region where the 3D scene is rendered |
| CDN | A remote service delivering libraries or other files to the browser |
| MIME type | HTTP metadata identifying the kind of file being served |

Recommended reading order in the source: `App` → `Chest` → `Scene` → `CameraControls` → `prepare_chest.py` → `animate_chest.py` → `build.mjs`. You can leave the GLB byte-reading math until you want to understand validation internals.
