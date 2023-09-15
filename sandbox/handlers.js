"use strict";

const log = require("loglevel");


const write_log = (res, log_level, options = {}) => {
    if (log.getLevel()>log.levels[log_level.toUpperCase()]) {
        return
    }
    if (typeof options === "function") {
        options = options()
    }
    let log_line = {
        timestamp: Date.now(),
        level: log_level,
        correlation_id: res.locals.correlation_id
    }
    if (typeof options === 'object') {
        options = Object.keys(options).reduce(function(obj, x) {
            let val = options[x]
            if (typeof val === "function") {
                val = val()
            }
            obj[x] = val;
            return obj;
        }, {});
        log_line = Object.assign(log_line, options)
    }
    if (Array.isArray(options)) {
        log_line["log"] = {log: options.map(x=> {return typeof x === "function"? x() : x })}
    }

    log[log_level](JSON.stringify(log_line))
};


async function status(req, res, next) {
    res.json({
        status: "pass",
        ping: "pong",
        service: req.app.locals.app_name,
        version: req.app.locals.version_info
    });
    res.end();
    next();
}

async function hello(req, res, next) {

    write_log(res, "warn", {
        message: "hello world",
        req: {
            path: req.path,
            query: req.query,
            headers: req.rawHeaders
        }
    });


    res.json({message: "hello world"});
    res.end();
    next();
}

async function events(req, res, next) {
    write_log(res, "info", {
        message: "events endpoint",
        req: {
            path: req.path,
            body: req.body,
            headers: req.rawHeaders,
        }
    });

    const eventType = req.body.type,
        acceptedEventTypes = ["pds-change-of-gp-1"];

    if (!acceptedEventTypes.includes(eventType)) {
        res.json({
            "validationErrors": {
                "type": "Please provide a valid event type"
            }
        });
    }   else {
        res.json({
            "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b"
        });
    }

    res.end();
    next();
}

module.exports = {
    status: status,
    hello: hello,
    events: events
};
