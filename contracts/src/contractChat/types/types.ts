export interface ContractState {
  messages: Message[];
  owner: string;
  evolve: string;
}

export interface Message {
  id: number;
  creator: string;
  content: string;
  timestamp: string;
}

export interface ContractAction {
  input: ContractInput;
  caller: string;
}

export interface ContractInput {
  function: ContractFunction;
  content: string;
  value: string;
}

export type ContractFunction = 'write' | 'evolve';

export type ContractResult = { state: ContractState };
