/// <chutzpah_reference path="/../../Dependencies/page/MC.GlobalSettings.Authentication.js" />
/// <chutzpah_reference path="/../../Dependencies/custom/MC.form.js" />
/// <chutzpah_reference path="/../../Dependencies/custom/MC.js" />

describe("MC.GlobalSettings.Authentication", function () {
    var authentication;
    beforeEach(function () {
        authentication = MC.GlobalSettings.Authentication;
    })
    describe(".GetData", function () {
        var html;
        beforeEach(function () {
            html = $('<input  id="ReFormatTrustedWebservers" name="ReFormatTrustedWebservers" type="text" value="127.0.0.1, ::1, 10.64.96.12" >');
            html.appendTo('body');
        });
        afterEach(function () {
            html.remove();
        });
        it("Always return Ip address in the textbox", function () {
            var expected = [
                "127.0.0.1",
                " ::1",
                " 10.64.96.12"
            ];
            var result = authentication.GetData();
            expect(result.systemSettings.trusted_webservers).toEqual(expected);
        });
    });
});