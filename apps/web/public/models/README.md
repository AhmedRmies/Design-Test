# Garment models

Drop optimised `.glb` files here. Expected filenames:

- `classic-tee.glb`
- `long-sleeve.glb`
- `hoodie.glb`
- `oversized-tee.glb`
- `tote-bag.glb`

## Where to get them

- Sketchfab — filter by CC0 / CC-BY, search "t-shirt low poly"
- Quaternius — free CC0 apparel packs
- Poly Haven — HDRIs and PBR fabric textures
- Paid: TurboSquid / CGTrader apparel packs (noticeably better topology)

## Requirements

- Single mesh per garment, clean quad topology
- One UV set with the print area laid out flat
- Separate material slots for fabric and print
- Y-up, roughly 1 unit tall, origin centred

## Optimise before committing

```bash
npx @gltf-transform/cli optimize raw.glb classic-tee.glb \
  --compress draco --texture-compress ktx2
```

A 4 MB raw GLB typically drops to 300-600 KB. Then generate a typed component:

```bash
npx gltfjsx apps/web/public/models/classic-tee.glb --types --transform
```
