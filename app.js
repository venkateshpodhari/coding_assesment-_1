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

const containCategoryAndStatus = (db) => {
  return db.status !== undefined && db.category !== undefined;
};

const hasCategoryAndPriority = (db) => {
  return db.category !== undefined && db.priority !== undefined;
};

const hasPriorityAndStatus = (db) => {
  return db.priority !== undefined && db.status !== undefined;
};

const hasCategory = (db) => {
  return db.category !== undefined;
};
const hasStatus = (db) => {
  return db.status !== undefined;
};

const hasPriority = (db) => {
  return db.priority !== undefined;
};

const hasSearch_q = (db) => {
  return db.search_q !== undefined;
};
//getting todo api 1
app.get("/todos/", async (request, response) => {
  const requestQuery = request.query;
  let query = "";
  let data = null;
  const { status, search_q = "", priority, category } = request.query;

  switch (true) {
    case containCategoryAndStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING"
        ) {
          query = `SELECT * FROM todo WHERE status = '${status}' 
                            AND category= '${category}'`;
          data = await db.all(query);
          response.send(data.map((eachTodo) => convertSToC(eachTodo)));
        } else {
          response.status(400);
          response.send("Invalid Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Status");
      }

      break;
    case hasCategoryAndPriority(request.query):
      if (
        category === "LEARNING" ||
        category === "WORK" ||
        category === "HOME"
      ) {
        if (
          priority === "HIGH" ||
          priority === "LOW" ||
          priority === "MEDIUM"
        ) {
          query = `SELECT * FROM 
          todo 
          WHERE priority = '${priority}' 
          AND category ='${category}';`;
          data = await db.all(query);
          response.send(data.map((eachTodo) => convertSToC(eachTodo)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasPriorityAndStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          priority === "HIGH" ||
          priority === "LOW" ||
          priority === "MEDIUM"
        ) {
          query = `SELECT * FROM 
          todo 
          WHERE priority = '${priority}' 
          AND status ='${status}';`;
          data = await db.all(query);
          response.send(data.map((eachTodo) => convertSToC(eachTodo)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `SELECT * FROM 
          todo 
          WHERE status ='${status}';`;
        data = await db.all(query);
        response.send(data.map((eachTodo) => convertSToC(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        query = `SELECT * FROM 
          todo 
          WHERE priority = '${priority}';`;
        data = await db.all(query);
        response.send(data.map((eachTodo) => convertSToC(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategory(request.query):
      if (
        category === "LEARNING" ||
        category === "WORK" ||
        category === "HOME"
      ) {
        query = `SELECT * FROM todo WHERE category = '${category}';`;
        data = await db.all(query);
        response.send(data.map((eachTodo) => convertSToC(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasSearch_q(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      data = await db.all(query);
      response.send(data.map((eachTodo) => convertSToC(eachTodo)));

      break;
    default:
      query = `SELECT * FROM todo`;
      data = await db.all(query);
      response.send(data.map((eachTodo) => convertSToC(eachTodo)));
      break;
  }
});
//get todo based on id

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const QueryResult = `SELECT * FROM todo WHERE id = ${todoId};;`;
  const dbResponse = await db.get(QueryResult);
  response.send(convertSToC(dbResponse));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isValid(new Date(date), "yyy-MM-dd")) {
    const newDate = format(new Date(date), "yyy-MM-dd");

    const queryResult = `SELECT * FROM todo WHERE due_date= '${newDate}';`;
    const dbResponse = await db.all(queryResult);
    response.send(dbResponse.map((eachDate) => convertSToC(eachDate)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//creating todo in todo table
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    if (priority === "MEDIUM" || priority === "HIGH" || priority === "LOW") {
      if (
        category === "LEARNING" ||
        category === "WORK" ||
        category === "HOME"
      ) {
        if (isValid(new Date(dueDate), "yyy-MM-dd")) {
          const newDate = format(new Date(dueDate), "yyy-MM-dd");
          const createTodo = `INSERT INTO todo(id,todo,priority,status,category,due_date)
                            VALUES (${id},'${todo}','${priority}','${status}','${category}','${newDate}');`;
          await db.run(createTodo);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

//updating todo based on id
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;

  const getQuery = `SELECT * FROM todo WHERE id =${todoId};`;
  const PreviousTodo = await db.get(getQuery);
  const {
    id = PreviousTodo.id,
    status = PreviousTodo.status,
    priority = PreviousTodo.priority,
    category = PreviousTodo.category,
    dueDate = PreviousTodo.due_date,
    todo = PreviousTodo.todo,
  } = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const updateTodo = `UPDATE todo
                SET id = ${id},
                    todo ='${todo}',
                    priority ='${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        const dbResponse = await db.run(updateTodo);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const updateTodo = `UPDATE todo
                SET id = ${id},
                    todo ='${todo}',
                    priority ='${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        const dbResponse = await db.run(updateTodo);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      const updateTodo = `UPDATE todo
                SET id = ${id},
                    todo ='${todo}',
                    priority ='${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
      const dbResponse = await db.run(updateTodo);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "LEARNING" ||
        category === "WORK" ||
        category === "HOME"
      ) {
        const updateTodo = `UPDATE todo
                SET id = ${id},
                    todo ='${todo}',
                    priority ='${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        const dbResponse = await db.run(updateTodo);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isValid(new Date(dueDate), "yyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyy-MM-dd");
        const updateTodo = `UPDATE todo
                SET id = ${id},
                    todo ='${todo}',
                    priority ='${priority}',
                    status = '${status}',
                    category = '${category}',
                    due_date = '${newDueDate}'
                    WHERE id = ${todoId};`;
        const dbResponse = await db.run(updateTodo);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//delete todo based on id
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
