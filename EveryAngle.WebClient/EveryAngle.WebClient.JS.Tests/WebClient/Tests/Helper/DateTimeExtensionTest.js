/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <chutzpah_reference path="/../../Dependencies/Helper/DateTimeExtension.js" />

describe("DateTimeExtensionTest", function () {

    describe("call ConvertUnixTimeStampToDateStringInAngleDetails", function () {

        it("should return empty if time is empty", function () {
            var result = '';
            var time;

            time = null;
            result = window.ConvertUnixTimeStampToDateStringInAngleDetails(time);
            expect('').toEqual(result);

            time = '';
            result = window.ConvertUnixTimeStampToDateStringInAngleDetails(time);
            expect('').toEqual(result);
            
            time = 0;
            result = window.ConvertUnixTimeStampToDateStringInAngleDetails(time);
            expect('').toEqual(result);

            time = undefined;
            result = window.ConvertUnixTimeStampToDateStringInAngleDetails(time);
            expect('').toEqual(result);
        }); 

        it("should return datetime if time is not empty", function () {
            var time = 1566203509;
            var result = window.ConvertUnixTimeStampToDateStringInAngleDetails(time);
            expect('').not.toEqual(result);
        }); 

    });

});