import React, { Component, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js?external=three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js?external=three';

// No build step: React.createElement is the JavaScript equivalent of JSX.
const h = React.createElement;
const HOME = [7.5, 5.6, 9];
const TARGET = [0, 1.8, 0];
const MODEL_URL = new URL('./models/treasure-chest.glb', import.meta.url).href;

class SceneBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    return this.state.error
      ? h('div', { className: 'scene-error', role: 'alert' },
          h('strong', null, 'The 3D scene could not load.'),
          h('p', null, 'Check that WebGL is available and the model file exists, then reload.'),
          h('button', { onClick: () => location.reload() }, 'Try again'))
      : this.props.children;
  }
}

function CameraControls({ resetKey }) {
  const { camera, gl, invalidate } = useThree();
  const controls = useRef(null);
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.target.set(...TARGET);
    orbit.enableDamping = true;
    orbit.enablePan = false;
    orbit.minDistance = 6;
    orbit.maxDistance = 19;
    orbit.minPolarAngle = 0.2;
    orbit.maxPolarAngle = Math.PI / 2 - 0.03;
    orbit.update();
    controls.current = orbit;
    return () => { orbit.dispose(); controls.current = null; };
  }, [camera, gl]);
  useEffect(() => {
    camera.position.set(...HOME);
    controls.current?.target.set(...TARGET);
    controls.current?.update();
    invalidate();
  }, [resetKey, camera, invalidate]);
  useFrame(() => controls.current?.update());
  return null;
}

function Chest({ angle, motion, wireframe, hinge, onToggle, onReady }) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL);
  const lid = scene.getObjectByName('Lid');
  if (!lid) throw new Error('The exported model must contain a node named Lid.');

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    onReady();
  }, [scene, onReady]);

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => { material.wireframe = wireframe; });
    });
  }, [scene, wireframe]);

  useFrame((_, delta) => {
    // The GLB is closed at 0. Its hinge runs along local X.
    // A negative rotation lifts the front of the lid toward the back.
    const target = -MathUtils.degToRad(angle);
    lid.rotation.x = motion
      ? MathUtils.damp(lid.rotation.x, target, 8, Math.min(delta, 0.05))
      : target;
  });

  return h('group', null,
    h('primitive', {
      object: scene,
      onClick: (event) => {
        if (event.delta > 5) return; // Dragging to orbit should not open the chest.
        event.stopPropagation();
        onToggle();
      },
    }),
    hinge && h('group', { position: lid.position },
      h('mesh', { rotation: [0, 0, Math.PI / 2] },
        h('cylinderGeometry', { args: [0.025, 0.025, 5.3, 12] }),
        h('meshBasicMaterial', { color: '#e65d37', depthTest: false })),
      h('mesh', null,
        h('sphereGeometry', { args: [0.105, 16, 16] }),
        h('meshBasicMaterial', { color: '#e65d37', depthTest: false }))),
  );
}

function Scene(props) {
  return h(Canvas, {
    shadows: true,
    dpr: [1, 1.75],
    camera: { position: HOME, fov: 38, near: 0.1, far: 80 },
    fallback: h('div', { className: 'scene-error' }, 'WebGL is unavailable in this browser.'),
    gl: { antialias: true, alpha: true },
    onCreated: ({ camera }) => camera.lookAt(new Vector3(...TARGET)),
  },
    h('ambientLight', { intensity: 1.6 }),
    h('hemisphereLight', { args: ['#fff4df', '#a5b3ba', 1.4] }),
    h('directionalLight', {
      position: [4, 9, 6], intensity: 3.2, castShadow: true,
      'shadow-mapSize': [2048, 2048], 'shadow-bias': -0.0003,
      'shadow-camera-left': -7, 'shadow-camera-right': 7,
      'shadow-camera-top': 7, 'shadow-camera-bottom': -7,
    }),
    h('directionalLight', { position: [-5, 4, -3], color: '#c7d8ff', intensity: 1.7 }),
    h('mesh', { rotation: [-Math.PI / 2, 0, 0], position: [0, -0.04, 0], receiveShadow: true },
      h('circleGeometry', { args: [5.8, 96] }),
      h('meshStandardMaterial', { color: '#ddd6c7', roughness: 1 })),
    h(Suspense, { fallback: null }, h(Chest, props)),
    h(CameraControls, { resetKey: props.resetKey }),
  );
}

function Toggle({ label, checked, onChange }) {
  return h('label', { className: 'check' },
    h('input', { type: 'checkbox', checked, onChange: (event) => onChange(event.target.checked) }),
    h('span', null, label));
}

function App() {
  const [angle, setAngle] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [wireframe, setWireframe] = useState(false);
  const [hinge, setHinge] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const toggle = () => setAngle((current) => current > 50 ? 0 : 100);
  const state = angle === 0 ? 'Closed' : angle === 100 ? 'Open' : 'Exploring';
  // React's state setter is stable, so model readiness does not re-run on each render.
  const ready = React.useCallback(() => setLoaded(true), []);

  return h(React.Fragment, null,
    h('header', { className: 'site-header' },
      h('a', { className: 'brand', href: './', 'aria-label': 'Chest Lab home' },
        h('span', { className: 'brand-mark', 'aria-hidden': true }, '◈'), 'Chest Lab'),
      h('span', { className: 'header-note' }, 'BLENDER → BROWSER'),
      h('a', { className: 'source-link', href: 'https://github.com/PranavN1234/Blender-JS', target: '_blank', rel: 'noreferrer' }, 'View source ↗')),
    h('main', null,
      h('section', { className: 'workshop', 'aria-labelledby': 'title' },
        h('div', { className: 'intro' },
          h('p', { className: 'eyebrow' }, h('span', { className: 'dot' }), 'EXPERIMENT 001'),
          h('h1', { id: 'title' }, 'A little box.', h('br'), h('em', null, 'A little magic.')),
          h('p', { className: 'description' }, 'From a Blender model to something you can touch. Click the chest and see what’s inside.'),
          h('div', { className: 'controls' },
            h('button', { className: 'primary', onClick: toggle, disabled: !loaded, 'aria-pressed': angle > 50 },
              angle > 50 ? 'Close the chest' : 'Open the chest', h('span', { 'aria-hidden': true }, angle > 50 ? '−' : '+')),
            h('div', { className: 'slider-label' },
              h('label', { htmlFor: 'angle' }, 'Lid angle'),
              h('output', { htmlFor: 'angle' }, `${angle}°`)),
            h('input', { id: 'angle', type: 'range', min: 0, max: 100, step: 1, value: angle, disabled: !loaded,
              style: { '--progress': `${angle}%` }, onChange: (event) => setAngle(Number(event.target.value)) }),
            h('div', { className: 'range-ends' }, h('span', null, 'CLOSED'), h('span', null, 'OPEN')),
            h('div', { className: 'options' },
              h(Toggle, { label: 'Show hinge', checked: hinge, onChange: setHinge }),
              h(Toggle, { label: 'Wireframe', checked: wireframe, onChange: setWireframe }),
              h(Toggle, { label: 'Smooth motion', checked: motion, onChange: setMotion }))),
          h('p', { className: 'small-note' }, 'One model. One hinge. A first step toward an interactive world.')),
        h('div', { className: 'stage' },
          h('div', { className: 'stage-top' },
            h('span', { className: 'stage-label' }, 'LIVE 3D PREVIEW'),
            h('span', { className: 'status', role: 'status' }, h('span', { className: 'dot' }), loaded ? state : 'Loading model…')),
          h('div', { className: 'canvas-wrap' },
            h(SceneBoundary, null, h(Scene, { angle, motion, wireframe, hinge, onToggle: toggle, onReady: ready, resetKey }))),
          h('div', { className: 'stage-bottom' },
            h('span', null, 'Drag to orbit · Scroll to zoom'),
            h('button', { className: 'reset', onClick: () => setResetKey((key) => key + 1) }, '↺ Reset view')))),
      h('section', { className: 'explanation', 'aria-label': 'How the interaction works' },
        h('div', { className: 'section-kicker' }, 'UNDER THE LID'),
        h('article', null, h('span', { className: 'step-number' }, '01'), h('h2', null, 'The model'),
          h('p', null, 'A GLB exported from Blender carries the shapes, colors, and a separate lid into the browser.')),
        h('article', null, h('span', { className: 'step-number' }, '02'), h('h2', null, 'The hinge'),
          h('p', null, 'The lid’s origin sits at the back edge. Toggle “Show hinge” to see the axis it rotates around.')),
        h('article', null, h('span', { className: 'step-number' }, '03'), h('h2', null, 'The interaction'),
          h('p', null, 'React handles the click. Three.js rotates the lid a little each frame until it reaches the selected angle.')))),
    h('footer', null,
      h('span', null, 'Built to learn. Made to explore.'),
      h('a', { href: 'https://shuriken.studio/models/props/low-poly-treasure-chest', target: '_blank', rel: 'noreferrer' }, 'Chest model by Shuriken Studio ↗')),
  );
}

createRoot(document.getElementById('root')).render(h(App));
