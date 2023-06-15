export interface PluginUserConfig {
    paths?: string[]
    tables?: boolean
    doctype?: string
    options?: import('juice').Options
    juiceCssLink?: (href: string) => string | Promise<string>
}
