import { Md5HashedPictureNames, Photographer } from '../serenity-protractor/stage/photographer';
import { ActivityFinished, DomainEvent } from './domain/events';
import { FileSystemOutlet } from './reporting/outlet';
import { Cast, Journal, Stage, StageManager } from './stage';

export class Serenity {
    private static serenity: Serenity;

    private stage: Stage = new Stage(new StageManager(new Journal()));

    public static callToStageFor(cast: Cast): Stage {
        return Serenity.instance.stage.enter(cast);
    }

    // todo: instead of exposing the StageManager, the Step factory should be available from DI
    public static stageManager() {
        return Serenity.instance.stage.manager;
    }

    public static notify(event: DomainEvent<any>) {
        Serenity.instance.stage.manager.notifyOf(event);
    }

    // todo: rename and clean up
    public static readNewJournalEntriesAs(id: string): DomainEvent<any>[] {
        return Serenity.instance.stage.manager.readNewJournalEntriesAs(id);
    }

    private static get instance() {
        return Serenity.serenity || (Serenity.serenity = new Serenity());
    }

    constructor() {

        // todo: make the crew members configurable externally
        new Photographer(
            [ ActivityFinished ],
            new FileSystemOutlet(`${process.cwd()}/target/site/serenity/`),
            new Md5HashedPictureNames('png')
        ).assignTo(this.stage);
    }
}
