/* istanbul ignore file */

import { AssertionReportDiffer } from '@serenity-js/core/lib/io';
import { ExecutionCompromised, ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionIgnored, ExecutionSkipped, ImplementationPending, Outcome } from '@serenity-js/core/lib/model';
import { Chalk } from 'chalk'; // eslint-disable-line unicorn/import-style

import { TerminalTheme } from './TerminalTheme';

/**
 * @desc
 *  Base class for {@apilink TerminalTheme} implementations intended
 *  to print to terminals that support colour output.
 *
 * @extends {TerminalTheme}
 *
 * @public
 * @abstract
 */
export abstract class ThemeForColourTerminals extends TerminalTheme {

    /**
     * @param {chalk~Chalk} chalk
     *
     * @see https://www.npmjs.com/package/chalk
     */
    constructor(protected readonly chalk: Chalk) {
        super(new AssertionReportDiffer({
            expected: line => this.chalk.green(`+ ${ line }`),
            actual:   line => this.chalk.red(`- ${ line }`),
            matching: line => `  ${ line }`,
        }));
    }

    /**
     * Joins the `parts` into a single string and decorates it
     * using a colour appropriate for a given {@apilink Outcome}.
     *
     * @param outcome
     *  an instance of an {@apilink @serenity-js/core/lib/model~Outcome}
     *  or a string class name of one of its implementations.
     *
     * @param parts
     *  the parts of the message to be decorated
     */
    outcome(outcome: Outcome | string, ...parts: any[]): string {
        const outcomeName = (outcome instanceof Outcome)
            ? outcome.constructor.name
            : outcome;

        switch (outcomeName) {
            case ExecutionCompromised.name:
                return this.chalk.magenta(this.joined(parts));
            case ExecutionFailedWithError.name:
            case ExecutionFailedWithAssertionError.name:
                return this.chalk.red(this.joined(parts));
            case ImplementationPending.name:
                return this.chalk.blue(this.joined(parts));
            case ExecutionSkipped.name:
            case ExecutionIgnored.name:
                return this.chalk.blackBright(this.joined(parts));
            // case ExecutionSuccessful.name:
            default:
                return this.chalk.green(this.joined(parts));
        }
    }

    /**
     * @desc
     *  Turns the serialised `expectedValue` and `actualValue` into
     *  a visual diff, so that it's easier for the developer to spot
     *  the difference between the two values.
     *
     * @param {string} expectedValue
     * @param {string} actualValue
     *
     * @returns {string}
     */
    diff(expectedValue: string, actualValue: string): string {
        return this.differ.diff(expectedValue, actualValue);
    }
}
