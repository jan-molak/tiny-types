import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [
            'spec/**/*.spec.ts',
        ],
        coverage: {
            provider: 'v8',
            reportsDirectory: './reports/coverage',
            reporter: [ 'lcov', 'text' ],
            include: [ 'src/**/*.ts' ],
            exclude: [ 'lib', 'node_modules', 'spec', 'src/types' ],
        },
    },
});

