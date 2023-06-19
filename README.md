<a href="https://npmjs.com/package/@vituum/vite-plugin-juice"><img src="https://img.shields.io/npm/v/@vituum/vite-plugin-juice.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/@vituum/vite-plugin-juice.svg" alt="node compatility"></a>

# ⚡️🧃 ViteJuice

Inlines CSS code to HTML via [Juice](https://github.com/Automattic/juice). It's handy for creating email templates.

```js
import juice from '@vituum/vite-plugin-juice'

export default {
  plugins: [
    juice({ 
      paths: [],
      tables: true,
      doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      options: {},
      juiceCssLink: async href => href
    })
  ]
}
```

Only PostCSS and CSS is supported, you can transform sass or less via `juiceLink()` function. And process it manually.

* Sass - https://sass-lang.com/documentation/js-api/
* Less - https://lesscss.org/usage/#programmatic-usage

```html
<link rel="stylesheet" data-href="/src/email.less" data-juice-link>
```

Read the [docs](https://vituum.dev/plugins/juice.html) to learn more about the plugin options.

### Requirements

- [Node.js LTS (18.x)](https://nodejs.org/en/download/)
- [Vite](https://vitejs.dev/)
