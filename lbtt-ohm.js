export const lbttGrammarContents = `LBTT {
Automaton = numStates condSpecifier State+

numStates = digit+

condSpecifier = digit+ ("s" | "t")*

State = stateId initial CondList TransitionList

CondList = (accCondId*  "-1")?

stateId = digit+

accCondId = digit+

initial = "0" | "1"

TransitionList = Transition+ "-1"

Transition = stateId CondList GuardFormula

GuardFormula = 
   constant
 | atomicProposition
 | GuardFormulaNot
 | GuardFormulaAnd
 | GuardFormulaOr
 | GuardFormulaXor
 | GuardFormulaImpl
 | GuardFormulaEquiv

constant = 
   "t"
 | "f"

GuardFormulaNot =  "!" GuardFormula

GuardFormulaAnd = "&" GuardFormula GuardFormula

GuardFormulaOr = "|" GuardFormula GuardFormula

GuardFormulaXor = "^" GuardFormula GuardFormula

GuardFormulaImpl = "i" GuardFormula GuardFormula

GuardFormulaEquiv = "e" GuardFormula GuardFormula

atomicProposition = "\\"" alnum+ "\\""

}`;
