// src/contractChat/actions/write/write.ts
var write = async (state, { caller, input: { content } }) => {
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
    content: 'Evolve',
    timestamp: Date.now().toString(),
  });
  return { state };
};

// src/contractChat/contract.ts
async function handle(state, action) {
  const input = action.input;
  switch (input.function) {
    case 'write':
      return await write(state, action);
    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
  }
}
