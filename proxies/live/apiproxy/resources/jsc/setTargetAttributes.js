// product-id and product-device-id are general use by APIM and so are accessed directly on the app

// If we need to add more then use extended attributes.
// Extended attributes should be added to the attribute of apim-app-flow-vars
// and then the value added to the JSON object under mns
// e.g. "apim-app-flow-vars": {
//         "mns": {
//             "permissions": "events:create:mns-test-signal-1",
//             "potential-future-attribute": "value"
//         }
//     }
// See: https://nhsd-confluence.digital.nhs.uk/display/APM/ExtendedAttributes+shared+flow

const appPermissions = context.getVariable("apim-app-flow-vars.mns.permissions");
context.targetRequest.headers["X-MNS-Application-Permissions"] = appPermissions;

const productId = context.getVariable("app.product-id");
context.targetRequest.headers["NHSE-Product-ID"] = productId;

const productDeviceId = context.getVariable("app.product-device-id");
context.targetRequest.headers["NHSE-Product-Device-ID"] = productDeviceId;
