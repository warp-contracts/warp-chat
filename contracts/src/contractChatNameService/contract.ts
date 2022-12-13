import { ContractAction, ContractResult, ContractState } from './types/types';
import { registerName } from './actions/write/registerName';
import { getName } from './actions/read/getName';

declare const ContractError;

export async function handle(state: ContractState, action: ContractAction): Promise<ContractResult> {
  const input = action.input;

  switch (input.function) {
    case 'registerName':
      return await registerName(state, action);
    case 'getName':
      return await getName(state, action);
    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
  }
}
