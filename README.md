<div align="center">

# ⬢ nxGenerator

### An ecosystem of parametric 3D configurators built on an **Nx** monorepo

One app (*Stairgen*) decomposed into a shared **configurator kit** —
so that **the next configurator is created with a single command**.

[![CI](https://github.com/przemeknowak781/nxGenerator/actions/workflows/ci.yml/badge.svg)](https://github.com/przemeknowak781/nxGenerator/actions/workflows/ci.yml)
![Nx](https://img.shields.io/badge/Nx-23-143055?logo=nx&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232a?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![R3F](https://img.shields.io/badge/three.js-React_Three_Fiber-000000?logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

</div>

---

## 💡 The idea in one sentence

> **The app is just a "composition root".** Everything it contains — the
> parametric engine, the 3D scene, export, validation, UI chrome — **Nx wires
> together from libraries** into a single graph and runs it with one command.

```bash
npx nx serve @nxgen/stairgen      # ← and the whole app comes alive
```

---

## 🧩 How Nx runs the app

`apps/stairgen` imports nothing but `@nxgen/*` packages. Nx maintains a
**dependency graph** derived from those imports, resolves them to library
**source** (no build step in between) and hands the whole graph to Vite:

```mermaid
flowchart TD
    S["apps/stairgen<br/><i>~120 lines: App, store, ControlPanel</i>"]

    subgraph stair["scope:stair · stair domain"]
        SSC["stair-scene<br/><small>R3F components</small>"]
        SGE["stair-geometry<br/><small>three.js builders</small>"]
        SDO["stair-domain<br/><small>types, presets, WT §68 rules</small>"]
    end

    subgraph shared["scope:shared · configurator kit (reusable)"]
        C3["configurator-3d<br/><small>canvas · camera · HDRI · GLB export</small>"]
        UI["ui-kit<br/><small>UI chrome · Leva theme</small>"]
        CO["configurator-core<br/><small>store · presets · validation</small>"]
    end

    S --> SSC & UI & C3 & CO & SDO
    SSC --> SGE & SDO & C3
    SGE --> SDO
    SDO --> CO
    UI --> CO

    classDef app fill:#b2542b,stroke:#8a3f1f,color:#fff;
    classDef s fill:#e9eef5,stroke:#5b7aa8,color:#1a2b45;
    classDef sh fill:#eef3ec,stroke:#5e8a52,color:#20331a;
    class S app; class SSC,SGE,SDO s; class C3,UI,CO sh;
```

What Nx gives you here (that a plain folder of code would not):

| Nx mechanism | Effect on the app |
|---|---|
| **Source graph** from `@nxgen/*` imports | `nx serve` boots the app with **live** libraries — HMR works across package boundaries |
| **Package exports → source** | No "build the library, then the app" step; Vite bundles the whole graph at once |
| **TS project references** | `nx typecheck` checks types in the right order, incrementally |
| **Task graph + `dependsOn`** | `build`/`test`/`typecheck` run in correct dependency order |

---

## 🛡️ Module boundaries — Nx guards the architecture

Every project carries `scope:*` (product) and `type:*` (layer) tags. The
[`@nx/enforce-module-boundaries`](eslint.config.mjs) rule **fails `nx lint`** the
moment someone violates the allowed dependencies:

```mermaid
flowchart LR
    app["type:app"] --> feature["type:feature"] --> ui["type:ui"] --> util["type:util"] --> domain["type:domain"]
    app -.-> ui & util & domain
    feature -.-> util & domain
    ui -.-> domain

    style app fill:#b2542b,color:#fff
    style domain fill:#eef3ec,stroke:#5e8a52,color:#20331a
```

| Layer | may depend on | | Scope | may depend on |
|---|---|---|---|---|
| `app` | all lower layers | | `shared` | **only** `shared` |
| `feature` | ui, util, domain | | `stair` | stair, shared |
| `ui` | util, domain | | `planter` | planter, shared |
| `domain` | domain | | | |

➡️ **`configurator-*` (shared) physically cannot depend on the stairs**, and no
configurator can reach into another's code. A violation turns CI red:

```
error  A project tagged "scope:shared" can only depend on libs tagged "scope:shared"
       @nx/enforce-module-boundaries
```

---

## ⚡ A new configurator with one command

The heart of the ecosystem is a **custom Nx generator** (`configurator-plugin`).
It composes the official `@nx/js`/`@nx/react` generators and overlays templates
to produce a complete, **immediately runnable** configurator wired to the kit:

```bash
npx nx g @nxgen/configurator-plugin:configurator desk \
  --displayName "Desk" --description "3D desk configurator"
```

```mermaid
flowchart LR
    CMD(["nx g …:configurator desk"]):::c --> A["apps/desk"]:::o
    CMD --> D["libs/desk-domain"]:::o
    CMD --> SC["libs/desk-scene"]:::o
    A -. imports .-> KIT[["configurator kit<br/>core · 3d · ui-kit"]]:::k
    SC -. imports .-> KIT
    D  -. imports .-> KIT
    classDef c fill:#b2542b,color:#fff;
    classDef o fill:#fff,stroke:#b2542b,color:#8a3f1f;
    classDef k fill:#eef3ec,stroke:#5e8a52,color:#20331a;
```

This is exactly how **`apps/planter`** was created — proof of reuse. You swap in
the product's geometry and parameters; the canvas, camera, HDRI, shadows, GLB
export, UI chrome and validation all come from the libraries.

---

## 🚀 `affected` & caching — Nx does only what's needed

The dependency graph also drives scaling. A change in `stair-domain` runs
**only** the stair chain — `planter` and the kit are left untouched:

```bash
$ nx affected -t build --files=libs/stair-domain/src/lib/metrics.ts
   ✔ @nxgen/stair-domain   @nxgen/stair-geometry
   ✔ @nxgen/stair-scene    @nxgen/stairgen
     (planter, ui-kit, configurator-* — skipped)
```

Running the same task again is a **cache hit** (0 ms). CI
([`ci.yml`](.github/workflows/ci.yml)) uses `nx affected`, so a PR only builds
what changed and its dependents.

---

## 🗂️ Structure

```
apps/
  stairgen/            # spiral-stair configurator (WT §68, GLB export)
  planter/             # produced by the generator — proof of reuse
libs/
  configurator-core/   # scope:shared  · store factory, presets, validation engine
  configurator-3d/     # scope:shared  · R3F: canvas, camera, HDRI, GLB export, materials
  ui-kit/              # scope:shared  · UI chrome, Leva theme, shell CSS
  stair-domain/        # scope:stair   · types, defaults, presets, metrics, WT §68 rules
  stair-geometry/      # scope:stair   · three.js geometry builders
  stair-scene/         # scope:stair   · R3F components (StairModel …)
  configurator-plugin/ # scope:tooling · Nx plugin with the `configurator` generator
```

## 🛠️ Commands

```bash
npm install                                   # install (npm workspaces)
npx nx serve  @nxgen/stairgen                 # dev server + HMR across libraries
npx nx graph                                  # interactive project graph
npx nx run-many -t lint test build typecheck  # everything, cached
npx nx affected -t lint test build            # only what a change touched
npx nx g @nxgen/configurator-plugin:configurator <name>   # new configurator
```

## 🧱 Stack

**Nx 23** (integrated monorepo, TS project references) · **React 19** ·
**Vite 8** · **Vitest** · **React Three Fiber 9 / three.js** · **Leva** ·
**Zustand** · **TypeScript** (strict).

<div align="center"><sub>Stairgen · a configurator for concrete / timber / steel spiral stairs with a continuous soffit, validated live against Polish building code (<i>Warunki Techniczne §68</i>), exporting to glTF 2.0 (PBR + round-trip config).</sub></div>
