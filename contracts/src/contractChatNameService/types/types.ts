export interface ContractState {
  names: {
    [creator: string]: string;
  };
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
  creator: string;
}

export type ContractFunction = 'registerName' | 'getName';

export type ContractResult = { state: ContractState } | { result: ContractReadResult };
