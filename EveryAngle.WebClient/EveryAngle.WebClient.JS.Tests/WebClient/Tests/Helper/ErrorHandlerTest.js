var isLoginPage = true;
/// <reference path="/Dependencies/ErrorHandler/ErrorHandler.js" />

describe("ErrorHandlerTest", function () {

    describe("call GetErrorFromResponseText", function () {

        it("should get text from response json", function () {
            var result = errorHandlerModel.GetErrorFromResponseText({ "reason": "Test1", "message": "Test2" });
            var expected = 'Test1, Test2';

            expect(expected).toEqual(result);
        });

        it("should get text from response json text #1", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('{ "reason": "Test1", "message": "Test2" }');
            var expected = 'Test1, Test2';

            expect(expected).toEqual(result);
        });

        it("should get text from response json text #2 (no reason)", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('{ "reason": null, "message": "Test2" }');
            var expected = 'Test2';

            expect(expected).toEqual(result);
        });

        it("should get text from response json text #2 (no message)", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('{ "reason": "Test1", "message": null }');
            var expected = 'Test1';

            expect(expected).toEqual(result);
        });

        it("should get text from response json text #2", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('{ "Message": "{ \\"reason\\": \\"Test1\\", \\"message\\": \\"Test2\\" }" }');
            var expected = 'Test1, Test2';

            expect(expected).toEqual(result);
        });

        it("should get text from response html text", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('<html><h1>Test h1</h1><h2>Test h2</h2><p>Test p</p></html>');
            var expected = 'Test h2';

            expect(expected).toEqual(result);
        });

        it("should not get text from invalid response text", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('');
            var expected = '';

            expect(expected).toEqual(result);
        });

        it("should not get text from invalid json text", function () {
            var result = errorHandlerModel.GetErrorFromResponseText('{ "data": [] }');
            var expected = '';

            expect(expected).toEqual(result);
        });

    });

});
