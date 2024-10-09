import {expect} from 'chai';

import {createAutomatonState, parseAutomaton, tick} from '../index.js';

describe('The library', () => {
let input = `2 1
0 1 -1
0 "a"
1 "b"
-1
1 0 0 -1
1 "b"
-1
`;

  it('does not parse a malforned automaton', () => {
    let automaton = parseAutomaton('whatever');
    expect(automaton.error).to.exist;
  });

  it('can parse an automaton', () => {
    let automaton = parseAutomaton(input);
    expect(automaton.lbtt).to.exist;
    expect(automaton.lbtt.numStates).to.equal(2);

    let state = createAutomatonState(automaton);
    expect(state).to.exist;
    expect(state.currentState).to.equal("0");
  });

  it('can traverse an automaton', () => {
    const automaton = parseAutomaton(input);
    expect(automaton.lbtt).to.exist;

    const obj = {
      a_: true,
      b_: false,
      a() { return obj.a_; },
      b() { return obj.b_; },
    };
    const state = createAutomatonState(automaton, obj);
    const tock1 = tick(state);
    expect(tock1.transitionTo).to.equal("0")
    expect(state.currentState).to.equal("0");
    obj.a_ = false;
    obj.b_ = true;
    const tock2 = tick(state);
    expect(tock2.transitionTo).to.equal("1")
    expect(state.currentState).to.equal("1");
  });

  it('can fail to traverse an automaton', () => {
    const automaton = parseAutomaton(input);
    expect(automaton.lbtt).to.exist;

    const obj = {
      a_: true,
      b_: false,
      a() { return obj.a_; },
      b() { return obj.b_; },
    };
    const state = createAutomatonState(automaton, obj);
    const tock1 = tick(state);
    expect(tock1.transitionTo).to.equal("0")
    expect(state.currentState).to.equal("0");
    obj.a_ = false;
    obj.b_ = true;
    const tock2 = tick(state);
    expect(tock2.transitionTo).to.equal("1")
    expect(state.currentState).to.equal("1");
    obj.a_ = true;
    obj.b_ = false;
    const tock3 = tick(state);
    expect(tock3).to.not.exist;
  });

  it('can reject the ω-word if the final state is not accepting', () => {
    let automaton = parseAutomaton(input);
    expect(automaton.lbtt).to.exist;

    const obj = {
      a_: true,
      b_: false,
      a() { return obj.a_; },
      b() { return obj.b_; },
    };
    let state = createAutomatonState(automaton, obj);
    let tock1 = tick(state);
    expect(state.isAccepting).to.equal(false);
  });

  it('can accept the ω-word if the final state is accepting', () => {
    let automaton = parseAutomaton(input);
    expect(automaton.lbtt).to.exist;

    const obj = {
      a_: true,
      b_: false,
      a() { return obj.a_; },
      b() { return obj.b_; },
    };
    let state = createAutomatonState(automaton, obj);
    let tock1 = tick(state);
    obj.a_ = false;
    obj.b_ = true;
    let tock2 = tick(state);
    expect(state.isAccepting).to.equal(true);
  });
});
