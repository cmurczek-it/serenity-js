import { Cast, Log } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { describe, it, test } from '@serenity-js/playwright-test';

export interface Notes {
    testServerUrl: string;
}

describe('Playwright Test reporting', () => {

    test.use({
        actors: ({ browser }, use) => {
            use(Cast.whereEveryoneCan(BrowseTheWebWithPlaywright.using(browser)));
        },
    });

    describe('A screenplay scenario', () => {

        it('propagates events to Serenity reporter', async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                Log.the('Hello world'),
            );
        });
    });
});
