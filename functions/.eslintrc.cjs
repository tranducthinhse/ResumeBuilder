module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    quotes: ["error", "double"],
    "no-unused-vars": "off",
  },
};
