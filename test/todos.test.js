const { ObjectId } = require("mongodb")
const request = require("supertest")
const app = require("../src/app")
const { connectToDB, closeConnection, getDB } = require("../src/database")

const baseUrl = "/todos"
let db

// #region after/before
beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const MONGODB_DB = process.env.MONGODB_DB || 'mytodos-test'

    await connectToDB(MONGODB_URI, MONGODB_DB)
    console.log(MONGODB_URI)
})

afterAll(async () => {
    closeConnection()
})

afterEach(async () => {
    db = getDB()
    await db.dropCollection("todos")
})

beforeEach(async () => {
    db = getDB()
    await db.createCollection("todos")
})
// #endregion

describe("GET /todos", () => {
    test("should respond with a 200 status code", async () => {
        const response = await request(app.callback()).get(baseUrl)
        expect(response.statusCode).toBe(200)
    })

    test("should respond with JSON", async () => {
        const response = await request(app.callback()).get(baseUrl)
        expect(response.type).toBe("application/json")
    })

    test("should respond with list of existing todos", async () => {
        // Arrange
        const todosData = [{ 
            title: "Title 1",
            completed: false,
            createdAt: new Date(2022, 1, 22),
            updatedAt: new Date(2022, 1, 25) 
        },
        { 
            title: "Title 2",
            completed: true,
            createdAt: new Date(2022, 1, 28),
            updatedAt: new Date(2022, 1, 29) 
        }];
        
        await db.collection("todos").insertMany(todosData, function(err, res) {
            if (err) throw err;
        });
        
        // Act
        const response = await request(app.callback()).get(baseUrl)

        // Assert
        expect(response.body.length).toBe(2)
        expect(response.body[0].title).toBe("Title 1")
        expect(response.body[1].title).toBe("Title 2")
        expect(response.body[0].completed).toBe(false)
        expect(response.body[1].completed).toBe(true)
        expect(response.body[0].createdAt).toBe("2022-02-21T23:00:00.000Z")
        expect(response.body[1].createdAt).toBe("2022-02-27T23:00:00.000Z")
        expect(response.body[0].updatedAt).toBe("2022-02-24T23:00:00.000Z")
        expect(response.body[1].updatedAt).toBe("2022-02-28T23:00:00.000Z")
    })
});

describe.only("POST /todos", () => {
    const titleData = { title: "Title 1" };
    const missingTitleData = {};
    const invalidTitleData = {title : null};

    //#region Status code
    test("should respond with a 200 status code", async () => {
        const response = await request(app.callback()).post(baseUrl).send(titleData)
        expect(response.statusCode).toBe(200)
    })

    test("should respond with a 422 status code if 'title' param is missing", async () => {
        const response = await request(app.callback()).post(baseUrl).send(missingTitleData)
        expect(response.statusCode).toBe(422)
    })

    test("should respond with a 400 status code if 'title' param is invalid", async () => {
        const response = await request(app.callback()).post(baseUrl).send(invalidTitleData)
        expect(response.statusCode).toBe(400)
    })
    //#endregion

    //#region Response message/content
    test("should respond with new generated id of length 24", async () => {
        const response = await request(app.callback()).post(baseUrl).send(titleData)
        expect(response.body.id.length).toBe(24)
    })

    test("should respond with an error message if 'title' param is missing", async () => {
        const response = await request(app.callback()).post(baseUrl).send(missingTitleData)
        expect(response.body.errorMsg).toBe("Missing parameter 'title'")
    })

    test("should respond with an error message if 'title' param is invalid", async () => {
        const response = await request(app.callback()).post(baseUrl).send(invalidTitleData)
        expect(response.body.errorMsg).toBe("Invalid parameter 'title'")
    })
    //#endregion

    //#region Response Type
    test("should respond with JSON", async () => {
        const response = await request(app.callback()).post(baseUrl).send(titleData)
        expect(response.type).toBe("application/json")
    })

    test("should respond with JSON if 'title' param is invalid", async () => {
        const response = await request(app.callback()).post(baseUrl).send(missingTitleData)
        expect(response.type).toBe("application/json")
    })

    test("should respond with JSON if 'title' param is missing", async () => {
        const response = await request(app.callback()).post(baseUrl).send(invalidTitleData)
        expect(response.type).toBe("application/json")
    })
    //#endregion
    
});

describe.only("DELETE /todos/:id", () => {
    const todosData = [{ 
        _id: '61e931687474c53eca3a716c',
        title: "Title 1",
        completed: false,
        createdAt: new Date(2022, 1, 22),
        updatedAt: new Date(2022, 1, 25) 
    },
    { 
        _id: '61e931687474c53eca3a716d',
        title: "Title 2",
        completed: true,
        createdAt: new Date(2022, 1, 28),
        updatedAt: new Date(2022, 1, 29) 
    }];
    const id = "61e931687474c53eca3a716c"
    const correctIdUrl = baseUrl + "/" + id
    const notFoundIdUrl = baseUrl + "/15"
    const invalidIdUrl = baseUrl + "/a"
    
    beforeEach(() => {
        await db.collection("todos").insertMany(todosData, function(err, res) {
            if (err) throw err;
        });
      });

    //#region Status code
    test("should respond with a 200 status code", async () => {
        const response = await request(app.callback()).post(correctIdUrl)
        expect(response.statusCode).toBe(200)
    })

    test("should respond with a 422 status code if 'id' param is missing", async () => {
        const response = await request(app.callback()).post(baseUrl)
        expect(response.statusCode).toBe(422)
    })

    test("should respond with a 400 status code if 'id' param is invalid", async () => {
        const response = await request(app.callback()).post(invalidIdUrl)
        expect(response.statusCode).toBe(400)
    })

    test("should respond with a 404 status code if 'id' param is not found", async () => {
        const response = await request(app.callback()).post(notFoundIdUrl)
        expect(response.statusCode).toBe(404)
    })
    //#endregion

    //#region Response message/content
    test("should respond with new generated id of length 24", async () => {
        const response = await request(app.callback()).post(correctIdUrl)
        expect(response.body.id.length).toBe("Todo '"+ id +"' deleted")
    })

    test("should respond with an error message if 'id' param is missing", async () => {
        const response = await request(app.callback()).post(baseUrl)
        expect(response.body.errorMsg).toBe("Missing parameter 'id'")
    })

    test("should respond with an error message if 'title' param is invalid", async () => {
        const response = await request(app.callback()).post(invalidIdUrl)
        expect(response.body.errorMsg).toBe("Invalid parameter 'id'")
    })

    test("should respond with an error message if 'title' param is not found", async () => {
        const response = await request(app.callback()).post(notFoundIdUrl)
        expect(response.body.errorMsg).toBe("Not found '" + id + "'")
    })
    //#endregion

    //#region Response Type
    test("should respond with JSON", async () => {
        const response = await request(app.callback()).delete(correctIdUrl)
        expect(response.type).toBe("application/json")
    })

    test("should respond with JSON if 'id' param is invalid", async () => {
        const response = await request(app.callback()).delete(invalidIdUrl)
        expect(response.type).toBe("application/json")
    })

    test("should respond with JSON if 'id' param is missing", async () => {
        const response = await request(app.callback()).delete(baseUrl)
        expect(response.type).toBe("application/json")
    })

    test("should respond with JSON if id is not found", async () => {
        const response = await request(app.callback()).delete(notFoundIdUrl)
        expect(response.type).toBe("application/json")
    })
    //#endregion
    
});
