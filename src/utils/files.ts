import { IOptions } from "@jscpd/core";
import { Entry, sync } from "fast-glob";
import { lstatSync, readFileSync, realpathSync, Stats } from "fs";
import { EntryWithContent } from "./types";
import { getFormatByFile } from "@jscpd/tokenizer";
import { entry } from "../../webpack.config";

export function getFilesToDetect(options: IOptions): EntryWithContent[] {
    function isFile(path: string): boolean {
        try {
            const stat: Stats = lstatSync(path);
            return stat.isFile();
        } catch (e) {
            // lstatSync throws an error if path doesn't exist
            return false;
        }
    }

    function skipNotSupportedFormats(options: IOptions): (entry: Entry) => boolean {
        return (entry: Entry): boolean => {
            const { path } = entry;
            const format: string | undefined = getFormatByFile(path, options.formatsExts);
            const shouldNotSkip = !!(format && options.format && options.format.includes(format));
            if ((options.debug || options.verbose) && !shouldNotSkip) {
                console.log(`File ${path} skipped! Format "${format}" does not included to supported formats.`);
            }
            return shouldNotSkip;
        }
    }

    const pattern = options.pattern || '**/*';
    let patterns = options.path;

    patterns = patterns !== undefined ? patterns.map((path: string) => {
        const currentPath = realpathSync(path);

        if (isFile(currentPath)) {
            return path;
        }

        return path.endsWith('/') ? `${path}${pattern}` : `${path}/${pattern}`;
    }) : [];

    const files = sync(
        patterns,
        {
            ignore: options.ignore,
            onlyFiles: true,
            dot: true,
            stats: true,
            absolute: options.absolute,
            followSymbolicLinks: !options.noSymlinks,
        },
    )
        .filter(skipNotSupportedFormats(options))
        .map((entry: Entry) => {
            const { path } = entry;
            const content = readFileSync(path).toString();
            return { ...entry, content }
        });

    return files;
}