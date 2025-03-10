"use strict";

const mockSubscriptions = require("./mockSubscriptions");
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


async function events(req, res, next) {
    write_log(res, "info", {
        message: "events endpoint",
        req: {
            path: req.path,
            body: req.body,
            headers: req.rawHeaders,
        }
    });

    const eventTime = req.body.time,
        eventTimeObject = new Date(eventTime);

    if (eventTimeObject.toString() === 'Invalid Date') {
        res.status(400);
        res.json({
            "validationErrors": {
                "time": "Please provide a valid time"
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

async function createSubscription(req, res, next) {
    write_log(res, "info", {
        message: "create subscriptions endpoint",
        req: {
            path: req.path,
            body: req.body,
            headers: req.rawHeaders,
        }
    });

    const resourceType = req.body.resourceType;

    if (resourceType !== 'Subscription') {
        res.status(400);
        res.json({
            "validationErrors": {
                "resourceType": "Please provide the correct resource type for this endpoint"
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

async function getSubscription(req, res, next) {
    write_log(res, "info", {
        message: "get subscription endpoint",
        req: {
            path: req.path,
            headers: req.rawHeaders,
        }
    });

    const subscriptionId = req.params.subId;

    if (subscriptionId === "e9050741-ae87-4720-beb1-2abd9248e227") {
        res.json(mockSubscriptions.mockCreatedSubscription);
    } 
    else if (subscriptionId == "c5a332ca-12ab-4ccf-9eb7-c933713accb3") {
        res.json(mockSubscriptions.mockCreatedSubscriptionFHIR)
    }    
    else {
        res.status(404);
        res.json({
            "errors": "Not found"
        });
    }

    res.end();
    next();
}


async function getSubscriptions(req, res, next) {
    write_log(res, "info", {
        message: "get ALL subscriptions endpoint",
        req: {
            path: req.path,
            headers: req.rawHeaders,
        }
    });
    res.json({"resourceType": "Bundle",
        "type": "searchset",
        "link": [
            {
                "relation": "self",
                "url": "/subscriptions"
            }
        ],
        "entry": [mockSubscriptions.mockCreatedSubscription]}
        )
    res.end();
    next();
}


async function editSubscription(req, res, next) {
    write_log(res, "info", {
        message: "edit subscriptions endpoint",
        req: {
            path: req.path,
            body: req.body,
            headers: req.rawHeaders,
        }
    });

    const resourceType = req.body.resourceType;
    const subscriptionId = req.params.subId;    

    if (resourceType !== 'Subscription') {
        res.status(400);
        res.json({
            "validationErrors": {
                "resourceType": `Please provide the correct resource type for this endpoint`
            }
        });
    }
    else if(subscriptionId === "e9050741-ae87-4720-beb1-2abd9248e227") {
        res.status(204);
    }
    else if (subscriptionId === "f8f44c83-a697-4607-8604-a1a45acedd8c") {
        res.status(409);
        res.json({
            "errors": "A matching subscription already exists with id: 5553998c-b802-4071-9a54-8e99ea729614"
        });
    }
    else {
        res.status(404);
        res.json({
            "errors": "Not found"
        });
    }    

    res.end();
    next();
}

async function deleteSubscription(req, res, next) {
    write_log(res, "info", {
        message: "delete subscriptions endpoint",
        req: {
            path: req.path,
            headers: req.rawHeaders,
        }
    });

    const subscriptionId = req.params.subId;

    if (subscriptionId === "e9050741-ae87-4720-beb1-2abd9248e227") {
        res.status(204);
    }
    else if (subscriptionId == "c5a332ca-12ab-4ccf-9eb7-c933713accb3") {
        res.status(204);
    }
    else {
        res.status(404);
        res.json({
            "errors": "Not found"
        });
    }

    res.end();
    next();
}

module.exports = {
    status: status,
    events: events,
    createSubscription: createSubscription,
    getSubscription: getSubscription,
    getSubscriptions: getSubscriptions,
    editSubscription: editSubscription,
    deleteSubscription: deleteSubscription
};
