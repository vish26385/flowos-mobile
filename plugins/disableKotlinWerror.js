const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function disableKotlinWerror(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Add a Kotlin compile override that disables "allWarningsAsErrors"
    // Works for both Groovy DSL and most project setups.
    const marker = "// --- disable-kotlin-werror ---";
    if (!contents.includes(marker)) {
      contents += `

${marker}
subprojects { subproject ->
  subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    kotlinOptions {
      allWarningsAsErrors = false
    }
  }
}
`;
    }

    config.modResults.contents = contents;
    return config;
  });
};
