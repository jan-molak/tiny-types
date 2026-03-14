# Design Document: tiny-types ESM/CJS Dual Build

## Overview

This design describes the migration of tiny-types to produce both ESM (ECMAScript Modules) and CommonJS-compatible builds. The migration follows the established pattern implemented in Serenity/JS packages.

The goal is to enable modern ESM consumers to import tiny-types natively while maintaining full backwards compatibility for existing CommonJS consumers. This is achieved through Node.js conditional exports, separate TypeScript compilation targets, a `lib/package.json` override for CommonJS output, and `Symbol.hasInstance` for cross-module `instanceof` checks.

## Architecture

The dual-build architecture uses Node.js package exports to conditionally resolve the correct module format based on the consumer's import style.

```
tiny-types/
├── src/                          # TypeScript source files
│   ├── index.ts                  # Main entry point
│   ├── TinyType.ts               # Base class with Symbol.hasInstance
│   ├── ensure.ts                 # Validation functions
│   ├── match.ts                  # Pattern matching
│   ├── objects/                  # Object utilities
│   └── predicates/               # Type predicates
├── esm/                          # ESM build output (generated)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── lib/                          # CJS build output (generated)
│   ├── index.js
│   ├── index.d.ts
│   ├── package.json              # { "type": "commonjs" }
│   └── ...
├── package.json                  # type: module, conditional exports
├── tsconfig.json                 # IDE support
├── tsconfig-esm.build.json       # ESM compilation config
└── tsconfig-cjs.build.json       # CJS compilation config
```

## Sequence Diagrams

### Build Process Flow

```
Developer -> npm: npm run compile
npm -> compile:clean: rimraf lib esm
compile:clean -> npm: directories removed
npm -> compile:esm: tsc --project tsconfig-esm.build.json
compile:esm -> npm: esm/ created (Node16 modules)
npm -> compile:cjs: tsc --project tsconfig-cjs.build.json
compile:cjs -> npm: lib/ created (CommonJS modules)
npm -> compile:cjs-package: node -e "fs.writeFileSync..."
compile:cjs-package -> npm: lib/package.json created
npm -> Developer: Build complete
```

### Module Resolution Flow

```
Consumer App -> Node.js: import { TinyType } from 'tiny-types'
Node.js -> package.json: Read exports["."].import
package.json -> Node.js: ./esm/index.js
Node.js -> esm/index.js: Load ES Module
esm/index.js -> Consumer App: TinyType class

Consumer App -> Node.js: require('tiny-types')
Node.js -> package.json: Read exports["."].require
package.json -> Node.js: ./lib/index.js
Node.js -> lib/package.json: Check type override
lib/package.json -> Node.js: type: commonjs
Node.js -> lib/index.js: Load CommonJS Module
lib/index.js -> Consumer App: TinyType class
```

### Cross-Module instanceof Check

```
ESM Module -> TinyType: new MyType('value')
TinyType -> instance: Brand with Symbol.for('tiny-types/TinyType')
ESM Module -> CJS Module: Pass instance

CJS Module -> TinyType: instance instanceof TinyType
TinyType -> Symbol.hasInstance: Check brand symbol
Symbol.hasInstance -> TinyType: Brand found, walk prototype chain
TinyType -> CJS Module: true (instanceof succeeds)
```

## Components and Interfaces

### Package.json Configuration

```json
{
  "name": "tiny-types",
  "type": "module",
  "main": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "module": "./esm/index.js",
  "exports": {
    ".": [
      {
        "types": "./lib/index.d.ts",
        "import": "./esm/index.js",
        "require": "./lib/index.js"
      },
      "./lib/index.js"
    ],
    "./lib/*": "./lib/*",
    "./esm/*": "./esm/*",
    "./package.json": "./package.json"
  },
  "scripts": {
    "clean": "rimraf lib esm",
    "compile": "npm run compile:clean && npm run compile:esm && npm run compile:cjs && npm run compile:cjs-package",
    "compile:clean": "rimraf lib esm",
    "compile:esm": "tsc --project tsconfig-esm.build.json",
    "compile:cjs": "tsc --project tsconfig-cjs.build.json",
    "compile:cjs-package": "node -e \"require('fs').writeFileSync('lib/package.json', '{ \\\"type\\\": \\\"commonjs\\\" }')\""
  }
}
```

### TypeScript Configuration Files

#### tsconfig-esm.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "esm",
    "rootDir": "src",
    "target": "es2022",
    "lib": ["es2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "rewriteRelativeImportExtensions": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["spec/**/*", "node_modules"]
}
```

#### tsconfig-cjs.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "lib",
    "rootDir": "src",
    "target": "es2022",
    "lib": ["es2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["spec/**/*", "node_modules"]
}
```

### TinyType Class with Symbol.hasInstance

The key change to fix the dual-package hazard is adding `Symbol.hasInstance` to the `TinyType` class:

```typescript
export abstract class TinyType {
    /**
     * Symbol used to brand TinyType instances for cross-module instanceof checks.
     * This addresses the dual-package hazard where the same class loaded from
     * both ESM and CJS creates distinct constructor functions.
     */
    private static readonly TYPE_BRAND = Symbol.for('tiny-types/TinyType');

    /**
     * Custom instanceof check that works across module boundaries.
     * This addresses the dual-package hazard where the same class loaded from
     * both ESM and CJS creates distinct constructor functions.
     *
     * The check walks up the prototype chain of the instance and compares
     * constructor names, which remain consistent across module boundaries.
     */
    static [Symbol.hasInstance](instance: unknown): boolean {
        if (instance === null || typeof instance !== 'object') {
            return false;
        }

        // First, verify this is a TinyType instance using the brand
        if ((instance as any)[TinyType.TYPE_BRAND] !== true) {
            return false;
        }

        // When checking against the base TinyType class, any branded instance qualifies
        if (this.name === 'TinyType') {
            return true;
        }

        // For subclass checks, walk the prototype chain and compare by name
        // This works across ESM/CJS boundaries where constructor references differ
        let proto = Object.getPrototypeOf(instance);
        while (proto !== null) {
            if (proto.constructor?.name === this.name) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }

        return false;
    }

    protected constructor() {
        // Brand the instance for cross-module instanceof checks
        (this as any)[TinyType.TYPE_BRAND] = true;
    }

    // ... rest of existing TinyType implementation
}
```

## Source File Import Extensions

All relative imports in `src/**/*.ts` files must use `.js` extensions for ESM compatibility:

```typescript
// Before
import { TinyType } from './TinyType';
import { ensure } from './ensure';
import { isDefined } from './predicates/isDefined';

// After
import { TinyType } from './TinyType.js';
import { ensure } from './ensure.js';
import { isDefined } from './predicates/isDefined.js';
```

TypeScript with `rewriteRelativeImportExtensions: true` in the ESM config handles this correctly. The CJS build doesn't need extensions since CommonJS resolution handles extensionless imports.

## Correctness Properties

### Property 1: Dual Build Output

*For any* compilation, the Build_System SHALL produce both an `esm/` directory with `index.js` and a `lib/` directory with `index.js`.

### Property 2: Type Declaration Parity

*For any* JavaScript file (`.js`) in the build output (either `esm/` or `lib/`), a corresponding TypeScript declaration file (`.d.ts`) SHALL exist in the same directory.

### Property 3: CJS Package Override

After compilation, the file `lib/package.json` SHALL exist and contain `{ "type": "commonjs" }`.

### Property 4: ESM Resolution

When imported using ESM `import` syntax, the resolved file path SHALL be within the `esm/` directory.

### Property 5: CJS Resolution

When required using CommonJS `require()` syntax, the resolved file path SHALL be within the `lib/` directory.

### Property 6: Cross-Module instanceof

*For any* instance of TinyType or its subclasses, `instanceof TinyType` SHALL return `true` regardless of whether the instance was created from ESM or CJS module and regardless of whether the check is performed in ESM or CJS context.

## Testing Strategy

### Unit Tests

Existing unit tests should pass without modification after the migration.

### Cross-Module instanceof Tests

Add tests to verify `instanceof` works across module boundaries:

```typescript
describe('TinyType cross-module instanceof', () => {
    it('should recognize instances created from different module formats', async () => {
        // Create instance from ESM
        const { MyType: EsmMyType } = await import('tiny-types');
        const esmInstance = new EsmMyType('value');
        
        // Check with CJS-loaded class
        const { MyType: CjsMyType } = require('tiny-types');
        
        expect(esmInstance instanceof CjsMyType).to.be.true;
        expect(esmInstance instanceof EsmMyType).to.be.true;
    });
});
```

### Verification Script

```bash
# Verify ESM resolution
node --input-type=module -e "import('tiny-types').then(m => console.log('ESM OK:', Object.keys(m).length, 'exports'))"

# Verify CJS resolution
node -e "console.log('CJS OK:', Object.keys(require('tiny-types')).length, 'exports')"

# Verify lib/package.json exists
node -e "console.log('CJS package.json:', require('./lib/package.json'))"
```

## Error Handling

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| Missing lib/package.json | CJS import fails in type:module package | Ensure compile:cjs-package runs |
| Missing .js extensions | ESM import fails | Add .js to all relative imports |
| Symbol.hasInstance not working | instanceof returns false cross-module | Verify brand is set in constructor |

## Migration Checklist

1. [ ] Update all source file imports to use `.js` extensions
2. [ ] Add `Symbol.hasInstance` and branding to `TinyType` class
3. [ ] Create `tsconfig-esm.build.json`
4. [ ] Create `tsconfig-cjs.build.json`
5. [ ] Update `package.json` with dual-build configuration
6. [ ] Update build scripts
7. [ ] Run tests to verify functionality
8. [ ] Test cross-module `instanceof` behavior
