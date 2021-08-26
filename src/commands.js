function commands(message, server, command, playersNumber, playersMax) {
  if (command === "server") {
    if (server.isOnline) {
      message.channel.send("server is online");
    } else if (server.isLoading) {
      message.channel.send("server is loading");
    } else {
      message.channel.send("server is offline");
    }
  }

  if (command === "players") {
    if (!server.isOnline) {
      message.channel.send("server is offline, so 0 players duh!");
    } else {
      message.channel.send(`${playersNumber} online, ${playersMax} max`);
    }
  }

 
  if (command == "treat") {
    message.channel.send(":couplekiss:");
  }
}

module.exports = {
  commands,
};
