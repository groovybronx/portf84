// Configuration pour Semantic Release
module.exports = {
  branches: [
    'main',
    {
      name: 'develop',
      prerelease: 'beta',
    },
    {
      name: 'release/*',
      prerelease: 'rc',
    },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/github',
  ],
};
