/** @type {import('prettier').Config} */
export default {
    semi: true,
    singleQuote: true,
    singleAttributePerLine: false,
    htmlWhitespaceSensitivity: 'css',
    printWidth: 150,
    tabWidth: 4,
    overrides: [
        {
            files: '**/*.yml',
            options: {
                tabWidth: 2,
            },
        },
    ],

    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
        // Must be loaded last
        'prettier-plugin-tailwindcss',
    ],

    // Options for `@ianvs/prettier-plugin-sort-imports`
    // Usage: https://github.com/ianvs/prettier-plugin-sort-imports
    importOrder: [
        '^(react/(.*)$)|^(react$)',
        '',
        '<BUILTIN_MODULES>',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '<TYPES>',
        '^@/types/(.*)$',
        '',
        '^@/lib/(.*)$',
        '',
        '^@/utils/(.*)$',
        '',
        '^@/hooks/(.*)$',
        '',
        '^@/layouts/(.*)$',
        '',
        '^@/components/ui/(.*)$',
        '',
        '^@/components/(.*)$',
        '',
        '^(?!.*[.]css$)[./].*$',
        '.css$',
        '',
        '^[./]',
    ],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrderCaseSensitive: false,

    // Options for `prettier-plugin-tailwindcss`
    // Usage: https://github.com/tailwindlabs/prettier-plugin-tailwindcss
    tailwindFunctions: ['clsx', 'cn'],
    tailwindStylesheet: 'resources/css/app.css',
};
