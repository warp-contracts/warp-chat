export interface ContractState {
  names: {
    [id: string]: string;
  };
  owner: string;
  evolve: string;
}

export interface ContractAction {
  input: ContractInput;
  caller: string;
}

export interface ContractReadResult {
  name: string;
}

export interface ContractInput {
  function: ContractFunction;
  name: string;
  id: string;
  value: string;
}

export type ContractFunction = 'registerName' | 'getName' | 'evolve';

export type ContractResult = { state: ContractState } | { result: ContractReadResult };
