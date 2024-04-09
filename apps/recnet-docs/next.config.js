//@ts-check

// ref: https://github.com/shuding/nextra/issues/454#issuecomment-2028475942
if (process.cwd() !== __dirname) {
  process.chdir(__dirname);
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
