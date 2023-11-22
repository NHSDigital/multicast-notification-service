const appPermissions = context.getVariable('app.permissions');
context.targetRequest.headers['X-MNS-Application-Permissions'] = appPermissions;
