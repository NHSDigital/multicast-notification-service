const mockSubscription = {
    "resourceType": "Subscription",
    "status": "requested",
    "reason": "",
    "end": "2024-01-25T00:00:00.000Z",
    "criteria": "eventType=pds-change-of-gp-1",
    "channel": {
        "type": "message",
        "endpoint": "arn:aws:sqs:eu-west-2:12345:nhs-dy-my-test-queue",
        "payload": "application/json"
    }
}


module.exports = {
    mockSubscription: mockSubscription
}
