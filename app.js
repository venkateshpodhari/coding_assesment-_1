var format = require("date-fns/format");
var isValid = require("date-fns/isValid");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertSToC = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};
const check = (query) => {
  let int = parseInt(query.due_date);
  return isValid(int);
};
//getting todo whose status is todo

const isContainStatusProperty = (query) => {
  return query.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  const { status, search_q = "", priority } = request.query;
  let data = null;
  let queryResult = "";
  let dbValue = "";
  switch (true) {
    case isContainStatusProperty(request.query):
      queryResult = `SELECT * FROM todo WHERE status ='${status}' `;
      dbValue = "Status";

      break;
    // case isContainPriorityProperties(request.query):
    //   queryResult = `SELECT * FROM todo WHERE priority = '${priority}'`;
    //   isTrue = priority;

    default:
      break;
  }
  const dbResponse = await db.all(queryResult);
  if (dbResponse === undefined) {
    response.status(400);
    response.send(`Invalid Todo ${dbValue}`);
  } else {
    const camelCase = [];
    const result = dbResponse.map((eachId) => {
      let update = convertSToC(eachId);
      camelCase.push(update);
    });
    response.send(camelCase);
    console.log(dbResponse == unfined);
  }
});
