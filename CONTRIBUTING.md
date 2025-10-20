# Contributing to Aided

First off, thank you for considering contributing to Aided! We welcome any contributions, from bug reports and documentation improvements to new features.

This document provides guidelines to help you get started.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE-OF-CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to **ahmadmdabit@gmail.com**.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an issue on our GitHub repository. A great bug report includes:
- A clear and descriptive title.
- A detailed description of the problem.
- A minimal, reproducible example that demonstrates the bug. You can use a tool like CodeSandbox or StackBlitz, or provide a small code snippet.
- Information about your environment (e.g., browser, Node.js version).

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please open an issue to start a discussion. This allows us to align on the proposal before any significant work is done.

### Pull Requests

We welcome pull requests! For any significant changes, please **open an issue first** to discuss the proposed changes with the maintainers.

## Development Setup

To get the project running locally, please follow these steps.

### 1. Fork & Clone

Fork the repository on GitHub, then clone your fork locally:

```bash
git clone https://github.com/ahmadmdabit/aided.git
cd aided
```

### 2. Install Dependencies

This project uses **Yarn 4** and **Corepack**. Corepack is bundled with modern Node.js versions and should be enabled to ensure you use the correct Yarn version.

```bash
# Enable Corepack (if you haven't already)
corepack enable

# Install all dependencies for the monorepo
yarn install
```
The project is configured to use `nodeLinker: node-modules`, so a `node_modules` directory will be created.

## Running Quality Checks

Before submitting a pull request, please ensure that all quality checks are passing.

### Linting

We use ESLint to enforce code style and catch common errors.

```bash
# Run the linter
yarn lint
```

### Testing

We use Vitest for unit and integration testing. Our goal is to maintain 100% test coverage.

```bash
# Run all tests in watch mode
yarn test

# Run all tests once and generate a coverage report
yarn coverage
```
Please ensure that all existing tests pass and that any new functionality is accompanied by its own set of tests. The coverage report can be viewed by opening the `coverage/index.html` file in your browser.

## Submitting a Pull Request

1.  Create a new branch for your feature or bugfix: `git checkout -b feat/my-new-feature` or `git checkout -b fix/my-bug-fix`.
2.  Make your changes and commit them with a descriptive message that follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
3.  Ensure all linting and testing checks pass (`yarn lint` and `yarn coverage`).
4.  Push your branch to your fork: `git push origin feat/my-new-feature`.
5.  Open a pull request against the `main` branch of the original repository.

Thank you for your contribution!
