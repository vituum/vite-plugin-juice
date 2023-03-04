import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssHtml from 'postcss-html'
import juice from 'juice'
import parse5 from 'parse5'

const defaultOptions = {
    paths: [],
    tables: false,
    doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    options: {},
    handleLinks: (href) => href
}

const plugin = (userOptions = {}) => {
    userOptions = Object.assign(defaultOptions, userOptions)

    return {
        name: '@vituum/vite-plugin-juice',
        enforce: 'post',
        transformIndexHtml: {
            enforce: 'post',
            transform: async (html, { path }) => {
                const paths = userOptions.paths
                let extraCss = ''

                if (paths.length === 0 || paths.filter(p => path.startsWith(`/${p}`)).length === 0) {
                    return html
                }

                if (html.includes('data-juice-link')) {
                    const document = parse5.parse(html)
                    const headNodes = document.childNodes[1].childNodes[0].childNodes
                    const headLinks = headNodes.filter(({ nodeName, attrs }) => nodeName === 'link' && attrs.filter(({name}) => name === 'data-juice-link'))

                    for (const link of headLinks) {
                        const href = link.attrs.filter(({ name }) => name === 'href')[0].value

                        if (typeof userOptions.handleLinks === 'function') {
                            extraCss += await userOptions.handleLinks(href)
                        }

                        headNodes.splice(headNodes.indexOf(link), 1);
                    }

                    html = parse5.serialize(document)
                    html = html.replace('</head>', `<style>${extraCss}</style></head>`)
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
