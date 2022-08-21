import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssHtml from 'postcss-html'
import juice from 'juice'

const defaultOptions = {
    paths: [],
    tables: false,
    options: {}
}

const plugin = (userOptions = {}) => {
    userOptions = Object.assign(defaultOptions, userOptions)

    return {
        name: '@vituum/vite-plugin-juice',
        enforce: 'post',
        transformIndexHtml: {
            enforce: 'post',
            transform: (html, { path }) => {
                const paths = userOptions.paths

                if (paths.length === 0 || paths.filter(p => path.startsWith(`/${p}`)).length === 0) {
                    return html
                }

                if (userOptions.tables) {
                    html = html.replaceAll('<table', '<table border="0" cellpadding="0" cellspacing="0"')
                }

                const result = postcss([postcssCustomProperties({
                    preserve: false
                })]).process(html, { syntax: postcssHtml() })

                return juice(result.content, userOptions.options)
            }
        }
    }
}

export default plugin
