import { ContractAction, ContractState, ContractResult } from '../../types/types';

declare const ContractError;

export const getName = async (
  state: ContractState,
  { input: { id } }: ContractAction
): Promise<ContractResult> => {
  if (!id) {
    throw new ContractError('Id must be provided.');
  }

  if (Object.keys(state.names).indexOf(id.toLowerCase()) == -1) {
    throw new ContractError('Id has no name assigned.');
  }

  const name = state.names[id.toLowerCase()];
  return { result: { name } };
};
