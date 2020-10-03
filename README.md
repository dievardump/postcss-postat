# PostCSS Postat

[PostCSS] plugin to transform -postat-declaration: value into @declaration value.

[PostCSS]: https://github.com/postcss/postcss

```css
.foo {
  -postat-extend: %placeholder;
}
```

```css
.foo {
  @extend %placeholder;
}
```

## Why?

Sometimes, you use tools that will do a lot of things, but maybe too much.
That's the case of Svelte, which is probably the best JavaScript tool to use right now, but also not the most permissive.

Because of that, I can't use [postcss-extend] in my workflow, which is for me a big problem as I love the idea of utility CSS, but I really dislike to see utility css used in markup.

[postcss-extend]: https://github.com/travco/postcss-extend

So instead I use postcss-extend for the same result. But it is not compatible with Svelte worflow, so I had to find an alternative, which is post-processing the CSS resulting from svelte.
And to do this I have to use a custom property in the form of `-postat-xxx: value;`

## Transforming

Not all -postat- can be transformed from `-postat-name: value;` into `@name value;` which is why you can use transformers.
For example `-postat-extend: %placeholder` will not work in Svelte because of the % which is not valid at this place.
Which is why I use a transformer that will transform : `-postat-extend-ph: placeholder;` into `@extend %placeholder;`

usage in `postcss.config.js`

```js
module.exports = {
  plugins: [
    require('postcss-postat')({
      transformers: {
        "extend-ph": (name, value, node) => {
          name = name.replace("-ph", "");
          value = `%${value}`;

          return [name, value];
        },
      },
    }),
  ]
}
```

The transformer is set for the rule `extend-ph` and will receive as parameters :

- name : name of the rule
- value : value of the node
- node : the postcss node

It's expected to return an array of the form `[name, value]` which will be then transformed into a PostCSS [AtRule] and inserted in the node in place of the `-postat-` declaration.

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-postat
```

**Step 2:** Check you project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-postat')(),
    require('autoprefixer')
  ]
}
```

[official docs]: https://github.com/postcss/postcss#usage

## Usage in Svelte

Because this is something that I built only for my use in Svelte, here is a small "how to".

I made a small [Example with svelte]

[Example with svelte]: https://github.io/dievardump/svelte-and-postat

```js
// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';

import postcss from 'postcss';
import postcssConfig from './postcss.config.js';
const postcssPlugins = postcssConfig({});
const postcssProcessor = postcss(postcssPlugins);

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife',
  },
  plugins: [
    svelte({
      emitCss: false,
      css: async (css) => {
        // here is where we will use postat
        const result = await postcssProcessor.process(css.code);
        css.code = result.css;
        css.write('public/bundle.css');
      },
    }),
    resolve(),
  ],
};
```

```js
// postcss.config.js
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const append = postcss.plugin('postcss-append', (opts) => {
  if (!opts) {
    return null;
  }

  if (!fs.lstatSync(opts).isFile()) {
    return null;
  }

  return (root) => {
    const data = fs.readFileSync(opts).toString();
    root.append(data);
  };
});

export default (options) => {
  const plugins = [
    // append the content of file declaring the placeholders
    append('src/css/placeholders.css'),
    require('postcss-postat')({
      transformers: {
        "extend-ph": (name, value, node) => {
          name = name.replace("-ph", "");
          value = `%${value}`;

          return [name, value];
        },
      },
    }),
    require('postcss-extend')(),
  ];

  return plugins;
};
```

And now you should be good to go to use
