import {
    IClone,
    IMapFrame,
    IOptions,
    IStore,
    MemoryStore,
    Statistic,
} from '@jscpd/core';
import { getDiffRes, getFilesToDetect, IncrementValidator } from './utils';
import { createHash } from 'crypto';
import { Tokenizer } from '@jscpd/tokenizer';
import { InFilesIncrementDetector } from './utils/InFilesIncrementDetector';

(async () => {
    const diffRes = await getDiffRes('feature/test1', 'feature/test');
    console.log(diffRes);

    const options: IOptions = {
        path: ['.'],
        format: ['c', 'python', 'markdown'],
    }

    const files = getFilesToDetect(options);
    const hashFunction = (value: string): string => {
        return createHash('md5').update(value).digest('hex')
    }
    options.hashFunction = options.hashFunction || hashFunction;
    const currentStore: IStore<IMapFrame> = new MemoryStore<IMapFrame>();
    const statistic = new Statistic();
    const tokenizer = new Tokenizer();
    const validators = [new IncrementValidator(diffRes)];
    const detector = new InFilesIncrementDetector(
        tokenizer,
        currentStore,
        statistic,
        options,
        validators,
    );

    const clones = await detector.detect(files);
})();