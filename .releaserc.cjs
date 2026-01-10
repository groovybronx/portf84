// Configuration for Semantic Release (CommonJS)
module.exports = {
	branches: [
		"main",
		{
			name: "develop",
			prerelease: "beta",
		},
		{
			name: "release/*",
			prerelease: "rc",
		},
		{
			name: "feature/*",
			prerelease: "alpha",
		},
	],
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		"@semantic-release/npm",
		[
			"@semantic-release/github",
			{
				// Configuration for GitHub releases
				successComment:
					"🎉 This ${issue.pull_request ? 'PR is included' : 'release has been published'} in version ${nextRelease.version} :tada:",
				failComment:
					"❌ The ${issue.pull_request ? 'PR' : 'release'} has failed. Please check the logs and fix the errors.",
				// Remove dynamic assignees to avoid GitHub Actions syntax issues
				draftRelease: true,
			},
		],
	],
	// Remove explicit repositoryUrl to let semantic-release infer from git context
	tagFormat: "v${version}",
};