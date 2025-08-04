const SERVER_URL = "http://IP_SERWERA:3000";

const api = async (path: string, body?: object) => {
  if (!body) {
    return await fetch(SERVER_URL + path, {
      method: "GET",
    });
  }

  return await fetch(SERVER_URL + path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const revokeKey = async () => {
  await fetch(SERVER_URL + "/key", {
    method: "DELETE",
  });
};

api.revokeKey = revokeKey;

export default api;
