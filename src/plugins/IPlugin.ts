export interface IPlugin {
    find(): Promise<string[]>
    load(): Promise<object>
}