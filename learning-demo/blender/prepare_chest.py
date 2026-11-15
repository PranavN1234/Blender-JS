"""Run in Blender's Scripting workspace, or with Blender --python.

Imports a fresh copy into a dedicated collection without deleting existing work.
Requires public/models/treasure-chest-original.glb downloaded from Shuriken Studio.
"""
import math
from pathlib import Path

import bpy
from mathutils import Matrix


def prepare(project_dir):
    project_dir = Path(project_dir)
    if bpy.data.objects.get('TreasureChest') or bpy.data.objects.get('Lid'):
        raise RuntimeError('Use a scene without an existing TreasureChest or Lid to avoid name collisions.')
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(project_dir / 'public/models/treasure-chest-original.glb'))
    imported = set(bpy.data.objects) - before
    collection = bpy.data.collections.new('Chest Lab')
    bpy.context.scene.collection.children.link(collection)
    for obj in imported:
        for old_collection in list(obj.users_collection):
            old_collection.objects.unlink(obj)
        collection.objects.link(obj)

    lid = bpy.data.objects['Lid']
    # The source is open at -100 degrees. Transform the geometry into a closed
    # pose and bake the original orientation, preserving the hinge location.
    lid.data.transform(Matrix.Rotation(math.radians(100), 4, 'X'))
    lid.data.transform(lid.matrix_basis.to_3x3().to_4x4())
    lid.rotation_mode = 'XYZ'
    lid.rotation_euler = (0, 0, 0)
    lid.rotation_quaternion = (1, 0, 0, 0)
    lid.data.update()
    lid['learning_note'] = 'Local X: 0 degrees closed, -100 degrees open. Origin is at the hinge.'
    bpy.context.view_layer.update()

    bpy.ops.object.select_all(action='DESELECT')
    for obj in imported:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = lid
    bpy.ops.export_scene.gltf(
        filepath=str(project_dir / 'public/models/treasure-chest.glb'),
        export_format='GLB', use_selection=True, export_animations=False,
    )
    print('Chest prepared. Save your Blender scene separately when ready.')


if __name__ == '__main__':
    # When run as a file via Blender --python, __file__ points at this script.
    # In the Text Editor call prepare('/absolute/path/to/learning-demo').
    prepare(Path(__file__).resolve().parents[1])
