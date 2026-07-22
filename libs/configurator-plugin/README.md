# @nxgen/configurator-plugin

Local Nx plugin that scaffolds new 3D configurators for the ecosystem.

## `configurator` generator

```bash
npx nx g @nxgen/configurator-plugin:configurator <name> \
  [--displayName "Label"] [--description "Tagline"]
```

Generates, pre-wired to the shared kit and tagged `scope:<name>`:

- `apps/<name>` — the configurator app (canvas + ui-kit chrome + control panel)
- `libs/<name>-domain` — config model, defaults, a preset, a validation rule
- `libs/<name>-scene` — the parametric R3F model

It composes the official `@nx/js` / `@nx/react` generators for idiomatic project
configuration, then overlays product-specific source from `files/` templates.

The generator runs from source (`generators.json` points at `src/`), so no build
step is required to use it in this workspace.
