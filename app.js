const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const instance = express();
instance.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let dbConnectionObject = null;
const connectDBAnServer = async () => {
  try {
    dbConnectionObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    instance.listen("3000", (request, response) => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    Console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

connectDBAnServer();
function convertDbObjectToResponse(obj) {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
}
//API 1
instance.get("/players/", async (request, response) => {
  const playerQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await dbConnectionObject.all(playerQuery);
  response.send(
    playersArray.map((eachArray) => convertDbObjectToResponse(eachArray))
  );
});

//API 2
instance.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playerQuery = `INSERT INTO  cricket_team (player_name,jersey_number,role) VALUES ("${playerName}",${jerseyNumber},"${role}");`;
  const playerArray = await dbConnectionObject.run(playerQuery);
  const playerId = playerArray.lastID;
  response.send(`Player Added to Team`);
});

//API 3
instance.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `SELECT * FROM cricket_team where player_id = ${playerId};`;
  const player = await dbConnectionObject.get(playerQuery);
  response.send(convertDbObjectToResponse(player));
});

//API 4
instance.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playerQuery = `UPDATE cricket_team SET player_name = "${playerName}",jersey_number = ${jerseyNumber},
    role = "${role}" WHERE player_id = ${playerId};`;
  await dbConnectionObject.run(playerQuery);
  response.send("Player Details Updated");
});

//API 5

instance.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team where player_id = ${playerId};`;
  await dbConnectionObject.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = instance;
