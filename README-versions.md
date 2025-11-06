# Version Management

This project uses centralized version management to ensure consistency across all environments.

## Tool Versions

All tool versions are defined in `.tool-versions` and `mise.toml`:

- **Node.js**: 22.11.0
- **pnpm**: 9.12.3

## Updating Versions

To update tool versions across the entire project:

1. **Update `.tool-versions`** - This file is the single source of truth
2. **Update `mise.toml`** - Modern mise configuration
3. **Update `Dockerfile`** - Container base image version
4. **Test locally** with `mise install` or `asdf install`
5. **Verify CI passes** - GitHub Actions will use the new versions automatically

## Files That Reference Versions

- `.tool-versions` - Main version file (mise/asdf compatible)
- `mise.toml` - Modern mise configuration
- `.cursor/Dockerfile` - Container base image
- `.github/workflows/*.yml` - CI/CD pipelines (automatically reads `.tool-versions`)

## Local Development

Use mise (recommended) or asdf:

```bash
# Install mise
curl https://mise.run | sh

# Install tools
mise install

# Or with asdf
asdf install
```

## Container Development

The Dockerfile uses the exact versions from `.tool-versions` to ensure container consistency with local development.

## CI/CD

GitHub Actions workflows use the `jdx/mise-action` and read versions from `.tool-versions` automatically.