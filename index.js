const postcss = require("postcss");

module.exports = (opts = {}) => {
  const { transformers = {} } = opts;
  return (root) => {
    root.walkDecls((node) => {
      if (node.prop.indexOf("-postat-") === 0) {
        let name = node.prop.replace("-postat-", "");
        let value = node.value;
        if ("function" === typeof transformers[name]) {
          [name, value] = transformers[name](name, value, node);
        }

        const AtRule = postcss.AtRule || postcss.atRule;
        let atRule = new AtRule({ name, params: value });
        node.parent.append(atRule);
        node.remove();
      }
    });
  };
};
module.exports.postcss = true;
