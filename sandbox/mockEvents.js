const minimumDataSetEvent = {
    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b",
    "type": "pds-change-of-gp-1",
    "subject": {
      "nhsNumber": "9912003888",
      "givenName": "Jack",
      "familyName": "DAWKINS",
      "dob": "2017-10-02"
    },
    "source": {
      "name": "The Organisation",
      "identifier": {
        "system": "https://fhir.nhs.uk/{Id}/ods-organization-code",
        "value": "ABC123"
      }
    },
    "time": "2022-04-05T17:31:00Z",
    "dataContentType": "application/fhir+json",
    "data": "https://test-api.nhs.uk/personal-demographics/FHIR/R4/Patient/5323035280"
  },
  changeOfGPFHIREvent = {
    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b",
    "meta": {
      "profile": [
        "http://hl7.org/fhir/STU3/StructureDefinition/Bundle"
      ]
    },
    "entry": [
      {
        "fullUrl": "3cfdf880-13e9-4f6b-8299-53e96ef5ec02",
        "resource": {
          "responsible": {
            "reference": "https://directory.spineservices.nhs.uk/STU3/Organization/X26",
            "display": "NHS DIGITAL"
          },
          "timestamp": "2019-11-01T15:00:00+00:00",
          "event": {
            "display": "PDS Change of GP",
            "system": "https://fhir.nhs.uk/STU3/CodeSystem/EventType-1",
            "code": "pds-change-of-gp-1"
          },
          "source": {
            "endpoint": "urn:nhs:addressing:asid:477121000323",
            "contact": {
              "system": "email",
              "value": "ssd.nationalservicedesk@nhs.net"
            }
          },
          "meta": {
            "profile": [
              "https://fhir.nhs.uk/STU3/StructureDefinition/Event-MessageHeader-1"
            ],
            "versionId": "1",
            "lastUpdated": "2017-11-01T15:00:33+00:00"
          },
          "focus": [
            {
              "reference": "urn:uuid:3f98da8c-3fe9-430e-8e7c-6edd078622f0"
            }
          ],
          "extension": [
            {
              "extension": [
                {
                  "valueIdentifier": {
                    "system": "https://fhir.nhs.uk/Id/nhs-number",
                    "value": "9912003888"
                  },
                  "url": "nhsNumber"
                },
                {
                  "valueHumanName": {
                    "use": "official",
                    "given": [
                      "Jack"
                    ],
                    "family": "DAWKINS"
                  },
                  "url": "name"
                },
                {
                  "valueDateTime": "2017-10-02T12:00:00+00:00",
                  "url": "birthDateTime"
                }
              ],
              "url": "https://fhir.nhs.uk/STU3/StructureDefinition/Extension-RoutingDemographics-1"
            },
            {
              "valueCodeableConcept": {
                "coding": [
                  {
                    "display": "New event message",
                    "system": "https://fhir.nhs.uk/STU3/CodeSystem/MessageEventType-1",
                    "code": "new"
                  }
                ]
              },
              "url": "https://fhir.nhs.uk/STU3/StructureDefinition/Extension-MessageEventType-1"
            }
          ],
          "id": "3cfdf880-13e9-4f6b-8299-53e96ef5ec02",
          "resourceType": "MessageHeader"
        }
      },
      {
        "fullUrl": "urn:uuid:4c687299-3693-47f0-b477-562b0784d225",
        "resource": {
          "id": "4c687299-3693-47f0-b477-562b0784d225",
          "meta": {
            "profile": [
              "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-HealthcareService-1"
            ]
          },
          "identifier": [
            {
              "system": "https://fhir.nhs.uk/STU3/CodeSystem/EMS-HealthcareServiceType-1",
              "value": "PDS"
            }
          ],
          "type": [
            {
              "coding": [
                {
                  "display": "Personal Demographics Service",
                  "system": "https://fhir.nhs.uk/STU3/CodeSystem/EMS-HealthcareServiceType-1",
                  "code": "PDS"
                }
              ]
            }
          ],
          "providedBy": {
            "reference": "https://directory.spineservices.nhs.uk/STU3/Organization/X26",
            "display": "NHS DIGITAL"
          },
          "resourceType": "HealthcareService"
        }
      },
      {
        "fullUrl": "urn:uuid:3f98da8c-3fe9-430e-8e7c-6edd078622f0",
        "resource": {
          "id": "3f98da8c-3fe9-430e-8e7c-6edd078622f0",
          "meta": {
            "profile": [
              "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-Communication-1"
            ]
          },
          "subject": {
            "reference": "urn:uuid:dffd2ca0-dc21-11e7-9296-cec278b6b50a",
            "display": "DAWKINS, Jack"
          },
          "payload": [
            {
              "contentReference": {
                "reference": "urn:uuid:dffd2ca0-dc21-11e7-9296-cec278b6b50a",
                "display": "DAWKINS, Jack"
              }
            }
          ],
          "status": "completed",
          "sent": "2019-12-01",
          "resourceType": "Communication"
        }
      },
      {
        "fullUrl": "urn:uuid:dffd2ca0-dc21-11e7-9296-cec278b6b50a",
        "resource": {
          "generalPractitioner": [
            {
              "reference": "urn:uuid:59a63170-b769-44f7-acb1-95cc3a0cb067",
              "display": "SHADWELL MEDICAL CENTRE"
            }
          ],
          "name": [
            {
              "use": "official",
              "given": [
                "Jack"
              ],
              "family": "DAWKINS"
            }
          ],
          "identifier": [
            {
              "extension": [
                {
                  "valueCodeableConcept": {
                    "coding": [
                      {
                        "display": "Number present and verified",
                        "system": "https://fhir.hl7.org.uk/STU3/CareConnect-NHSNumberVerificationStatus-1",
                        "code": "01"
                      }
                    ]
                  },
                  "url": "https://fhir.hl7.org.uk/STU3/StructureDefinition/Extension-CareConnect-NHSNumberVerificationStatus-1"
                }
              ],
              "system": "https://fhir.nhs.uk/Id/nhs-number",
              "value": "9912003888"
            }
          ],
          "address": [
            {
              "use": "home",
              "postalCode": "LS17 7DF",
              "line": [
                "4 Sandmoor Drive",
                "LEEDS"
              ]
            }
          ],
          "_birthDate": {
            "extension": [
              {
                "valueDateTime": "2017-10-02T20:12:00+00:00",
                "url": "http://hl7.org/fhir/StructureDefinition/patient-birthTime"
              }
            ]
          },
          "id": "dffd2ca0-dc21-11e7-9296-cec278b6b50a",
          "meta": {
            "profile": [
              "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-Patient-1"
            ]
          },
          "birthDate": "2017-10-02",
          "gender": "male",
          "resourceType": "Patient"
        }
      },
      {
        "fullUrl": "urn:uuid:59a63170-b769-44f7-acb1-95cc3a0cb067",
        "resource": {
          "id": "59a63170-b769-44f7-acb1-95cc3a0cb067",
          "meta": {
            "profile": [
              "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-Organization-1"
            ]
          },
          "name": "SHADWELL MEDICAL CENTRE",
          "identifier": [
            {
              "system": "https://fhir.nhs.uk/Id/ods-organization-code",
              "value": "B86056"
            }
          ],
          "partOf": {
            "reference": "https://directory.spineservices.nhs.uk/STU3/Organization/02V",
            "display": "NHS LEEDS NORTH ICB"
          },
          "resourceType": "Organization"
        }
      },
      {
        "fullUrl": "urn:uuid:b13f45db-bd6d-48ef-bf30-3a4c0904a777",
        "resource": {
          "id": "b13f45db-bd6d-48ef-bf30-3a4c0904a777",
          "meta": {
            "profile": [
              "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-EpisodeOfCare-1"
            ]
          },
          "managingOrganization": {
            "reference": "urn:uuid:e84bfc04-2d79-451e-84ef-a50116506088",
            "display": "LIVERSEDGE MEDICAL CENTRE"
          },
          "patient": {
            "reference": "urn:uuid:dffd2ca0-dc21-11e7-9296-cec278b6b50a",
            "display": "DAWKINS, Jack"
          },
          "period": {
            "end": "2017-10-29T15:00:00+00:00",
            "start": "2017-10-09T15:00:00+00:00"
          },
          "status": "finished",
          "type": [
            {
              "coding": [
                {
                  "display": "Primary care",
                  "system": "https://fhir.nhs.uk/STU3/CodeSystem/EMS-PDS-PatientCareProvisionType-1",
                  "code": "1"
                }
              ]
            }
          ],
          "resourceType": "EpisodeOfCare"
        }
      },
      {
        "fullUrl": "urn:uuid:e84bfc04-2d79-451e-84ef-a50116506088",
        "resource": {
          "id": "e84bfc04-2d79-451e-84ef-a50116506088",
          "meta": {
            "profile": [
              "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-Organization-1"
            ]
          },
          "name": "LIVERSEDGE MEDICAL CENTRE",
          "identifier": [
            {
              "system": "https://fhir.nhs.uk/Id/ods-organization-code",
              "value": "B85612"
            }
          ],
          "partOf": {
            "reference": "https://directory.spineservices.nhs.uk/STU3/Organization/03J",
            "display": "NHS NORTH KIRKLEES ICB"
          },
          "resourceType": "Organization"
        }
      }
    ],
    "type": "message",
    "resourceType": "Bundle"
  };

module.exports = {
    minimumDataSetEvent: minimumDataSetEvent,
    changeOfGPFHIREvent: changeOfGPFHIREvent
}
