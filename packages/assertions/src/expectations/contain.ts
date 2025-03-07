import { Answerable, Expectation } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects';

/**
 * Produces an {@apilink Expectation|expectation} that is met when the actual array of `Item[]` contains
 * at least one `Item` that is equal to the resolved value of `expected`.
 *
 * Note that the equality check performs comparison **by value**
 * using [TinyTypes `equal`](https://github.com/jan-molak/tiny-types/blob/master/src/objects/equal.ts).
 *
 * ## Ensuring that the array contains the given item
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, and, startsWith, endsWith } from '@serenity-js/assertions'
 *
 * const items = [ { name: 'apples' }, { name: 'bananas' } ]
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that(items, contain({ name: 'bananas' })),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export function contain<Item>(expected: Answerable<Item>): Expectation<Item[]> {
    return Expectation.thatActualShould<Item, Item[]>('contain', expected)
        .soThat((actualValue, expectedValue) => actualValue.some(item => equal(item, expectedValue)));
}
