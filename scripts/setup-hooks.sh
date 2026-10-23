#!/usr/bin/env bash
# Setup script: configures local git hooks for this repository.
# Run once after cloning:  bash scripts/setup-hooks.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "❌ Not inside a git repository."
  exit 1
fi

HOOKS_DIR="$REPO_ROOT/.githooks"

if [[ ! -d "$HOOKS_DIR" ]]; then
  echo "❌ Hooks directory not found: $HOOKS_DIR"
  exit 1
fi

# Point git to the tracked hooks directory
git config core.hooksPath ".githooks"

# Make hooks executable (chmod is a no-op on Windows but harmless)
chmod +x "$HOOKS_DIR"/* 2>/dev/null || true

echo "✅ Git hooks installed from .githooks/"
echo "   - commit-msg : validates Conventional Commits"
echo "   - pre-push   : validates branch naming convention"
echo ""
echo "To bypass hooks for a single command: git <command> --no-verify"
