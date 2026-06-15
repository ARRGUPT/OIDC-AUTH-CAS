export const clients = [
  {
    clientId: "trush-blog",
    clientSecret: "trush-blog-secret",
    redirectUris: ["http://localhost:3000/callback"],
  },
];

export const findClient = (clientId) => {
  return clients.find((client) => client.clientId === clientId);
};