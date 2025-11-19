// --- patch-expo-router.js ---
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "node_modules", "expo-router", "build");
let patched = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (name.endsWith(".js")) patch(p);
  }
}

// function patch(file) {
//   let src = fs.readFileSync(file, "utf8");
//   const orig = src;
//   src = src
//     .replace(/React\.use\(/g, "React.useContext(")
//     .replace(/\(0,\s*react_1\.use\)\(/g, "react_1.useContext(")
//     .replace(/react_1\.use\(/g, "react_1.useContext(")
//     .replace(/react\.use\(/g, "react.useContext(");
//   if (src !== orig) {
//     fs.writeFileSync(file, src, "utf8");
//     patched++;
//     console.log("Patched:", file);
//   }
// }

function patch(file) {
  let src = fs.readFileSync(file, "utf8");
  const orig = src;

  src = src
    // Fix React.use and variants
    .replace(/React\.use\(/g, "React.useContext(")
    .replace(/\(0,\s*react_1\.use\)\(/g, "react_1.useContext(")
    .replace(/react_1\.use\(/g, "react_1.useContext(")
    .replace(/react\.use\(/g, "react.useContext(")
    // Fix react_1.default.use(
    .replace(/react_1\.default\.use\(/g, "react_1.default.useContext(")
    .replace(/ReactDefault\.use\(/g, "ReactDefault.useContext(");

  if (src !== orig) {
    fs.writeFileSync(file, src, "utf8");
    patched++;
    console.log("Patched:", file);
  }
}

if (fs.existsSync(root)) {
  walk(root);
  console.log(`✅  Patched ${patched} file(s)`);
} else {
  console.error("expo-router build folder not found:", root);
}
