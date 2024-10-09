import {grammars} from "ohm-js";
import {lbttGrammarContents} from './lbtt-ohm.js'

const g = grammars(lbttGrammarContents).LBTT;
const semantics = g.createSemantics();

semantics.addOperation('toLBTT', {
  Automaton(numStates, condSpecifier, states) {
    const ns = numStates.toLBTT();
    const cs = condSpecifier.toLBTT();
    const st = states.toLBTT();
    return ({
      type: 'Automaton',
      numStates: ns,
      condSpecifier: cs,
      states: st,
    });
  },
  TransitionList(transitions,_) {
    return transitions.toLBTT();
  },
  Transition(stateId, condList, guardFormula) {
    const id = stateId.toLBTT();
    const co = condList.toLBTT();
    const g = guardFormula.toLBTT();
    return ({
      stateId: id,
      condList: co.length ? co[0] : null,
      guardFormula: g,
    });
  },
  accCondId(digits) {
    const d = digits.toLBTT();
    return d.flatMap(x=>x).join();
  },
  stateId(digits) {
    const d = digits.toLBTT();
    return d.join();
  },
  initial(val) {
    let v = val.toLBTT();
    return v === "1";
  },
  CondList(accCondId, _) {
    let i = accCondId.toLBTT();
    return i;
  },
  State(stateId, initial, condList, transitionList) {
    const id = stateId.toLBTT();
    const ini = initial.toLBTT();
    const co = condList.toLBTT();
    const tr = transitionList.toLBTT();
    return ({
      stateId: id,
      initial: ini,
      condList: co.length ? co[0] : null,
      transitionList: tr,
    });
  },
  GuardFormula(val) {
    const v = val.toLBTT();
    return v;
  },
  constant(val) {
    const v = val.toLBTT();
    return ({
      constant: v === 't',
    })
  },
  atomicProposition(_, val, __) {
    const v = val.toLBTT();
    return ({
      atomic: v.flatMap(x=>x).join(),
    })
  },
  GuardFormulaNot(_, sub) {
    const a = sub1.toLBTT();
    return ({
      op: 'NOT',
      a,
    });
  },
  GuardFormulaAnd(_, sub1, sub2) {
    const a = sub1.toLBTT();
    const b = sub2.toLBTT();
    return ({
      op: 'AND',
      a,
      b,
    });
  },
  GuardFormulaOr(_, sub1, sub2) {
    const a = sub1.toLBTT();
    const b = sub2.toLBTT();
    return ({
      op: 'OR',
      a,
      b,
    });
  },
  GuardFormulaXor(_, sub1, sub2) {
    const a = sub1.toLBTT();
    const b = sub2.toLBTT();
    return ({
      op: 'XOR',
      a,
      b,
    });
  },
  GuardFormulaImpl(_, sub1, sub2) {
    const a = sub1.toLBTT();
    const b = sub2.toLBTT();
    return ({
      op: 'IMPL',
      a,
      b,
    });
  },
  GuardFormulaEquiv(_, sub1, sub2) {
    const a = sub1.toLBTT();
    const b = sub2.toLBTT();
    return ({
      op: 'EQUIV',
      a,
      b,
    });
  },
  numStates(val) {
    let v = val.toLBTT();
    return +v.join();
  },
  condSpecifier(a, b) {
    return ({});
  },
  _iter(...children) {
    return children.map(x => x.toLBTT());
  },
  _nonterminal(...children) {
    return children.map(x => x.toLBTT());
  },
  _terminal() {
    return this.sourceString;
  },
});
export function parseAutomaton(input) {
  let matchResult = g.match(input);

  if (matchResult.failed()) {
    return ({
      error: matchResult.message
    });
  } else {
    let dict = semantics(matchResult);
    const lbtt = dict['toLBTT'].apply(dict); // const lbtt = dict.toLBTT();
    return ({
      lbtt,
    });
  }
}

export function createAutomatonState(automaton, that) {
  let lbtt = automaton.lbtt;
  let foundInitial = lbtt.states.find(s => s.initial);
  if (foundInitial) {
    return ({
      lbtt,
      that,
      currentState: foundInitial?.stateId,
      isAccepting: foundInitial.condList?.length > 0,
    });
  } else {
    return null;
  }
}

function evalGuard(guard, that, propositionCache) {
  if(guard.constant) {
    return guard.constant;
  } else if(guard.atomic) {
    if(propositionCache.hasOwnProperty(guard.atomic)) {
      return propositionCache[guard.atomic];
    } else {
      let val = !!that[guard.atomic].call(that);
      propositionCache[guard.atomic] = val;
      return val;
    }
  } else if(guard.op === 'NOT') {
    let val = evalGuard(guard.a, that, propositionCache);
    return !val;
  } else {
    let val1 = evalGuard(guard.a, that, propositionCache);
    let val2 = evalGuard(guard.b, that, propositionCache);
    let op = guard.op;
    switch (op) {
      case 'AND': return val1 && val2;
      case 'OR': return val1 || val2;
      case 'XOR': return val1 !== val2;
      case 'IMPL': return !val1 || val2;
      case 'EQUIV': return val1 === val2;
    }
  }
}

export function tick(automatonState) {
  let foundState = automatonState.lbtt.states.find(s => s.stateId === automatonState.currentState);
  if(foundState) {
    const propositionCache = {};
    let transitionList = foundState.transitionList;
    let foundTransition = transitionList.find(t => evalGuard(t.guardFormula, automatonState.that, propositionCache));
    if (foundTransition) { //todo if transition has acceptance conditions, mark as accepting
      let stateId = foundTransition.stateId;
      automatonState.currentState = stateId;
      let foundNewState = automatonState.lbtt.states.find(s => s.stateId === automatonState.currentState);
      automatonState.isAccepting = foundNewState.condList?.length > 0;
      return ({
        transitionTo: stateId,
        propositionCache,
      });
    }
  }
  return null;
}
