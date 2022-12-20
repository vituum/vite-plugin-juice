import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssHtml from 'postcss-html'
import juice from 'juice'

const defaultOptions = {
    paths: [],
    tables: false,
    doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    juice: {}
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

                html = html.replace('<!DOCTYPE html>', userOptions.doctype)

                if (userOptions.tables) {
                    html = html.replaceAll('<table', '<table border="0" cellpadding="0" cellspacing="0"')
                }

                html = html.replace('</head>', '</head><!-- postcss-disable -->')

                const result = postcss([postcssCustomProperties({
                    preserve: false
                })]).process(html, { syntax: postcssHtml() })

                const output = result.content.replace('</head><!-- postcss-disable -->', '</head>')

                return juice(output, userOptions.options)
            }
        }
    }
}

export default plugin
