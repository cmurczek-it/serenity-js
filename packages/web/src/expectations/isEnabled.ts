import { and, isPresent } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { PageElement } from '../screenplay';
import { ElementExpectation } from './ElementExpectation';

/**
 *  {@apilink Expectation} that an element is enabled, which means it resolves to `true` when:
 *  - the element {@apilink isPresent|is present} in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
 *  - {@apilink PageElement.isEnabled} resolves to `true`
 *
 *  If the above conditions are not met, the expectation resolves to `false`.
 *
 * ## Learn more
 * - {@apilink PageElement.isEnabled}
 * - {@apilink ElementExpectation}
 * - {@apilink Expectation}
 * - {@apilink Check}
 * - {@apilink Ensure}
 * - {@apilink Wait}
 *
 * @group Expectations
 */
export function isEnabled(): Expectation<PageElement> {
    return Expectation.to<boolean, PageElement>('become enabled').soThatActual(and(
        isPresent(),
        ElementExpectation.forElementTo('become enabled', actual => actual.isEnabled())
    ));
}
