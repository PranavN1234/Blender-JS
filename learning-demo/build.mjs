import assert from 'node:assert/strict';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(root, 'public');
const bytes = await readFile(resolve(publicDir, 'models/treasure-chest.glb'));
assert.equal(bytes.toString('ascii', 0, 4), 'glTF', 'Model must be a binary glTF');
assert.equal(bytes.readUInt32LE(4), 2, 'Model must use glTF 2.0');
assert.equal(bytes.readUInt32LE(8), bytes.length, 'Model byte length must match its header');
const jsonLength = bytes.readUInt32LE(12);
const model = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength));
const lidIndex = model.nodes.findIndex((node) => node.name === 'Lid');
assert.ok(lidIndex >= 0, 'Named Lid node must exist');
assert.ok(!model.nodes[lidIndex].rotation, 'Rest pose must be closed with zero rotation');
const binStart = 20 + jsonLength + 8;
const readAccessor = (index) => {
  const accessor = model.accessors[index];
  const view = model.bufferViews[accessor.bufferView];
  assert.equal(accessor.componentType, 5126, 'Animation data must use float32');
  const width = { SCALAR: 1, VEC4: 4 }[accessor.type];
  assert.ok(width, `Unexpected animation accessor type: ${accessor.type}`);
  const start = binStart + (view.byteOffset || 0) + (accessor.byteOffset || 0);
  return Array.from({ length: accessor.count }, (_, row) =>
    Array.from({ length: width }, (_, component) =>
      bytes.readFloatLE(start + row * (view.byteStride || width * 4) + component * 4)));
};
const close = (a, b) => Math.abs(a - b) < 0.0001;
for (const name of ['OpenChest', 'CloseChest']) {
  const clip = model.animations?.find((animation) => animation.name === name);
  assert.ok(clip, `Model must include ${name}`);
  assert.ok(clip.channels.every((channel) => channel.target.node === lidIndex && channel.target.path === 'rotation'), `${name} must only rotate the lid`);
  const sampler = clip.samplers[clip.channels[0].sampler];
  const times = readAccessor(sampler.input).flat();
  assert.equal(times[0], 0, `${name} must start at zero seconds`);
  assert.ok(times.at(-1) > 1 && times.every((time, index) => index === 0 || time > times[index - 1]), 'Clip times must increase');
  const rotations = readAccessor(sampler.output);
  const first = rotations[0];
  const last = rotations.at(-1);
  const closed = name === 'OpenChest' ? first : last;
  const open = name === 'OpenChest' ? last : first;
  assert.ok(close(closed[0], 0) && close(Math.abs(closed[3]), 1), 'Closed quaternion must be identity');
  assert.ok(close(Math.abs(open[0]), Math.sin(50 * Math.PI / 180)) && close(Math.abs(open[3]), Math.cos(50 * Math.PI / 180)), 'Open quaternion must rotate 100 degrees');
  assert.ok(open[0] * open[3] < 0, 'Opening rotation must lift the lid backward');
}
for (const file of ['index.html', 'app.mjs', 'style.css', 'models/chest-preview.png']) {
  assert.ok((await readFile(resolve(publicDir, file))).length > 0, `Missing ${file}`);
}
const dist = resolve(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(publicDir, dist, { recursive: true });
console.log('Verified closed pose, named lid, both animation clips, and required assets. Built dist/.');
