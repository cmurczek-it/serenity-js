import { WriteFileOptions } from 'fs';
import { ensure, isDefined, isGreaterThan, isString, property } from 'tiny-types';

import {
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ArtifactArchived,
    ArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
} from '../../../events';
import { FileSystem, Path } from '../../../io';
import { Artifact, ArtifactType, CorrelationId, Description, Name, Photo, TestReport } from '../../../model';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';
import { Hash } from './Hash';

/**
 * Stores any {@apilink Artifact|artifacts} emitted via {@apilink ArtifactGenerated} events on the {@apilink FileSystem}
 *
 * ## Registering `ArtifactArchiver` programmatically
 *
 * ```ts
 * import { ArtifactArchiver, configure } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     ArtifactArchiver.storingArtifactsAt(`/target/site/serenity`),
 *   ]
 *   // other Serenity/JS config
 * })
 * ```
 *
 * ## Registering `ArtifactArchiver` using Protractor configuration
 *
 * ```js
 * // protractor.conf.js
 * const { ArtifactArchiver } = require('@serenity-js/core')
 *
 * exports.config = {
 *   framework:     'custom',
 *   frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     crew: [
 *       ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *     ],
 *     // other Serenity/JS config
 *   },
 *   // other Protractor config
 * };
 * ```
 *
 * ## Registering `ArtifactArchiver` using WebdriverIO configuration
 *
 * ```ts
 * // wdio.conf.js
 * import { ArtifactArchiver } from '@serenity-js/core'
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *     framework: '@serenity-js/webdriverio',
 *
 *     serenity: {
 *         crew: [
 *             ArtifactArchiver.storingArtifactsAt(`/target/site/serenity`),
 *         ]
 *         // other Serenity/JS config
 *     },
 *   },
 *   // other WebdriverIO config
 * }
 * ```
 *
 * @group Stage
 */
export class ArtifactArchiver implements StageCrewMember {

    /**
     * Instantiates an `ArtifactArchiver` storing artifacts in a given `destination`.
     * The `destination` directory will be created automatically and recursively if it doesn't exist.
     *
     * @param destination
     */
    static storingArtifactsAt(...destination: string[]): StageCrewMember {
        ensure('Path to destination directory', destination, property('length', isGreaterThan(0)));

        const pathToDestination = destination.map(segment => new Path(segment)).reduce((acc, current) => acc.join(current));

        return new ArtifactArchiver(new FileSystem(pathToDestination));
    }

    /**
     * Instantiates an `ArtifactArchiver` storing artifacts in a given `outputDirectory`.
     * The `outputDirectory` will be created automatically and recursively if it doesn't exist.
     *
     * @param config
     */
    static fromJSON(config: { outputDirectory: string }): StageCrewMember {
        const outputDirectory = ensure('outputDirectory', config.outputDirectory, isDefined(), isString());

        return new ArtifactArchiver(new FileSystem(Path.from(outputDirectory)));
    }

    /**
     * @param {FileSystem} fileSystem
     * @param {Stage} [stage]
     *  The stage this {@apilink StageCrewMember} should be assigned to
     */
    constructor(
        private readonly fileSystem: FileSystem,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /**
     * Handles {@apilink DomainEvent} objects emitted by the {@apilink StageManager}.
     *
     * @see {@apilink StageCrewMember}
     *
     * @listens {ArtifactGenerated}
     * @emits {ArtifactArchived}
     *
     * @param event
     */
    notifyOf(event: DomainEvent): void {

        if (!(event instanceof ArtifactGenerated)) {
            // ignore any other events
            return void 0;
        }

        if (event.artifact instanceof Photo) {
            const filename = this.fileNameFor('photo', event.name, event.artifact, 'png');

            this.archive(
                filename,
                event.artifact.base64EncodedValue,
                'base64',
                this.archivisationAnnouncement(event, filename),
            );
        }

        if (event.artifact instanceof TestReport) {
            const filename = this.fileNameFor('scenario', event.name, event.artifact, 'json');

            this.archive(
                filename,
                event.artifact.map(JSON.stringify),
                'utf8',
                this.archivisationAnnouncement(event, filename),
            );
        }
    }

    private fileNameFor(prefix: string, artifactName: Name, artifact: Artifact, extension: string): Path {
        const hash = Hash.of(artifact.base64EncodedValue).short();

        return Path.fromSanitisedString(
            // Ensure that the file name is shorter than 250 chars, which is safe with all the filesystems
            // note: we can't do that in the Path constructor as the Path can be used to join other paths,
            // so restricting the length of the _path_ itself would not be correct.
            `${ prefix.slice(0, 10) }-${ urlFriendly(artifactName.value).slice(0, 64) }-${ hash }.${ extension }`.replace(/-+/g, '-'),
            // characters:     10    1         64                                      1    10   1    4                                 < 100
        );
    }

    private archive(relativePath: Path, contents: string, encoding: WriteFileOptions, announce: (absolutePath: Path) => void): void {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ relativePath.value }'...`),
            id,
        ));

        this.fileSystem.store(relativePath, contents, encoding)
            .then(absolutePath => {
                announce(relativePath);

                this.stage.announce(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Saved '${ absolutePath.value }'`),
                    id,
                ));
            })
            .catch(error => {
                this.stage.announce(new AsyncOperationFailed(error, id));
            });
    }

    private archivisationAnnouncement(event: ArtifactGenerated | ActivityRelatedArtifactGenerated, relativePathToArtifact: Path) {
        return (absolutePath: Path) => {
            if (event instanceof ActivityRelatedArtifactGenerated) {
                this.stage.announce(new ActivityRelatedArtifactArchived(
                    event.sceneId,
                    event.activityId,
                    event.name,
                    event.artifact.constructor as ArtifactType,
                    relativePathToArtifact,
                ));
            } else if (event instanceof ArtifactGenerated) {
                this.stage.announce(new ArtifactArchived(
                    event.sceneId,
                    event.name,
                    event.artifact.constructor as ArtifactType,
                    relativePathToArtifact,
                ));
            }
        };
    }
}

/**
 * @private
 * @param {string} name
 */
function urlFriendly(name: string): string {
    return name.toLocaleLowerCase()
        .replace(/[^\d.a-z-]/g, '-');
}
