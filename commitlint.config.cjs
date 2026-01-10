module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat", // New features
				"fix", // Bug fixes
				"docs", // Documentation
				"style", // Code style (formatting, etc)
				"refactor", // Refactoring
				"test", // Tests
				"chore", // Build process, dependencies, etc
				"perf", // Performance improvements
				"ci", // CI configuration
				"build", // Build system
				"revert", // Revert previous commit
			],
		],
		"subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
		"subject-max-length": [2, "always", 50],
		"body-max-line-length": [2, "always", 72],
	},
};
