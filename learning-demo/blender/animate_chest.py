"""Add named opening/closing clips and a playable Blender timeline.

Run after prepare_chest.py in a fresh scene, or open a prepared chest and run
this script in Blender. Existing lid animation is preserved by refusing to run.
"""
import math
from pathlib import Path

import bpy


def animate(project_dir):
    project_dir = Path(project_dir)
    scene = bpy.context.scene
    lid = bpy.data.objects['Lid']
    if lid.animation_data and (lid.animation_data.action or len(lid.animation_data.nla_tracks)):
        raise RuntimeError('Lid already has animation. Keep it or use a fresh prepared model.')
    if any(bpy.data.actions.get(name) for name in ['OpenChest', 'CloseChest']):
        raise RuntimeError('An action with a demo clip name already exists; preserve it first.')

    lid.animation_data_create()
    lid.rotation_mode = 'XYZ'
    for name, start, end, strip_start in [
        ('OpenChest', 0, -100, 1),
        ('CloseChest', -100, 0, 61),
    ]:
        action = bpy.data.actions.new(name)
        lid.animation_data.action = action
        for frame, degrees in [(1, start), (41, end)]:
            lid.rotation_euler = (math.radians(degrees), 0, 0)
            lid.keyframe_insert(data_path='rotation_euler', frame=frame, group='Lid hinge')
        for layer in action.layers:
            for keyframe_strip in layer.strips:
                for bag in keyframe_strip.channelbags:
                    for curve in bag.fcurves:
                        for key in curve.keyframe_points:
                            key.interpolation = 'LINEAR'
        lid.animation_data.action = None
        track = lid.animation_data.nla_tracks.new()
        track.name = name
        strip = track.strips.new(name, strip_start, action)
        strip.extrapolation = 'HOLD_FORWARD' if name == 'OpenChest' else 'NOTHING'

    scene.frame_start = 1
    scene.frame_end = 101
    scene.render.fps = 30
    for name, frame in [('Closed', 1), ('Open', 41), ('Close begins', 61), ('Closed again', 101)]:
        scene.timeline_markers.new(name, frame=frame)
    scene.frame_set(1)
    bpy.ops.object.select_all(action='DESELECT')
    root = bpy.data.objects['TreasureChest']
    for obj in [root, *root.children_recursive]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = lid
    bpy.ops.export_scene.gltf(
        filepath=str(project_dir / 'public/models/treasure-chest.glb'),
        export_format='GLB', use_selection=True, export_animations=True,
        export_animation_mode='ACTIONS', export_force_sampling=True,
        export_anim_slide_to_zero=True,
    )
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(project_dir / 'blender/treasure-chest.blend'))
    print('Space plays the Blender timeline. The GLB contains OpenChest and CloseChest.')


if __name__ == '__main__':
    animate(Path(__file__).resolve().parents[1])
