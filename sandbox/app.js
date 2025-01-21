"use strict";

const cors = require("cors");
const express = require("express");
const app = express();
const log = require("loglevel");
const uuid = require("uuid");


function setup(options) {
    options = options || {};
    app.locals.app_name = options.APP_NAME || "multicast-notification-service";
    app.locals.version_info = JSON.parse(options.VERSION_INFO || "{}");
    log.setLevel(options.LOG_LEVEL || "info");
    log.info(JSON.stringify({
        timestamp: Date.now(),
        level: "info",
        app: app.locals.app_name,
        msg: "setup",
        version:  app.locals.version_info
    }));
};

function start(options) {
    options = options || {};
    const server = app.listen(options.PORT || 9000, () => {
        log.info(JSON.stringify({
            timestamp: Date.now(),
            level: "info",
            app: app.locals.app_name,
            msg: "startup",
            server_port: server.address().port,
            version:  app.locals.version_info
        }));
    });
    return server;
};

function before_request(req, res, next) {
    res.locals.started_at = Date.now();
    res.locals.correlation_id = (
        req.header("X-Correlation-ID")
        || req.header("Correlation-ID")
        || req.header("CorrelationID")
        || uuid.v4()
    );
    next();
};

const _health_endpoints = ["/_ping", "/health"];

function after_request(req, res, next) {
    if (_health_endpoints.includes(req.path) && !("log" in Object.assign({}, req.query))) {
        // don't log ping / health by default
        return next();
    };
    const finished_at = Date.now();
    const log_entry = {
        timestamp: finished_at,
        level: "info",
        app: app.locals.app_name,
        msg: "request",
        correlation_id: res.locals.correlation_id,
        started: res.locals.started_at,
        finished: finished_at,
        duration: finished_at - res.locals.started_at,
        req: {
            url: req.url,
            method: req.method,
            query: req.query,
            path: req.path,
        },
        res: {
            status: res.statusCode,
            message: res.message
        },
        version: app.locals.version_info
    };

    if (log.getLevel()<2) {
        // debug
        log_entry.req.headers = req.rawHeaders;
        log_entry.res.headers = res.rawHeaders;
    };
    log.info(JSON.stringify(log_entry));

    next();
};

function on_error(err, req, res, next) {
    let log_err = err;
    if (log_err instanceof Error) {
        log_err = {
            name: err.name,
            message: err.message,
            stack: err.stack
        };
    };
    const finished_at = Date.now();
    log.error(JSON.stringify({
        timestamp: finished_at,
        level: "error",
        app: app.locals.app_name,
        msg: "error",
        correlation_id: res.locals.correlation_id,
        started: res.locals.started_at,
        finished: finished_at,
        duration: finished_at - res.locals.started_at,
        err: log_err,
        version:  app.locals.version_info
    }));
    if (res.headersSent) {
        next();
        return;
    };
    res.status(500);
    res.json({error: "something went wrong"});
    next();
};

const handlers = require("./handlers");
app.use(
    cors({
        origin: "https://digital.nhs.uk",
        allowedHeaders: [
            "origin",
            "x-requested-with",
            "accept",
            "accept-encoding",
            "content-type",
            "content-length",
            "host",
            "nhsd-correlation-id",
            "nhsd-request-id",
            "user-agent",
            "x-correlation-id",
            "x-forwarded-for",
            "x-forwarded-port",
            "x-forwarded-proto",
            "authorization",
            "x-application-id",
            "x-application-name",
            "x-application-mesh-mailboxes",
            "x-mns-application-permissions",
            "nhse-product-id",
            "nhse-product-device-id"
        ],
        maxAge: 3628800,
        methods: ["GET", "PUT", "POST", "DELETE"]
    })
);
app.use(before_request);
app.use(express.json({type: ["application/json", "application/cloudevents+json", "application/fhir+json"]}));
app.get("/_ping", handlers.status);
app.get("/_status", handlers.status);
app.get("/health", handlers.status);
app.get("/subscriptions", handlers.getSubscriptions);
app.get("/subscriptions/:subId", handlers.getSubscription);
app.delete("/subscriptions/:subId", handlers.deleteSubscription);
app.put("/subscriptions/:subId", handlers.editSubscription);
app.post("/events", handlers.events);
app.post("/subscriptions", handlers.createSubscription);
app.use(on_error);
app.use(after_request);

module.exports = {start: start, setup: setup};
