<a href="https://npmjs.com/package/@vituum/vite-plugin-juice"><img src="https://img.shields.io/npm/v/@vituum/vite-plugin-juice.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/@vituum/vite-plugin-juice.svg" alt="node compatility"></a>

# ⚡️🧃 ViteJuice

Inlines CSS (sass, less etc. also supported) code to HTML via [Juice](https://github.com/Automattic/juice). It's handy for creating email templates.

```js
import juice from '@vituum/vite-plugin-juice'

export default {
  plugins: [
    juice({ 
      paths: [],
      tables: false,
      juice: {}
    })
  ]
}
```

Read the [docs](https://vituum.dev/config/integrations-options.html#vituum-juice) to learn more about the plugin options.

### Requirements

- [Node.js LTS (16.x)](https://nodejs.org/en/download/)
- [Vite](https://vitejs.dev/) or [Vituum](https://vituum.dev/)
