const appPermissions = context.getVariable('app.permissions');
context.targetRequest.headers['X-MNS-Application-Permissions'] = appPermissions;

const appMeshMailboxes = context.getVariable('app.meshmailboxes');
context.targetRequest.headers['X-MNS-Application-Mesh-Mailboxes'] = appMeshMailboxes;
