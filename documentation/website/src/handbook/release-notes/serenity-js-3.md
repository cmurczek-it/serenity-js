---
title: Serenity/JS 3.0 (RC)
layout: handbook.hbs
---

# Serenity/JS 3.0 Release Candidate

Serenity/JS 3.0 is [around the corner](https://github.com/serenity-js/serenity-js/milestone/1)
and introduces a number of new features while aiming to retain backwards compatibility of most of the core APIs.

The latest Release Candidate (RC) is already [available on NPM](https://www.npmjs.com/package/@serenity-js/core) and this guide
will help you get started and highlight notable differences from Serenity/JS version 2.

We've already migrated several of the popular [Serenity/JS templates](https://github.com/serenity-js?q=template&type=all&language=&sort=), and you'll find code using the new Serenity/JS APIs on the `main` branch (the old `master` branch still contains Serenity/JS 2 code):
- [serenity-js-cucumber-webdriverio-template](https://github.com/serenity-js/serenity-js-cucumber-webdriverio-template/tree/main) ([see diff](https://github.com/serenity-js/serenity-js-cucumber-webdriverio-template/compare/master...main))
- [serenity-js-mocha-webdriverio-template](https://github.com/serenity-js/serenity-js-mocha-webdriverio-template/tree/main) ([see diff](https://github.com/serenity-js/serenity-js-mocha-webdriverio-template/compare/master...main))


<div class="pro-tip">
    <div class="icon"><i class="fab fa-twitter"></i></div>
    <div class="text">
        <p>
            This guide will continue to evolve as we're working on Serenity/JS 3.0, so make sure to follow @SerenityJS on Twitter to stay up to date!
        </p>
        <p>
            <a href="https://twitter.com/@SerenityJS" class="img-link">
                <img src="https://img.shields.io/twitter/follow/SerenityJS?style=social" alt="Follow SerenityJS on Twitter" />
            </a>
        </p>
    </div>
</div>

## Portable Web Tests

The most significant change in the Web testing space is the introduction of the [`@serenity-js/web`](https://github.com/serenity-js/serenity-js/tree/main/packages/web) module and numerous features that help your tests become portable across the different test integration tools (such as Protractor, WebdriverIO, Puppeteer, etc.)

The new module contains all the Web-related interactions and questions, while the integration-tool specific modules such as [`@serenity-js/protractor`](https://github.com/serenity-js/serenity-js/tree/main/packages/protractor) and [`@serenity-js/webdriverio`](https://github.com/serenity-js/serenity-js/tree/main/packages/webdriverio) contain only tool-specific models and abilities. This change will help your test code be much more portable between the different integration tools, and will also help us significantly reduce the effort of introducing new integrations (with [support for Playwright](https://github.com/serenity-js/serenity-js/pull/911) already in the works).

To see what the changes look like in practice, have a look at the TodoMVC tests implemented using:
- [Serenity/JS 3.x](https://github.com/serenity-js/serenity-js/tree/main/examples/webdriverio-mocha-todomvc)
- [Serenity/JS 2.x](https://github.com/serenity-js/serenity-js/tree/master/examples/webdriverio-mocha-todomvc)

Let's discuss the changes below.

### Configuring the `Actors`

The only non-portable part of Serenity/JS 3.x Web tests is your `Actors` class.
That's because while your tests can be agnostic of the lower-level integration tool, the `Actors` need to "know" what tool to use.

The first change you'll see is in how the `Actors` class is defined.

In [Serenity/JS 2](https://github.com/serenity-js/serenity-js/blob/4779aa66431addc63bbc77c435a9e25bf1f39d13/examples/webdriverio-mocha-todomvc/src/Actors.ts):
```typescript
import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/webdriverio';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(browser),
        );
    }
}
```

In [Serenity/JS 3](https://github.com/serenity-js/serenity-js/blob/4779aa66431addc63bbc77c435a9e25bf1f39d13/examples/webdriverio-mocha-todomvc/src/Actors.ts):
```typescript
import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithWebdriverIO.using(browser),
        );
    }
}
```

So here's the difference:
- Instead of importing `BrowseTheWeb` you import `BrowseTheWebWithWebdriverIO` (which is a tool-specific implementation of the `BrowseTheWeb` interface)
- Next, you give the new tool-specific ability to the actor:

```diff
import { Actor, Cast } from '@serenity-js/core';
- import { BrowseTheWeb } from '@serenity-js/webdriverio';
+ import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
-           BrowseTheWeb.using(browser),
+           BrowseTheWebWithWebdriverIO.using(browser),
        );
    }
}
```

### Implementing portable `Interaction`s and `Question`s

Because `BrowseTheWebWithWebdriverIO extends BrowseTheWeb`, any custom interactions and questions should still use the **generic and tool-agnostic** `BrowseTheWeb` from `@serenity-js/web` to be portable between the different integration tools. Note that this also means that there's a good chance that any custom interactions and questions you have implemented with Serenity/JS 2 would still work with few if any changes with Serenity/JS 3.

How does it work? In Serenity 3, calling `BrowseTheWeb.as(actor)` looks up any ability that extends the base `BrowseTheWeb`, so currently either `BrowseTheWebWithWebdriverIO`, `BrowseTheWebWithProtractor`, or your custom extensions of those classes.


For example, the below custom interaction to `ReloadPage` is **portable**, which means that it works with both `BrowseTheWebWithWebdriverIO` _and_ `BrowseTheWebWithProtractor`:

```typescript
import { Actor, Interaction } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web'

const ReloadPage = () =>
    Interaction.where(`#actor reloads a page`, (actor: Actor) => {
        return BrowseTheWeb.as(actor).reloadPage();
    });
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        If you're into software design patterns, you can think of <code>Actor</code>s as tiny <a href="https://en.wikipedia.org/wiki/Dependency_injection">Dependency Injection Containers</a>. 
    </p>
    </div>
</div>

### Portable `PageElements`

The next significant change is the **removal of `Target` classes** in favour of portable `PageElement` and `PageElements` implementations. Serenity/JS 3 also uses its own tool-agnostic locators.

It will all become more clear with an example.

In [Serenity/JS 2](https://github.com/serenity-js/serenity-js/blob/master/examples/webdriverio-mocha-todomvc/src/todo-list/ui/TodoList.ts) you'd define the elements you want your tests to interact with using syntax similar to the below:

```typescript
import { equals } from '@serenity-js/assertions';
import { Question } from '@serenity-js/core';
import { by, Target, Text } from '@serenity-js/webdriverio';
import { Element } from 'webdriverio';

export class TodoList {
    static newTodoInput =
        Target.the('"What needs to be done?" input box')
            .located(by.css('.new-todo'));

    static editTodoInput =
        Target.the('"What needs to be done?" input box')
            .located(by.css('.todo-list li.editing .edit'));

    static items =
        Target.all('List of Items')
            .located(by.css('.todo-list li'));

    static itemCalled = (name: string): Question<Promise<Element<'async'>>> =>
        TodoList.items
            .where(Text, equals(name))
            .first();
}
```

Note that in the listing above:
- `by` is tool-specific and comes from `@serenity-js/webdriverio`
- `TodoList.itemCalled` is defined as returning `Question<Promise<Element<'async'>>>` with `Element` again being tool-specific and coming from `webdriverio`

Both of the above issues make our code bound to the lower-level test integration tool.

In [Serenity/JS 3](https://github.com/serenity-js/serenity-js/tree/main/examples/webdriverio-mocha-todomvc/src/todo-list/ui) the changes to implementation look relatively small, but have powerful consequences:

```typescript
import { By, PageElement, PageElements, Text } from '@serenity-js/web';
import { includes } from '@serenity-js/assertions';

export class TodoList {
    static newTodoInput =
        PageElement.located(By.css('.new-todo'))
            .describedAs('"What needs to be done?" input box')
    ;

    static editTodoInput =
        PageElement.located(By.css('.todo-list li.editing .edit')).describedAs('edit field');

    static items =
        PageElements.located(By.css('.todo-list li')).describedAs('list of items');

    static itemCalled = (name: string) =>
        TodoList.items
            .where(Text, includes(name))
            .first()
            .describedAs(`item called '${ name }'`);
}
```

To see the new `PageElement` and `PageElements` APIs in action, including using advanced element filters and mapping,
have a look at the [PageElements patterns spec](https://github.com/serenity-js/serenity-js/blob/main/integration/web-specs/spec/screenplay/models/PageElements.patterns.spec.ts).

If you'd like to see a tutorial or screencast on this topic, let us know on Twitter!

<a href="https://twitter.com/@SerenityJS" class="img-link">
    <img src="https://img.shields.io/twitter/follow/SerenityJS?style=social" alt="Follow SerenityJS on Twitter" />
</a>

## Taking Notes

The ability to `TakeNotes`, the question about `Note`, and the interaction to `TakeNote` have been completely re-written to provide better type safety, more flexibility, and to take advantage of the new `QuestionAdapter` APIs.

At the high level, there's a new class that represents the `Notepad`. You can type it to specify what sort of data you're planning to store in it:

```typescript

import { TakeNotes, Note, Notepad } from '@serenity-js/core';

// example interface describing the notes stored in the Notepad
interface MyNotes {
  credentials: {
    username?: string;
    password?: string;
  }
}

actorCalled('Leonard')
  .whoCan(
    TakeNotes.using(Notepad.empty<MyNotes>())
  )
```

You can then record and retrieve notes using `Notepad.notes<T>()`, or a convenient alias - `notes<T>()`, which replaced `Note`:

```typescript
import { Log, Notepad, notes, TakeNotes } from '@serenity-js/core';

actorCalled('Leonard')
  .whoCan(
    TakeNotes.using(Notepad.empty<MyNotes>())
  )
  .attemptsTo(
    notes<MyNotes>().set('credentials', { username: 'leonard@example.org', password: 'P@ssw0rd!' }),
    Log.the(
        notes<MyNotes>().get('credentials').username    // note that `username` is a QuestionAdapter<string>
    ),
  )
```

While you can still initialise the ability to `TakeNotes.usingAnEmptyNotepad()` (which is an alias for `TakeNotes.using(Notepad.empty())`), you can now also provide an initial state:

```typescript
import { Note, Notepad, TakeNotes } from '@serenity-js/core';

actorCalled('Leonard')
  .whoCan(
    TakeNotes.using(
      Notepad.with<MyNotes>({
        credentials: {
          username: 'leonard@example.org', 
          password: 'SuperSecretP@ssword1', 
        }
      })
    )
  )
```

The factory method `TakeNotes.usingASharedNotepad()` has been removed, so if you'd like the actors to share notes, you'll need to give them the same instance of the Notepad to work with:

```typescript
 import { Actor, Cast, Notepad, TakeNotes } from '@serenity-js/core';

 interface AuthCredentials {
     username: string;
     password: string;
 }
 
 interface MyNotes {
     credentials: AuthCredentials;
 }

 export class Actors implements Cast {

     // initialise a shared notepad when the Actors class is initialised
     private readonly sharedNotepad = Notepad.with<MyNotes>({
         credentials: {
             username: 'test-user',
             password: 'SuperSecretP@ssword!',
         }
     });

     prepare(actor: Actor): Actor {
         switch (actor.name) {
           case 'Alice':
           case 'Bob':
               // Alice and Bob should share notes
               return actor.whoCan(TakeNotes.using(this.sharedNotepad));
           default:
               // other actors should have their own notepads
              return actor.whoCan(TakeNotes.using(Notepad.empty<MyNotes>()));
         }
     }
 }
```

Another improvement is that `notes<T>().get(noteName)` now returns a `QuestionAdapter`. The adapter creates a Screenplay Pattern-style proxy around the underlying value, so when you invoke its methods the adapter generates `Interaction`s and `Question`s as needed:

```typescript
import { Log, Notepad, notes, TakeNotes } from '@serenity-js/core';

actorCalled('Leonard')
  .whoCan(
    TakeNotes.using(Notepad.empty<MyNotes>())
  )
  .attemptsTo(
    notes<MyNotes>.set('credentials', { 
        username: 'leonard@example.org',
        password: 'SuperSecretP@ssword1',
    }),
    Log.the(
      notes<MyNotes>().get('credentials') // returns QuestionAdapter<AuthCredentials>
        .username                         // returns QuestionAdapter<string>  
        .toLocaleUpperCase()              // proxies toLocaleUpperCase and generates an Interaction around it
        .charAt(0)                        // proxies charAt and generates a proxy, etc.
    ), // emits "L"
  )
```

### Using an untyped Notepad

If you don't want to use the typed notepad in the first steps of your migration, you can still use an untyped version:

```typescript
 import { Actor, Cast, Notepad, TakeNotes } from '@serenity-js/core';

 export class Actors implements Cast {

     // initialise an empty shared notepad when the Actors class is initialised
     private readonly sharedNotepad = Notepad.empty();

     prepare(actor: Actor): Actor {
         switch (actor.name) {
           case 'Alice':
           case 'Bob':
               // Alice and Bob should share notes
               return actor.whoCan(TakeNotes.using(this.sharedNotepad));
           default:
               // other actors should have their own notepads
              return actor.whoCan(TakeNotes.using(Notepad.empty()));
         }
     }
 }
```

You can then record and retrieve notes using your subject of choice, defined using a `string`:

```typescript
import { Log, Note } from '@serenity-js/core';

actorCalled('Alice')
  .attemptsTo(
    notes().set('shopping list item', 'milk'),
    Log.the(
      notes().get('shopping list item')
    ),
  )
```

The untyped flavour gives you access to `QuestionAdapter`s just like the typed version, however your text editor might not be able to provide you with as much support as it would if your notepad had been typed.

## Waiting

In Serenity/JS 2, interactions to `Wait.for` and `Wait.until` relied on browser-specific wait APIs, such as Protractor [`wait`](https://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.wait) or WebdriverIO [`waitUntil`](https://webdriver.io/docs/api/browser/waitUntil/).
Since the interactions were specific to browser integration tools, they'd also come as part of `@serenity-js/protractor` or `@serenity-js/webdriverio` modules.

In Serenity/JS 3, interactions to `Wait` **don't rely on any browser integration tool** and are, in fact, completely browser-independent.
What this means in practice is that you can use `Wait` for both browser and API tests.

Since `Wait` is no longer tied to the browser, it's also been moved to `@serenity-js/core`:

```diff
import { actorCalled, Duration } from '@serenity-js/core';
- import { Wait } from '@serenity-js/protractor';
- import { Wait } from '@serenity-js/webdriverio';
+ import { Wait } from '@serenity-js/core';

actorCalled('Alice').attemptsTo(
    Wait.for(Duration.ofSeconds(1)),
    
    Wait.until(someQuestion, someExpectation)
        .pollingEvery(Duration.ofMilliseconds(10)),
    
    Wait.upTo(Duration.ofSeconds(5)
        .until(someQuestion, someExpectation)
        .pollingEvery(Duration.ofMilliseconds(10)),
)
```

Additionally, `Wait.until` has also received a new API allowing you to configure its polling interval (500ms by default):

```typescript
import { actorCalled, Duration, Wait } from '@serenity-js/core';

actorCalled('Alice').attemptsTo(
    Wait.until(someQuestion, someExpectation)
        .pollingEvery(Duration.ofMilliseconds(10)),
)
```

## `@serenity-js/assertions`

### `property` removed

`property` helper function has been removed since it's no longer needed.

`QuestionAdapter`, returned by `Question.about` creates a `Proxy` object around the returned value, which allows for methods and properties of the underlying object to be invoked on the `QuestionAdapter` itself, and the results of the invocation automatically converted into `Question` or `Interaction` so that they're compatible with other Serenity/JS interfaces.

```typescript
const User = () =>
  Question.about('user', actor => {
    // Question.about can return a static value or a Promise<value>,
    // QuestionAdapter is compatible with both.
    return Promise.resolve({
      handle: '@jan-molak',
    });
  }
```

```diff
import { actorCalled } from '@serenity-js/core';
- import { Ensure, equals, property } from '@serenity-js/assertions';
+ import { Ensure, equals } from '@serenity-js/assertions';

actorCalled('Alice').attemptsTo
-  Ensure.that(User(), property('handle', equals('@jan-molak')))
+  Ensure.that(User().handle, equals('@jan-molak'))
)
```

`QuestionAdapter` also creates a `Proxy` object around the returned value, allowing for the properties and methods of the returned value to be invoked on the `QuestionAdapter` itself, and their return values to be wrapped in `Interaction` or `Question` automatically so that they're compatible with other Serenity/JS interfaces.

For example:

```
Ensure.that(User().toUpperCase().slice(1, 4), equals('JAN'))
```

## `@serenity-js/rest`

### `Answerable<WithAnswerableProperties<AxiosRequestConfig>>` in HTTP requests

All HTTP requests now accept `Answerable<WithAnswerableProperties<AxiosRequestConfig>>`, which means you can now specify additional
HTTP request configuration using a configuration object with nested `Question`s, `QuestionAdapter`s and `Promise`s.

For example:

```typescript
import { actorCalled } from '@serenity-js/core';
import { Send, PostRequest } from '@serenity-js/rest';

actorCalled('René').attemptsTo(
    Send.a(
        PostRequest.to('/products/2')
            .with({ name: 'apple' })
            .using({
                headers: {
                    Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`, 
                },
            })
    )
);

/*
 sends a request with:
 
    headers: {
        Authorization: 'Bearer some-token',
    },
 */
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <p><strong>PRO TIP:</strong>
            The code sample above uses <a href="/modules/core/function/index.html#static-function-q"><code>q</code></a>, 
    a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates">tagged template</a> 
    function converting a `string` template parameterised with <code>Question&lt;string | number&gt;</code> into a <code>QuestionAdapter&lt;string&gt;</code>. Useful when you need to quickly concatenate <code>string</code>`s and <code>Question&lt;string&gt;</code>
        </p>
    </div>
</div>

## `@serenity-js/core`

### Screenplay-style dictionaries with `Question.fromObject`

A new Screenplay-style data structure, `Answerable<WithAnswerableProperties<Source_Type>>` will help you convert
and merge plain JavaScript objects with nested [`Answerable`s](/modules/core/typedef/index.html#static-typedef-Answerable%3CT%3E) into a `QuestionAdapter<T>`.

For example:

```typescript

import { actorCalled } from '@serenity-js/core';
import { Send, PostRequest } from '@serenity-js/rest';

interface AddProductRequestData {
    name:       string;
    quantity:   number;
}

actorCalled('René').attemptsTo(
    Send.a(
        PostRequest.to('/products')
            .with(
                Question.fromObject<AddProductRequestData>({
                    name:       Text.of(someElement),
                    quantity:   Text.of(someOtherElement).as(Number)
                })
            )
    )
);
```

To merge several objects, pass them to `Question.fromObject` as per the example below:

```typescript
Question.fromObject<AddProductRequestData>(  
    // initial values
    { name: 'unknown', quantity: 0 },
    // overrides
    { name: Text.of(someElement) },
    // other overrides
    { quantity: Text.of(someOtherElement).as(Number) },    
)
```

Note that in the above code sample, the first object contains values for all the fields
required by `AddProductRequestData` interface.

If not all the fields are required, make sure to mark them
as [optional](https://www.typescriptlang.org/docs/handbook/interfaces.html#optional-properties).

For example:

```typescript
interface AddProductRequestData {
    name:       string;
    quantity?:  number; // optional
}
```

## More coming soon!

<div class="pro-tip">
    <div class="icon"><i class="fab fa-github"></i></div>
    <div class="text">
        <p> 
            More content is coming soon, so please follow Serenity/JS on Twitter to stay up to date!
            <a href="https://twitter.com/@SerenityJS" class="img-link">
                <img src="https://img.shields.io/twitter/follow/SerenityJS?style=social" alt="Follow SerenityJS on Twitter" />
            </a>
        </p>
        <p>
            If you find our work useful and want to keep the new features coming, become a Serenity/JS GitHub Sponsor today!
        </p>
        <p>
            <a class="github-button" href="https://github.com/sponsors/serenity-js" data-icon="octicon-heart" data-size="large" aria-label="Sponsor Serenity/JS on GitHub">Sponsor</a></p>
        </p>
    </div>
</div>



TODO:
- add note on Website.url() -> Page.current().url()
