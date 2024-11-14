// NO MORE CUSTOM ATTRIBUTES SHOULD BE ADDED IN THIS WAY
// There is a limit on custom attributes per app and if apps have many api connections
// this limit could be easily hit. The exception would be potential global custom attributes
// e.g. product-id

// If we need to add more then use extended attributes. See:
// https://nhsd-confluence.digital.nhs.uk/display/APM/ExtendedAttributes+shared+flow

const appPermissions = context.getVariable('app.permissions');
context.targetRequest.headers['X-MNS-Application-Permissions'] = appPermissions;

const appMeshMailboxes = context.getVariable('app.mesh-mailboxes');
context.targetRequest.headers['X-MNS-Application-Mesh-Mailboxes'] = appMeshMailboxes;
