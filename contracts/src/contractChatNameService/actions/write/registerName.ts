import { ContractAction, ContractState, ContractResult } from '../../types/types';

declare const ContractError;

export const registerName = async (
  state: ContractState,
  { caller, input: { name } }: ContractAction
): Promise<ContractResult> => {
  if (!name) {
    throw new ContractError('Name must be provided.');
  }

  if (Object.keys(state.names).find((key) => state.names[key] == name)) {
    throw new ContractError('Name already registered.');
  }

  const maxNameLength = 36;
  if (name.length > maxNameLength || typeof name !== 'string' || name === '') {
    throw new ContractError('Invalid name.');
  }

  state.names[caller.toLowerCase()] = name;

  return { state };
};
