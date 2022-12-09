import { ContractAction, ContractResult, ContractState } from './types/types';
import { write } from '../contracts/actions/write/write';

declare const ContractError;

export async function handle(state: ContractState, action: ContractAction): Promise<ContractResult> {
  const input = action.input;

  switch (input.function) {
    case 'write':
      return await write(state, action);
    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
  }
}
