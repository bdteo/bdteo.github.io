SHELL := /usr/bin/env bash
.SHELLFLAGS := -euo pipefail -c

.PHONY: deploy deploy-build clean

# Zero-downtime deploy for the VPS:
# - builds in a temporary git worktree (so we never delete the live public/)
# - atomically swaps the ./public symlink to the new build output
#
# Requirements on the VPS:
# - git, make
# - nvm installed for the deploy user (boris) at ~/.nvm
# - pnpm available via corepack (package.json pins pnpm)

APP_DIR := $(CURDIR)
# Store releases OUTSIDE the git working tree so accidental `git clean -fd`
# can't delete the currently-served build (which would cause 403s during deploy).
RELEASES_DIR := $(HOME)/site/bdteo.com-releases
TIMESTAMP := $(shell date +%Y%m%d%H%M%S)
WORKTREE_DIR := $(RELEASES_DIR)/.worktree-$(TIMESTAMP)
RELEASE_DIR := $(RELEASES_DIR)/$(TIMESTAMP)
NVM_DIR := $(HOME)/.nvm
NODE_VERSION := 22

deploy:
	@echo "==> Fetching latest main"; \
	cd "$(APP_DIR)"; \
	git fetch --all --prune; \
	echo "==> Ensuring public is a symlink"; \
	mkdir -p "$(RELEASES_DIR)"; \
	if [ -L "$(APP_DIR)/public" ] && [ ! -e "$(APP_DIR)/public" ]; then \
	  echo "!! public symlink is broken. Creating a temporary empty release to restore availability."; \
	  mkdir -p "$(RELEASES_DIR)/rescue-$(TIMESTAMP)/public"; \
	  ln -s "$(RELEASES_DIR)/rescue-$(TIMESTAMP)/public" "$(APP_DIR)/public.tmp"; \
	  mv -Tf "$(APP_DIR)/public.tmp" "$(APP_DIR)/public"; \
	elif [ -L "$(APP_DIR)/public" ]; then \
	  :; \
	elif [ -d "$(APP_DIR)/public" ]; then \
	  mkdir -p "$(RELEASES_DIR)/initial-$(TIMESTAMP)"; \
	  mv "$(APP_DIR)/public" "$(RELEASES_DIR)/initial-$(TIMESTAMP)/public"; \
	  ln -s "$(RELEASES_DIR)/initial-$(TIMESTAMP)/public" "$(APP_DIR)/public.tmp"; \
	  mv -Tf "$(APP_DIR)/public.tmp" "$(APP_DIR)/public"; \
	else \
	  mkdir -p "$(RELEASES_DIR)/initial-$(TIMESTAMP)/public"; \
	  ln -s "$(RELEASES_DIR)/initial-$(TIMESTAMP)/public" "$(APP_DIR)/public.tmp"; \
	  mv -Tf "$(APP_DIR)/public.tmp" "$(APP_DIR)/public"; \
	fi; \
	echo "==> Creating worktree at $(WORKTREE_DIR)"; \
	git worktree add --detach "$(WORKTREE_DIR)" origin/main; \
	echo "==> Building in worktree (no impact to live)"; \
	bash -lc 'set -euo pipefail; \
	  cd "$(WORKTREE_DIR)"; \
	  export NVM_DIR="$(NVM_DIR)"; \
	  [ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	  nvm install $(NODE_VERSION) >/dev/null; \
	  nvm use $(NODE_VERSION) >/dev/null; \
	  corepack enable >/dev/null 2>&1 || true; \
	  pnpm install --frozen-lockfile; \
	  pnpm build'; \
	echo "==> Capturing build output"; \
	mkdir -p "$(RELEASE_DIR)"; \
	mv "$(WORKTREE_DIR)/public" "$(RELEASE_DIR)/public"; \
	echo "==> Cleaning worktree"; \
	git worktree remove --force "$(WORKTREE_DIR)"; \
	echo "==> Atomically switching public -> $(RELEASE_DIR)/public"; \
	ln -s "$(RELEASE_DIR)/public" "$(APP_DIR)/public.tmp"; \
	mv -Tf "$(APP_DIR)/public.tmp" "$(APP_DIR)/public"; \
	echo "==> Done. Live site now serves the new build."; \
	echo "==> Keeping only the most recent 10 releases"; \
	ls -1dt "$(RELEASES_DIR)"/20* 2>/dev/null | tail -n +11 | xargs -r rm -rf || true

clean:
	@rm -rf "$(RELEASES_DIR)"

