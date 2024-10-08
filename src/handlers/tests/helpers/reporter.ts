import {
	DisplayProcessor,
	SpecReporter,
	StacktraceOption,
} from 'jasmine-spec-reporter';
import SuiteInfo = jasmine.SuiteInfo;

class CustomProcessor extends DisplayProcessor {
	public displayJasmineStarted(info: SuiteInfo, log: string): string {
		console.log(info);
		return `TypeScript ${log}`;
	}
}

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
	new SpecReporter({
		spec: {
			displayStacktrace: StacktraceOption.NONE,
			displayPending: true,
		},
		customProcessors: [CustomProcessor],
	})
);
