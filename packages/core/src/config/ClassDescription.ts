/**
 * `ClassDescription` describes the Node module ID and optionally:
 * - a named export that you want to import
 * - a parameter that should be passed to the static `fromJSON` method if the imported type provides it.
 *
 * `ClassDescription` is used to describe the {@apilink StageCrewMember|StageCrewMembers} passed to {@apilink SerenityConfig}.
 *
 * The most basic class description is the name of a Node module that must provide a `default` export.
 * For example, below definition would be interpreted as a request to import the `default` export from the `@serenity-js/serenity-bdd` module and instantiate it using its no-arg constructor:
 * ```typescript
 * import { configure } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     `@serenity-js/serenity-bdd`
 *   ]
 * })
 * ```
 *
 * Class description can also include a named export to be imported. For example, below definition would be interpreted as a request
 * to import the `SerenityBDDReporter` type from `@serenity-js/serenity-bdd` and instantiate it using its no-arg constructor:
 *
 * ```typescript
 * import { configure } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     `@serenity-js/serenity-bdd:SerenityBDDReporter`
 *   ]
 * })
 * ```
 *
 * However, not all types have no-arg constructors. In those cases, a type offering a `static fromJSON(configParam)` method can be described using a tuple
 * where the first item describes the Node module and optionally the class name, and the second item describes the `configParam`.
 *
 * ```typescript
 * import { configure } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     [ `@serenity-js/core:ArtifactArchiver`, { outputDirectory: './target/site/serenity' } ]
 *   ]
 * })
 * ```
 *
 * Note that the class description could also describe a local Node module. This can be useful when you're writing a custom StageCrewMember implementation.
 * For example, `./my-reporter:MyReporter` would be interpreted as a request to load the `MyReporter` type from `./my-reporter` file, located
 * relative to the [working directory](https://nodejs.org/api/process.html#processcwd) of the current Node.js process.
 *
 * @group Configuration
 */
export type ClassDescription =
    string |            // e.g. '@serenity-js/core:StreamReporter'
    [ string ] |        // e.g. [ '@serenity-js/core:StreamReporter' ]
    [ string, any ];    // e.g. [ '@serenity-js/core:StreamReporter', { outputFile: './events.ndjson' } ]
