const client_notif = {
  local: {},
  connect: () => {
    if (!isEditor) {
      const url = baseurl("");
      const ws = new WebSocket(url);

      ws.onopen = () => {
        ws.send(JSON.stringify({ user_id: "123123", type: "subscribe" }));
      };
      ws.onmessage = () => {};
    }
  },
};
