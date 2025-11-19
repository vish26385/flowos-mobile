// const { getDefaultConfig } = require('expo/metro-config');
// const config = getDefaultConfig(__dirname);

// config.resolver.assetExts.push('cjs'); // fixes some RN Paper web builds

// module.exports = config;

// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 🧩 Patch: Disable Metro’s broken symbolicator on web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Block any symbolication attempts using <anonymous> path
      if (req.url?.includes("symbolicate")) {
        res.end(JSON.stringify({ stack: [] }));
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;


