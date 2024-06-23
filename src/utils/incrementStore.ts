import { IMapFrame, IStore, ITokensMap, MemoryStore } from "@jscpd/core";
import { Change } from "./diffParser";


export class IncrementMemoryStore<Frame extends IMapFrame> extends MemoryStore<Frame> {
    private __namespace: string = '';
    protected changedValues: Record<string, Record<string, Frame>> = {};

    constructor(
        private readonly changeMap: Record<string, Change[]>
    ) {
        super();
    }

    public namespace(namespace: string): void {
        super.namespace(namespace);
        // super._namespace is not accessible.
        this.__namespace = namespace;
        this.changedValues[namespace] = this.changedValues[namespace] || {};
    }

    private isChange(value: Frame): Change {
        return this.changeMap[value.sourceId].find(change => {
            const [start, end] = change;
            return value.start.loc?.start.line > start && value.start.loc?.start.line < end
                || value.end.loc?.end.line > start && value.end.loc?.end.line < end;
        });
    }

    public get(key: string, value?: Frame): Promise<Frame> {
        if (!value || this.isChange(value)) {
            return super.get(key);
        } else {
            return new Promise((res, rej) => {
                if (key in this.changedValues[this.__namespace]) {
                    res(this.changedValues[this.__namespace][key]);
                } else {
                    rej(new Error('not found'));
                }
            });
        }
    }
    
    set(key: string, value: Frame): Promise<Frame> {
        if (this.isChange(value)) {
            this.values[this.__namespace][key] = value;
            return Promise.resolve(value);
        } else {
            return super.set(key, value);
        }
    }

    close(): void {
        super.close();
        this.changedValues = {};
    }

}