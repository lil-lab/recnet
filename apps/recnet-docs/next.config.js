//@ts-check
const fs = require("fs");
const path = require("path");

// ref: https://github.com/shuding/nextra/issues/454#issuecomment-1907150823
const destPagesPath = path.join(__dirname, "../../pages");
fs.symlink("apps/recnet-docs/src/pages", destPagesPath, "dir", (e) => {
  console.log("Created symlink to apps/recnet-docs/src/pages in pages/");
  console.log(
    "Learn more: ",
    "https://github.com/shuding/nextra/issues/454#issuecomment-1907150823"
  );
  if (e && e.message.startsWith("EEXIST")) {
    console.log("ℹ️ Symlink already exists. Skipping symlink creation.");
  }
});

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
