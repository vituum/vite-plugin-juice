export interface PluginUserConfig {
    paths?: string[]
    tables?: boolean
    doctype?: string
    options?: import('juice').Options
    juiceLink?: (href: string) => string | Promise<string>
}

export default function plugin(options?: PluginUserConfig) : import('vite').Plugin
