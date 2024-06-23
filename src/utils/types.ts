import { IClone, IStatistic } from "@jscpd/core";
import { Entry } from "fast-glob";

export interface EntryWithContent extends Entry {
	content: string;
}

export interface IHook {
	process(clones: IClone[]): Promise<IClone[]>;
}

export interface IReporter {
	report(clones: IClone[], statistic: IStatistic | undefined): void;
}

