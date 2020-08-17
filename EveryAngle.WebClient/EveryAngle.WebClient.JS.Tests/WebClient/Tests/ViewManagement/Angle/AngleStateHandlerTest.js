/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglestateview.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/anglestatehandler.js" />

describe("AngleStateHandler", function () {

    var angleStateHandler;
    beforeEach(function () {
        angleStateHandler = new AngleStateHandler();
    });
    
    describe(".SetAngleData", function () {
        
        it("should set data", function () {
            spyOn(angleStateHandler, 'SetItemData').and.callFake($.noop);
            spyOn(angleStateHandler, 'GetDisplaysData').and.returnValue([]);
            spyOn(angleInfoModel, 'IsTemporaryAngle').and.returnValue(false);
            var angle = {
                model: "model",
                is_published: true,
                is_validated: true,
                is_template: true,
                allow_followups: true,
                allow_more_details: true,
                assigned_labels :["S2D"],
                uri: "uri",
                state: "state",
                multi_lang_name: ["en"],
                authorizations: {
                    update: true,
                    publish: true,
                    unpublish: true,
                    validate: true,
                    unvalidate: true
                },
                display_definitions: []
            };
            
            angleStateHandler.SetAngleData(angle);
            
            var data = angleStateHandler.Data;
            expect(data.is_template()).toEqual(angle.is_template);
            expect(data.allow_followups()).toEqual(angle.allow_followups);
            expect(data.not_allow_followups()).toEqual(!angle.allow_followups);
            expect(data.allow_more_details()).toEqual(angle.allow_more_details);
            expect(data.not_allow_more_details()).toEqual(!angle.allow_more_details);
        });

    });

    describe(".GetDisplaysData", function () {
        it("should get Display data", function () {
            spyOn(angleStateHandler, "CanSetDisplayState").and.returnValue(true);

            var displays = [
                {
                    id: 'id2',
                    multi_lang_name: [{ lang: 'en', text: 'name2' }],
                    state: 'state2',
                    display_type: 'type2',
                    is_public: false,
                    is_angle_default: true
                },
                {
                    id: 'id1',
                    multi_lang_name: [{ lang: 'en', text: 'name1' }],
                    state: 'state1',
                    display_type: 'type1',
                    is_public: false,
                    is_angle_default: false
                }
            ];
            var result = angleStateHandler.GetDisplaysData(displays);
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual("id1");
            expect(result[0].name).toEqual("name1");
            expect(result[0].display_type).toEqual("type1");
            expect(result[0].is_public()).toEqual(false);
            expect(result[0].is_angle_default()).toEqual(false);
            expect(result[0].css()).toEqual("icon-type1");
            expect(result[0].state).toEqual("state1");
            expect(result[1].id).toEqual("id2");
            expect(result[1].name).toEqual("name2");
            expect(result[1].display_type).toEqual("type2");
            expect(result[1].is_public()).toEqual(true);
            expect(result[1].is_angle_default()).toEqual(true);
            expect(result[1].css()).toEqual("icon-type2 default");
            expect(result[1].state).toEqual("state2");
        });
    });

    describe(".CanSetDisplayState", function () {
        var testAuthorizations = [
            {
                title: 'cannot set Display state if is_angle_default = true',
                is_public: true,
                is_angle_default: true,
                authorizations: { unpublish: true, publish: true },
                expected: false
            },
            {
                title: 'cannot set Display state if no authorizations',
                is_public: true,
                is_angle_default: false,
                authorizations: null,
                expected: false
            },
            {
                title: 'cannot set Display state if authorizations.unpublish = false',
                is_public: true,
                is_angle_default: false,
                authorizations: { unpublish: false, publish: true },
                expected: false
            },
            {
                title: 'cannot set Display state if authorizations.publish = false',
                is_public: false,
                is_angle_default: false,
                authorizations: { unpublish: true, publish: false },
                expected: false
            },
            {
                title: 'can set Display state',
                is_public: false,
                is_angle_default: false,
                authorizations: { unpublish: true, publish: true },
                expected: true
            }
        ];
        $.each(testAuthorizations, function (index, test) {
            it(test.title, function () {
                var result = angleStateHandler.CanSetDisplayState(test.is_angle_default, test.is_public, test.authorizations);
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".Displays", function () {
        it("can get displays data correctly", function () {
            spyOn(angleStateHandler, 'SetItemData').and.callFake($.noop);
            spyOn(angleInfoModel, 'IsTemporaryAngle').and.returnValue(false);
            var angle = {
                model: "model",
                is_published: true,
                is_validated: true,
                is_template: true,
                allow_followups: true,
                allow_more_details: true,
                assigned_labels: ["S2D"],
                uri: "uri",
                state: "state",
                multi_lang_name: ["en"],
                authorizations: {
                    update: true,
                    publish: true,
                    unpublish: true,
                    validate: true,
                    unvalidate: true
                },
                display_definitions: [{ uri: 'displays/1', id: 'id1' },
                    { uri: 'displays/2', id: 'id2' }]
            };

            angleStateHandler.SetAngleData(angle);
            var result = angleStateHandler.Displays();
            expect(result.length).toEqual(2);
        });
    });

});