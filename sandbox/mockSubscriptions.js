const mockSubscriptionRequest = {
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
},
mockCreatedSubscription = {
    "id": "e9050741-ae87-4720-beb1-2abd9248e227",
    "resourceType": "Subscription",
    "status": "active",
    "end": "2024-04-05T17:00:00.000Z",
    "reason": "",
    "criteria": "eventType=pds-change-of-gp-1",
    "channel": {
        "type": "message",
        "endpoint": "arn:aws:sqs:eu-west-2:12345:example-queue-123",
        "payload": "application/json"
    }
},
mockSubscriptionRequestFHIR ={
    ...mockSubscriptionRequest,
    "channel": {
        ...mockSubscriptionRequest.channel,
        "payload": "application/fhir+json"
    }
},
mockCreatedSubscriptionFHIR ={
    ...mockCreatedSubscription,
    "id": "c5a332ca-12ab-4ccf-9eb7-c933713accb3",
    "channel": {
        ...mockCreatedSubscription.channel,
        "payload": "application/fhir+json"
    }
}


module.exports = {
    mockCreatedSubscription: mockCreatedSubscription,
    mockSubscriptionRequest: mockSubscriptionRequest,
    mockSubscriptionRequestFHIR: mockSubscriptionRequestFHIR,
    mockCreatedSubscriptionFHIR: mockCreatedSubscriptionFHIR,
}
