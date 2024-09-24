// https://www.thisdot.co/blog/linting-formatting-and-type-checking-commits-in-an-nx-monorepo-with-husky
module.exports = {
  "{apps,libs,tools}/**/*.{ts,tsx}": (files) => {
    return `nx affected -t typecheck --files=${files.join(",")}`;
  },
  "{apps,tools}/**/*.{js,ts,jsx,tsx,json}": [
    (files) => {
      return `nx affected:lint --files=${files.join(",")}`;
    },
    (files) => {
      return `nx format:check --files=${files.join(",")}`;
    },
  ],
  "{libs,tools}/**/*.{ts,tsx.json}": [
    (files) => {
      return `eslint --cache --fix ${files.join(" ")}`;
    },
    (files) => {
      return `nx format:check --files=${files.join(",")}`;
    },
  ],
};
