import { ContractAction, ContractState, ContractResult } from '../../types/types';

declare const ContractError;

export const getName = async (
  state: ContractState,
  { caller, input: { creator } }: ContractAction
): Promise<ContractResult> => {
  if (!creator) {
    throw new ContractError('Creator is must be provided.');
  }

  if (Object.keys(state.names).indexOf(creator) == -1) {
    throw new ContractError('Creator has no name assigned.');
  }

  const name = state.names[caller];
  return { result: { name } };
};
