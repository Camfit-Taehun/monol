module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  extends: ["eslint:recommended"],
  ignorePatterns: ["dist/**", "ui/dist/**", "ui/node_modules/**", ".planote/**"]
};
