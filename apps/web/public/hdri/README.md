# Environment maps

`<Environment preset="city" />` pulls from a CDN by default. For offline or
self-hosted use, download a 1-2k `.hdr` from Poly Haven and switch to:

```tsx
<Environment files="/hdri/studio.hdr" />
```
