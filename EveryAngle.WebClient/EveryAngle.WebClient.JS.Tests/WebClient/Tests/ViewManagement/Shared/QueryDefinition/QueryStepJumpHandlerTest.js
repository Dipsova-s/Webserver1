/// <reference path="/Dependencies/ViewManagement/Angle/followupPageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />

describe("QueryStepJumpHandler", function () {
    var handler;
    beforeEach(function () {
        handler = new QueryDefinitionHandler();
    });

    describe(".IsJump", function () {
        it("should return true when [step_type] equal 'followup'", function () {
            var result = handler.IsJump({ step_type: 'followup' });
            expect(result).toEqual(true);
        });
        it("should return false when [step_type] is not 'followup'", function () {
            var result = handler.IsJump({ step_type: 'sorting' });
            expect(result).toEqual(false);
        });
    });
    describe(".IsErrorJump", function () {
        it("should return false when [query step] is not a jump", function () {
            spyOn(handler, 'IsJump').and.returnValue(false);
            var queryStep = { valid: function () { return true; } };
            var result = handler.IsErrorJump(queryStep);
            expect(result).toEqual(false);
        });
        it("should return false when [query step] is valid", function () {
            spyOn(handler, 'IsJump').and.returnValue(true);
            var queryStep = { valid: function () { return true; } };
            var result = handler.IsErrorJump(queryStep);
            expect(result).toEqual(false);
        });
        it("should return true when [query step] is an invalid jump", function () {
            spyOn(handler, 'IsJump').and.returnValue(true);
            var queryStep = { valid: function () { return false; } };
            var result = handler.IsErrorJump(queryStep);
            expect(result).toEqual(true);
        });
    });
    describe(".HasErrorJump", function () {
        it("should be true", function () {
            spyOn(handler, 'GetJumps').and.returnValues([{}, {}]);
            spyOn(handler, 'IsErrorJump').and.returnValues([false, true]);
            var result = handler.HasErrorJump();
            expect(result).toEqual(true);
        });
    });
    describe(".GetJumps", function () {
        it("should return objects [query steps] when there are any objects with [step_types] equal [followup]", function () {
            handler.Data([
                { step_type: 'followup' }
            ]);
            var result = handler.GetJumps();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(1);
        });

        it("should return empty array [query steps] when there is no object with [step_types] equal [followup]", function () {
            handler.Data([
                { step_type: 'filter' }
            ]);
            var result = handler.GetJumps();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(0);
        });
    });
    describe(".GetLastJump", function () {
        it("should return the last Jump from parent and handler", function () {
            handler.Parent({
                GetJumps: function () { return [{ id: 'pJump1' }, { id: 'pJump2' }]; }
            });
            spyOn(handler, 'GetJumps').and.returnValue([{ id: 'myJump1' }, { id: 'myJump2' }]);
            var result = handler.GetLastJump();
            expect(result).not.toBeNull();
            expect(result.id).toEqual('myJump2');
        });

        it("should return the last Jump from parent when handler's jump is empty", function () {
            handler.Parent({
                GetJumps: function () { return [{ id: 'pJump1' }, { id: 'pJump2' }]; }
            });
            spyOn(handler, 'GetJumps').and.returnValue([]);
            var result = handler.GetLastJump();
            expect(result).not.toBeNull();
            expect(result.id).toEqual('pJump2');
        });

        it("should return the last Jump from handler when parent's jump is empty", function () {
            handler.Parent({
                GetJumps: function () { return []; }
            });
            spyOn(handler, 'GetJumps').and.returnValue([{ id: 'myJump1' }, { id: 'myJump2' }]);
            var result = handler.GetLastJump();
            expect(result).not.toBeNull();
            expect(result.id).toEqual('myJump2');
        });

        it("should return the empty array when there is no jump in handler and/or its parent", function () {
            handler.Parent(null);
            spyOn(handler, 'GetJumps').and.returnValue([]);
            var result = handler.GetLastJump();
            expect(result).toBeNull();
        });
    });
    describe(".CanAddFilterFromJump", function () {
        var tests = [
            {
                title: 'can add filter from jump (valid=true, authorization=true)',
                valid: true,
                authorization: true,
                expected: true
            },
            {
                title: 'cannot add filter from jump (valid=false, authorization=true)',
                valid: false,
                authorization: true,
                expected: false
            },
            {
                title: 'cannot add filter from jump (valid=true, authorization=false)',
                valid: true,
                authorization: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(handler, 'CanAdd').and.returnValue(test.authorization);
                var queryStep = { valid: ko.observable(test.valid) };
                var result = handler.CanAddFilterFromJump(queryStep);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });
    describe(".CanRemoveJump", function () {
        var tests = [
            {
                title: 'can remove jump (is_adhoc=true, can_change=false, can_save=false)',
                is_adhoc: true,
                can_change: false,
                can_save: false,
                expected: true
            },
            {
                title: 'can remove jump (is_adhoc=false, can_change=true, can_save=true)',
                is_adhoc: false,
                can_change: true,
                can_save: true,
                expected: true
            },
            {
                title: 'cannot remove jump (is_adhoc=false, can_change=false, can_save=true)',
                is_adhoc: false,
                can_change: false,
                can_save: true,
                expected: false
            },
            {
                title: 'can remove jump (is_adhoc=false, can_change=true, can_save=false)',
                is_adhoc: false,
                can_change: true,
                can_save: false,
                expected: true
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(handler.Authorizations, 'CanChangeJump').and.returnValue(test.can_change);
                spyOn(handler.Authorizations, 'CanSave').and.returnValue(test.can_save);
                var queryStep = { is_adhoc: ko.observable(test.is_adhoc) };
                var result = handler.CanRemoveJump(queryStep);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });
    describe(".RemoveJump", function () {
        beforeEach(function () {
            spyOn(handler, 'IsFilterOrJump').and.returnValue(true);
        });
        it("should set handler.Data() to be empty when handler.Data() is already empty", function () {
            handler.Data([]);
            var queryStep = { step_type: 'followup' };
            handler.RemoveJump(queryStep);

            expect(handler.Data()).not.toBeNull();
            expect(handler.Data().length).toEqual(0);
        });
        it("should remove data from backward until that data is queryStep", function () {
            var queryStep = { id: 2 };
            handler.Data([
                { id: 1 },
                queryStep,
                { id: 3, is_applied: false }
            ]);
            handler.RemoveJump(queryStep);

            expect(handler.Data()).not.toBeNull();
            expect(handler.Data().length).toEqual(1);
            expect(handler.Data()[0].id).toEqual(1);
        });
    });
    describe(".AddJump", function () {
        it("should insert new jump by GetAddJumpOrFilterIndex()", function () {
            spyOn(modelFollowupsHandler, 'SetFollowups');
            spyOn(handler, 'GetAddJumpOrFilterIndex').and.returnValue(1);
            spyOn(handler, 'ExpandPanel');
            spyOn(handler, 'CloseAllFilterEditors');
            spyOn(handler, 'ScrollToItem');
            spyOn(handler, 'TriggerUpdateBlockUI');

            handler.Data([
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ]);

            var field = { id: 1 };
            handler.AddJump(field);

            var result = handler.Data();
            expect(result).not.toBeNull();
            expect(result.length).toEqual(4);
            expect(result[0].id).toEqual(1);
            expect(result[2].id).toEqual(2);
            expect(result[3].id).toEqual(3);

            var adhocJump = result[1];
            expect(adhocJump.step_type).toEqual('followup');
            expect(adhocJump.followup).toEqual(1);
            expect(adhocJump.is_adhoc()).toEqual(true);

            expect(modelFollowupsHandler.SetFollowups).toHaveBeenCalledTimes(1);
            expect(handler.ExpandPanel).toHaveBeenCalledTimes(1);
            expect(handler.CloseAllFilterEditors).toHaveBeenCalledTimes(1);
            expect(handler.ScrollToItem).toHaveBeenCalledTimes(1);
            expect(handler.TriggerUpdateBlockUI).toHaveBeenCalledTimes(1);
        });
    });
    describe(".ShowInfoJumpPopup", function () {
        it("should pass parameter to ShowHelpTextPopup correctly", function () {
            spyOn(helpTextHandler, 'ShowHelpTextPopup').and.callFake(function (args1, args2, args3) {
                expect(args1).toEqual('followupValue');
                expect(args2).toEqual('followup');
                expect(args3).toEqual('modelValue');
            });

            var queryStep = {
                followup: 'followupValue',
                model: 'modelValue'
            };

            handler.ShowInfoJumpPopup(queryStep);
        });
    });
    describe(".ShowAddJumpPopup", function () {
        it("should do nothing when CanAdd() is false", function () {
            spyOn(handler, 'CanAdd').and.returnValue(false);

            spyOn(followupPageHandler, 'SetHandlerValues');
            spyOn(followupPageHandler, 'ShowPopup');

            handler.ShowAddJumpPopup();

            expect(followupPageHandler.SetHandlerValues).toHaveBeenCalledTimes(0);
            expect(followupPageHandler.ShowPopup).toHaveBeenCalledTimes(0);
        });
        it("should show AddJumpPopup for angle when handler has no Parent", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);
            spyOn(handler, 'Parent').and.returnValue(null);
            spyOn(handler, 'GetData').and.returnValue([{}, {}]);

            spyOn(followupPageHandler, 'SetHandlerValues').and.callFake(function (args1, args2, args3) {
                expect(args2.length).toEqual(2);
                expect(args3.length).toEqual(0);
            });
            spyOn(followupPageHandler, 'ShowPopup');

            handler.ShowAddJumpPopup();

            expect(followupPageHandler.SetHandlerValues).toHaveBeenCalledTimes(1);
            expect(followupPageHandler.ShowPopup).toHaveBeenCalledTimes(1);
        });
        it("should show AddJumpPopup for display when handler has Parent", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);
            spyOn(handler, 'Parent').and.returnValue({ GetData: function () { return [{}]; } });
            spyOn(handler, 'GetData').and.returnValue([{}, {}]);

            spyOn(followupPageHandler, 'SetHandlerValues').and.callFake(function (args1, args2, args3) {
                expect(args2.length).toEqual(1);
                expect(args3.length).toEqual(2);
            });
            spyOn(followupPageHandler, 'ShowPopup');

            handler.ShowAddJumpPopup();

            expect(followupPageHandler.SetHandlerValues).toHaveBeenCalledTimes(1);
            expect(followupPageHandler.ShowPopup).toHaveBeenCalledTimes(1);
        });
    });
    describe(".ShowAddFilterFromJumpPopup", function () {
        it("should do nothing when CanAdd() is false", function () {
            spyOn(handler, 'CanAdd').and.returnValue(false);

            spyOn(handler, 'GetAddFilterTarget');
            spyOn(handler, 'InitialAddFilterOptions');
            spyOn(fieldsChooserHandler, 'ShowPopup');

            var queryStep = {};
            handler.ShowAddFilterFromJumpPopup(queryStep);

            expect(handler.InitialAddFilterOptions).toHaveBeenCalledTimes(0);
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalledTimes(0);
        });
        it("should show popup when CanAdd() is true", function () {
            spyOn(handler, 'CanAdd').and.returnValue(true);

            spyOn(handler, 'GetAddFilterTarget').and.returnValue('target');
            spyOn(handler, 'InitialAddFilterOptions');
            spyOn(fieldsChooserHandler, 'ShowPopup').and.callFake(function (args1, args2, args3) {
                expect(args1).toEqual('AddFilter');
                expect(args2).toEqual('target');
            });

            var queryStep = {};
            handler.ShowAddFilterFromJumpPopup(queryStep);

            expect(handler.InitialAddFilterOptions).toHaveBeenCalledTimes(1);
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalledTimes(1);
        });
    });
});