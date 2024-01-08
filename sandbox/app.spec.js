const mockEvents = require("./mockEvent");
const request = require("supertest");


describe("app handler tests", function () {
    let server;
    let env;
    const version_info = {
        build_label:"1233-shaacdef1",
        releaseId:"1234",
        commitId:"acdef12341ccc"
    };

    before(function () {
        env = process.env;
        let app = require("./app");
        app.setup({
            VERSION_INFO: JSON.stringify(version_info),
            LOG_LEVEL: (process.env.NODE_ENV === "test" ? "warn": "debug")
        });
        server = app.start();
    });

    beforeEach(function () {

    });
    afterEach(function () {

    });
    after(function () {
        process.env = env;
        server.close();
    });

    describe("healthcheck tests", () => {
        it("responds to /_ping", (done) => {
            request(server)
                .get("/_ping")
                .expect(200, {
                    status: "pass",
                    ping: "pong",
                    service: "multicast-notification-service",
                    version: version_info
                })
                .expect("Content-Type", /json/, done);
        });
    
        it("responds to /_status", (done) => {
            request(server)
                .get("/_status")
                .expect(200, {
                    status: "pass",
                    ping: "pong",
                    service: "multicast-notification-service",
                    version: version_info
                })
                .expect("Content-Type", /json/, done);
        });
    });

    describe("/events endpoint tests", () => {
        it("responds with a success when the pre-canned MDS event is published to /events", (done) => {
            request(server)
                .post("/events")
                .send(mockEvents.minimumDataSetEvent)
                .expect(200, {
                    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b"
                },done);
        });
    
        it("responds with a validation error when an event with an invalid time is published to /events", (done) => {
            let invalidEvent = mockEvents.minimumDataSetEvent;
            invalidEvent["time"] = "202-04-05T17:31:00.000Z";
    
            request(server)
                .post("/events")
                .send(mockEvents.minimumDataSetEvent)
                .expect(400, {
                    "validationErrors": {
                        "time": "Please provide a valid time"
                    }
                },done);
        });
    });
});
