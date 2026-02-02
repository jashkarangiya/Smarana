# Contributing to Smarana

Thank you for your interest in contributing to Smarana! We welcome contributions from the community.

## Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/smarana.git
   cd smarana
   npm install
   ```

2. **Environment**:
   Copy `.env.example` to `.env` and configure the necessary secrets.

3. **Run Locally**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a Branch**:
   Always create a new branch for your work. Use a descriptive name:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Changes**:
   - Write clean, maintainable code.
   - Improve existing tests or add new ones (`npm test`).
   - Ensure linting passes (`npm run lint`).

3. **Commit**:
   Use conventional commits (e.g., `feat: add gamification`, `fix: login error`).

4. **Verify**:
   Before pushing, run the full test suite:
   ```bash
   npm test
   npx playwright test
   ```

## Pull Request Process

1. Push your branch to your fork.
2. Open a Pull Request against the `main` branch.
3. Fill out the PR template with details about your changes.
4. Wait for CI checks to pass and a customized review.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
