# Implementation Plan: tiny-types ESM/CJS Dual Build

## Overview

This implementation plan migrates the tiny-types library to produce dual ESM and CommonJS builds following the established Serenity/JS pattern. The tasks are ordered to build incrementally, starting with source file updates, then build configuration, and finally verification.

## Tasks

- [x] 1. Update source files for ESM compatibility
  - [x] 1.1 Update all relative imports in `src/` to use `.js` extensions
    - Scan all TypeScript files in `src/` directory
    - Add `.js` extension to all relative import statements
    - This enables ESM module resolution while TypeScript handles CJS compatibility
    - _Requirements: 7.1, 7.2_

- [x] 2. Implement cross-module instanceof support
  - [x] 2.1 Add `Symbol.hasInstance` and branding to `TinyType` class
    - Add private static `TYPE_BRAND` using `Symbol.for('tiny-types/TinyType')`
    - Implement static `[Symbol.hasInstance]` method that checks brand and walks prototype chain
    - Brand instances in the constructor with `(this as any)[TinyType.TYPE_BRAND] = true`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 2.2 Write unit tests for cross-module instanceof behavior
    - Test that `instanceof TinyType` returns true for branded instances
    - Test that subclass instanceof checks work correctly
    - Test prototype chain walking for nested inheritance
    - _Requirements: 9.5_

- [x] 3. Checkpoint - Verify source changes compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create TypeScript build configurations
  - [x] 4.1 Create `tsconfig-esm.build.json` for ESM compilation
    - Extend base `tsconfig.json`
    - Configure `module: "Node16"`, `moduleResolution: "Node16"`, `outDir: "esm"`
    - Enable `rewriteRelativeImportExtensions: true` for .js extension handling
    - Include `src/**/*.ts`, exclude `spec/**/*` and `node_modules`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.2 Create `tsconfig-cjs.build.json` for CJS compilation
    - Extend base `tsconfig.json`
    - Configure `module: "CommonJS"`, `moduleResolution: "Node"`, `outDir: "lib"`
    - Include `src/**/*.ts`, exclude `spec/**/*` and `node_modules`
    - _Requirements: 5.4, 5.5_

- [x] 5. Update package.json configuration
  - [x] 5.1 Add dual-build package configuration
    - Add `"type": "module"` for ESM default
    - Add `"module": "./esm/index.js"` for bundler compatibility
    - Preserve existing `main` and `types` fields for backwards compatibility
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 5.2 Configure conditional exports
    - Add exports for main entry point with `types`, `import`, and `require` conditions
    - Add fallback path for older Node.js versions
    - Add `"./lib/*": "./lib/*"` wildcard for legacy deep imports
    - Add `"./esm/*": "./esm/*"` wildcard for explicit ESM deep imports
    - Add `"./package.json": "./package.json"` for metadata access
    - _Requirements: 3.3, 3.4, 4.1, 4.2, 4.3_

  - [x] 5.3 Update build scripts
    - Add `compile:clean` script: `rimraf lib esm`
    - Add `compile:esm` script: `tsc --project tsconfig-esm.build.json`
    - Add `compile:cjs` script: `tsc --project tsconfig-cjs.build.json`
    - Add `compile:cjs-package` script to generate `lib/package.json` with `{ "type": "commonjs" }`
    - Update `compile` script to run: clean, esm, cjs, cjs-package in order
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 6. Checkpoint - Verify build configuration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Build verification and testing
  - [x] 7.1 Run full build and verify outputs
    - Execute `npm run compile` to produce both builds
    - Verify `esm/index.js` exists with ESM output
    - Verify `lib/index.js` exists with CJS output
    - Verify `lib/package.json` exists with `{ "type": "commonjs" }`
    - Verify `.d.ts` files are generated in both directories
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3, 10.1, 10.2_

  - [x] 7.2 Run test suite to verify functionality
    - Execute existing unit tests
    - Verify all tests pass with the new build configuration
    - _Requirements: 9.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript throughout as specified in the design
- Property 6 (Cross-Module instanceof) is addressed by task 2.1 and 2.2
- The build produces type declarations alongside JavaScript files for both ESM and CJS outputs
