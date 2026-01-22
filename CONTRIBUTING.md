# Contributing to Harken

Thank you for your interest in contributing to Harken!

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+

### Getting Started

```bash
# Clone the repository
git clone https://github.com/thutch-conecrow/harken.git
cd harken

# Install dependencies
pnpm install

# Run all checks
pnpm ci
```

### Available Scripts

| Command              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `pnpm build`         | Build all packages                                    |
| `pnpm typecheck`     | Run TypeScript type checking                          |
| `pnpm lint`          | Run ESLint                                            |
| `pnpm lint:fix`      | Run ESLint with auto-fix                              |
| `pnpm format`        | Format code with Prettier                             |
| `pnpm format:check`  | Check code formatting                                 |
| `pnpm test`          | Run tests                                             |
| `pnpm test:coverage` | Run tests with coverage report                        |
| `pnpm ci`            | Run all checks (typecheck, lint, format, build, test) |

### SDK Development

The SDK lives in `packages/sdk-react-native/`. Key scripts:

```bash
# Run SDK tests in watch mode
pnpm --filter @harkenapp/sdk-react-native test:watch

# Regenerate OpenAPI types
pnpm --filter @harkenapp/sdk-react-native generate
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `pnpm ci` to ensure all checks pass
5. Commit your changes with a descriptive message
6. Push to your fork and open a Pull Request

### Commit Messages

Use clear, descriptive commit messages. We follow conventional commits style:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `chore:` Maintenance tasks

## Release Process

Releases are automated via GitHub Actions. When changes are merged to `main`:

1. **CI runs** - typecheck, lint, format check, build, and tests
2. **Path filtering** - Only SDK source changes trigger a release
3. **Version bump** - Automatically increments based on current version:
   - Prerelease (e.g., `0.0.1-alpha.1`) → `0.0.1-alpha.2`
   - Stable (e.g., `0.1.0`) → `0.1.1` (patch)
4. **npm publish** - With OIDC-based provenance
5. **Git tag** - Creates release tag and GitHub release

### Manual Releases

Use `workflow_dispatch` on the Release workflow to:

- Override version (e.g., graduate from alpha to `0.1.0`)
- Choose release type (patch/minor/major)

### Version Management

- Prerelease versions auto-increment the prerelease number
- Stable versions auto-increment patch by default
- To graduate from prerelease, manually set version via workflow_dispatch

## Code Style

- TypeScript strict mode
- ESLint + Prettier for formatting
- No unnecessary dependencies
- Keep the SDK lightweight and focused

## Testing

Tests use Vitest. Focus on:

- Business logic (API client, retry logic, etc.)
- State management (stores, domain logic)
- Edge cases and error handling

Avoid testing:

- Thin wrapper components
- Pass-through context providers
- Type-only code

## Questions?

Open an issue for questions or discussions.
