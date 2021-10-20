import { Answerable, AnswersQuestions, Interaction, LogicError } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { Element } from '../../ui';

/**
 * @desc
 *  A base class for interactions with {@link Element}s.
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export abstract class ElementInteraction extends Interaction {

    /**
     * @param {string} description
     *  A human-readable description to be used when reporting
     *  this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @protected
     */
    protected constructor(private readonly description: string) {
        super();
    }

    /**
     * @desc
     *  Returns the resolved {@link Element}, or throws a {@link @serenity-js/core/lib/errors~LogicError}
     *  if the element is `undefined`.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element<'async'>>} element
     *
     * @returns {Promise<Element>}
     *
     * @protected
     */
    protected async resolve(
        actor: AnswersQuestions,
        element: Answerable<Element>,
    ): Promise<Element> {
        const resolved = await actor.answer(element);

        if (! resolved) {
            throw new LogicError(formatted `Couldn't find ${ element }`);
        }

        return resolved;
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return this.description;
    }
}