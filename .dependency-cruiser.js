/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are forbidden.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-domain-to-infra",
      severity: "error",
      comment: "Domain layer must not depend on infrastructure.",
      from: { path: "^src/modules/[^/]+/domain" },
      to: {
        path: ["^src/modules/[^/]+/infrastructure", "^src/modules/[^/]+/adapters"],
      },
    },
    {
      name: "no-domain-to-next",
      severity: "error",
      comment: "Domain must not import Next.js modules.",
      from: { path: "^src/modules/[^/]+/domain" },
      to: { path: "^next/" },
    },
    {
      name: "no-app-to-next-request",
      severity: "warn",
      comment: "Application use cases should not import Next.js request objects.",
      from: { path: "^src/modules/[^/]+/application" },
      to: { path: "^next/server" },
    },
    {
      name: "no-cross-module-dependency",
      severity: "warn",
      comment: "Modules should not import from each other's internals — only through ports.",
      from: { path: "^src/modules/([^/]+)/(domain|application)" },
      to: { path: "^src/modules/(?!\\1)([^/]+)/(domain|application|infrastructure|adapters)" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    moduleSystems: ["es6", "commonjs"],
    tsConfig: {
      fileName: "tsconfig.json",
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
