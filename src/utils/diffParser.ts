import { exec } from "child_process";

export type Path = string;

export type Change = [
    lineStart: number,
    lineEnd: number,
];

export const parseDiffRes = (diffData: string) => {
    let path: Path;
    let changeList: Array<Change> = [];
    let diffRes: Record<Path, Array<Change>> = {};

    diffData.split(/[(\r\n)\r\n]+/).forEach(line => {
        if (line[0] && line[0] !== '/') {
            const [lineNum, lineCnt] = line.trim().split(',').map(_ => parseInt(_));
            if (lineCnt) {
                changeList.push([lineNum, lineNum + lineCnt - 1]);
            } else if (lineCnt === undefined) {
                changeList.push([lineNum, lineNum]);
            }
        } else {
            path && (diffRes[path.substring(1)] = changeList);
            path = line;
            changeList = [];
        }
    });

    return diffRes;
}

export const getDiffRes = async (targetBranch: string, baseBranch: string = 'master'): Promise<Record<string, Change[]>> => {
    return new Promise((res, rej) => {
        const cmd = `git diff ${baseBranch} ${targetBranch} --unified=0 |` +
            `grep -v -e '^[+-]' -e '^index' -e '^new file' -e '^deleted'|` +
            String.raw`sed 's/diff --git a.* b\//\//g; s/.*@@\(.*\)@@.*/\1/g; s/^ -.* +//g;'`

        exec(cmd, (error, stdout) => {
            if (error) {
                rej(error);
            } else {
                res(parseDiffRes(stdout));
            }
        });
    });
}
