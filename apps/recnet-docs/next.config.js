//@ts-check
const fs = require("fs");
const path = require("path");

// if pages directory does not exist
const pagesDir = path.resolve(__dirname, "./src/pages");
const rootPagesDir = path.resolve(__dirname, "../../pages");
if (!fs.existsSync(rootPagesDir)) {
  // copy all files from pageDir to rootPagesDir
  console.log(`Copying ${pagesDir} to ${rootPagesDir}`);
  fs.mkdirSync(rootPagesDir);
  fs.cpSync(pagesDir, rootPagesDir, {
    recursive: true,
  });
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

// eslint-disable-next-line @typescript-eslint/no-var-requires
// @ts-expect-error: not typed
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNextra,
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
