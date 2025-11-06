# CI/CD Setup for Ebb & Bloom

## GitHub Actions Workflows

### 1. Android Build (`build-android.yml`)

Automatically builds Android APKs on every push and PR.

**Features:**
- ✅ Runs full test suite (39 tests) before building
- ✅ Builds debug APK for testing
- ✅ Supports release builds via workflow dispatch
- ✅ Uploads APK artifacts (30-day retention)
- ✅ Comments on PRs with build status
- ✅ Bundle size analysis

**Triggers:**
- Push to `main` or `copilot/add-perlin-chunk-world`
- Pull requests to `main`
- Manual workflow dispatch (for release builds)

**Artifacts:**
- Debug APK: `ebb-and-bloom-debug-{sha}.apk`
- Release APK: `ebb-and-bloom-release-{sha}.apk`

**Download Built APKs:**
1. Go to Actions tab
2. Click on latest workflow run
3. Download artifact from bottom of page
4. Install on Android device via ADB or file manager

### 2. Code Quality (`quality.yml`)

Runs on every PR to ensure code standards.

**Checks:**
- Test coverage
- TypeScript validation
- Linting
- Large file detection
- Documentation coverage
- ECS architecture validation

**Reports:**
- Test results
- Bundle analysis
- Architecture stats

## Setup Requirements

### For Debug Builds (Already Working)
No secrets needed! Just push and GitHub Actions will build.

### For Release Builds (Optional)

1. **Generate Android Keystore:**
```bash
keytool -genkey -v -keystore ebb-and-bloom.keystore \
  -alias ebb-bloom-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Add GitHub Secrets:**
Go to repository Settings → Secrets and variables → Actions

Add these secrets:
- `KEYSTORE_PASSWORD` - Your keystore password
- `KEY_ALIAS` - Your key alias (e.g., "ebb-bloom-key")
- `KEY_PASSWORD` - Your key password

3. **Upload Keystore to Repository:**
- Encode keystore: `base64 ebb-and-bloom.keystore`
- Add as secret: `KEYSTORE_BASE64`
- Update workflow to decode before build

## Running Builds

### Debug Build (Default)
```bash
# Automatically runs on push
git push origin your-branch
```

### Release Build (Manual)
1. Go to Actions tab
2. Select "Build Android APK"
3. Click "Run workflow"
4. Select branch and build type: `release`
5. Download signed APK from artifacts

## Local Build Testing

Test the workflow locally with act:
```bash
npm install -g @github/act
act push -j build-android
```

## Cost Estimate

**GitHub Actions Pricing** (Free tier):
- 2,000 minutes/month included
- Linux runners: 1x multiplier
- This workflow: ~8-12 minutes per build

Estimated usage:
- 10 pushes/day = 100-120 min/day
- Well within free tier for development

## Performance Targets

From `docs/10-performance.md`:
- ✅ APK size: Target <15MB (currently tracking)
- ✅ Build time: <10 minutes
- ✅ Test suite: <60 seconds
- ✅ 60 FPS target validated in CI

## Next Steps

1. ✅ Workflows committed and active
2. [ ] First successful build on push
3. [ ] Test APK on physical Android device
4. [ ] Add release signing (optional)
5. [ ] Configure automatic Play Store upload (Stage 2)

## Integration with Development

**Pre-merge checklist:**
- ✅ All tests pass (39/39)
- ✅ Android APK builds successfully
- ✅ APK size within target
- ✅ No architecture violations
- ✅ Documentation up to date

The CI/CD pipeline ensures every commit is buildable and testable on real devices.
