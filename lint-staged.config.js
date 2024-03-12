// https://www.thisdot.co/blog/linting-formatting-and-type-checking-commits-in-an-nx-monorepo-with-husky
module.exports = {
  "{apps,libs,tools}/**/*.{ts,tsx}": (files) => {
    return `nx affected -t typecheck --files=${files.join(",")}`;
  },
  "{apps,tools}/**/*.{js,ts,jsx,tsx,json}": [
    (files) => `nx affected:lint --files=${files.join(",")}`,
    (files) => `nx format:write --files=${files.join(",")}`,
  ],
  "{libs,tools}/**/*.{js,ts,jsx,tsx,json}": [
    (files) => `nx affected:lint --fix --files=${files.join(",")}`,
    (files) => `nx format:write --files=${files.join(",")}`,
  ],
};
