module.exports = {
  hooks: {
    readPackage(pkg) {
      pkg.allowBuildScripts = true;
      return pkg;
    },
  },
};
