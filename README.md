# nxGenerator — ekosystem konfiguratorów 3D

Monorepo [Nx](https://nx.dev) będące **fundamentem ekosystemu parametrycznych
konfiguratorów 3D**. Pierwszy produkt — **Stairgen** (konfigurator schodów
kręconych) — został rozłożony na współdzielony „configurator kit" i cienką
warstwę domenową, dzięki czemu kolejne konfiguratory powstają jednym poleceniem.

Projekt jest jednocześnie **wzorcowym demo Nx**: biblioteki z egzekwowanymi
granicami modułów, cache i graf zadań, `nx affected` w CI oraz **własny generator
Nx**, który scaffolduje kompletny, działający konfigurator.

```
apps/
  stairgen/            # konfigurator schodów kręconych (WT §68)
  planter/             # przykład wygenerowany generatorem (dowód reużywalności)
libs/
  configurator-core/   # scope:shared · silnik: store factory, presety, walidacja
  configurator-3d/     # scope:shared · R3F: canvas, kamera, HDRI, eksport GLB, materiały
  ui-kit/              # scope:shared · chrome UI (topbar, panele, motyw Leva) + styl powłoki
  stair-domain/        # scope:stair  · typy, defaults, presety, metryki, reguły WT §68
  stair-geometry/      # scope:stair  · buildery geometrii Three.js
  stair-scene/         # scope:stair  · komponenty R3F (StairModel …)
  configurator-plugin/ # scope:tooling · plugin Nx z generatorem `configurator`
```

## Architektura i granice modułów

Każdy projekt ma tagi `scope:*` (produkt) i `type:*` (warstwa). Reguła
[`@nx/enforce-module-boundaries`](eslint.config.mjs) egzekwuje, kto od kogo może
zależeć — naruszenie **wywala `nx lint`**:

| Warstwa (`type`) | może zależeć od |
|---|---|
| `app` | `feature`, `ui`, `util`, `domain` |
| `feature` | `feature`, `ui`, `util`, `domain` |
| `ui` | `ui`, `util`, `domain` |
| `util` | `util`, `domain` |
| `domain` | `domain` |

| Zakres (`scope`) | może zależeć od |
|---|---|
| `shared` | tylko `shared` |
| `stair` | `stair`, `shared` |
| `planter` | `planter`, `shared` |

Efekt: biblioteki `shared` **nie mogą** przypadkiem zależeć od produktu, a jeden
konfigurator **nie może** sięgnąć do kodu innego. Graf zależności:

```
stairgen ─┬─ stair-scene ─┬─ stair-geometry ── stair-domain ── configurator-core
          │               ├─ stair-domain ─────────────────────┘
          │               └─ configurator-3d
          ├─ ui-kit ── configurator-core
          └─ configurator-3d
```

Podgląd na żywo: `npx nx graph`.

## Nowy konfigurator jednym poleceniem

Sercem ekosystemu jest generator `@nxgen/configurator-plugin:configurator`.
Tworzy aplikację oraz biblioteki domeny i sceny, podpięte pod współdzielony kit,
z poprawnymi tagami i działającym szkieletem 3D:

```bash
npx nx g @nxgen/configurator-plugin:configurator moje-biurko \
  --displayName "Biurko" --description "Konfigurator biurek 3D"

# powstaje: apps/moje-biurko, libs/moje-biurko-domain, libs/moje-biurko-scene
npx nx serve @nxgen/moje-biurko      # od razu działa
```

Wygenerowany kod to punkt wyjścia — podmieniasz geometrię, parametry i reguły
walidacji na właściwe dla produktu. Cała infrastruktura (canvas, kamera, HDRI,
cienie, eksport GLB, chrome UI, walidacja) pochodzi z bibliotek współdzielonych.

## Codzienne komendy

```bash
npm install                                  # instalacja (workspaces)
npx nx serve @nxgen/stairgen                 # dev server konfiguratora schodów
npx nx run-many -t lint test build typecheck # cała praca, z cache
npx nx affected -t lint test build           # tylko to, co dotknięte zmianą
npx nx graph                                  # interaktywny graf projektów
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) używa `nx affected`,
więc PR uruchamia zadania wyłącznie dla zmienionych projektów i ich zależnych.
[Deploy](.github/workflows/deploy.yml) buduje `stairgen` i publikuje na GitHub
Pages.

## Stairgen

Parametryczny konfigurator betonowych / drewnianych / stalowych schodów
kręconych z ciągłym podniebieniem. ~65 parametrów, walidacja na żywo wg *Warunków
Technicznych §68* (trzy profile budynku), eksport do glTF 2.0 (GLB) z materiałami
PBR i round-trippable konfiguracją w `asset.extras`. Renderowanie w
[React Three Fiber](https://r3f.docs.pmnd.rs/).

## Stack

Nx 23 (integrated monorepo, TS project references) · React 19 · Vite 8 ·
Vitest · React Three Fiber 9 / three.js · Leva · Zustand · TypeScript (strict).
