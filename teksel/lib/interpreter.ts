import { FunctionDefinition } from "./statements";


class Scope {
  nestedScope: Scope | undefined;
  parentScope: Scope;
  variables: Map<string, any>;

  constructor(variables: Map<string, any>, parentScope: Scope) {
    this.variables = new Map(variables);
    this.parentScope = parentScope;
  }

  createNestedScope(variables: Map<string, any>): Scope {
    const newScope = new Scope(variables, this);
    this.nestedScope = newScope;
    return newScope;
  }

  getVariable(name: string): any {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }
    if (this.parentScope !== undefined) {
      const variable = this.parentScope.getVariable(name);
      if (variable !== null) {
        return variable;
      }
    }
    return null;
  }
}

export class Interpreter {
}
