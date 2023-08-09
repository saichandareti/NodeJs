const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const connectDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
connectDbAndServer();

//API-1
const hasPriAndStProperties = (object) => {
  return object.priority !== undefined && object.status !== undefined;
};
const hasStAndCatProperties = (object) => {
  return object.status !== undefined && object.category !== undefined;
};
const hasPriAndCatProperties = (object) => {
  return object.priority !== undefined && object.category !== undefined;
};
const hasPriProperty = (object) => {
  return object.priority !== undefined;
};
const hasStaProperty = (object) => {
  return object.status !== undefined;
};
const hasCatProperty = (object) => {
  return object.category !== undefined;
};
const hasSearchProperty = (object) => {
  return object.search_q !== undefined;
};

const outPutResu = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";

  const todoDetails = request.query;
  const {
    search_q = "",
    todo,
    priority,
    status,
    category,
    due_date,
  } = todoDetails;
  switch (true) {
    case hasPriAndStProperties(todoDetails):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}'`;
          data = await db.all(getTodoQuery);
          response.send(data.map((eachItem) => outPutResu(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasPriAndCatProperties(todoDetails):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE  priority = '${priority}' AND category = '${category}'`;
          data = await db.all(getTodoQuery);
          response.send(data.map((eachItem) => outPutResu(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasStAndCatProperties(todoDetails):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          status === "DONE" ||
          status === "IN PROGRESS" ||
          status === "TO DO"
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE status = '${status}' AND category = '${category}'`;
          data = await db.all(getTodoQuery);
          response.send(data.map((eachItem) => outPutResu(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriProperty(todoDetails):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQuery = `SELECT * FROM todo WHERE  priority='${priority}'`;
        data = await db.all(getTodoQuery);
        response.send(data.map((eachItem) => outPutResu(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStaProperty(todoDetails):
      console.log(status);
      if (status === "IN PROGRESS" || status === "TO DO" || status === "DONE") {
        getTodoQuery = `SELECT * FROM todo WHERE  status='${status}'`;
        data = await db.all(getTodoQuery);
        response.send(data.map((eachItem) => outPutResu(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    case hasCatProperty(todoDetails):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodoQuery = `SELECT * FROM todo WHERE  category='${category}'`;
        data = await db.all(getTodoQuery);
        response.send(data.map((eachItem) => outPutResu(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasSearchProperty(todoDetails):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
      data = await db.all(getTodoQuery);
      response.send(data.map((eachItem) => outPutResu(eachItem)));
      break;
    default:
      getTodoQuery = `SELECT * FROM todo `;
      data = await db.all(getTodoQuery);
      response.send(data.map((eachItem) => outPutResu(eachItem)));
      break;
  }
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const data = await db.get(dbQuery);
  response.send(outPutResu(data));
});

const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");
//API-3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  //const parsed = parse(newDate);
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const dbQuery = `SELECT * FROM todo WHERE due_date = '${newDate}'`;
    const dbResponse = await db.all(dbQuery);
    response.send(dbResponse.map((eachItem) => outPutResu(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const dbDetails = request.body;

  const { id, todo, priority, status, category, dueDate } = dbDetails;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDate = format(new Date(dueDate), "yyyy-MM-dd");
          const dbQuery = `INSERT INTO todo (id, todo, priority, status, category, due_date) VALUES (${id}, '${todo}', '${priority}', '${status}' ,'${category}', '${postNewDate}')`;
          const dbResponse = await db.run(dbQuery);
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
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  const previous = `SELECT * FROM todo WHERE id=${todoId}`;
  const previosResponse = await db.get(previous);
  console.log(previosResponse);
  const {
    status = previosResponse.status,
    todo = previosResponse.todo,
    priority = previosResponse.priority,
    category = previosResponse.category,
    dueDate = previosResponse.due_date,
  } = requestBody;
  let query;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `UPDATE todo SET  todo = '${status}', priority = '${priority}', status = '${status}',  category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId}`;
        await db.run(query);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDUIM" || priority === "LOW") {
        query = `UPDATE todo SET  todo = '${status}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId}`;
        await db.run(query);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      query = `UPDATE todo SET  todo = '${status}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId}`;
      await db.run(query);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        query = `UPDATE todo SET  todo = '${status}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId}`;
        await db.run(query);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        query = `UPDATE todo SET todo = '${status}', priority = '${priority}',status = '${status}',  category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId}`;
        await db.run(query);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `DELETE FROM todo WHERE id = '${todoId}'`;
  const dbResponse = db.run(dbQuery);
  response.send("Todo Deleted");
});
module.exports = app;
