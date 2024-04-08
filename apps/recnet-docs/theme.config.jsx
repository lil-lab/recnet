const config = {
  logo: <span>RecNet Docs</span>,
  project: {
    link: "https://github.com/lil-lab/recnet",
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === "separator") {
        return <div>{title}</div>;
      }
      return <>{title}</>;
    },
  },
  // ... other theme options
};

export default config;
