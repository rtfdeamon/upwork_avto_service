module.exports = {
  hooks: {
    readPackage(pkg) {
      // разрешаем postinstall у всех зависимостей (Nest, protobufjs и др.)
      pkg.allowBuildScripts = true;
      return pkg;
    },
  },
};
