const mockEvents = require("./mockEvent");
const mockSubscriptions = require("./mockSubscriptions");
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
        it("GET /_ping responds successfully", (done) => {
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
    
        it("GET /_status responds successfully", (done) => {
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
        // POST /events

        it("POST /events responds with a success when the pre-canned MDS event is sent", (done) => {
            request(server)
                .post("/events")
                .send(mockEvents.minimumDataSetEvent)
                .expect(200, {
                    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b"
                },done);
        });
    
        it("POST /events responds with a validation error when an event with an invalid time is sent", (done) => {
            let invalidEvent = {...mockEvents.minimumDataSetEvent};
            invalidEvent["time"] = "202-04-05T17:31:00.000Z";
   
            request(server)
                .post("/events")
                .send(invalidEvent)
                .expect(400, {
                    "validationErrors": {
                        "time": "Please provide a valid time"
                    }
                },done);
        });
    });

    describe("/subscriptions endpoint tests", () => {

        // POST /subscriptions

        it("POST /subscriptions responds with a success when the pre-canned subscription is sent", (done) => {
            request(server)
                .post("/subscriptions")
                .set('Content-Type',  'application/fhir+json')
                .send(mockSubscriptions.mockSubscriptionRequest)
                .expect(200, {
                    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b"
                },done);
        });
    
        it("POST /subscriptions responds with a validation error when an invalid resourceType is sent", (done) => {
            let invalidSubscription = {...mockSubscriptions.mockSubscriptionRequest};
            invalidSubscription["resourceType"] = "Bundle";
    
            request(server)
                .post("/subscriptions")
                .set('Content-Type',  'application/fhir+json')
                .send(invalidSubscription)
                .expect(400, {
                    "validationErrors": {
                        "resourceType": "Please provide the correct resource type for this endpoint"
                    }
                },done);
        });

        it("POST /subscriptions responds with a success when the pre-canned FHIR subscription is sent", (done) => {
            request(server)
                .post("/subscriptions")
                .set('Content-Type',  'application/fhir+json')
                .send(mockSubscriptions.mockSubscriptionRequestFHIR)
                .expect(200, {
                    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b"
                },done);
        });

        // GET /subscriptions

        it("GET /subscriptions responds with a success when user requests to get ALL subscriptions", (done) => {
            request(server)
                .get("/subscriptions")
                .expect(200, {  "resourceType": "Bundle",
                                "type": "searchset",
                                "link": [
                                    {
                                        "relation": "self",
                                        "url": "/subscriptions"
                                    }
                                ], "entry": [mockSubscriptions.mockCreatedSubscription]
                            }, done);
        });        

    });


    describe("/subscriptions/{id} endpoint tests", () => {

        // GET /subscriptions/{id}
    
        it("GET /subscriptions/{id} responds with a success and returns subscription body when a valid subscriptionID is sent", (done) => {
            request(server)
                .get("/subscriptions/e9050741-ae87-4720-beb1-2abd9248e227")
                .expect(200, mockSubscriptions.mockCreatedSubscription, done);
        });


        it("GET /subscriptions/{id} responds with a success and returns subscription body including FHIR output format, when a valid subscriptionID is sent", (done) => {
            request(server)
                .get("/subscriptions/c5a332ca-12ab-4ccf-9eb7-c933713accb3")
                .expect(200, mockSubscriptions.mockCreatedSubscriptionFHIR, done);
        });
    
        it("GET /subscriptions/{id} responds with a not found error when non-matching subscriptionID is sent", (done) => {
            request(server)
                .get("/subscriptions/236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b")
                .expect(404, {
                    "errors": "Not found" 
                }, done);
        });

        // DELETE /subscriptions/{id}
    
        it("DELETE /subscriptions/{id} responds with a success when a valid subscriptionID is sent", (done) => {
            request(server)
                .delete("/subscriptions/e9050741-ae87-4720-beb1-2abd9248e227")
                .expect(204, done);
        });
    
        it("DELETE /subscriptions/{id} responds with a validation error when an non-matching subscriptionID is sent", (done) => {
            request(server)
                .delete("/subscriptions/236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b")
                .expect(404, {
                    "errors": "Not found" 
                }, done);
        });

        // PUT /subscriptions/{id}

        it("PUT /subscriptions/{id} responds with succcess when user updates a subscription", (done) => {
            //console.log(mockSubscriptions.mockSubscriptionRequest);
            request(server)
                .put("/subscriptions/e9050741-ae87-4720-beb1-2abd9248e227")
                .set('Content-Type',  'application/fhir+json')                
                .send(mockSubscriptions.mockSubscriptionRequest)
                .expect(204, {
                },done);
        });     

        it("PUT /subscriptions/{id} responds with a conflict error when matching subscription already exists", (done) => {
            request(server)
                .put("/subscriptions/f8f44c83-a697-4607-8604-a1a45acedd8c")
                .send(mockSubscriptions.mockSubscriptionRequest)
                .expect(409, {
                    "errors": "A matching subscription already exists with id: 5553998c-b802-4071-9a54-8e99ea729614"
                },done);
        });            

        it("PUT /subscriptions/{id} responds with a validation error when an invalid resourceType is sent", (done) => {
            let invalidSubscription = {...mockSubscriptions.mockSubscriptionRequest};
            invalidSubscription["resourceType"] = "Bundle";
    
            request(server)
                .put("/subscriptions/e9050741-ae87-4720-beb1-2abd9248e227")
                .set('Content-Type',  'application/fhir+json')
                .send(invalidSubscription)
                .expect(400, {
                    "validationErrors": {
                        "resourceType": "Please provide the correct resource type for this endpoint"
                    }
                },done);
        });     
        
        it("PUT /subscriptions/{id} responds with a validation error when non-matching subscriptionID is sent", (done) => {
            request(server)
                .put("/subscriptions/236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b")
                .set('Content-Type',  'application/fhir+json')                
                .send(mockSubscriptions.mockSubscriptionRequest)                
                .expect(404, {
                    "errors": "Not found" 
                }, done);
        });   

    });
});
