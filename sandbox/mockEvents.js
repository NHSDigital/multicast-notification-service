const minimumDataSetEvent = {
    "id": "236a1d4a-5d69-4fa9-9c7f-e72bf505aa5b",
    "type": "pds-change-of-gp-1",
    "subject": {
      "nhsNumber": "9912003888",
      "familyName": "DAWKINS",
      "dob": "2017-10-02",
    },
    "source": {
      "name": "NHS Digital",
      "identifier": {
        "system": "https://fhir.nhs.uk/Id/nhsSpineASID",
        "value": "477121000324"
      }
    },
    "time": "2022-04-05T17:31:00Z",
    "data": {
      "versionId": "W/\"2\"",
      "fullUrl": "https://int.api.service.nhs.uk/personal-demographics/FHIR/R4/Patient/9912003888",
      "provenance": {
          "name": "The GP Practice",
          "identifier": {
              "system": "https://fhir.nhs.uk/Id/nhsSpineASID",
              "value": "477121000323"
          }
      }
   }
  }

module.exports = {
    minimumDataSetEvent: minimumDataSetEvent
}
