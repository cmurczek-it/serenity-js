import { Timestamp } from '@serenity-js/core';
import { Cookie, CookieData, CookieMissingError } from '@serenity-js/web';
import * as playwright from 'playwright-core';
import { ensure, isDefined } from 'tiny-types';

/**
 * Playwright-specific implementation of {@apilink Cookie}.
 *
 * @group Models
 */
export class PlaywrightCookie extends Cookie {

    constructor(
        private readonly context: playwright.BrowserContext,
        cookieName: string,
    ) {
        super(cookieName);
        ensure('context', context, isDefined());
    }

    async delete(): Promise<void> {
        // see https://github.com/microsoft/playwright/issues/10143
        const cookies = await this.context.cookies();
        await this.context.clearCookies();
        await this.context.addCookies(
            cookies.filter(cookie => cookie.name !== this.cookieName)
        );
    }

    protected async read(): Promise<CookieData> {
        const cookies = await this.context.cookies();

        const found = cookies.find(cookie => cookie.name === this.cookieName);

        if (! found) {
            throw new CookieMissingError(`Cookie '${ this.cookieName }' not set`);
        }

        return {
            name:       found.name,
            value:      found.value,
            domain:     found.domain,
            path:       found.path,
            expiry:     found.expires !== undefined
                ? Timestamp.fromTimestampInSeconds(Math.round(found.expires))
                : undefined,
            httpOnly:   found.httpOnly,
            secure:     found.secure,
        }
    }
}
