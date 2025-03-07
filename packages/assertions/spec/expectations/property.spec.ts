import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { Ensure, equals, property } from '../../src';

interface Person {
    name: string;
    age?: number;
}

describe('hasProperty', () => {

    const Alice: Person = {
        name: 'Alice',
        age: 27,
    }

    it('allows for the actor flow to continue when the "actual" has a property that meets the expectation', () => {
        return expect(
            actorCalled('Astrid').attemptsTo(
                Ensure.that(Alice, property('name', equals('Alice'))),
            )
        ).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" does not have a property that meets the expectation', () => {
        return expect(
            actorCalled('Astrid').attemptsTo(
                Ensure.that(Alice, property('name', equals('Bob'))),
            )
        ).to.be.rejectedWith(AssertionError, `{"name":"Alice","age":27} to have property name that does equal 'Bob'`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal('Bob');
                expect(error.actual).to.deep.equal({ name: 'Alice', age: 27 });
            });
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(Alice, property('name', equals('Alice'))).toString())
            .to.equal(`#actor ensures that {"name":"Alice","age":27} does have property name that does equal 'Alice'`);
    });
});
