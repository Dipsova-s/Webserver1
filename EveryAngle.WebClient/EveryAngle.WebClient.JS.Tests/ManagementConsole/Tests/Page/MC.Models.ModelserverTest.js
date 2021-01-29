/// <chutzpah_reference path="/../../Dependencies/custom/MC.js" />
/// <chutzpah_reference path="/../../Dependencies/custom/MC.form.js" />
/// <chutzpah_reference path="/../../Dependencies/page/MC.Models.Modelserver.js" />

describe("MC.Models.Modelserver", function () {

    let modelServer, domElement;
    beforeEach(function () {
        modelServer = MC.Models.ModelServer;
        domElement = $('<div class="content pageModelContentParameters">' +
            '<div class="contentSection contentSectionInfo sap_settings">' +
            '<h2 style="cursor: pointer;" class="click" onclick="MC.Models.ModelServer.CollapsibleExpandable(this);"><span class="k-icon k-i-expand">SAP connection settings</span></h2>' +
            '<form id="sap_settings" data-role="validator" autocomplete="off" style="display: none;" novalidate="novalidate" _lpchecked="1">' +
            '<div class="contentSectionInfoItem" id="row-sap_host" style="padding-left: 20px;">' +
            '<label data-role="tooltip">Hostname</label>' +
            '<p><input class="text autosyncinput" data-setting-type="text" data-type="textbox" id="sap_host" name="sap_host" type="text" value="sapides720"></p>' +
            '</form></div></div>');

        domElement.appendTo('body');
    });
    afterEach(function () {
        domElement.remove();
    });

    describe(".CollapsibleExpandable", function () {

        it("Form should be visible when click on the header element", function () {
            //Act
            jQuery('.click').trigger('click');

            //Assert
            expect($("#sap_settings").is(':visible')).toBeTruthy();
        });
        it("Form should be hidden when click on the header element", function () {
            //Act
            jQuery('.click').trigger('click');
            jQuery('.click').trigger('click');

            //Assert
            expect($("#sap_settings").is(':visible')).toBeFalsy();
        });

    });

    describe(".GetData", function () {

        it("Should return data from the form", function () {
            //Prepare
            const expected = {
                id: "sap_host",
                value: "sapides720",
                type: "text"               
            };

            //Act
            const result = modelServer.GetData();

            //Assert
            expect(result.settingList[0]).toEqual(expected);
        });
    });
});