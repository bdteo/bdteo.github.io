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
RELEASES_DIR := $(APP_DIR)/.releases
TIMESTAMP := $(shell date +%Y%m%d%H%M%S)
WORKTREE_DIR := $(APP_DIR)/.worktree-$(TIMESTAMP)
RELEASE_DIR := $(RELEASES_DIR)/$(TIMESTAMP)
NVM_DIR := $(HOME)/.nvm
NODE_VERSION := 22

deploy:
	@set -euo pipefail; \
	echo "==> Fetching latest main"; \
	cd "$(APP_DIR)"; \
	git fetch --all --prune; \
	echo "==> Ensuring public is a symlink"; \
	mkdir -p "$(RELEASES_DIR)"; \
	if [ -L "$(APP_DIR)/public" ]; then \
	  :; \
	elif [ -d "$(APP_DIR)/public" ]; then \
	  mv "$(APP_DIR)/public" "$(RELEASES_DIR)/initial-$(TIMESTAMP)"; \
	  ln -sfn "$(RELEASES_DIR)/initial-$(TIMESTAMP)" "$(APP_DIR)/public"; \
	else \
	  mkdir -p "$(RELEASES_DIR)/initial-$(TIMESTAMP)"; \
	  ln -sfn "$(RELEASES_DIR)/initial-$(TIMESTAMP)" "$(APP_DIR)/public"; \
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
	ln -sfn "$(RELEASE_DIR)/public" "$(APP_DIR)/public"; \
	echo "==> Done. Live site now serves the new build."

clean:
	@rm -rf "$(RELEASES_DIR)" "$(APP_DIR)"/.worktree-*

