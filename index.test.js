const postcss = require("postcss");

const plugin = require("./");

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: undefined,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it("transforms simple placeholder name", async () => {
  await run(
    "a{ -postat-extend: %placeholder; }",
    "a{ @extend %placeholder; }",
    {}
  );
});

it("transforms complex placeholder name", async () => {
  await run(
    "a{ -postat-extend: %placeholder param1, param2; }",
    "a{ @extend %placeholder param1, param2; }",
    {}
  );
});

it("transforms rule that have a transformer", async () => {
  await run(
    "a{ -postat-extend-ph: placeholder param1, param2; }",
    "a{ @extend %placeholder param1, param2; }",
    {
      transformers: {
        "extend-ph": (name, value) => {
          name = name.replace("-ph", "");
          value = `%${value}`;

          return [name, value];
        },
      },
    }
  );
});
