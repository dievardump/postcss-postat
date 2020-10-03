module.exports = (opts = {}) => {
  const { transformers = {} } = opts;
  return {
    postcssPlugin: "postat",
    Declaration(node, { AtRule }) {
      if (node.prop.indexOf("-postat-") === 0) {
        let name = node.prop.replace("-postat-", "");
        let value = node.value;
        if ("function" === typeof transformers[name]) {
          [name, value] = transformers[name](name, value, node);
        }

        let atRule = new AtRule({ name, params: value });
        node.parent.append(atRule);
        node.remove();
      }
    },
  };
};
module.exports.postcss = true;
