# Rawnak Tools — MVP

## Routes

- Arabic: \`/ar/tools\`
- English: \`/en/tools\`
- Editors: \`/{locale}/tools/{slug}\`

Available slugs:

- \`button-studio\`
- \`motion-studio\`
- \`theme-builder\`
- \`svg-studio\`
- \`hero-builder\`

## Design decisions

- Rawnak Tools lives in the existing Rawnak Group Next.js app rather than creating a new product/repository or fourth Rawnak "world".
- Editors are entirely client-side for the MVP. No login, database write, personal-data processing, backend API, payment collection, or external AI service.
- All exported snippets are original HTML/CSS/SVG and do **not** embed premium components from third-party libraries.
- RTL/LTR derives from the existing locale layout; Arabic and English URLs work independently.
- No dependencies added to \`package.json\`.

## Adding a tool

1. Add a typed slug and bilingual catalog details to \`lib/tools/catalog.ts\`.
2. Add editor controls, preview, and copy/download code to \`components/tools/ToolWorkbench.tsx\`. Prefer extracting shared controls before the file gets larger.
3. The index and static editor route parameters automatically pick up the new slug.
4. Test \`npm run build\`, keyboard navigation, reduced-motion mode, mobile screens, and export output.

## Third-party license caution

Open-source libraries may be used if their specific license and attribution requirements permit the intended usage and distribution. Do **not** copy paid React Bits Pro components or repackage libraries that prohibit redistribution. Audit licenses before importing any third-party snippets into a public component collection.

## Suggested next steps

- Add a public feedback form / usage analytics that honor privacy.
- Extract preview/export adapters per tool from the shared workbench.
- Add source format options (React/HTML/CSS) and validation of generated exports.
- Build a reusable studio editor configuration schema and optional shadcn registry.
- Add integration and visual regression tests before launch.
