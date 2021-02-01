/// <chutzpah_reference path="/../../Dependencies/custom/mc.form.js" />
/// <chutzpah_reference path="/../../Dependencies/page/MC.Models.Communications.js" />

describe("MC.Models.Communications", function () {
    var communications;
    beforeEach(function () {
        communications = MC.Models.Communications;
    });

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(communications).toBeDefined();
        });
    });

    describe("when SaveModelCommunication without 'send_logs_frequency'", function () {
        it(".GetData() should return values", function () {
            var contact = 12345, address = "Company Address", city = "City", country = "Country", telephone = 12345678, email = "abc@xyz.com", sender = "xyz@srs.com", recipients = "abc@xyz.com,pqr@xyz.com", logFrequency = 2;
            spyOn($.fn, 'val').and.returnValues(contact, address, city, country, telephone, email, sender, recipients, logFrequency);
            var returnResult = communications.GetData();
            expect(returnResult.companyInformationData.contact).toEqual(contact);
            expect(returnResult.companyInformationData.address).toEqual(address);
            expect(returnResult.companyInformationData.city).toEqual(city);
            expect(returnResult.companyInformationData.country).toEqual(country);
            expect(returnResult.companyInformationData.telephone).toEqual(telephone);
            expect(returnResult.companyInformationData.email).toEqual(email);
            expect(returnResult.emailSettingsData.sender).toEqual(sender);
            expect(returnResult.emailSettingsData.recipients).toEqual(recipients.split(','));
            expect(returnResult.emailSettingsData.send_logs_frequency).toEqual(logFrequency);
        });
        it(".GetData() should set default value to '0'", function () {
            spyOn($.fn, 'val').and.returnValue("");
            var returnResult = communications.GetData();
            expect(returnResult.emailSettingsData.send_logs_frequency).toEqual(0);
        });
    });
});
