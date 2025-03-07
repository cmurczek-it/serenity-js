import { ensure, isDefined, isInstanceOf, property } from 'tiny-types';

import { OutputStream } from './adapter';
import { SerenityConfig } from './config';
import { ConfigurationError } from './errors';
import { DomainEvent } from './events';
import { ClassDescriptionParser, ClassLoader, d, has, ModuleLoader } from './io';
import { CorrelationId, Duration, Timestamp } from './model';
import { Actor } from './screenplay/actor/Actor';
import { StageCrewMember, StageCrewMemberBuilder } from './stage';
import { Cast } from './stage/Cast';
import { Clock } from './stage/Clock';
import { Extras } from './stage/Extras';
import { Stage } from './stage/Stage';
import { StageManager } from './stage/StageManager';

/**
 * @group Serenity
 */
export class Serenity {
    private static defaultCueTimeout    = Duration.ofSeconds(5);
    private static defaultActors        = new Extras();

    private stage: Stage;
    private outputStream: OutputStream  = process.stdout;

    private readonly classLoader: ClassLoader;

    /**
     * @param clock
     */
    constructor(
        private readonly clock: Clock = new Clock(),
        cwd: string = process.cwd(),
    ) {
        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(Serenity.defaultCueTimeout, clock),
        );

        this.classLoader = new ClassLoader(
            new ModuleLoader(cwd),
            new ClassDescriptionParser(),
        );
    }

    /**
     * Configures Serenity/JS. Every call to this function
     * replaces the previous configuration provided,
     * so this function should be called exactly once
     * in your test suite.
     *
     * @param config
     */
    configure(config: SerenityConfig): void {
        const looksLikeBuilder          = has<StageCrewMemberBuilder>({ build: 'function' });
        const looksLikeStageCrewMember  = has<StageCrewMember>({ assignedTo: 'function', notifyOf: 'function' });

        const cueTimeout = config.cueTimeout
            ? ensure('cueTimeout', config.cueTimeout, isInstanceOf(Duration))
            : Serenity.defaultCueTimeout;

        if (config.outputStream) {
            this.outputStream = config.outputStream;
        }

        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(cueTimeout, this.clock),
        );

        if (config.actors) {
            this.engage(config.actors);
        }

        if (Array.isArray(config.crew)) {
            this.stage.assign(
                ...config.crew.map((stageCrewMemberDescription, i) => {

                    const stageCrewMember = this.classLoader.looksLoadable(stageCrewMemberDescription)
                        ? this.classLoader.instantiate<StageCrewMember | StageCrewMemberBuilder>(stageCrewMemberDescription)
                        : stageCrewMemberDescription;

                    if (looksLikeBuilder(stageCrewMember)) {
                        return stageCrewMember.build({ stage: this.stage, outputStream: this.outputStream });
                    }

                    if (looksLikeStageCrewMember(stageCrewMember)) {
                        return stageCrewMember.assignedTo(this.stage);
                    }

                    throw new ConfigurationError(
                        d`Entries under \`crew\` should implement either StageCrewMember or StageCrewMemberBuilder interfaces, \`${ stageCrewMemberDescription }\` found at index ${ i }`
                    );
                }),
            );
        }
    }

    /**
     * Re-configures Serenity/JS with a new {@apilink Cast} of {@apilink Actor|actors}
     * you want to use in any subsequent calls to {@apilink actorCalled}.
     *
     * For your convenience, use {@apilink engage} function instead,
     * which provides an alternative to calling {@apilink Actor.whoCan} directly in your tests
     * and is typically invoked in a "before all" or "before each" hook of your test runner of choice.
     *
     * If your implementation of the {@apilink Cast} interface is stateless,
     * you can invoke this function just once before your entire test suite is executed, see
     * - [`beforeAll`](https://jasmine.github.io/api/3.6/global.html#beforeAll) in Jasmine,
     * - [`before`](https://mochajs.org/#hooks) in Mocha,
     * - [`BeforeAll`](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#beforeall--afterall) in Cucumber.js
     *
     * However, if your {@apilink Cast} holds state that you want to reset before each scenario,
     * it's better to invoke `engage` before each test using:
     * - [`beforeEach`](https://jasmine.github.io/api/3.6/global.html#beforeEach) in Jasmine
     * - [`beforeEach`](https://mochajs.org/#hooks) in Mocha,
     * - [`Before`](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#hooks) in Cucumber.js
     *
     * ## Engaging a cast of actors
     *
     * ```ts
     * import { Actor, Cast } from '@serenity-js/core';
     *
     * class Actors implements Cast {
     *   prepare(actor: Actor) {
     *     return actor.whoCan(
     *       // ... abilities you'd like the Actor to have
     *     );
     *   }
     * }
     *
     * engage(new Actors());
     * ```
     *
     * ### Using with Mocha test runner
     *
     * ```ts
     * import { beforeEach } from 'mocha'
     *
     * beforeEach(() => engage(new Actors()))
     * ```
     *
     * ### Using with Jasmine test runner
     *
     * ```ts
     * import 'jasmine'
     *
     * beforeEach(() => engage(new Actors()))
     * ```
     *
     * ### Using with Cucumber.js test runner
     *
     * ```ts
     * import { Before } from '@cucumber/cucumber'
     *
     * Before(() => engage(new Actors()))
     * ```
     *
     * ## Learn more
     * - {@apilink Actor}
     * - {@apilink Cast}
     * - {@apilink engage}
     *
     * @param actors
     */
    engage(actors: Cast): void {
        this.stage.engage(
            ensure('actors', actors, property('prepare', isDefined())),
        );
    }

    /**
     * Instantiates or retrieves an {@apilink Actor}
     * called `name` if one has already been instantiated.
     *
     * For your convenience, use {@apilink actorCalled} function instead.
     *
     * ## Usage with Mocha
     *
     * ```typescript
     *   import { describe, it } from 'mocha';
     *   import { actorCalled } from '@serenity-js/core';
     *
     *   describe('Feature', () => {
     *
     *      it('should have some behaviour', () =>
     *          actorCalled('James').attemptsTo(
     *              // ... activities
     *          ))
     *   })
     * ```
     *
     * ## Usage with Jasmine
     *
     * ```typescript
     *   import 'jasmine';
     *   import { actorCalled } from '@serenity-js/core';
     *
     *   describe('Feature', () => {
     *
     *      it('should have some behaviour', () =>
     *          actorCalled('James').attemptsTo(
     *              // ... activities
     *          ))
     *   })
     * ```
     *
     * ## Usage with Cucumber
     *
     * ```typescript
     * import { actorCalled } from '@serenity-js/core';
     * import { Given } from '@cucumber/cucumber';
     *
     * Given(/(.*?) is a registered user/, (name: string) =>
     *   actorCalled(name).attemptsTo(
     *     // ... activities
     *   ))
     * ```
     *
     * ## Learn more
     *
     * - {@apilink engage}
     * - {@apilink Actor}
     * - {@apilink Cast}
     * - {@apilink actorCalled}
     *
     * @param name
     *  The name of the actor to instantiate or retrieve
     */
    theActorCalled(name: string): Actor {
        return this.stage.theActorCalled(name);
    }

    /**
     * Retrieves an actor who was last instantiated or retrieved
     * using {@apilink Serenity.theActorCalled}.
     *
     * This function is particularly useful when automating Cucumber scenarios.
     *
     * For your convenience, use {@apilink actorInTheSpotlight} function instead.
     *
     * ## Usage with Cucumber
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core';
     * import { Given, When } from '@cucumber/cucumber';
     *
     * Given(/(.*?) is a registered user/, (name: string) =>
     *   actorCalled(name).attemptsTo(
     *     // ... activities
     *   ))
     *
     * When(/(?:he|she|they) browse their recent orders/, () =>
     *   actorInTheSpotlight().attemptsTo(
     *     // ... activities
     *   ))
     * ```
     *
     * ## Learn more
     *
     * - {@apilink engage}
     * - {@apilink actorCalled}
     * - {@apilink actorInTheSpotlight}
     * - {@apilink Actor}
     * - {@apilink Cast}
     */
    theActorInTheSpotlight(): Actor {
        return this.stage.theActorInTheSpotlight();
    }

    announce(event: DomainEvent): void {
        this.stage.announce(event);
    }

    currentTime(): Timestamp {
        return this.stage.currentTime();
    }

    assignNewSceneId(): CorrelationId {
        return this.stage.assignNewSceneId();
    }

    currentSceneId(): CorrelationId {
        return this.stage.currentSceneId();
    }

    assignNewActivityId(): CorrelationId {
        return this.stage.assignNewActivityId();
    }

    /**
     * @package
     */
    waitForNextCue(): Promise<void> {
        return this.stage.waitForNextCue();
    }
}
