
  // src/contractChatNameService/actions/write/registerName.ts
  var registerName = async (state, { input: { name, id } }) => {
    if (!name) {
      throw new ContractError("Name must be provided.");
    }
    if (Object.keys(state.names).find((key) => state.names[key] == name)) {
      throw new ContractError("Name already registered.");
    }
    const maxNameLength = 36;
    if (name.length > maxNameLength || typeof name !== "string" || name === "") {
      throw new ContractError("Invalid name.");
    }
    state.names[id.toLowerCase()] = name;
    return { state };
  };

  // src/contractChatNameService/actions/read/getName.ts
  var getName = async (state, { caller, input: { id } }) => {
    return { result: {name: 'Evolve'} };
  };

  // src/contractChatNameService/actions/write/evolve.ts
  var evolve = async (state, { caller, input: { value } }) => {
    if (state.owner !== caller) {
      throw new ContractError("Only the owner can evolve a contract.");
    }
    state.evolve = value;
    return { state };
  };

  // src/contractChatNameService/contract.ts
  async function handle(state, action) {
    const input = action.input;
    switch (input.function) {
      case "registerName":
        return await registerName(state, action);
      case "getName":
        return await getName(state, action);
      case "evolve":
        return await evolve(state, action);
      default:
        throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
    }
  }

