import Client from "./client.model.js";

export const findClient = async (clientId) => {
  return await Client.findOne({
    clientId,
    isActive: true,
  });
};
