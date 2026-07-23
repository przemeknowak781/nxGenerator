import {
  formatFiles,
  generateFiles,
  names,
  updateJson,
  type Tree,
} from '@nx/devkit';
import { applicationGenerator, libraryGenerator as reactLibraryGenerator } from '@nx/react';
import { libraryGenerator as jsLibraryGenerator } from '@nx/js';
import * as path from 'path';
import type { ConfiguratorGeneratorSchema } from './schema';

/**
 * The ecosystem's scaffolder. Given a product name it stamps out a complete,
 * runnable 3D configurator:
 *
 *   apps/<name>          — the app (canvas + ui-kit chrome + control panel)
 *   libs/<name>-domain   — config model, defaults, preset, validation rule
 *   libs/<name>-scene    — the parametric R3F model
 *
 * Every project is pre-wired to the shared kit (@nxgen/configurator-core,
 * @nxgen/configurator-3d, @nxgen/ui-kit) and tagged with `scope:<name>` so the
 * module-boundary rules apply from the first commit.
 *
 * It composes the official `@nx/js` / `@nx/react` generators (so the project
 * configs stay idiomatic) and then overlays product-specific source.
 */
export async function configuratorGenerator(tree: Tree, options: ConfiguratorGeneratorSchema) {
  const n = names(options.name);
  const name = n.fileName; // kebab-case
  const className = n.className; // PascalCase
  const displayName = options.displayName ?? className;
  const description = options.description ?? 'Konfigurator 3D';
  const scopeTag = `scope:${name}`;

  const subst = {
    name,
    className,
    propertyName: n.propertyName,
    constantName: n.constantName,
    displayName,
    description,
    tmpl: '',
  };

  const domainRoot = `libs/${name}-domain`;
  const sceneRoot = `libs/${name}-scene`;
  const appRoot = `apps/${name}`;

  // 1. Domain library (pure TS) — models, defaults, preset, validation.
  await jsLibraryGenerator(tree, {
    directory: domainRoot,
    name: `${name}-domain`,
    importPath: `@nxgen/${name}-domain`,
    bundler: 'none',
    unitTestRunner: 'vitest',
    linter: 'none',
    tags: `${scopeTag},domain:${name}`,
    skipFormat: true,
  });
  ensureBundlerResolution(tree, `${domainRoot}/tsconfig.lib.json`);
  ensureBundlerResolution(tree, `${domainRoot}/tsconfig.spec.json`);
  foldProjectJson(tree, domainRoot, [scopeTag, `domain:${name}`]);
  replaceSrc(tree, domainRoot, path.join(__dirname, 'files/domain'), subst);

  // 2. Scene library (React + R3F) — the parametric model.
  await reactLibraryGenerator(tree, {
    directory: sceneRoot,
    name: `${name}-scene`,
    importPath: `@nxgen/${name}-scene`,
    bundler: 'none',
    unitTestRunner: 'vitest',
    component: false,
    style: 'none',
    linter: 'none',
    tags: `${scopeTag},type:feature`,
    skipFormat: true,
  });
  foldProjectJson(tree, sceneRoot, [scopeTag, 'type:feature']);
  // R3F's intrinsic JSX elements (<mesh>, <group>, …) come from a module
  // augmentation that must be explicitly included where they are used.
  addTypes(tree, `${sceneRoot}/tsconfig.lib.json`, ['@react-three/fiber']);
  replaceSrc(tree, sceneRoot, path.join(__dirname, 'files/scene'), subst);

  // 3. Application — composition root.
  await applicationGenerator(tree, {
    directory: appRoot,
    name,
    bundler: 'vite',
    unitTestRunner: 'vitest',
    e2eTestRunner: 'none',
    style: 'css',
    routing: false,
    linter: 'none',
    tags: `${scopeTag},type:app`,
    skipFormat: true,
  });
  foldProjectJson(tree, appRoot, [scopeTag, 'type:app']);
  // Drop the sample app files and overlay the configurator composition.
  for (const f of ['src/app', 'src/main.tsx', 'src/styles.css', 'index.html']) {
    tree.delete(`${appRoot}/${f}`);
  }
  generateFiles(tree, path.join(__dirname, 'files/app'), appRoot, subst);

  await formatFiles(tree);
}

/** Replace a generated library's `src` with our template output. */
function replaceSrc(tree: Tree, root: string, templateDir: string, subst: Record<string, string>) {
  tree.delete(`${root}/src`);
  generateFiles(tree, templateDir, `${root}/src`, subst);
}

/**
 * Fold a generated `project.json` into the project's `package.json` `nx` field
 * so every project follows the same convention as the hand-authored libs:
 * scoped `@nxgen/*` name (from package.json) with tags in `nx.tags`, and targets
 * inferred by the nx plugins. Keeps `nx show projects` consistent.
 */
function foldProjectJson(tree: Tree, root: string, tags: string[]) {
  const projectJsonPath = `${root}/project.json`;
  if (tree.exists(projectJsonPath)) tree.delete(projectJsonPath);
  const packageJsonPath = `${root}/package.json`;
  if (!tree.exists(packageJsonPath)) return;
  updateJson(tree, packageJsonPath, (json) => {
    json.nx = { ...(json.nx ?? {}), tags };
    return json;
  });
}

/** Match the workspace convention: bundler module resolution for pure-TS libs. */
function ensureBundlerResolution(tree: Tree, tsconfigPath: string) {
  if (!tree.exists(tsconfigPath)) return;
  updateJson(tree, tsconfigPath, (json) => {
    json.compilerOptions ??= {};
    json.compilerOptions.module = 'esnext';
    json.compilerOptions.moduleResolution = 'bundler';
    return json;
  });
}

/** Add entries to a tsconfig's `compilerOptions.types` (de-duplicated). */
function addTypes(tree: Tree, tsconfigPath: string, types: string[]) {
  if (!tree.exists(tsconfigPath)) return;
  updateJson(tree, tsconfigPath, (json) => {
    json.compilerOptions ??= {};
    const existing: string[] = json.compilerOptions.types ?? [];
    json.compilerOptions.types = [...new Set([...existing, ...types])];
    return json;
  });
}

export default configuratorGenerator;
