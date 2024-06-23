import { IClone, ICloneValidator, IOptions } from "@jscpd/core";
import { Change } from "./diffParser";

class IncrementValidator implements ICloneValidator {

    constructor(private readonly changeMap: Record<string, Change[]>) {}

    private isIncrementChange(clone: IClone): boolean {
        let changes: Change[];
        if (changes = this.changeMap[clone.duplicationA.sourceId]) {
            const change = changes.find(change => {
                const [start, end] = change;
                if (start <= clone.duplicationA.end.line && end >= clone.duplicationB.start.line) {
                    return true;
                }
            });
            if (change) {
                return true;
            }
        }
        if (changes = this.changeMap[clone.duplicationB.sourceId]) {
            const change = changes.find(change => {
                const [start, end] = change;
                if (start <= clone.duplicationB.end.line && end >= clone.duplicationB.start.line) {
                    return true;
                }
            });
            if (change) {
                console.log(change);
                return true;
            }
        }
        return false;
    }
    
    validate(clone: IClone, options: IOptions) {
        if (this.isIncrementChange(clone)) {
            return {
                status: true,
                message: [] as string[],
                clone: clone,
            }
        } else {
            return {
                status: false,
                message: ['This clone is all from previous commits'],
                clone: clone,
            }
        }
    }
}

export default IncrementValidator;