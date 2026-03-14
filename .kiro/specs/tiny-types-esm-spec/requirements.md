# Requirements Document: tiny-types ESM/CJS Dual Build

## Introduction

This document specifies the requirements for migrating the tiny-types library to produce dual ESM (ECMAScript Modules) and CommonJS builds. The migration enables modern ESM consumers to import the library natively while maintaining full backwards compatibility for existing CommonJS consumers. The approach follows the established pattern implemented in Serenity/JS packages.

## Glossary

- **ESM_Build**: The ECMAScript Modules output compiled to the `esm/` directory using Node16 module resolution
- **CJS_Build**: The CommonJS output compiled to the `lib/` directory
- **Conditional_Exports**: Node.js package.json exports field that resolves to different files based on import style
- **Dual_Package_Hazard**: A situation where the same package is loaded twice (once as ESM, once as CJS), creating two separate instances of classes and breaking `instanceof` checks
- **Symbol_Brand**: A Symbol.for() based marker used to identify class instances across module boundaries
- **Build_System**: The compilation toolchain using TypeScript and npm scripts

## Requirements

### Requirement 1: ESM Build Output

**User Story:** As a developer using ESM, I want to import tiny-types using standard ES module syntax, so that I can use modern JavaScript features and tooling.

#### Acceptance Criteria

1. WHEN the library is compiled, THE Build_System SHALL produce an ESM_Build in the `esm/` directory
2. WHEN the ESM_Build is produced, THE Build_System SHALL use TypeScript with `module: "Node16"` and `moduleResolution: "Node16"`
3. WHEN the ESM_Build is produced, THE Build_System SHALL generate `.d.ts` type declaration files alongside JavaScript files
4. WHEN an ESM consumer imports from the library, THE Conditional_Exports SHALL resolve to the `esm/` directory files

### Requirement 2: CommonJS Build Output

**User Story:** As a developer using CommonJS, I want to require tiny-types using standard CommonJS syntax, so that my existing code continues to work without modification.

#### Acceptance Criteria

1. WHEN the library is compiled, THE Build_System SHALL produce a CJS_Build in the `lib/` directory
2. WHEN the CJS_Build is produced, THE Build_System SHALL use TypeScript with `module: "CommonJS"` and `moduleResolution: "Node"`
3. WHEN the CJS_Build is produced, THE Build_System SHALL generate `.d.ts` type declaration files alongside JavaScript files
4. WHEN the CJS_Build is produced, THE Build_System SHALL create a `lib/package.json` file containing `{ "type": "commonjs" }`
5. WHEN a CommonJS consumer requires the library, THE Conditional_Exports SHALL resolve to the `lib/` directory files

### Requirement 3: Package Configuration

**User Story:** As a package maintainer, I want proper dual-build configuration, so that both ESM and CommonJS consumers are supported correctly.

#### Acceptance Criteria

1. THE package SHALL have `"type": "module"` in its package.json
2. THE package SHALL have `"module": "./esm/index.js"` in its package.json for bundler compatibility
3. THE package SHALL have Conditional_Exports for the main entry point with `types`, `import`, and `require` conditions
4. THE package SHALL have a fallback path for older Node.js versions that don't support conditional exports
5. THE package SHALL preserve existing `main` and `types` fields for backwards compatibility

### Requirement 4: Backwards Compatible Deep Imports

**User Story:** As a developer with existing code using `/lib/` deep imports, I want my imports to continue working after migration, so that I don't need to update my codebase immediately.

#### Acceptance Criteria

1. THE package SHALL have `"./lib/*": "./lib/*"` wildcard export for legacy deep import compatibility
2. THE package SHALL have `"./esm/*": "./esm/*"` wildcard export for explicit ESM deep imports
3. THE package SHALL expose `"./package.json": "./package.json"` for package metadata access

### Requirement 5: TypeScript Configuration Files

**User Story:** As a package maintainer, I want separate TypeScript configuration files for ESM and CJS builds, so that each build uses the correct module settings.

#### Acceptance Criteria

1. THE package SHALL have a `tsconfig-esm.build.json` file for ESM compilation
2. THE `tsconfig-esm.build.json` SHALL configure `module: "Node16"`, `moduleResolution: "Node16"`, and `outDir: "esm"`
3. THE `tsconfig-esm.build.json` SHALL configure `rewriteRelativeImportExtensions: true` for .js extension handling
4. THE package SHALL have a `tsconfig-cjs.build.json` file for CJS compilation
5. THE `tsconfig-cjs.build.json` SHALL configure `module: "CommonJS"`, `moduleResolution: "Node"`, and `outDir: "lib"`

### Requirement 6: Build Scripts

**User Story:** As a package maintainer, I want standardized build scripts for dual compilation, so that the build process is consistent.

#### Acceptance Criteria

1. THE package SHALL have a `compile` script that orchestrates the full dual-build process
2. THE package SHALL have a `compile:clean` script that removes both `lib/` and `esm/` directories
3. THE package SHALL have a `compile:esm` script that compiles using `tsconfig-esm.build.json`
4. THE package SHALL have a `compile:cjs` script that compiles using `tsconfig-cjs.build.json`
5. THE package SHALL have a `compile:cjs-package` script that generates `lib/package.json`
6. WHEN the `compile` script runs, THE Build_System SHALL execute scripts in order: clean, esm, cjs, cjs-package

### Requirement 7: Source File ESM Compatibility

**User Story:** As a package maintainer, I want source files to use ESM-compatible import syntax, so that the ESM build works correctly.

#### Acceptance Criteria

1. ALL relative imports in source files SHALL use `.js` file extensions
2. THE TypeScript compiler with `rewriteRelativeImportExtensions` SHALL handle extension rewriting for CJS output

### Requirement 8: Dual-Package Hazard Mitigation

**User Story:** As a developer, I want `instanceof` checks to work correctly even when the library is loaded from both ESM and CJS contexts, so that type checking remains reliable.

#### Acceptance Criteria

1. THE `TinyType` class SHALL implement `Symbol.hasInstance` for cross-module `instanceof` checks
2. THE `TinyType` class SHALL use a Symbol_Brand (`Symbol.for('tiny-types/TinyType')`) to identify instances
3. THE `Symbol.hasInstance` implementation SHALL walk the prototype chain comparing constructor names
4. WHEN an instance is created, THE constructor SHALL brand the instance with the Symbol_Brand
5. WHEN `instanceof TinyType` is evaluated, THE check SHALL return true for any branded instance regardless of module origin

### Requirement 9: Build Verification

**User Story:** As a package maintainer, I want to verify that both ESM and CJS builds work correctly, so that consumers can rely on the package regardless of their module system.

#### Acceptance Criteria

1. WHEN the library is compiled, THE Build_System SHALL verify that `esm/index.js` exists
2. WHEN the library is compiled, THE Build_System SHALL verify that `lib/index.js` exists
3. WHEN the library is compiled, THE Build_System SHALL verify that `lib/package.json` exists with `type: "commonjs"`
4. WHEN the library is compiled, THE Build_System SHALL run all unit tests to verify functionality
5. THE unit tests SHALL verify `instanceof` checks work across ESM/CJS boundaries

### Requirement 10: Type Declaration Availability

**User Story:** As a TypeScript developer, I want type declarations available for both ESM and CJS imports, so that I get proper type checking regardless of my module system.

#### Acceptance Criteria

1. WHEN the ESM_Build is produced, THE Build_System SHALL generate `.d.ts` files in the `esm/` directory
2. WHEN the CJS_Build is produced, THE Build_System SHALL generate `.d.ts` files in the `lib/` directory
3. THE Conditional_Exports SHALL include `types` condition pointing to the correct `.d.ts` file
4. WHEN a TypeScript consumer imports from the library, THE type declarations SHALL be resolved correctly
