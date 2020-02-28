/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />

describe("AngleActionMenuHandler", function () {
    var AngleActionMenuHandlerTest = function () {
        var self = this;
        jQuery.extend(self, new AngleActionMenuHandler(self));
    };
    var angleActionMenuHandler;
    beforeEach(function () {
        angleActionMenuHandler = new AngleActionMenuHandlerTest();
    });

    describe(".IsFindOptionVisible", function () {

        var tests = [
            {
                title: 'should hide Find option for realtime model',
                is_real_time: true,
                expected: false
            },
            {
                title: 'should show Find option if it\'s not realtime model',
                is_real_time: false,
                expected: true
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(angleInfoModel, 'Data').and.returnValue({});
                spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
                spyOn(aboutSystemHandler, 'IsRealTimeModel').and.returnValue(test.is_real_time);

                //process
                var result = angleActionMenuHandler.IsFindOptionVisible();

                //assert
                expect(result).toEqual(test.expected);
            });
        });
    });
});
