const { withAppBuildGradle } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function disableKotlinWerror(config) {
  // Patch android/build.gradle (root) not android/app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    // This mod targets app/build.gradle, but we need root build.gradle.
    // We'll patch it manually using the projectRoot.
    return config;
  });

  return require("@expo/config-plugins").withDangerousMod(config, [
    "android",
    async (config) => {
      const root = config.modRequest.platformProjectRoot; // .../android
      const buildGradlePath = path.join(root, "build.gradle");

      if (!fs.existsSync(buildGradlePath)) {
        // Some projects use build.gradle.kts – handle that too
        const ktsPath = path.join(root, "build.gradle.kts");
        if (fs.existsSync(ktsPath)) {
          let contents = fs.readFileSync(ktsPath, "utf8");
          const marker = "// --- disable-kotlin-werror ---";
          if (!contents.includes(marker)) {
            contents += `

${marker}
subprojects {
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    compilerOptions {
      allWarningsAsErrors.set(false)
    }
  }
}
`;
            fs.writeFileSync(ktsPath, contents);
          }
        }
        return config;
      }

      let contents = fs.readFileSync(buildGradlePath, "utf8");
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
        fs.writeFileSync(buildGradlePath, contents);
      }

      return config;
    },
  ]);
};
