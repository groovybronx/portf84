# Contribution Guide and Git Workflow

This guide outlines the branch management strategy and GitHub configuration for the Lumina Portfolio project. Following these guidelines ensures a smooth and consistent development process.

## Branching Strategy

The project uses a branching model based on Git Flow, with a few key branches that serve distinct purposes.

### Main Branches

-   **`main`**: This branch represents the production-ready code. It is protected, meaning all changes must be merged through a pull request. The `main` branch should always be stable and deployable.
-   **`develop`**: This is the primary integration branch for ongoing development. All feature branches are merged into `develop`. It is the default branch for the repository.

### Supporting Branches

-   **`release/vX.Y.Z-beta`**: These branches are used to prepare for a new release. They are created from `develop`, and only bug fixes and documentation updates are allowed. Once a release branch is stable, it is merged into both `main` and `develop`.
-   **`feature/*`**: All new features are developed in their own `feature` branch. These are created from `develop` and merged back into `develop` through a pull request.
-   **`fix/*`**: Bug fixes are handled in `fix` branches. These are typically created from `develop`, but for urgent production issues, they can be created from `main` (as a "hotfix").
-   **`copilot/*`**: These are temporary branches created by GitHub Copilot for AI-assisted development. They should be cleaned up regularly once their changes are merged.

## GitHub Configuration

To enforce the branching strategy and maintain code quality, the GitHub repository is configured with the following settings.

### Default Branch

The **`develop`** branch is set as the default branch. This ensures that new pull requests target `develop` by default.

### Branch Protection Rules

-   **`main`** **Branch**:
    -   **Require a pull request before merging**: All changes to `main` must be made through a pull request.
    -   **Require approvals**: At least one review and approval is required before merging.
    -   **Require status checks to pass**: All continuous integration (CI) checks, such as tests and builds, must pass before merging.
    -   **Require conversation resolution**: All comments on a pull request must be resolved before it can be merged.
    -   **Include administrators**: These rules apply to repository administrators as well.

-   **`develop`** **Branch** (Recommended):
    -   Similar protection rules can be applied to the `develop` branch, although they can be less strict (e.g., no required approvals).

## Contribution Workflow

### Developing a New Feature

1.  **Create a feature branch** from `develop`:
    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b feature/your-new-feature
    ```
2.  **Implement your feature**.
3.  **Push your branch** and create a pull request to merge it into `develop`.

### Preparing a Release

1.  **Create a release branch** from `develop`:
    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b release/v0.2.0-beta
    ```
2.  **Finalize the release** by updating the version number, changelog, and fixing any remaining bugs.
3.  **Create a pull request** to merge the release branch into `main`.
4.  Once merged, **merge the release branch back into** `develop` to ensure that any changes made on the release branch are incorporated into the main development line.
5.  **Tag the release** on the `main` branch:
    ```bash
    git checkout main
    git pull origin main
    git tag -a v0.2.0-beta -m "Release v0.2.0-beta"
    git push origin v0.2.0-beta
    ```

### Creating a Hotfix

1.  **Create a fix branch** from `main`:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b fix/critical-bug
    ```
2.  **Implement the fix**.
3.  **Create a pull request** to merge the fix into `main`.
4.  **Merge the fix back into** `develop` to ensure the fix is included in future releases.

## Branch Cleanup

To keep the repository tidy, the project includes scripts for cleaning up old and merged branches. You can also manually delete remote branches using the following command:

```bash
git push origin --delete <branch-name>
```
