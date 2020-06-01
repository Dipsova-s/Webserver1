/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/userfriendlynamehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelClassesHandler.js" />

describe("ModelClassesHandler", function () {
    var modelClassesHandler;

    beforeEach(function () {
        modelClassesHandler = new ModelClassesHandler();
    });

    describe(".GetClassName", function () {
        it('should get class name as Id', function () {
            spyOn(modelClassesHandler, 'GetDataBy').and.returnValue(null);

            var result = modelClassesHandler.GetClassName('class-id', '', enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
            expect(result).toEqual('class-id');
        });
        it('should get class name from class object', function () {
            spyOn(modelClassesHandler, 'GetDataBy').and.returnValue({ short_name: 'class-name' });

            var result = modelClassesHandler.GetClassName('class-id', '', enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
            expect(result).toEqual('class-name');
        });
        it('should get class name from followup object', function () {
            spyOn(modelClassesHandler, 'GetDataBy').and.returnValue(null);
            spyOn(modelFollowupsHandler, 'GetDataBy').and.returnValue({ short_name: 'followup-name' });

            var result = modelClassesHandler.GetClassName('class-id', '', enumHandlers.FRIENDLYNAMEMODE.SHORTNAME);
            expect(result).toEqual('followup-name');
        });
    });
});
