
export type CommonParams = {
    env: string;
    templateType: string;
    basePath: string;
    verbose: boolean
    unpack: boolean
}

export type InstanceParams = CommonParams & {
    guid: string
}

export type TemplateParams = CommonParams & {
    path: string
}

export type ConfigParams = CommonParams & {
    path: string
    environment: string
    for?: string
}
