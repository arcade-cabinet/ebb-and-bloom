# Read Node.js version from .tool-versions
# This ensures consistency across development, CI, and container environments
FROM node:22.11.0-bookworm-slim

# Display for GUI-based tests
ENV DISPLAY=:99

# Install system dependencies for browsers, builds, Electron, and Android tooling
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials (native Node modules like better-sqlite3)
    git \
    curl \
    wget \
    build-essential \
    pkg-config \
    python3 \
    python3-pip \
    # X11 libraries for GUI testing
    xvfb \
    x11-utils \
    libx11-dev \
    libxext-dev \
    libxrender-dev \
    libxinerama-dev \
    # Browser testing dependencies (Chromium + ChromeDriver)
    chromium \
    chromium-driver \
    # Headless browser support libraries (Playwright/Chromium)
    libgbm1 \
    libgbm-dev \
    libdrm2 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgtk-3-dev \
    libnotify-dev \
    libnss3 \
    libnss3-dev \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libsecret-1-0 \
    libcups2 \
    libnspr4 \
    fonts-liberation \
    # Additional common browser deps
    libglib2.0-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxkbcommon0 \
    libxshmfence1 \
    libpango-1.0-0 \
    ffmpeg \
    # SDL2 for game testing
    libsdl2-dev \
    libsdl2-image-dev \
    libsdl2-mixer-dev \
    libsdl2-ttf-dev \
    # OpenGL/WebGL testing
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    mesa-utils \
    # Android/Capacitor build prerequisites
    openjdk-17-jdk \
    unzip \
    gradle \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*


# Install just command runner
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*


# pnpm via Corepack (MANDATORY package manager for this project)
# Version matches .tool-versions file
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm --version

# Verify pnpm is properly configured for background agents
RUN pnpm config set registry https://registry.npmjs.org/ \
    && pnpm config set store-dir /root/.local/share/pnpm/store

# Playwright: install required OS deps and cache Chromium browser
RUN pnpm dlx playwright install-deps
RUN pnpm dlx playwright install chromium

# Android SDK (for Capacitor Android tasks)
# Use a variable for the command line tools version for easier updates.
# Last tested/compatible version as of 2024-06. Update as needed.
ENV ANDROID_CMDLINE_TOOLS_VERSION=11076708
ENV ANDROID_SDK_ROOT=/opt/android-sdk ANDROID_HOME=/opt/android-sdk
ENV PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools"
RUN mkdir -p /opt/android-sdk/cmdline-tools \
    && curl -sSL -o /tmp/cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDLINE_TOOLS_VERSION}_latest.zip" \
    && unzip -q /tmp/cmdtools.zip -d /opt/android-sdk/cmdline-tools \
    && mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest \
    && rm -f /tmp/cmdtools.zip

RUN yes | sdkmanager --licenses && sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Browser testing environment variables
ENV CHROME_BIN=/usr/bin/chromium CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Game development specific environment variables
ENV NODE_ENV=development
ENV VITE_DEV_SERVER_PORT=3000
ENV CAPACITOR_ANDROID_STUDIO_PATH=""

# Background agent optimization - reduce memory footprint
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV PNPM_CONFIG_STORE_DIR=/root/.local/share/pnpm/store

# Working directory for background agents (workspace copied separately by agent)
WORKDIR /workspace
