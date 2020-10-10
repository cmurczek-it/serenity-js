import 'mocha';

import { EventStreamEmitter, expect } from '@integration/testing-tools';
import { Actor, Cast, Clock, Duration, Stage, StageManager } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { ConsoleReporter } from '../../../../src';
import { Printer } from '../../../../src/stage/crew/console-reporter/Printer';
import { ThemeForMonochromaticTerminals } from '../../../../src/stage/crew/console-reporter/themes';

/** @test {ConsoleReporter} */
describe('ConsoleReporter', () => {

    let stdout: FakeWritableStream,
        reporter: ConsoleReporter,
        stage: Stage,
        emitter: EventStreamEmitter;

    beforeEach(() => {
        stdout = new FakeWritableStream();

        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()));
        emitter = new EventStreamEmitter(stage);

        reporter = new ConsoleReporter(
            new Printer(stdout as unknown as NodeJS.WritableStream),
            new ThemeForMonochromaticTerminals(),
        );

        stage.assign(reporter);
    });

    describe('when instantiated', () => {

        it(`complains when not given a printer`, () => {
            expect(() => new ConsoleReporter(null, new ThemeForMonochromaticTerminals()))
                .to.throw(Error, 'printer should be defined');
        });

        it(`complains when not given a theme`, () => {
            expect(() => new ConsoleReporter(new Printer(), null))
                .to.throw(Error, 'theme should be defined');
        });
    });

    describe('when the scenario passes', () => {

        /** @test {ConsoleReporter} */
        it('prints the passing steps and the scenario summary', () => emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-13T23:50:41.568Z","details":{"category":"Reporting","location":{"column":3,"line":9,"path":"features/reporting.feature"},"name":"The one that passes"}}}
            {"type":"TestRunnerDetected","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-13T23:50:41.569Z","value":"Cucumber"}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"Reporting","type":"feature"},"timestamp":"2019-11-13T23:50:41.569Z","value":{"category":"Reporting","location":{"column":3,"line":9,"path":"features/reporting.feature"},"name":"The one that passes"}}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"wip","type":"tag"},"timestamp":"2019-11-13T23:50:41.569Z","value":{"category":"Reporting","location":{"column":3,"line":9,"path":"features/reporting.feature"},"name":"The one that passes"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2xxtnsb0000wx6ubyfcqy3x","timestamp":"2019-11-13T23:50:41.579Z","details":{"name":"Given a step that passes"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2xxtnsf0001wx6u26b1wx3m","outcome":{"code":64},"timestamp":"2019-11-13T23:50:41.583Z","details":{"name":"Given a step that passes"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2xxtnsh0002wx6ugv1yegbc","timestamp":"2019-11-13T23:50:41.585Z","details":{"name":"And another step that passes"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2xxtnsi0003wx6u6l0mg47s","outcome":{"code":64},"timestamp":"2019-11-13T23:50:41.586Z","details":{"name":"And another step that passes"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":64},"timestamp":"2019-11-13T23:50:41.600Z","details":{"category":"Reporting","location":{"column":3,"line":9,"path":"features/reporting.feature"},"name":"The one that passes"}}}
            {"type":"ArtifactGenerated","event":{"artifact":{"type":"TestReport","base64EncodedValue":"eyJuYW1lIjoiVGhlIG9uZSB0aGF0IHBhc3NlcyIsInRpdGxlIjoiVGhlIG9uZSB0aGF0IHBhc3NlcyIsImlkIjoicmVwb3J0aW5nO3RoZS1vbmUtdGhhdC1wYXNzZXMiLCJtYW51YWwiOmZhbHNlLCJ0ZXN0U3RlcHMiOlt7Im51bWJlciI6MSwiZGVzY3JpcHRpb24iOiJHaXZlbiBhIHN0ZXAgdGhhdCBwYXNzZXMiLCJzdGFydFRpbWUiOjE1NzM2ODkwNDE1NzksImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU1VDQ0VTUyIsImR1cmF0aW9uIjo0fSx7Im51bWJlciI6MiwiZGVzY3JpcHRpb24iOiJBbmQgYW5vdGhlciBzdGVwIHRoYXQgcGFzc2VzIiwic3RhcnRUaW1lIjoxNTczNjg5MDQxNTg1LCJjaGlsZHJlbiI6W10sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IlNVQ0NFU1MiLCJkdXJhdGlvbiI6MX1dLCJ1c2VyU3RvcnkiOnsiaWQiOiJyZXBvcnRpbmciLCJzdG9yeU5hbWUiOiJSZXBvcnRpbmciLCJwYXRoIjoiZmVhdHVyZXMvcmVwb3J0aW5nLmZlYXR1cmUiLCJ0eXBlIjoiZmVhdHVyZSJ9LCJzdGFydFRpbWUiOjE1NzM2ODkwNDE1NjgsInRlc3RTb3VyY2UiOiJDdWN1bWJlciIsInRhZ3MiOlt7Im5hbWUiOiJSZXBvcnRpbmciLCJ0eXBlIjoiZmVhdHVyZSJ9LHsibmFtZSI6IndpcCIsInR5cGUiOiJ0YWcifV0sImZlYXR1cmVUYWciOnsibmFtZSI6IlJlcG9ydGluZyIsInR5cGUiOiJmZWF0dXJlIn0sImR1cmF0aW9uIjozMiwicmVzdWx0IjoiU1VDQ0VTUyJ9"},"name":"The one that passes","timestamp":"2019-11-13T23:50:41.604Z"}}
            {"type":"TestRunFinished","event":"2019-11-13T23:50:41.602Z"}
            {"type":"ArtifactArchived","event":{"name":"The one that passes","type":"TestReport","path":"scenario-the-one-that-passes-0c74d8196f.json","timestamp":"2019-11-13T23:50:41.611Z"}}
        `).then(() => {
            expect(stdout.buffer).to.equal(trimmed `
                | --------------------------------------------------------------------------------
                | features/reporting.feature:9
                |
                | Reporting: The one that passes
                |
                |   Given a step that passes
                |   And another step that passes
                |
                | ✓ Execution successful (32ms)
                | ================================================================================
                | Execution Summary
                |
                | Reporting:  1 successful, 1 total (32ms)
                |
                | Total time: 32ms
                | Scenarios:  1
                | ================================================================================
            `);
        }));
    });

    describe('when the scenario fails with an error', () => {

        /** @test {ConsoleReporter} */
        it('prints the error message next to the step that has failed, and a full stack trace at the bottom', () => emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-13T23:59:38.642Z","details":{"category":"Reporting","location":{"column":3,"line":14,"path":"features/reporting.feature"},"name":"The one that times out"}}}
            {"type":"TestRunnerDetected","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-13T23:59:38.642Z","value":"Cucumber"}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"Reporting","type":"feature"},"timestamp":"2019-11-13T23:59:38.642Z","value":{"category":"Reporting","location":{"column":3,"line":14,"path":"features/reporting.feature"},"name":"The one that times out"}}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"wip","type":"tag"},"timestamp":"2019-11-13T23:59:38.642Z","value":{"category":"Reporting","location":{"column":3,"line":14,"path":"features/reporting.feature"},"name":"The one that times out"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2xy566v0000dd6u19y2orgh","timestamp":"2019-11-13T23:59:38.648Z","details":{"name":"Given a step that times out"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2xy569y0001dd6uj7acnq06","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 100 milliseconds\\\\n    at Timeout._time.default.setTimeout [as _onTimeout] (/Users/jan/Projects/serenity-js/node_modules/cucumber/lib/user_code_runner.js:76:18)\\\\n    at ontimeout (timers.js:436:11)\\\\n    at tryOnTimeout (timers.js:300:5)\\\\n    at listOnTimeout (timers.js:263:5)\\\\n    at Timer.processTimers (timers.js:223:10)\\",\\"message\\":\\"function timed out, ensure the promise resolves within 100 milliseconds\\"}"},"timestamp":"2019-11-13T23:59:38.758Z","details":{"name":"Given a step that times out"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":2,"error":"{\\"name\\":\\"Error\\",\\"stack\\":\\"Error: function timed out, ensure the promise resolves within 100 milliseconds\\\\n    at Timeout._time.default.setTimeout [as _onTimeout] (/Users/jan/Projects/serenity-js/node_modules/cucumber/lib/user_code_runner.js:76:18)\\\\n    at ontimeout (timers.js:436:11)\\\\n    at tryOnTimeout (timers.js:300:5)\\\\n    at listOnTimeout (timers.js:263:5)\\\\n    at Timer.processTimers (timers.js:223:10)\\",\\"message\\":\\"function timed out, ensure the promise resolves within 100 milliseconds\\"}"},"timestamp":"2019-11-13T23:59:38.774Z","details":{"category":"Reporting","location":{"column":3,"line":14,"path":"features/reporting.feature"},"name":"The one that times out"}}}
            {"type":"ArtifactGenerated","event":{"artifact":{"type":"TestReport","base64EncodedValue":"eyJuYW1lIjoiVGhlIG9uZSB0aGF0IHRpbWVzIG91dCIsInRpdGxlIjoiVGhlIG9uZSB0aGF0IHRpbWVzIG91dCIsImlkIjoicmVwb3J0aW5nO3RoZS1vbmUtdGhhdC10aW1lcy1vdXQiLCJtYW51YWwiOmZhbHNlLCJ0ZXN0U3RlcHMiOlt7Im51bWJlciI6MSwiZGVzY3JpcHRpb24iOiJHaXZlbiBhIHN0ZXAgdGhhdCB0aW1lcyBvdXQiLCJzdGFydFRpbWUiOjE1NzM2ODk1Nzg2NDgsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiRVJST1IiLCJkdXJhdGlvbiI6MTEwLCJleGNlcHRpb24iOnsiZXJyb3JUeXBlIjoiRXJyb3IiLCJtZXNzYWdlIjoiZnVuY3Rpb24gdGltZWQgb3V0LCBlbnN1cmUgdGhlIHByb21pc2UgcmVzb2x2ZXMgd2l0aGluIDEwMCBtaWxsaXNlY29uZHMiLCJzdGFja1RyYWNlIjpbeyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJUaW1lb3V0Ll90aW1lLmRlZmF1bHQuc2V0VGltZW91dCBbYXMgX29uVGltZW91dF0oKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvY3VjdW1iZXIvbGliL3VzZXJfY29kZV9ydW5uZXIuanMiLCJsaW5lTnVtYmVyIjo3Nn0seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJvbnRpbWVvdXQoKSIsImZpbGVOYW1lIjoidGltZXJzLmpzIiwibGluZU51bWJlciI6NDM2fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6InRyeU9uVGltZW91dCgpIiwiZmlsZU5hbWUiOiJ0aW1lcnMuanMiLCJsaW5lTnVtYmVyIjozMDB9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoibGlzdE9uVGltZW91dCgpIiwiZmlsZU5hbWUiOiJ0aW1lcnMuanMiLCJsaW5lTnVtYmVyIjoyNjN9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiVGltZXIucHJvY2Vzc1RpbWVycygpIiwiZmlsZU5hbWUiOiJ0aW1lcnMuanMiLCJsaW5lTnVtYmVyIjoyMjN9XX19XSwidXNlclN0b3J5Ijp7ImlkIjoicmVwb3J0aW5nIiwic3RvcnlOYW1lIjoiUmVwb3J0aW5nIiwicGF0aCI6ImZlYXR1cmVzL3JlcG9ydGluZy5mZWF0dXJlIiwidHlwZSI6ImZlYXR1cmUifSwic3RhcnRUaW1lIjoxNTczNjg5NTc4NjQyLCJ0ZXN0U291cmNlIjoiQ3VjdW1iZXIiLCJ0YWdzIjpbeyJuYW1lIjoiUmVwb3J0aW5nIiwidHlwZSI6ImZlYXR1cmUifSx7Im5hbWUiOiJ3aXAiLCJ0eXBlIjoidGFnIn1dLCJmZWF0dXJlVGFnIjp7Im5hbWUiOiJSZXBvcnRpbmciLCJ0eXBlIjoiZmVhdHVyZSJ9LCJkdXJhdGlvbiI6MTMyLCJyZXN1bHQiOiJFUlJPUiIsInRlc3RGYWlsdXJlQ2F1c2UiOnsiZXJyb3JUeXBlIjoiRXJyb3IiLCJtZXNzYWdlIjoiZnVuY3Rpb24gdGltZWQgb3V0LCBlbnN1cmUgdGhlIHByb21pc2UgcmVzb2x2ZXMgd2l0aGluIDEwMCBtaWxsaXNlY29uZHMiLCJzdGFja1RyYWNlIjpbeyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJUaW1lb3V0Ll90aW1lLmRlZmF1bHQuc2V0VGltZW91dCBbYXMgX29uVGltZW91dF0oKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvY3VjdW1iZXIvbGliL3VzZXJfY29kZV9ydW5uZXIuanMiLCJsaW5lTnVtYmVyIjo3Nn0seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJvbnRpbWVvdXQoKSIsImZpbGVOYW1lIjoidGltZXJzLmpzIiwibGluZU51bWJlciI6NDM2fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6InRyeU9uVGltZW91dCgpIiwiZmlsZU5hbWUiOiJ0aW1lcnMuanMiLCJsaW5lTnVtYmVyIjozMDB9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoibGlzdE9uVGltZW91dCgpIiwiZmlsZU5hbWUiOiJ0aW1lcnMuanMiLCJsaW5lTnVtYmVyIjoyNjN9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiVGltZXIucHJvY2Vzc1RpbWVycygpIiwiZmlsZU5hbWUiOiJ0aW1lcnMuanMiLCJsaW5lTnVtYmVyIjoyMjN9XX19"},"name":"The one that times out","timestamp":"2019-11-13T23:59:38.778Z"}}
            {"type":"TestRunFinished","event":"2019-11-13T23:59:38.777Z"}
            {"type":"ArtifactArchived","event":{"name":"The one that times out","type":"TestReport","path":"scenario-the-one-that-times-out-cd6e130961.json","timestamp":"2019-11-13T23:59:38.783Z"}}
        `).then(() => {
            expect(stdout.buffer).to.equal(trimmed `
                | --------------------------------------------------------------------------------
                | features/reporting.feature:14
                |
                | Reporting: The one that times out
                |
                |   Given a step that times out
                |     ✗ Error: function timed out, ensure the promise resolves within 100 milliseconds
                |
                | ✗ Execution failed with error (132ms)
                |
                |   Error: function timed out, ensure the promise resolves within 100 milliseconds
                |       at Timeout._time.default.setTimeout [as _onTimeout] (/Users/jan/Projects/serenity-js/node_modules/cucumber/lib/user_code_runner.js:76:18)
                |       at ontimeout (timers.js:436:11)
                |       at tryOnTimeout (timers.js:300:5)
                |       at listOnTimeout (timers.js:263:5)
                |       at Timer.processTimers (timers.js:223:10)
                | ================================================================================
                | Execution Summary
                |
                | Reporting:  1 broken, 1 total (132ms)
                |
                | Total time: 132ms
                | Scenarios:  1
                | ================================================================================
            `);
        }));

        /** @test {ConsoleReporter} */
        it('prints any steps that were skipped as a result of the failure', () => emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-14T00:09:59.914Z","details":{"category":"Reporting","location":{"column":3,"line":18,"path":"features/reporting.feature"},"name":"The one with skipped steps"}}}
            {"type":"TestRunnerDetected","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-14T00:09:59.914Z","value":"Cucumber"}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"Reporting","type":"feature"},"timestamp":"2019-11-14T00:09:59.915Z","value":{"category":"Reporting","location":{"column":3,"line":18,"path":"features/reporting.feature"},"name":"The one with skipped steps"}}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"wip","type":"tag"},"timestamp":"2019-11-14T00:09:59.915Z","value":{"category":"Reporting","location":{"column":3,"line":18,"path":"features/reporting.feature"},"name":"The one with skipped steps"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2xyihkg0000x86u5hhg4v1i","timestamp":"2019-11-14T00:09:59.920Z","details":{"name":"Given step marked as pending"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2xyihkj0001x86ub4fifc1e","outcome":{"code":8,"error":"{\\"name\\":\\"ImplementationPendingError\\",\\"stack\\":\\"ImplementationPendingError: Step not implemented\\\\n    at CucumberEventProtocolAdapter.outcomeFrom (/Users/jan/Projects/serenity-js/packages/cucumber/src/listeners/CucumberEventProtocolAdapter.ts:179:54)\\\\n    at EventEmitter.<anonymous> (/Users/jan/Projects/serenity-js/packages/cucumber/src/listeners/CucumberEventProtocolAdapter.ts:140:54)\\\\n    at EventEmitter.emit (events.js:203:15)\\",\\"message\\":\\"Step not implemented\\"}"},"timestamp":"2019-11-14T00:09:59.923Z","details":{"name":"Given step marked as pending"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2xyihkm0002x86uxb6imypk","timestamp":"2019-11-14T00:09:59.926Z","details":{"name":"And a step that passes"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2xyihkm0003x86uzfy3yd50","outcome":{"code":32},"timestamp":"2019-11-14T00:09:59.926Z","details":{"name":"And a step that passes"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2xyihkn0004x86uhae8vjo9","timestamp":"2019-11-14T00:09:59.927Z","details":{"name":"And another step that passes"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2xyihkn0005x86uky06tl7d","outcome":{"code":32},"timestamp":"2019-11-14T00:09:59.927Z","details":{"name":"And another step that passes"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":8,"error":"{\\"name\\":\\"ImplementationPendingError\\",\\"stack\\":\\"ImplementationPendingError: Step not implemented\\\\n    at CucumberEventProtocolAdapter.outcomeFrom (/Users/jan/Projects/serenity-js/packages/cucumber/src/listeners/CucumberEventProtocolAdapter.ts:179:54)\\\\n    at EventEmitter.<anonymous> (/Users/jan/Projects/serenity-js/packages/cucumber/src/listeners/CucumberEventProtocolAdapter.ts:155:28)\\\\n    at EventEmitter.emit (events.js:203:15)\\",\\"message\\":\\"Step not implemented\\"}"},"timestamp":"2019-11-14T00:09:59.942Z","details":{"category":"Reporting","location":{"column":3,"line":18,"path":"features/reporting.feature"},"name":"The one with skipped steps"}}}
            {"type":"ArtifactGenerated","event":{"artifact":{"type":"TestReport","base64EncodedValue":"eyJuYW1lIjoiVGhlIG9uZSB3aXRoIHNraXBwZWQgc3RlcHMiLCJ0aXRsZSI6IlRoZSBvbmUgd2l0aCBza2lwcGVkIHN0ZXBzIiwiaWQiOiJyZXBvcnRpbmc7dGhlLW9uZS13aXRoLXNraXBwZWQtc3RlcHMiLCJtYW51YWwiOmZhbHNlLCJ0ZXN0U3RlcHMiOlt7Im51bWJlciI6MSwiZGVzY3JpcHRpb24iOiJHaXZlbiBzdGVwIG1hcmtlZCBhcyBwZW5kaW5nIiwic3RhcnRUaW1lIjoxNTczNjkwMTk5OTIwLCJjaGlsZHJlbiI6W10sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IlBFTkRJTkciLCJkdXJhdGlvbiI6M30seyJudW1iZXIiOjIsImRlc2NyaXB0aW9uIjoiQW5kIGEgc3RlcCB0aGF0IHBhc3NlcyIsInN0YXJ0VGltZSI6MTU3MzY5MDE5OTkyNiwiY2hpbGRyZW4iOltdLCJyZXBvcnREYXRhIjpbXSwic2NyZWVuc2hvdHMiOltdLCJyZXN1bHQiOiJTS0lQUEVEIiwiZHVyYXRpb24iOjB9LHsibnVtYmVyIjozLCJkZXNjcmlwdGlvbiI6IkFuZCBhbm90aGVyIHN0ZXAgdGhhdCBwYXNzZXMiLCJzdGFydFRpbWUiOjE1NzM2OTAxOTk5MjcsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU0tJUFBFRCIsImR1cmF0aW9uIjowfV0sInVzZXJTdG9yeSI6eyJpZCI6InJlcG9ydGluZyIsInN0b3J5TmFtZSI6IlJlcG9ydGluZyIsInBhdGgiOiJmZWF0dXJlcy9yZXBvcnRpbmcuZmVhdHVyZSIsInR5cGUiOiJmZWF0dXJlIn0sInN0YXJ0VGltZSI6MTU3MzY5MDE5OTkxNCwidGVzdFNvdXJjZSI6IkN1Y3VtYmVyIiwidGFncyI6W3sibmFtZSI6IlJlcG9ydGluZyIsInR5cGUiOiJmZWF0dXJlIn0seyJuYW1lIjoid2lwIiwidHlwZSI6InRhZyJ9XSwiZmVhdHVyZVRhZyI6eyJuYW1lIjoiUmVwb3J0aW5nIiwidHlwZSI6ImZlYXR1cmUifSwiZHVyYXRpb24iOjI4LCJyZXN1bHQiOiJQRU5ESU5HIn0="},"name":"The one with skipped steps","timestamp":"2019-11-14T00:09:59.946Z"}}
            {"type":"TestRunFinished","event":"2019-11-14T00:09:59.945Z"}
            {"type":"ArtifactArchived","event":{"name":"The one with skipped steps","type":"TestReport","path":"scenario-the-one-with-skipped-steps-884c9d1482.json","timestamp":"2019-11-14T00:09:59.951Z"}}
        `).then(() => {
            expect(stdout.buffer).to.equal(trimmed `
                | --------------------------------------------------------------------------------
                | features/reporting.feature:18
                |
                | Reporting: The one with skipped steps
                |
                |   Given step marked as pending
                |     ☕ImplementationPendingError: Step not implemented
                |   ⇢ And a step that passes
                |   ⇢ And another step that passes
                |
                | ☕Implementation pending (28ms)
                |
                |   ImplementationPendingError: Step not implemented
                |       at CucumberEventProtocolAdapter.outcomeFrom (/Users/jan/Projects/serenity-js/packages/cucumber/src/listeners/CucumberEventProtocolAdapter.ts:179:54)
                |       at EventEmitter.<anonymous> (/Users/jan/Projects/serenity-js/packages/cucumber/src/listeners/CucumberEventProtocolAdapter.ts:155:28)
                |       at EventEmitter.emit (events.js:203:15)
                | ================================================================================
                | Execution Summary
                |
                | Reporting:  1 pending, 1 total (28ms)
                |
                | Total time: 28ms
                | Scenarios:  1
                | ================================================================================
            `);
        }));

        /** @test {ConsoleReporter} */
        it('prints the details of the failed assertion', () => emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-14T01:27:21.134Z","details":{"category":"Reporting","location":{"column":3,"line":24,"path":"features/reporting.feature"},"name":"The one with a failing assertion"}}}
            {"type":"TestRunnerDetected","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-14T01:27:21.134Z","value":"Cucumber"}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"Reporting","type":"feature"},"timestamp":"2019-11-14T01:27:21.134Z","value":{"category":"Reporting","location":{"column":3,"line":24,"path":"features/reporting.feature"},"name":"The one with a failing assertion"}}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"wip","type":"tag"},"timestamp":"2019-11-14T01:27:21.134Z","value":{"category":"Reporting","location":{"column":3,"line":24,"path":"features/reporting.feature"},"name":"The one with a failing assertion"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2y19yr70000hd6u9qquvkpr","timestamp":"2019-11-14T01:27:21.140Z","details":{"name":"Given a step that fails with an assertion error"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2y19yrb0001hd6ub6joksw8","timestamp":"2019-11-14T01:27:21.143Z","details":{"name":"Artemis ensures that list of numbers does equal a Promise"}}}
            {"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"ck2y19yrb0001hd6ub6joksw8","artifact":{"type":"AssertionReport","base64EncodedValue":"eyJleHBlY3RlZCI6IltcbiAgMSxcbiAgMlxuXSIsImFjdHVhbCI6IltcbiAgMSxcbiAgMixcbiAgM1xuXSJ9"},"name":"Assertion Report","timestamp":"2019-11-14T01:27:21.144Z"}}
            {"type":"InteractionFinished","event":{"activityId":"ck2y19yrb0001hd6ub6joksw8","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Expected list of numbers to equal a Promise\\\\n    at Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at Ensure.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:52:21)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Expected list of numbers to equal a Promise\\",\\"expected\\":[1,2],\\"actual\\":[1,2,3]}"},"timestamp":"2019-11-14T01:27:21.145Z","details":{"name":"Artemis ensures that list of numbers does equal a Promise"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2y19yri0003hd6utrdysnaq","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Expected list of numbers to equal a Promise\\\\n    at Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at Ensure.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:52:21)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Expected list of numbers to equal a Promise\\",\\"expected\\":[1,2],\\"actual\\":[1,2,3]}"},"timestamp":"2019-11-14T01:27:21.150Z","details":{"name":"Given a step that fails with an assertion error"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2y19yri0004hd6uezrh3spb","timestamp":"2019-11-14T01:27:21.150Z","details":{"name":"And a step that passes"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2y19yrj0005hd6uhri1iovg","outcome":{"code":32},"timestamp":"2019-11-14T01:27:21.151Z","details":{"name":"And a step that passes"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":4,"error":"{\\"name\\":\\"AssertionError\\",\\"stack\\":\\"AssertionError: Expected list of numbers to equal a Promise\\\\n    at Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at Ensure.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:52:21)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Expected list of numbers to equal a Promise\\",\\"expected\\":[1,2],\\"actual\\":[1,2,3]}"},"timestamp":"2019-11-14T01:27:21.166Z","details":{"category":"Reporting","location":{"column":3,"line":24,"path":"features/reporting.feature"},"name":"The one with a failing assertion"}}}
            {"type":"ArtifactGenerated","event":{"artifact":{"type":"TestReport","base64EncodedValue":"eyJuYW1lIjoiVGhlIG9uZSB3aXRoIGEgZmFpbGluZyBhc3NlcnRpb24iLCJ0aXRsZSI6IlRoZSBvbmUgd2l0aCBhIGZhaWxpbmcgYXNzZXJ0aW9uIiwiaWQiOiJyZXBvcnRpbmc7dGhlLW9uZS13aXRoLWEtZmFpbGluZy1hc3NlcnRpb24iLCJtYW51YWwiOmZhbHNlLCJ0ZXN0U3RlcHMiOlt7Im51bWJlciI6MSwiZGVzY3JpcHRpb24iOiJHaXZlbiBhIHN0ZXAgdGhhdCBmYWlscyB3aXRoIGFuIGFzc2VydGlvbiBlcnJvciIsInN0YXJ0VGltZSI6MTU3MzY5NDg0MTE0MCwiY2hpbGRyZW4iOlt7Im51bWJlciI6MiwiZGVzY3JpcHRpb24iOiJBcnRlbWlzIGVuc3VyZXMgdGhhdCBsaXN0IG9mIG51bWJlcnMgZG9lcyBlcXVhbCBhIFByb21pc2UiLCJzdGFydFRpbWUiOjE1NzM2OTQ4NDExNDMsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W3siaWQiOiJyZXBvcnQtZGF0YS1jazJ5MTl5cmMwMDAyaGQ2dWJxZGFtaHozIiwiaXNFdmlkZW5jZSI6ZmFsc2UsInBhdGgiOiIiLCJ0aXRsZSI6IkFzc2VydGlvbiBSZXBvcnQiLCJjb250ZW50cyI6ImV4cGVjdGVkOiBbXG4gIDEsXG4gIDJcbl1cblxuYWN0dWFsOiBbXG4gIDEsXG4gIDIsXG4gIDNcbl0ifV0sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiRkFJTFVSRSIsImR1cmF0aW9uIjoyLCJleGNlcHRpb24iOnsiZXJyb3JUeXBlIjoiQXNzZXJ0aW9uRXJyb3IiLCJtZXNzYWdlIjoiRXhwZWN0ZWQgbGlzdCBvZiBudW1iZXJzIHRvIGVxdWFsIGEgUHJvbWlzZSIsInN0YWNrVHJhY2UiOlt7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6IkVuc3VyZS5hc0Fzc2VydGlvbkVycm9yKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6NTZ9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlLmVycm9yRm9yT3V0Y29tZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjUyfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS50cmFuc2Zvcm1hdGlvbigpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjMzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS5NYXRjaGVyUnVsZS5leGVjdXRlKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvbm9kZV9tb2R1bGVzL3RpbnktdHlwZXMvc3JjL3BhdHRlcm4tbWF0Y2hpbmcvcnVsZXMvTWF0Y2hlclJ1bGUudHMiLCJsaW5lTnVtYmVyIjoxM30seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJPYmplY3RNYXRjaGVyLlBhdHRlcm5NYXRjaGVyLmVsc2UoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9QYXR0ZXJuTWF0Y2hlci50cyIsImxpbmVOdW1iZXIiOjE3fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6InVuZGVmaW5lZCgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjM2fV19fV0sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IkZBSUxVUkUiLCJkdXJhdGlvbiI6MTB9LHsibnVtYmVyIjozLCJkZXNjcmlwdGlvbiI6IkFuZCBhIHN0ZXAgdGhhdCBwYXNzZXMiLCJzdGFydFRpbWUiOjE1NzM2OTQ4NDExNTAsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU0tJUFBFRCIsImR1cmF0aW9uIjoxfV0sInVzZXJTdG9yeSI6eyJpZCI6InJlcG9ydGluZyIsInN0b3J5TmFtZSI6IlJlcG9ydGluZyIsInBhdGgiOiJmZWF0dXJlcy9yZXBvcnRpbmcuZmVhdHVyZSIsInR5cGUiOiJmZWF0dXJlIn0sInN0YXJ0VGltZSI6MTU3MzY5NDg0MTEzNCwidGVzdFNvdXJjZSI6IkN1Y3VtYmVyIiwidGFncyI6W3sibmFtZSI6IlJlcG9ydGluZyIsInR5cGUiOiJmZWF0dXJlIn0seyJuYW1lIjoid2lwIiwidHlwZSI6InRhZyJ9XSwiZmVhdHVyZVRhZyI6eyJuYW1lIjoiUmVwb3J0aW5nIiwidHlwZSI6ImZlYXR1cmUifSwiZHVyYXRpb24iOjMyLCJyZXN1bHQiOiJGQUlMVVJFIiwidGVzdEZhaWx1cmVDYXVzZSI6eyJlcnJvclR5cGUiOiJBc3NlcnRpb25FcnJvciIsIm1lc3NhZ2UiOiJFeHBlY3RlZCBsaXN0IG9mIG51bWJlcnMgdG8gZXF1YWwgYSBQcm9taXNlIiwic3RhY2tUcmFjZSI6W3siZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlLmFzQXNzZXJ0aW9uRXJyb3IoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9wYWNrYWdlcy9hc3NlcnRpb25zL3NyYy9FbnN1cmUudHMiLCJsaW5lTnVtYmVyIjo1Nn0seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJFbnN1cmUuZXJyb3JGb3JPdXRjb21lKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6NTJ9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiTWF0Y2hlc09iamVjdHNXaXRoQ29tbW9uUHJvdG90eXBlLnRyYW5zZm9ybWF0aW9uKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6MzN9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiTWF0Y2hlc09iamVjdHNXaXRoQ29tbW9uUHJvdG90eXBlLk1hdGNoZXJSdWxlLmV4ZWN1dGUoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9ydWxlcy9NYXRjaGVyUnVsZS50cyIsImxpbmVOdW1iZXIiOjEzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik9iamVjdE1hdGNoZXIuUGF0dGVybk1hdGNoZXIuZWxzZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL25vZGVfbW9kdWxlcy90aW55LXR5cGVzL3NyYy9wYXR0ZXJuLW1hdGNoaW5nL1BhdHRlcm5NYXRjaGVyLnRzIiwibGluZU51bWJlciI6MTd9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoidW5kZWZpbmVkKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6MzZ9XX19"},"name":"The one with a failing assertion","timestamp":"2019-11-14T01:27:21.169Z"}}
            {"type":"TestRunFinished","event":"2019-11-14T01:27:21.169Z"}
            {"type":"ArtifactArchived","event":{"name":"The one with a failing assertion","type":"TestReport","path":"scenario-the-one-with-a-failing-assertion-50a7e2cebd.json","timestamp":"2019-11-14T01:27:21.174Z"}}
        `).then(() => {
            expect(stdout.buffer).to.equal(trimmed `
                | --------------------------------------------------------------------------------
                | features/reporting.feature:24
                |
                | Reporting: The one with a failing assertion
                |
                |   Given a step that fails with an assertion error
                |     ✗ Artemis ensures that list of numbers does equal a Promise (2ms)
                |
                |       Difference (+ expected, - actual):
                |
                |         [
                |           1,
                |       -   2,
                |       -   3
                |       +   2
                |         ]
                |
                |   ⇢ And a step that passes
                |
                | ✗ Execution failed with assertion error (32ms)
                |
                |   AssertionError: Expected list of numbers to equal a Promise
                |       at Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)
                |       at Ensure.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:52:21)
                |       at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)
                |       at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)
                |       at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)
                |       at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26
                | ================================================================================
                | Execution Summary
                |
                | Reporting:  1 failed, 1 total (32ms)
                |
                | Total time: 32ms
                | Scenarios:  1
                | ================================================================================
            `);
        }));

        /** @test {ConsoleReporter} */
        it('pinpoints exactly where the failure happened', () => emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-14T23:27:24.800Z","details":{"category":"Reporting","location":{"column":3,"line":29,"path":"features/reporting.feature"},"name":"The one with error propagation"}}}
            {"type":"TestRunnerDetected","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-14T23:27:24.800Z","value":"Cucumber"}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"Reporting","type":"feature"},"timestamp":"2019-11-14T23:27:24.801Z","value":{"category":"Reporting","location":{"column":3,"line":29,"path":"features/reporting.feature"},"name":"The one with error propagation"}}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"wip","type":"tag"},"timestamp":"2019-11-14T23:27:24.801Z","value":{"category":"Reporting","location":{"column":3,"line":29,"path":"features/reporting.feature"},"name":"The one with error propagation"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2zcfkp60000fa6uauhx7b0c","timestamp":"2019-11-14T23:27:24.810Z","details":{"name":"Given a step that fails with an error compromising the test"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2zcfkpa0001fa6uusada8jg","timestamp":"2019-11-14T23:27:24.814Z","details":{"name":"Artemis sets up the test data"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2zcfkpa0002fa6u3bhkdnzq","timestamp":"2019-11-14T23:27:24.814Z","details":{"name":"Artemis connects to the database"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zcfkpb0003fa6u43q63m5z","timestamp":"2019-11-14T23:27:24.815Z","details":{"name":"Artemis ensures that the database server status does equal 'working'"}}}
            {"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"ck2zcfkpb0003fa6u43q63m5z","artifact":{"type":"AssertionReport","base64EncodedValue":"eyJleHBlY3RlZCI6Iid3b3JraW5nJyIsImFjdHVhbCI6Iidkb3duJyJ9"},"name":"Assertion Report","timestamp":"2019-11-14T23:27:24.816Z"}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zcfkpb0003fa6u43q63m5z","outcome":{"code":1,"error":"{\\"name\\":\\"TestCompromisedError\\",\\"stack\\":\\"TestCompromisedError: Database server is down\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:87:16)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\\\nCaused by: AssertionError: Expected the database server status to equal 'working'\\\\n    at EnsureOrFailWithCustomError.Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:85:37)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Database server is down\\",\\"cause\\":{\\"name\\":\\"AssertionError\\",\\"expected\\":\\"working\\",\\"actual\\":\\"down\\"}}"},"timestamp":"2019-11-14T23:27:24.822Z","details":{"name":"Artemis ensures that the database server status does equal 'working'"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2zcfkpa0002fa6u3bhkdnzq","outcome":{"code":1,"error":"{\\"name\\":\\"TestCompromisedError\\",\\"stack\\":\\"TestCompromisedError: Database server is down\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:87:16)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\\\nCaused by: AssertionError: Expected the database server status to equal 'working'\\\\n    at EnsureOrFailWithCustomError.Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:85:37)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Database server is down\\",\\"cause\\":{\\"name\\":\\"AssertionError\\",\\"expected\\":\\"working\\",\\"actual\\":\\"down\\"}}"},"timestamp":"2019-11-14T23:27:24.826Z","details":{"name":"Artemis connects to the database"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2zcfkpa0001fa6uusada8jg","outcome":{"code":1,"error":"{\\"name\\":\\"TestCompromisedError\\",\\"stack\\":\\"TestCompromisedError: Database server is down\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:87:16)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\\\nCaused by: AssertionError: Expected the database server status to equal 'working'\\\\n    at EnsureOrFailWithCustomError.Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:85:37)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Database server is down\\",\\"cause\\":{\\"name\\":\\"AssertionError\\",\\"expected\\":\\"working\\",\\"actual\\":\\"down\\"}}"},"timestamp":"2019-11-14T23:27:24.827Z","details":{"name":"Artemis sets up the test data"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2zcfkpr0005fa6u1ceh2z6k","outcome":{"code":1,"error":"{\\"name\\":\\"TestCompromisedError\\",\\"stack\\":\\"TestCompromisedError: Database server is down\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:87:16)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\\\nCaused by: AssertionError: Expected the database server status to equal 'working'\\\\n    at EnsureOrFailWithCustomError.Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:85:37)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Database server is down\\",\\"cause\\":{\\"name\\":\\"AssertionError\\",\\"expected\\":\\"working\\",\\"actual\\":\\"down\\"}}"},"timestamp":"2019-11-14T23:27:24.831Z","details":{"name":"Given a step that fails with an error compromising the test"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2zcfkps0006fa6u7qp3o1io","timestamp":"2019-11-14T23:27:24.832Z","details":{"name":"And a step that passes"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2zcfkpt0007fa6uer31d05y","outcome":{"code":32},"timestamp":"2019-11-14T23:27:24.833Z","details":{"name":"And a step that passes"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":1,"error":"{\\"name\\":\\"TestCompromisedError\\",\\"stack\\":\\"TestCompromisedError: Database server is down\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:87:16)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\\\nCaused by: AssertionError: Expected the database server status to equal 'working'\\\\n    at EnsureOrFailWithCustomError.Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)\\\\n    at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:85:37)\\\\n    at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)\\\\n    at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)\\\\n    at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)\\\\n    at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26\\",\\"message\\":\\"Database server is down\\",\\"cause\\":{\\"name\\":\\"AssertionError\\",\\"expected\\":\\"working\\",\\"actual\\":\\"down\\"}}"},"timestamp":"2019-11-14T23:27:24.849Z","details":{"category":"Reporting","location":{"column":3,"line":29,"path":"features/reporting.feature"},"name":"The one with error propagation"}}}
            {"type":"ArtifactGenerated","event":{"artifact":{"type":"TestReport","base64EncodedValue":"eyJuYW1lIjoiVGhlIG9uZSB3aXRoIGVycm9yIHByb3BhZ2F0aW9uIiwidGl0bGUiOiJUaGUgb25lIHdpdGggZXJyb3IgcHJvcGFnYXRpb24iLCJpZCI6InJlcG9ydGluZzt0aGUtb25lLXdpdGgtZXJyb3ItcHJvcGFnYXRpb24iLCJtYW51YWwiOmZhbHNlLCJ0ZXN0U3RlcHMiOlt7Im51bWJlciI6MSwiZGVzY3JpcHRpb24iOiJHaXZlbiBhIHN0ZXAgdGhhdCBmYWlscyB3aXRoIGFuIGVycm9yIGNvbXByb21pc2luZyB0aGUgdGVzdCIsInN0YXJ0VGltZSI6MTU3Mzc3NDA0NDgxMCwiY2hpbGRyZW4iOlt7Im51bWJlciI6MiwiZGVzY3JpcHRpb24iOiJBcnRlbWlzIHNldHMgdXAgdGhlIHRlc3QgZGF0YSIsInN0YXJ0VGltZSI6MTU3Mzc3NDA0NDgxNCwiY2hpbGRyZW4iOlt7Im51bWJlciI6MywiZGVzY3JpcHRpb24iOiJBcnRlbWlzIGNvbm5lY3RzIHRvIHRoZSBkYXRhYmFzZSIsInN0YXJ0VGltZSI6MTU3Mzc3NDA0NDgxNCwiY2hpbGRyZW4iOlt7Im51bWJlciI6NCwiZGVzY3JpcHRpb24iOiJBcnRlbWlzIGVuc3VyZXMgdGhhdCB0aGUgZGF0YWJhc2Ugc2VydmVyIHN0YXR1cyBkb2VzIGVxdWFsICd3b3JraW5nJyIsInN0YXJ0VGltZSI6MTU3Mzc3NDA0NDgxNSwiY2hpbGRyZW4iOltdLCJyZXBvcnREYXRhIjpbeyJpZCI6InJlcG9ydC1kYXRhLWNrMnpjZmtwZDAwMDRmYTZ1ZTBwbmoxZXAiLCJpc0V2aWRlbmNlIjpmYWxzZSwicGF0aCI6IiIsInRpdGxlIjoiQXNzZXJ0aW9uIFJlcG9ydCIsImNvbnRlbnRzIjoiZXhwZWN0ZWQ6ICd3b3JraW5nJ1xuXG5hY3R1YWw6ICdkb3duJyJ9XSwic2NyZWVuc2hvdHMiOltdLCJyZXN1bHQiOiJDT01QUk9NSVNFRCIsImR1cmF0aW9uIjo3LCJleGNlcHRpb24iOnsiZXJyb3JUeXBlIjoiVGVzdENvbXByb21pc2VkRXJyb3IiLCJtZXNzYWdlIjoiRGF0YWJhc2Ugc2VydmVyIGlzIGRvd24iLCJzdGFja1RyYWNlIjpbeyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJFbnN1cmVPckZhaWxXaXRoQ3VzdG9tRXJyb3IuZXJyb3JGb3JPdXRjb21lKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6ODd9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiTWF0Y2hlc09iamVjdHNXaXRoQ29tbW9uUHJvdG90eXBlLnRyYW5zZm9ybWF0aW9uKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6MzN9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiTWF0Y2hlc09iamVjdHNXaXRoQ29tbW9uUHJvdG90eXBlLk1hdGNoZXJSdWxlLmV4ZWN1dGUoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9ydWxlcy9NYXRjaGVyUnVsZS50cyIsImxpbmVOdW1iZXIiOjEzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik9iamVjdE1hdGNoZXIuUGF0dGVybk1hdGNoZXIuZWxzZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL25vZGVfbW9kdWxlcy90aW55LXR5cGVzL3NyYy9wYXR0ZXJuLW1hdGNoaW5nL1BhdHRlcm5NYXRjaGVyLnRzIiwibGluZU51bWJlciI6MTd9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoidW5kZWZpbmVkKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6MzZ9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlT3JGYWlsV2l0aEN1c3RvbUVycm9yLkVuc3VyZS5hc0Fzc2VydGlvbkVycm9yKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6NTZ9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlT3JGYWlsV2l0aEN1c3RvbUVycm9yLmVycm9yRm9yT3V0Y29tZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjg1fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS50cmFuc2Zvcm1hdGlvbigpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjMzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS5NYXRjaGVyUnVsZS5leGVjdXRlKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvbm9kZV9tb2R1bGVzL3RpbnktdHlwZXMvc3JjL3BhdHRlcm4tbWF0Y2hpbmcvcnVsZXMvTWF0Y2hlclJ1bGUudHMiLCJsaW5lTnVtYmVyIjoxM30seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJPYmplY3RNYXRjaGVyLlBhdHRlcm5NYXRjaGVyLmVsc2UoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9QYXR0ZXJuTWF0Y2hlci50cyIsImxpbmVOdW1iZXIiOjE3fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6InVuZGVmaW5lZCgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjM2fV0sInJvb3RDYXVzZSI6eyJlcnJvclR5cGUiOiJBc3NlcnRpb25FcnJvciIsIm1lc3NhZ2UiOiJFeHBlY3RlZCB0aGUgZGF0YWJhc2Ugc2VydmVyIHN0YXR1cyB0byBlcXVhbCAnd29ya2luZyciLCJzdGFja1RyYWNlIjpbeyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJFbnN1cmVPckZhaWxXaXRoQ3VzdG9tRXJyb3IuRW5zdXJlLmFzQXNzZXJ0aW9uRXJyb3IoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9wYWNrYWdlcy9hc3NlcnRpb25zL3NyYy9FbnN1cmUudHMiLCJsaW5lTnVtYmVyIjo1Nn0seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJFbnN1cmVPckZhaWxXaXRoQ3VzdG9tRXJyb3IuZXJyb3JGb3JPdXRjb21lKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6ODV9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiTWF0Y2hlc09iamVjdHNXaXRoQ29tbW9uUHJvdG90eXBlLnRyYW5zZm9ybWF0aW9uKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6MzN9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiTWF0Y2hlc09iamVjdHNXaXRoQ29tbW9uUHJvdG90eXBlLk1hdGNoZXJSdWxlLmV4ZWN1dGUoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9ydWxlcy9NYXRjaGVyUnVsZS50cyIsImxpbmVOdW1iZXIiOjEzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik9iamVjdE1hdGNoZXIuUGF0dGVybk1hdGNoZXIuZWxzZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL25vZGVfbW9kdWxlcy90aW55LXR5cGVzL3NyYy9wYXR0ZXJuLW1hdGNoaW5nL1BhdHRlcm5NYXRjaGVyLnRzIiwibGluZU51bWJlciI6MTd9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoidW5kZWZpbmVkKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6MzZ9XX19fV0sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IkNPTVBST01JU0VEIiwiZHVyYXRpb24iOjEyfV0sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IkNPTVBST01JU0VEIiwiZHVyYXRpb24iOjEzfV0sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IkNPTVBST01JU0VEIiwiZHVyYXRpb24iOjIxfSx7Im51bWJlciI6NSwiZGVzY3JpcHRpb24iOiJBbmQgYSBzdGVwIHRoYXQgcGFzc2VzIiwic3RhcnRUaW1lIjoxNTczNzc0MDQ0ODMyLCJjaGlsZHJlbiI6W10sInJlcG9ydERhdGEiOltdLCJzY3JlZW5zaG90cyI6W10sInJlc3VsdCI6IlNLSVBQRUQiLCJkdXJhdGlvbiI6MX1dLCJ1c2VyU3RvcnkiOnsiaWQiOiJyZXBvcnRpbmciLCJzdG9yeU5hbWUiOiJSZXBvcnRpbmciLCJwYXRoIjoiZmVhdHVyZXMvcmVwb3J0aW5nLmZlYXR1cmUiLCJ0eXBlIjoiZmVhdHVyZSJ9LCJzdGFydFRpbWUiOjE1NzM3NzQwNDQ4MDAsInRlc3RTb3VyY2UiOiJDdWN1bWJlciIsInRhZ3MiOlt7Im5hbWUiOiJSZXBvcnRpbmciLCJ0eXBlIjoiZmVhdHVyZSJ9LHsibmFtZSI6IndpcCIsInR5cGUiOiJ0YWcifV0sImZlYXR1cmVUYWciOnsibmFtZSI6IlJlcG9ydGluZyIsInR5cGUiOiJmZWF0dXJlIn0sImR1cmF0aW9uIjo0OSwicmVzdWx0IjoiQ09NUFJPTUlTRUQiLCJ0ZXN0RmFpbHVyZUNhdXNlIjp7ImVycm9yVHlwZSI6IlRlc3RDb21wcm9taXNlZEVycm9yIiwibWVzc2FnZSI6IkRhdGFiYXNlIHNlcnZlciBpcyBkb3duIiwic3RhY2tUcmFjZSI6W3siZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlT3JGYWlsV2l0aEN1c3RvbUVycm9yLmVycm9yRm9yT3V0Y29tZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjg3fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS50cmFuc2Zvcm1hdGlvbigpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjMzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS5NYXRjaGVyUnVsZS5leGVjdXRlKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvbm9kZV9tb2R1bGVzL3RpbnktdHlwZXMvc3JjL3BhdHRlcm4tbWF0Y2hpbmcvcnVsZXMvTWF0Y2hlclJ1bGUudHMiLCJsaW5lTnVtYmVyIjoxM30seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJPYmplY3RNYXRjaGVyLlBhdHRlcm5NYXRjaGVyLmVsc2UoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9QYXR0ZXJuTWF0Y2hlci50cyIsImxpbmVOdW1iZXIiOjE3fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6InVuZGVmaW5lZCgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjM2fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6IkVuc3VyZU9yRmFpbFdpdGhDdXN0b21FcnJvci5FbnN1cmUuYXNBc3NlcnRpb25FcnJvcigpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjU2fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6IkVuc3VyZU9yRmFpbFdpdGhDdXN0b21FcnJvci5lcnJvckZvck91dGNvbWUoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9wYWNrYWdlcy9hc3NlcnRpb25zL3NyYy9FbnN1cmUudHMiLCJsaW5lTnVtYmVyIjo4NX0seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJNYXRjaGVzT2JqZWN0c1dpdGhDb21tb25Qcm90b3R5cGUudHJhbnNmb3JtYXRpb24oKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9wYWNrYWdlcy9hc3NlcnRpb25zL3NyYy9FbnN1cmUudHMiLCJsaW5lTnVtYmVyIjozM30seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJNYXRjaGVzT2JqZWN0c1dpdGhDb21tb25Qcm90b3R5cGUuTWF0Y2hlclJ1bGUuZXhlY3V0ZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL25vZGVfbW9kdWxlcy90aW55LXR5cGVzL3NyYy9wYXR0ZXJuLW1hdGNoaW5nL3J1bGVzL01hdGNoZXJSdWxlLnRzIiwibGluZU51bWJlciI6MTN9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiT2JqZWN0TWF0Y2hlci5QYXR0ZXJuTWF0Y2hlci5lbHNlKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvbm9kZV9tb2R1bGVzL3RpbnktdHlwZXMvc3JjL3BhdHRlcm4tbWF0Y2hpbmcvUGF0dGVybk1hdGNoZXIudHMiLCJsaW5lTnVtYmVyIjoxN30seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJ1bmRlZmluZWQoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9wYWNrYWdlcy9hc3NlcnRpb25zL3NyYy9FbnN1cmUudHMiLCJsaW5lTnVtYmVyIjozNn1dLCJyb290Q2F1c2UiOnsiZXJyb3JUeXBlIjoiQXNzZXJ0aW9uRXJyb3IiLCJtZXNzYWdlIjoiRXhwZWN0ZWQgdGhlIGRhdGFiYXNlIHNlcnZlciBzdGF0dXMgdG8gZXF1YWwgJ3dvcmtpbmcnIiwic3RhY2tUcmFjZSI6W3siZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlT3JGYWlsV2l0aEN1c3RvbUVycm9yLkVuc3VyZS5hc0Fzc2VydGlvbkVycm9yKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvcGFja2FnZXMvYXNzZXJ0aW9ucy9zcmMvRW5zdXJlLnRzIiwibGluZU51bWJlciI6NTZ9LHsiZGVjbGFyaW5nQ2xhc3MiOiIiLCJtZXRob2ROYW1lIjoiRW5zdXJlT3JGYWlsV2l0aEN1c3RvbUVycm9yLmVycm9yRm9yT3V0Y29tZSgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjg1fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS50cmFuc2Zvcm1hdGlvbigpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjMzfSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6Ik1hdGNoZXNPYmplY3RzV2l0aENvbW1vblByb3RvdHlwZS5NYXRjaGVyUnVsZS5leGVjdXRlKCkiLCJmaWxlTmFtZSI6Ii9Vc2Vycy9qYW4vUHJvamVjdHMvc2VyZW5pdHktanMvbm9kZV9tb2R1bGVzL3RpbnktdHlwZXMvc3JjL3BhdHRlcm4tbWF0Y2hpbmcvcnVsZXMvTWF0Y2hlclJ1bGUudHMiLCJsaW5lTnVtYmVyIjoxM30seyJkZWNsYXJpbmdDbGFzcyI6IiIsIm1ldGhvZE5hbWUiOiJPYmplY3RNYXRjaGVyLlBhdHRlcm5NYXRjaGVyLmVsc2UoKSIsImZpbGVOYW1lIjoiL1VzZXJzL2phbi9Qcm9qZWN0cy9zZXJlbml0eS1qcy9ub2RlX21vZHVsZXMvdGlueS10eXBlcy9zcmMvcGF0dGVybi1tYXRjaGluZy9QYXR0ZXJuTWF0Y2hlci50cyIsImxpbmVOdW1iZXIiOjE3fSx7ImRlY2xhcmluZ0NsYXNzIjoiIiwibWV0aG9kTmFtZSI6InVuZGVmaW5lZCgpIiwiZmlsZU5hbWUiOiIvVXNlcnMvamFuL1Byb2plY3RzL3NlcmVuaXR5LWpzL3BhY2thZ2VzL2Fzc2VydGlvbnMvc3JjL0Vuc3VyZS50cyIsImxpbmVOdW1iZXIiOjM2fV19fX0="},"name":"The one with error propagation","timestamp":"2019-11-14T23:27:24.852Z"}}
            {"type":"TestRunFinished","event":"2019-11-14T23:27:24.851Z"}
            {"type":"ArtifactArchived","event":{"name":"The one with error propagation","type":"TestReport","path":"scenario-the-one-with-error-propagation-f22a55694f.json","timestamp":"2019-11-14T23:27:24.858Z"}}
        `).then(() => {
            expect(stdout.buffer).to.equal(trimmed `
                | --------------------------------------------------------------------------------
                | features/reporting.feature:29
                |
                | Reporting: The one with error propagation
                |
                |   Given a step that fails with an error compromising the test
                |     Artemis sets up the test data
                |       Artemis connects to the database
                |         ✗ Artemis ensures that the database server status does equal 'working' (7ms)
                |           TestCompromisedError: Database server is down
                |
                |           Difference (+ expected, - actual):
                |
                |           - 'down'
                |           + 'working'
                |
                |   ⇢ And a step that passes
                |
                | ✗ Execution compromised (49ms)
                |
                |   TestCompromisedError: Database server is down
                |       at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:87:16)
                |       at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)
                |       at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)
                |       at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)
                |       at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26
                |   Caused by: AssertionError: Expected the database server status to equal 'working'
                |       at EnsureOrFailWithCustomError.Ensure.asAssertionError (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:56:16)
                |       at EnsureOrFailWithCustomError.errorForOutcome (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:85:37)
                |       at MatchesObjectsWithCommonPrototype.transformation (/Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:33:36)
                |       at MatchesObjectsWithCommonPrototype.MatcherRule.execute (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/rules/MatcherRule.ts:13:21)
                |       at ObjectMatcher.PatternMatcher.else (/Users/jan/Projects/serenity-js/node_modules/tiny-types/src/pattern-matching/PatternMatcher.ts:17:71)
                |       at /Users/jan/Projects/serenity-js/packages/assertions/src/Ensure.ts:36:26
                | ================================================================================
                | Execution Summary
                |
                | Reporting:  1 compromised, 1 total (49ms)
                |
                | Total time: 49ms
                | Scenarios:  1
                | ================================================================================
            `);
        }));
    });

    describe('when the developer logs arbitrary data', () => {

        /** @test {ConsoleReporter} */
        it(`prints it together with an appropriate name for each entry (if different from the content itself)`, () => emitter.emit(`
            {"type":"SceneStarts","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-15T01:05:12.366Z","details":{"category":"Calculations API","location":{"column":3,"line":17,"path":"features/api/calculations.feature"},"name":"Calculates result of an expression"}}}
            {"type":"TestRunnerDetected","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","timestamp":"2019-11-15T01:05:12.366Z","value":"Cucumber"}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"api","type":"capability"},"timestamp":"2019-11-15T01:05:12.366Z","value":{"category":"Calculations API","location":{"column":3,"line":17,"path":"features/api/calculations.feature"},"name":"Calculates result of an expression"}}}
            {"type":"SceneTagged","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","tag":{"name":"Calculations API","type":"feature"},"timestamp":"2019-11-15T01:05:12.366Z","value":{"category":"Calculations API","location":{"column":3,"line":17,"path":"features/api/calculations.feature"},"name":"Calculates result of an expression"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc510000p66uizjogeqq","timestamp":"2019-11-15T01:05:12.373Z","details":{"name":"Apisitt starts the local server"}}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc510000p66uizjogeqq","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.378Z","details":{"name":"Apisitt starts the local server"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc570001p66udhh2g6fl","timestamp":"2019-11-15T01:05:12.379Z","details":{"name":"Apisitt changes the API URL to the URL of the local server"}}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc570001p66udhh2g6fl","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.380Z","details":{"name":"Apisitt changes the API URL to the URL of the local server"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2zfxc590002p66u2hcup2k5","timestamp":"2019-11-15T01:05:12.381Z","details":{"name":"When Apisitt asks for the following calculation: 2 + 2"}}}
            {"type":"TaskStarts","event":{"activityId":"ck2zfxc5a0003p66ucebv6cfk","timestamp":"2019-11-15T01:05:12.382Z","details":{"name":"Apisitt requests calculation of 2 + 2"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc5b0004p66unfin36rs","timestamp":"2019-11-15T01:05:12.383Z","details":{"name":"Apisitt sends a POST request to '/api/calculations'"}}}
            {"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"ck2zfxc5b0004p66unfin36rs","artifact":{"type":"HTTPRequestResponse","base64EncodedValue":"eyJyZXF1ZXN0Ijp7Im1ldGhvZCI6InBvc3QiLCJ1cmwiOiJodHRwOi8vMTI3LjAuMC4xOjUzNTM5L2FwaS9jYWxjdWxhdGlvbnMiLCJoZWFkZXJzIjp7IkFjY2VwdCI6ImFwcGxpY2F0aW9uL2pzb24sYXBwbGljYXRpb24veG1sIiwiQ29udGVudC1UeXBlIjoidGV4dC9wbGFpbiIsIlVzZXItQWdlbnQiOiJheGlvcy8wLjE5LjAiLCJDb250ZW50LUxlbmd0aCI6NX0sImRhdGEiOiIyICsgMiJ9LCJyZXNwb25zZSI6eyJzdGF0dXMiOjIwMSwiaGVhZGVycyI6eyJ4LXBvd2VyZWQtYnkiOiJFeHByZXNzIiwibG9jYXRpb24iOiIvYXBpL2NhbGN1bGF0aW9ucy9jazJ6ZnhjNXIwMDAwcDY2dXM4dDRvYTM2IiwiZGF0ZSI6IkZyaSwgMTUgTm92IDIwMTkgMDE6MDU6MTIgR01UIiwiY29ubmVjdGlvbiI6ImNsb3NlIiwiY29udGVudC1sZW5ndGgiOiIwIn0sImRhdGEiOiIifX0="},"name":"request post http://127.0.0.1:53539/api/calculations","timestamp":"2019-11-15T01:05:12.402Z"}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc5b0004p66unfin36rs","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.403Z","details":{"name":"Apisitt sends a POST request to '/api/calculations'"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc5v0005p66u6nbljt4u","timestamp":"2019-11-15T01:05:12.403Z","details":{"name":"Apisitt ensures that the status of the last response does equal 201"}}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc5v0005p66u6nbljt4u","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.404Z","details":{"name":"Apisitt ensures that the status of the last response does equal 201"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc5w0006p66uzpzqqi7m","timestamp":"2019-11-15T01:05:12.404Z","details":{"name":"Apisitt ensures that the 'location' header of the last response does start with '/api/calculations/'"}}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc5w0006p66uzpzqqi7m","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.404Z","details":{"name":"Apisitt ensures that the 'location' header of the last response does start with '/api/calculations/'"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc5w0007p66uctan5o3f","timestamp":"2019-11-15T01:05:12.404Z","details":{"name":"Apisitt logs: the status of the last response, the 'location' header of the last response, banana"}}}
            {"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"ck2zfxc5w0007p66uctan5o3f","artifact":{"type":"LogEntry","base64EncodedValue":"eyJkYXRhIjoiMjAxIn0="},"name":"the status of the last response","timestamp":"2019-11-15T01:05:12.404Z"}}
            {"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"ck2zfxc5w0007p66uctan5o3f","artifact":{"type":"LogEntry","base64EncodedValue":"eyJkYXRhIjoiJy9hcGkvY2FsY3VsYXRpb25zL2NrMnpmeGM1cjAwMDBwNjZ1czh0NG9hMzYnIn0="},"name":"the 'location' header of the last response","timestamp":"2019-11-15T01:05:12.405Z"}}
            {"type":"ActivityRelatedArtifactGenerated","event":{"activityId":"ck2zfxc5w0007p66uctan5o3f","artifact":{"type":"LogEntry","base64EncodedValue":"eyJkYXRhIjoiJ2JhbmFuYScifQ=="},"name":"'banana'","timestamp":"2019-11-15T01:05:12.405Z"}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc5w0007p66uctan5o3f","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.405Z","details":{"name":"Apisitt logs: the status of the last response, the 'location' header of the last response, banana"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2zfxc5a0003p66ucebv6cfk","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.405Z","details":{"name":"Apisitt requests calculation of 2 + 2"}}}
            {"type":"TaskFinished","event":{"activityId":"ck2zfxc5y000bp66uos98j4q3","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.406Z","details":{"name":"When Apisitt asks for the following calculation: 2 + 2"}}}
            {"type":"InteractionStarts","event":{"activityId":"ck2zfxc5z000cp66uj8gxxfeb","timestamp":"2019-11-15T01:05:12.407Z","details":{"name":"Apisitt stops the local server"}}}
            {"type":"InteractionFinished","event":{"activityId":"ck2zfxc5z000cp66uj8gxxfeb","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.407Z","details":{"name":"Apisitt stops the local server"}}}
            {"type":"SceneFinished","event":{"sceneId":"ckg2xi0mf0000xf5zb41kc67m","outcome":{"code":64},"timestamp":"2019-11-15T01:05:12.421Z","details":{"category":"Calculations API","location":{"column":3,"line":17,"path":"features/api/calculations.feature"},"name":"Calculates result of an expression"}}}
            {"type":"ArtifactGenerated","event":{"artifact":{"type":"TestReport","base64EncodedValue":"eyJuYW1lIjoiQ2FsY3VsYXRlcyByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbiIsInRpdGxlIjoiQ2FsY3VsYXRlcyByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbiIsImlkIjoiY2FsY3VsYXRpb25zLWFwaTtjYWxjdWxhdGVzLXJlc3VsdC1vZi1hbi1leHByZXNzaW9uIiwibWFudWFsIjpmYWxzZSwidGVzdFN0ZXBzIjpbeyJudW1iZXIiOjEsImRlc2NyaXB0aW9uIjoiQXBpc2l0dCBzdGFydHMgdGhlIGxvY2FsIHNlcnZlciIsInN0YXJ0VGltZSI6MTU3Mzc3OTkxMjM3MywiY2hpbGRyZW4iOltdLCJyZXBvcnREYXRhIjpbXSwic2NyZWVuc2hvdHMiOltdLCJyZXN1bHQiOiJTVUNDRVNTIiwiZHVyYXRpb24iOjV9LHsibnVtYmVyIjoyLCJkZXNjcmlwdGlvbiI6IkFwaXNpdHQgY2hhbmdlcyB0aGUgQVBJIFVSTCB0byB0aGUgVVJMIG9mIHRoZSBsb2NhbCBzZXJ2ZXIiLCJzdGFydFRpbWUiOjE1NzM3Nzk5MTIzNzksImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU1VDQ0VTUyIsImR1cmF0aW9uIjoxfSx7Im51bWJlciI6MywiZGVzY3JpcHRpb24iOiJXaGVuIEFwaXNpdHQgYXNrcyBmb3IgdGhlIGZvbGxvd2luZyBjYWxjdWxhdGlvbjogMiArIDIiLCJzdGFydFRpbWUiOjE1NzM3Nzk5MTIzODEsImNoaWxkcmVuIjpbeyJudW1iZXIiOjQsImRlc2NyaXB0aW9uIjoiQXBpc2l0dCByZXF1ZXN0cyBjYWxjdWxhdGlvbiBvZiAyICsgMiIsInN0YXJ0VGltZSI6MTU3Mzc3OTkxMjM4MiwiY2hpbGRyZW4iOlt7Im51bWJlciI6NSwiZGVzY3JpcHRpb24iOiJBcGlzaXR0IHNlbmRzIGEgUE9TVCByZXF1ZXN0IHRvICcvYXBpL2NhbGN1bGF0aW9ucyciLCJzdGFydFRpbWUiOjE1NzM3Nzk5MTIzODMsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdFF1ZXJ5Ijp7Im1ldGhvZCI6IlBPU1QiLCJwYXRoIjoiaHR0cDovLzEyNy4wLjAuMTo1MzUzOS9hcGkvY2FsY3VsYXRpb25zIiwiY29udGVudCI6IicyICsgMiciLCJjb250ZW50VHlwZSI6InRleHQvcGxhaW4iLCJyZXF1ZXN0SGVhZGVycyI6IkFjY2VwdDogYXBwbGljYXRpb24vanNvbixhcHBsaWNhdGlvbi94bWxcbkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpblxuVXNlci1BZ2VudDogYXhpb3MvMC4xOS4wXG5Db250ZW50LUxlbmd0aDogNSIsInJlcXVlc3RDb29raWVzIjoiIiwic3RhdHVzQ29kZSI6MjAxLCJyZXNwb25zZUhlYWRlcnMiOiJ4LXBvd2VyZWQtYnk6IEV4cHJlc3NcbmxvY2F0aW9uOiAvYXBpL2NhbGN1bGF0aW9ucy9jazJ6ZnhjNXIwMDAwcDY2dXM4dDRvYTM2XG5kYXRlOiBGcmksIDE1IE5vdiAyMDE5IDAxOjA1OjEyIEdNVFxuY29ubmVjdGlvbjogY2xvc2VcbmNvbnRlbnQtbGVuZ3RoOiAwIiwicmVzcG9uc2VDb29raWVzIjoiIiwicmVzcG9uc2VCb2R5IjoiJycifSwicmVzdWx0IjoiU1VDQ0VTUyIsImR1cmF0aW9uIjoyMH0seyJudW1iZXIiOjYsImRlc2NyaXB0aW9uIjoiQXBpc2l0dCBlbnN1cmVzIHRoYXQgdGhlIHN0YXR1cyBvZiB0aGUgbGFzdCByZXNwb25zZSBkb2VzIGVxdWFsIDIwMSIsInN0YXJ0VGltZSI6MTU3Mzc3OTkxMjQwMywiY2hpbGRyZW4iOltdLCJyZXBvcnREYXRhIjpbXSwic2NyZWVuc2hvdHMiOltdLCJyZXN1bHQiOiJTVUNDRVNTIiwiZHVyYXRpb24iOjF9LHsibnVtYmVyIjo3LCJkZXNjcmlwdGlvbiI6IkFwaXNpdHQgZW5zdXJlcyB0aGF0IHRoZSAnbG9jYXRpb24nIGhlYWRlciBvZiB0aGUgbGFzdCByZXNwb25zZSBkb2VzIHN0YXJ0IHdpdGggJy9hcGkvY2FsY3VsYXRpb25zLyciLCJzdGFydFRpbWUiOjE1NzM3Nzk5MTI0MDQsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU1VDQ0VTUyIsImR1cmF0aW9uIjowfSx7Im51bWJlciI6OCwiZGVzY3JpcHRpb24iOiJBcGlzaXR0IGxvZ3M6IHRoZSBzdGF0dXMgb2YgdGhlIGxhc3QgcmVzcG9uc2UsIHRoZSAnbG9jYXRpb24nIGhlYWRlciBvZiB0aGUgbGFzdCByZXNwb25zZSwgYmFuYW5hIiwic3RhcnRUaW1lIjoxNTczNzc5OTEyNDA0LCJjaGlsZHJlbiI6W10sInJlcG9ydERhdGEiOlt7ImlkIjoicmVwb3J0LWRhdGEtY2syemZ4YzV4MDAwOHA2NnV5YTlqM2NxeiIsImlzRXZpZGVuY2UiOmZhbHNlLCJwYXRoIjoiIiwidGl0bGUiOiJ0aGUgc3RhdHVzIG9mIHRoZSBsYXN0IHJlc3BvbnNlIiwiY29udGVudHMiOiIyMDEifSx7ImlkIjoicmVwb3J0LWRhdGEtY2syemZ4YzV4MDAwOXA2NnVxNThlcXZlcyIsImlzRXZpZGVuY2UiOmZhbHNlLCJwYXRoIjoiIiwidGl0bGUiOiJ0aGUgJ2xvY2F0aW9uJyBoZWFkZXIgb2YgdGhlIGxhc3QgcmVzcG9uc2UiLCJjb250ZW50cyI6IicvYXBpL2NhbGN1bGF0aW9ucy9jazJ6ZnhjNXIwMDAwcDY2dXM4dDRvYTM2JyJ9LHsiaWQiOiJyZXBvcnQtZGF0YS1jazJ6ZnhjNXgwMDBhcDY2dTB5YnFlazc0IiwiaXNFdmlkZW5jZSI6ZmFsc2UsInBhdGgiOiIiLCJ0aXRsZSI6IidiYW5hbmEnIiwiY29udGVudHMiOiInYmFuYW5hJyJ9XSwic2NyZWVuc2hvdHMiOltdLCJyZXN1bHQiOiJTVUNDRVNTIiwiZHVyYXRpb24iOjF9XSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU1VDQ0VTUyIsImR1cmF0aW9uIjoyM31dLCJyZXBvcnREYXRhIjpbXSwic2NyZWVuc2hvdHMiOltdLCJyZXN1bHQiOiJTVUNDRVNTIiwiZHVyYXRpb24iOjI1fSx7Im51bWJlciI6OSwiZGVzY3JpcHRpb24iOiJBcGlzaXR0IHN0b3BzIHRoZSBsb2NhbCBzZXJ2ZXIiLCJzdGFydFRpbWUiOjE1NzM3Nzk5MTI0MDcsImNoaWxkcmVuIjpbXSwicmVwb3J0RGF0YSI6W10sInNjcmVlbnNob3RzIjpbXSwicmVzdWx0IjoiU1VDQ0VTUyIsImR1cmF0aW9uIjowfV0sInVzZXJTdG9yeSI6eyJpZCI6ImNhbGN1bGF0aW9ucy1hcGkiLCJzdG9yeU5hbWUiOiJDYWxjdWxhdGlvbnMgQVBJIiwicGF0aCI6ImZlYXR1cmVzL2FwaS9jYWxjdWxhdGlvbnMuZmVhdHVyZSIsInR5cGUiOiJmZWF0dXJlIn0sInN0YXJ0VGltZSI6MTU3Mzc3OTkxMjM2NiwidGVzdFNvdXJjZSI6IkN1Y3VtYmVyIiwidGFncyI6W3sibmFtZSI6ImFwaSIsInR5cGUiOiJjYXBhYmlsaXR5In0seyJuYW1lIjoiQXBpL0NhbGN1bGF0aW9ucyBBUEkiLCJ0eXBlIjoiZmVhdHVyZSJ9XSwiZmVhdHVyZVRhZyI6eyJuYW1lIjoiQ2FsY3VsYXRpb25zIEFQSSIsInR5cGUiOiJmZWF0dXJlIn0sImR1cmF0aW9uIjo1NSwicmVzdWx0IjoiU1VDQ0VTUyJ9"},"name":"Calculates result of an expression","timestamp":"2019-11-15T01:05:12.423Z"}}
            {"type":"TestRunFinished","event":"2019-11-15T01:05:12.422Z"}
            {"type":"ArtifactArchived","event":{"name":"Calculates result of an expression","type":"TestReport","path":"scenario-calculates-result-of-an-expression-23ff6a3fa8.json","timestamp":"2019-11-15T01:05:12.428Z"}}
        `).then(() => {
            expect(stdout.buffer).to.equal(trimmed `
                | --------------------------------------------------------------------------------
                | features/api/calculations.feature:17
                |
                | Calculations API: Calculates result of an expression
                |
                |   ✓ Apisitt starts the local server (5ms)
                |   ✓ Apisitt changes the API URL to the URL of the local server (1ms)
                |   When Apisitt asks for the following calculation: 2 + 2
                |     Apisitt requests calculation of 2 + 2
                |       ✓ Apisitt sends a POST request to '/api/calculations' (20ms)
                |       ✓ Apisitt ensures that the status of the last response does equal 201 (1ms)
                |       ✓ Apisitt ensures that the 'location' header of the last response does start with '/api/calculations/' (0ms)
                |       ✓ Apisitt logs: the status of the last response, the 'location' header of the last response, banana (1ms)
                |         the status of the last response:
                |         201
                |
                |         the 'location' header of the last response:
                |         '/api/calculations/ck2zfxc5r0000p66us8t4oa36'
                |
                |         'banana'
                |
                |   ✓ Apisitt stops the local server (0ms)
                |
                | ✓ Execution successful (55ms)
                | ================================================================================
                | Execution Summary
                |
                | Calculations API: 1 successful, 1 total (55ms)
                |
                | Total time: 55ms
                | Scenarios:  1
                | ================================================================================
            `);
        }));
    });
});

class FakeWritableStream implements Partial<NodeJS.WritableStream> {
    constructor(public buffer: string = '') {
    }

    // @ts-ignore
    write(chunk: string, encoding: string): boolean {
        this.buffer += chunk;
    }
}

class Extras implements Cast {
    prepare(actor: Actor): Actor {
        return actor;
    }
}
