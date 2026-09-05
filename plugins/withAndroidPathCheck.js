const { withGradleProperties } = require("@expo/config-plugins");

// Necessário no Windows: o caminho do projeto tem "ç" (App de serviços), e o
// Gradle recusa non-ASCII paths por padrão. Ver http://b.android.com/95744
// Sem isso, o android/gradle.properties gerado a cada `expo prebuild` perde
// esse ajuste.
module.exports = function withAndroidPathCheck(config) {
  return withGradleProperties(config, (config) => {
    config.modResults.push({ type: "property", key: "android.overridePathCheck", value: "true" });
    return config;
  });
};
