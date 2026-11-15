# Blender Portfolio Lab

Repository: https://github.com/PranavN1234/Blender-JS

A learning workspace for bringing Blender models and animations into a React Three Fiber browser demo, followed by a stylized portfolio room.

Start learning with the [Chest Lab study guide](docs/chest-study-guide.md): the actual model, Python scripts, browser code, exercises, and troubleshooting.

## First exercise: interactive treasure chest

The first demo is in [`learning-demo/`](learning-demo/README.md). It includes the imported model, editable Blender source, and a React Three Fiber website.

```sh
cd learning-demo
npm run dev
```

Open http://localhost:5173. No dependency installation is needed; the browser loads pinned libraries from a CDN.

1. Model a chest and separate lid in Blender.
2. Place the lid pivot at its hinge.
3. Export the model as GLB.
4. Display it in a browser and open or close the lid on click using code.
5. Author the opening animation in Blender and play the exported clip in the browser.

The model has been imported and its lid normalized to a closed pose. The browser implementation has click-to-open, an angle slider, hinge visualization, wireframe controls, and a choice of JavaScript motion or Blender-authored clips. The editable Blender file also has a playable open/hold/close timeline. JavaScript checks and the validated static build pass; browser verification remains pending because the authoring session blocks local server sockets.

## Files

- `portfolio-master-context.md`: portfolio concept and acceptance criteria.
- `docs/learning-log.md`: learning notes and completed milestones.
- `learning-demo/blender/`: editable Blender source and preparation script.
- `learning-demo/public/models/`: original and prepared GLBs used by the exercise.
- `learning-demo/`: browser exercise and local server.

Keep the editable `.blend` sources alongside the browser exports. Review asset sizes before committing large binary files.
