/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Search/AngleCopyHandler.js" />

describe("AngleCopyHandler", function () {

    var angleCopyHandler;

    beforeEach(function () {
        angleCopyHandler = new AngleCopyHandler();
    });

    describe(".GetCopyAngleData", function () {

        var angle;

        beforeEach(function () {
            angle = {
                model: '/models/1',
                is_validated: true,
                is_published: true,
                multi_lang_name: [
                    { text: 'angle 1' }
                ],
                display_definitions: [
                    { id: 'display1', uri: '/displays/1' },
                    { id: 'display2', uri: '/displays/2' }
                ],
                angle_default_display: '/displays/2',
                user_specific: {
                    is_starred: true,
                    private_note: 'test'
                }
            };
        });

        it("should do nothing if no 'user_specific'", function () {

            delete angle.user_specific;

            var copyAngle = angleCopyHandler.GetCopyAngleData(angle, '/models/2');
            expect(copyAngle.user_specific).not.toBeDefined();

        });

        it("should not remove 'private_note' when the angle have it", function () {

            var copyAngle = angleCopyHandler.GetCopyAngleData(angle, '/models/2');
            expect(copyAngle.user_specific.private_note).toEqual('test');

        });

        it("should add ' (copy)' after angle name if same model", function () {

            var copyAngle = angleCopyHandler.GetCopyAngleData(angle, '/models/1');
            expect(copyAngle.multi_lang_name[0].text).toEqual('angle 1 (copy)');

        });

        it("should change 'angle_default_display' to a new id", function () {

            var copyAngle = angleCopyHandler.GetCopyAngleData(angle, '/models/1');
            expect(copyAngle.angle_default_display).toEqual(copyAngle.display_definitions[1].id);

        });

        it("should use 'angle_default_display' of the first display if it does not matches", function () {

            angle.angle_default_display = '/displays/3';
            var copyAngle = angleCopyHandler.GetCopyAngleData(angle, '/models/1');
            expect(copyAngle.angle_default_display).toEqual(copyAngle.display_definitions[0].id);

        });

    });
});

