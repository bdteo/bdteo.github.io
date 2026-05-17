#!/usr/bin/env node

const childProcess = require("node:child_process")
const fs = require("node:fs")
const fsp = require("node:fs/promises")
const os = require("node:os")
const path = require("node:path")

const rootDir = path.resolve(__dirname, "..")
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bdteo-build-"))
const workDir = path.join(tempRoot, "site")
const keepTemp = process.env.BLOG_BUILD_KEEP === "1"
const outputDir = process.env.BLOG_BUILD_OUTPUT
  ? path.resolve(rootDir, process.env.BLOG_BUILD_OUTPUT)
  : null

const run = (command, args, options = {}) => {
  const result = childProcess.spawnSync(command, args, {
    cwd: workDir,
    stdio: "inherit",
    shell: false,
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

const copySite = () => {
  fs.mkdirSync(workDir, { recursive: true })
  const source = `${rootDir}/`
  const target = `${workDir}/`

  const result = childProcess.spawnSync(
    "rsync",
    [
      "-a",
      "--delete",
      "--exclude",
      ".git",
      "--exclude",
      "node_modules",
      "--exclude",
      ".cache",
      "--exclude",
      "public",
      "--exclude",
      ".DS_Store",
      source,
      target,
    ],
    { stdio: "inherit" },
  )

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

const installDependencies = () => {
  console.log("==> Installing dependencies in isolated copy")
  run("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"])
}

const copyPublicToOutput = async () => {
  if (!outputDir) {
    return
  }

  const builtPublic = path.join(workDir, "public")
  console.log(`==> Copying isolated public output to ${outputDir}`)
  await fsp.rm(outputDir, { recursive: true, force: true })
  await fsp.mkdir(path.dirname(outputDir), { recursive: true })

  const result = childProcess.spawnSync(
    "rsync",
    ["-a", "--delete", `${builtPublic}/`, `${outputDir}/`],
    { stdio: "inherit" },
  )

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

const main = async () => {
  try {
    console.log(`==> Creating isolated build copy at ${workDir}`)
    copySite()
    installDependencies()

    console.log("==> Building isolated copy")
    run("pnpm", ["exec", "gatsby", "clean"])
    run("pnpm", ["exec", "gatsby", "build", "--prefix-paths"])

    console.log(`==> Isolated build succeeded: ${path.join(workDir, "public")}`)
    await copyPublicToOutput()

    if (!keepTemp) {
      await fsp.rm(tempRoot, { recursive: true, force: true })
    } else {
      console.log(`==> Keeping isolated build directory: ${tempRoot}`)
    }
  } catch (error) {
    console.error(`build-isolated: ${error.message}`)
    if (!keepTemp) {
      await fsp.rm(tempRoot, { recursive: true, force: true })
    }
    process.exit(1)
  }
}

main()
