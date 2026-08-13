const [major = 0, minor = 0, patch = 0] = process.versions.node
  .split('.')
  .map((value) => Number.parseInt(value, 10))

const requiredVersion = { major: 24, minor: 19, patch: 0 }
const actualVersion = { major, minor, patch }

const isSupported =
  actualVersion.major === requiredVersion.major &&
  (actualVersion.minor > requiredVersion.minor ||
    (actualVersion.minor === requiredVersion.minor && actualVersion.patch >= requiredVersion.patch))

if (!isSupported) {
  throw new Error(
    `Unsupported Node.js ${process.versions.node}. Install Node.js 24.19.0 or a newer 24.x release.`,
  )
}
