import { ContractAction, ContractState, ContractResult } from '../../types/types';

declare const ContractError;

export const write = async (
  state: ContractState,
  { caller, input: { content } }: ContractAction
): Promise<ContractResult> => {
  const id = state.messages.length == 0 ? 1 : state.messages.length + 1;

  if (!content) {
    throw new ContractError(`Creator must provide a message.`);
  }

  if (content.length > 280) {
    throw new ContractError(`Message too long.`);
  }

  if (state['messages'].length == 500) {
    state['messages'].shift();
    state['messages'].forEach((m) => (m.id = m.id - 1));
  }

  state['messages'].push({
    id,
    creator: caller,
    content,
    timestamp: Date.now().toString(),
  });

  return { state };
};
