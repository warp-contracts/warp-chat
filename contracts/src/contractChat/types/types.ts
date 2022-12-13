export interface ContractState {
  messages: Message[];
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
}

export type ContractFunction = 'write';

export type ContractResult = { state: ContractState };
