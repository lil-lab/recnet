const { join } = require("path");

const { NxWebpackPlugin } = require("@nx/webpack");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/recnet-api"),
  },
  plugins: [
    new NxWebpackPlugin({
      target: "node",
      compiler: "tsc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      assets: ["./src/assets"],
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true,
    }),
  ],
};
