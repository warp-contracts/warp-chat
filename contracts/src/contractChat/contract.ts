import { ContractAction, ContractResult, ContractState } from './types/types';
import { write } from './actions/write/write';
import { evolve } from './actions/write/evolve';

declare const ContractError;

export async function handle(state: ContractState, action: ContractAction): Promise<ContractResult> {
  const input = action.input;

  switch (input.function) {
    case 'write':
      return await write(state, action);
      case 'evolve':
        return await evolve(state, action);
    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
  }
}
