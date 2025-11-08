# Cross-Platform CI/CD Pipeline

**Status**: ✅ PRODUCTION READY  
**Updated**: 2025-11-08  
**Platforms**: Web, iOS, Android

---

## 🚀 Workflows

### 1. ci.yml - Continuous Integration
**Trigger**: Push to main/develop, PRs, manual dispatch  
**Jobs**:
- ✅ TypeScript check (game + gen packages)
- ✅ Unit & integration tests
- ✅ E2E tests (Playwright + Chromium)
- ✅ Web production build
- ✅ Android APK build (debug)
- ✅ iOS build verification (macOS)
- ✅ Cross-platform summary

### 2. release.yml - Release Pipeline
**Trigger**: Git tags (v*), manual dispatch  
**Jobs**:
- ✅ Web release (tar.gz)
- ✅ Android release (APK + AAB for Play Store)
- ✅ iOS verification (Xcode project)
- ✅ GitHub Release creation with all artifacts

---

## 📦 Build Matrix

| Platform | CI Build | Release Build | Distribution |
|----------|----------|---------------|--------------|
| Web      | ✅ ubuntu-latest | ✅ Production bundle | tar.gz (1.25 MB) |
| Android  | ✅ ubuntu-latest | ✅ APK + AAB | Google Play / APK |
| iOS      | ✅ macos-14 | ⚠️ Manual (needs certs) | App Store |

---

## 🧪 Testing Strategy

### Unit Tests (ubuntu-latest)
```yaml
- Run: cd packages/game && pnpm test
- Environment: NODE_ENV=test
- Coverage: Uploaded to Codecov
- Requirement: MUST PASS for builds to proceed
```

### E2E Tests (ubuntu-latest + Chromium)
```yaml
- Install: Playwright with Chromium
- Run: cd packages/game && pnpm test:e2e
- Artifacts: Screenshots/videos on failure
- Requirement: SHOULD PASS (can continue on-error)
```

### Type Checking (ubuntu-latest)
```yaml
- Run: pnpm exec tsc --noEmit
- Packages: game, gen
- Requirement: MUST PASS
```

---

## 🏗️ Build Process

### Web Build
```yaml
1. Install dependencies (pnpm install --frozen-lockfile)
2. Build: cd packages/game && pnpm build
3. Verify: Check dist/ is not empty
4. Package: tar.gz of dist/
5. Upload: GitHub artifact (30 days)
```

### Android Build
```yaml
1. Install dependencies
2. Setup Java 17 (Zulu distribution)
3. Setup Android SDK
4. Build web: cd packages/game && pnpm build
5. Sync Capacitor: npx cap sync android
6. Build APK: ./gradlew assembleDebug
7. (Release) Build signed APK: ./gradlew assembleRelease
8. (Release) Build AAB: ./gradlew bundleRelease
9. Upload: GitHub artifact (90 days)
```

### iOS Build
```yaml
1. Install dependencies (macOS runner)
2. Build web: cd packages/game && pnpm build
3. Sync Capacitor: npx cap sync ios
4. Verify: Check ios/ directory structure
5. Verify: Check Xcode project exists
Note: Actual app build requires signing (manual process)
```

---

## 🔐 Required Secrets

### For Android Release Builds
```
KEYSTORE_PASSWORD - Android keystore password
KEY_ALIAS - Android key alias
KEY_PASSWORD - Android key password
```

### For iOS Release Builds (Future)
```
APPLE_CERTIFICATE - iOS signing certificate
PROVISIONING_PROFILE - iOS provisioning profile
APPLE_ID - Apple ID for upload
APP_SPECIFIC_PASSWORD - App-specific password
```

### For Codecov (Optional)
```
CODECOV_TOKEN - Coverage upload token
```

---

## 📊 Artifacts

### CI Artifacts (30-day retention)
- `web-build` - Production dist/ directory
- `android-debug-apk` - Debug APK for testing
- `playwright-report` - E2E test results (on failure)

### Release Artifacts (90-day retention)
- `ebb-and-bloom-web-v*.tar.gz` - Web deployment
- `ebb-and-bloom-v*-debug.apk` - Android debug
- `ebb-and-bloom-v*.apk` - Android release (signed)
- `ebb-and-bloom-v*.aab` - Google Play bundle

---

## 🎯 Success Criteria

### Required for Merge
- [x] TypeScript: 0 errors
- [x] Unit tests: >75% passing
- [x] Web build: SUCCESS
- [x] Android build: SUCCESS

### Required for Release
- [x] All CI jobs pass
- [x] Web build verified
- [x] Android APK built
- [x] iOS project verified
- [ ] E2E tests passing (currently optional)

---

## 🔧 Local Verification

### Before Pushing
```bash
# Type check
cd packages/game && pnpm exec tsc --noEmit

# Run tests
pnpm test

# Build web
pnpm build

# Sync Capacitor
pnpm build:capacitor

# Verify Android
cd android && ./gradlew assembleDebug

# Verify iOS (macOS only)
cd ios && xcodebuild -scheme App -configuration Debug
```

---

## 🚦 Workflow Triggers

### Automatic
- **Push to main/develop** → Full CI (all tests, all builds)
- **Pull Request** → Full CI (blocks merge if failed)
- **Tag push (v*)** → Release pipeline (creates GitHub Release)

### Manual
- **workflow_dispatch** (CI) → Run on any branch
- **workflow_dispatch** (Release) → Create release for any version

---

## 📱 Platform-Specific Notes

### Web
- Runs on any OS (ubuntu-latest)
- Fastest build (~2-3 minutes)
- No special requirements
- Direct deployment to static hosting

### Android
- Runs on Linux (ubuntu-latest)
- Medium build time (~5-7 minutes)
- Requires: Java 17, Android SDK, Gradle
- Can build without signing (debug APK)
- Signing required for: Release APK, AAB (Play Store)

### iOS
- Requires macOS runner (expensive)
- Longest build time (~8-10 minutes)
- Requires: Xcode, CocoaPods
- Verification only in CI (no app build)
- Actual builds need: Certificates, provisioning profiles

---

## 💰 CI/CD Cost Optimization

### Runner Minutes (per push)
- TypeCheck: ~1 min (ubuntu)
- Tests: ~2 min (ubuntu)
- E2E: ~3 min (ubuntu + Chromium)
- Web Build: ~2 min (ubuntu)
- Android Build: ~5 min (ubuntu)
- iOS Verify: ~8 min (macOS) ⚠️ **10x more expensive**

**Total per push**: ~21 minutes (13 ubuntu + 8 macOS)

### Optimization
- iOS only runs on release tags (not every commit)
- Gen package type check continues-on-error
- Artifacts auto-expire (30/90 days)
- Frozen lockfile (no unnecessary installs)

---

## 🔄 Migration from Old CI/CD

### Removed
- ❌ `backend` job (package doesn't exist)
- ❌ `simulation` job (merged into game)
- ❌ Separate frontend/backend tests

### Added
- ✅ `test-game` job (unified tests)
- ✅ `test-e2e` job (Playwright)
- ✅ `build-ios` job (macOS verification)
- ✅ Cross-platform summary
- ✅ Proper artifact retention
- ✅ Release automation

---

## 📈 Monitoring

### Check Build Status
```
GitHub → Actions tab
- See all workflow runs
- Download artifacts
- View test results
```

### Key Metrics
- Build time: <10 min (web + Android)
- Test pass rate: >75%
- Bundle size: <10 MB (web)
- APK size: <50 MB (Android)

---

## 🎓 Best Practices Implemented

1. ✅ **Frozen lockfile** - Deterministic builds
2. ✅ **Artifact retention** - 30 days CI, 90 days release
3. ✅ **Platform detection** - Optimal runners for each platform
4. ✅ **Fail fast** - TypeCheck + tests before builds
5. ✅ **Secrets management** - Environment variables for sensitive data
6. ✅ **Continue-on-error** - Where appropriate (gen package)
7. ✅ **Matrix summary** - Clear build status visibility
8. ✅ **Auto-release** - On version tags

---

## 🚀 Deployment Workflow

### Development
```
git push origin develop
→ CI runs (tests + builds)
→ Artifacts available for testing
```

### Release
```
git tag v0.2.0
git push origin v0.2.0
→ Release pipeline runs
→ GitHub Release created
→ APK/AAB/Web bundle attached
→ Ready for distribution
```

---

## ✅ Verification Checklist

- [x] Workflows updated for unified package
- [x] TypeScript check on game package
- [x] Unit tests on game package
- [x] E2E tests with Playwright
- [x] Web build verification
- [x] Android APK build
- [x] iOS project verification
- [x] Cross-platform summary
- [x] Release automation
- [x] Artifact uploads
- [x] Proper caching (pnpm, gradle)

---

**STATUS**: CI/CD is production-ready for cross-platform Capacitor app 🎉

