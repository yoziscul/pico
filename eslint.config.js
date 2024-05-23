module.exports = {
  env: {
		"browser": true,
		"es2021": true,
    "node": true,
	},
  extends: ["eslint:recommended"],
  rules: {
    indent: ["error", 4],
		linebreakStyle: ["error", "unix"],
		quotes: ["error", "single", { "avoidEscape": true }],
		semi: ["error", "always"],
  },
};

