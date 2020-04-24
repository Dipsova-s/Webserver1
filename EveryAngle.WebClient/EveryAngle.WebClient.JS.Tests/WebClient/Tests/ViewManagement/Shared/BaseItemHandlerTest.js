/// <reference path="/Dependencies/ErrorHandler/ErrorHandler.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ResolveAngleDisplayHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/BaseItemHandler.js" />

describe("BaseItemHandler", function () {
    var baseItemHandler;
    beforeEach(function () {
        baseItemHandler = new BaseItemHandler();
        baseItemHandler.ItemDescriptionHandler = new ItemDescriptionHandler();
        baseItemHandler.QueryDefinitionHandler = new QueryDefinitionHandler();
    });

    describe("constructor", function () {
        it("should define variables and functions", function () {
            // assert
            expect($.isEmptyObject(baseItemHandler.Data())).toEqual(true);
            expect(baseItemHandler.ItemDescriptionHandler).not.toEqual(null);
            expect(baseItemHandler.QueryDefinitionHandler).not.toEqual(null);
            expect(typeof baseItemHandler.Initial).toEqual('function');
            expect(typeof baseItemHandler.SetData).toEqual('function');
            expect(typeof baseItemHandler.GetChangeData).toEqual('function');
            expect(typeof baseItemHandler.UpdateDataFunction).toEqual('function');
            expect(typeof baseItemHandler.UpdateStateFunction).toEqual('function');
            expect(typeof baseItemHandler.UpdateAdhocFunction).toEqual('function');
        });
    });

    describe(".GetName", function () {
        it("should get name", function () {
            // prepare
            var model = {
                multi_lang_name: [{ lang: 'en', text: 'my-name' }]
            };
            baseItemHandler.Data(model);

            // assert
            expect(baseItemHandler.GetName()).toEqual('my-name');
        });
    });

    describe(".GetDescription", function () {
        it("should get description", function () {
            // prepare
            var model = {
                multi_lang_description: [{ lang: 'en', text: 'my-description' }]
            };
            baseItemHandler.Data(model);

            // assert
            expect(baseItemHandler.GetDescription()).toEqual('my-description');
        });
    });

    describe(".GetDescriptionText", function () {
        it("should get description", function () {
            // prepare
            spyOn(baseItemHandler, 'GetDescription').and.returnValue('<h1>header</h1><p>details</p>');

            // assert
            expect(baseItemHandler.GetDescriptionText()).toEqual('details');
        });
    });

    describe(".GetModelName", function () {
        var tests = [
            {
                title: 'should not get model name',
                model: null,
                expected: ''
            },
            {
                title: 'should get model name as Id',
                model: { id: 'model_1' },
                expected: 'model_1'
            },
            {
                title: 'should get model name as short name',
                model: { id: 'model_1', short_name: 'Model 1' },
                expected: 'Model 1'
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                spyOn(modelsHandler, 'GetModelByUri').and.returnValue(test.model);
                baseItemHandler.Data({ model: 'any' });

                // assert
                expect(baseItemHandler.GetModelName()).toEqual(test.expected);
            });
        });
    });

    describe(".IsAdhoc", function () {
        it("should be adhoc Angle", function () {
            // prepare
            baseItemHandler.Data({ uri: '/models/1/angles/abc1d-efc3h-ig0fr' });

            // assert
            expect(baseItemHandler.IsAdhoc()).toEqual(true);
        });

        it("should not be adhoc Angle", function () {
            // prepare
            baseItemHandler.Data({ uri: '/models/1/angles/1' });

            // assert
            expect(baseItemHandler.IsAdhoc()).toEqual(false);
        });
    });

    describe(".GetDetails", function () {
        it("should get details", function () {
            // prepare
            baseItemHandler.Data({ my_details: '{"test":true}' });
            var result = baseItemHandler.GetDetails('my_details');

            // assert
            expect(result).toEqual({ test: true });
        });
    });

    describe(".SetDetails", function () {
        it("should set details", function () {
            // prepare
            baseItemHandler.Data({ my_details: '{"test":false}' });
            baseItemHandler.SetDetails('my_details', { test: true });

            // assert
            expect(baseItemHandler.Data().my_details).toEqual('{"test":true}');
        });
    });

    describe(".ShowEditDescriptionPopup", function () {
        it("can show edit description popup", function () {
            // prepare
            spyOn(popup, 'Show').and.callFake($.noop);
            baseItemHandler.Data({
                id: jQuery.noop,
                multi_lang_name: [],
                multi_lang_description: [],
                authorizations: {}
            });
            baseItemHandler.ShowEditDescriptionPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".CanUpdateDescription", function () {
        it("can update description", function () {
            // prepare
            baseItemHandler.Data({ authorizations: { update: true } });

            // assert
            expect(baseItemHandler.CanUpdateDescription()).toEqual(true);
        });

        it("cannot update description", function () {
            // prepare
            baseItemHandler.Data({ authorizations: { update: false } });

            // assert
            expect(baseItemHandler.CanUpdateDescription()).toEqual(false);
        });
    });

    describe(".SaveDescription", function () {
        it("should show progress bar and save", function () {
            // prepare
            baseItemHandler.ItemDescriptionHandler = new ItemDescriptionHandler([], []);
            spyOn(baseItemHandler.ItemDescriptionHandler, 'ShowProgressbar').and.callFake($.noop);
            spyOn(baseItemHandler, 'UpdateData').and.callFake($.noop);
            baseItemHandler.SaveDescription();

            // assert
            expect(baseItemHandler.ItemDescriptionHandler.ShowProgressbar).toHaveBeenCalled();
            expect(baseItemHandler.UpdateData).toHaveBeenCalled();
        });
    });

    describe(".SaveDescriptionDone", function () {
        var tests = [
            {
                title: 'should close popup and do not show notification when is ad-hoc',
                is_adhoc: true,
                expected: 0
            },
            {
                title: 'should close popup and show notification when is not ad-hoc',
                is_adhoc: false,
                expected: 1
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                baseItemHandler.ItemDescriptionHandler = new ItemDescriptionHandler([], []);
                spyOn(baseItemHandler.ItemDescriptionHandler, 'CloseEditPopup').and.callFake($.noop);
                spyOn(baseItemHandler, 'GetName').and.returnValue('');
                spyOn(baseItemHandler, 'IsAdhoc').and.returnValue(test.is_adhoc);
                spyOn(toast, 'MakeSuccessTextFormatting').and.callFake($.noop);
                baseItemHandler.SaveDescriptionDone();

                // assert
                expect(baseItemHandler.ItemDescriptionHandler.CloseEditPopup).toHaveBeenCalled();
                expect(toast.MakeSuccessTextFormatting).toHaveBeenCalledTimes(test.expected);
            });
        });
    });

    describe(".SaveDescriptionFail", function () {
        it("should hide progress bar", function () {
            // prepare
            baseItemHandler.ItemDescriptionHandler = new ItemDescriptionHandler([], []);
            spyOn(baseItemHandler.ItemDescriptionHandler, 'HideProgressbar').and.callFake($.noop);
            baseItemHandler.SaveDescriptionFail();

            // assert
            expect(baseItemHandler.ItemDescriptionHandler.HideProgressbar).toHaveBeenCalled();
        });
    });

    describe(".InitialQueryDefinition", function () {
        it("should set data successfully", function () {
            // prepare
            baseItemHandler.QueryDefinitionHandler = new QueryDefinitionHandler();
            spyOn(baseItemHandler.QueryDefinitionHandler, 'SetData').and.callFake($.noop);

            baseItemHandler.InitialQueryDefinition({}, {}, {});

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".SaveQueryDefinition", function () {
        it("should skip when has not changed", function () {
            // prepare
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasChanged').and.returnValue(false);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'Validate').and.returnValue({ valid: true });
            spyOn(popup, 'Alert');
            spyOn(baseItemHandler.QueryDefinitionHandler, 'GetQueryDefinition');

            baseItemHandler.SaveQueryDefinition();

            // assert
            expect(popup.Alert).not.toHaveBeenCalled();
            expect(baseItemHandler.QueryDefinitionHandler.GetQueryDefinition).not.toHaveBeenCalled();
        });

        it("should skip when invalid", function () {
            // prepare
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'Validate').and.returnValue({ valid: false, message: 'error' });
            spyOn(popup, 'Alert');
            spyOn(baseItemHandler.QueryDefinitionHandler, 'GetQueryDefinition');

            baseItemHandler.SaveQueryDefinition();

            // assert
            expect(popup.Alert).toHaveBeenCalled();
            expect(baseItemHandler.QueryDefinitionHandler.GetQueryDefinition).not.toHaveBeenCalled();
        });

        it("should save state when has changed jump", function () {
            // prepare
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'Validate').and.returnValue({ valid: true });
            spyOn(baseItemHandler.QueryDefinitionHandler, 'GetQueryDefinition');
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasJumpChanged').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'CanSave').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'ShowProgressbar');
            spyOn(baseItemHandler, 'UpdateData').and.callFake($.noop);
            spyOn(popup, 'Confirm');

            baseItemHandler.SaveQueryDefinition();

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.GetQueryDefinition).toHaveBeenCalled();
            expect(baseItemHandler.QueryDefinitionHandler.ShowProgressbar).not.toHaveBeenCalled();
            expect(baseItemHandler.UpdateData).not.toHaveBeenCalled();
            expect(popup.Confirm).toHaveBeenCalled();
        });

        it("should save state when has not changed jump", function () {
            // prepare
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'Validate').and.returnValue({ valid: true });
            spyOn(baseItemHandler.QueryDefinitionHandler, 'GetQueryDefinition');
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasJumpChanged').and.returnValue(false);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'CanSave').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'ShowProgressbar');
            spyOn(baseItemHandler, 'UpdateData').and.callFake($.noop);
            spyOn(popup, 'Confirm');

            baseItemHandler.SaveQueryDefinition();

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.GetQueryDefinition).toHaveBeenCalled();
            expect(baseItemHandler.QueryDefinitionHandler.ShowProgressbar).toHaveBeenCalled();
            expect(baseItemHandler.UpdateData).toHaveBeenCalled();
            expect(popup.Confirm).not.toHaveBeenCalled();
        });

        it("should save state when has not changed jump and cannot save", function () {
            // prepare
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasChanged').and.returnValue(true);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'Validate').and.returnValue({ valid: true });
            spyOn(baseItemHandler.QueryDefinitionHandler, 'GetQueryDefinition');
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HasJumpChanged').and.returnValue(false);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'CanSave').and.returnValue(false);
            spyOn(baseItemHandler.QueryDefinitionHandler, 'ShowProgressbar');
            spyOn(baseItemHandler, 'UpdateData').and.callFake($.noop);
            spyOn(baseItemHandler, 'SaveQueryDefinitionDone');
            spyOn(baseItemHandler, 'SaveAdhocQueryDefinition');
            spyOn(popup, 'Confirm');

            baseItemHandler.SaveQueryDefinition();

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.GetQueryDefinition).toHaveBeenCalled();
            expect(baseItemHandler.QueryDefinitionHandler.ShowProgressbar).not.toHaveBeenCalled();
            expect(baseItemHandler.UpdateData).not.toHaveBeenCalled();
            expect(baseItemHandler.SaveQueryDefinitionDone).not.toHaveBeenCalled();
            expect(baseItemHandler.SaveAdhocQueryDefinition).toHaveBeenCalled();
            expect(popup.Confirm).not.toHaveBeenCalled();
        });
    });

    describe(".SaveAdhocQueryDefinition", function () {
        it("should save adhoc query definition", function () {
            // prepare
            spyOn(baseItemHandler, 'GetData').and.returnValue({});
            spyOn(baseItemHandler, 'UpdateAdhocFunction');
            spyOn(baseItemHandler, 'ExecuteQueryDefinition');
            baseItemHandler.SaveAdhocQueryDefinition();

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.ForcedSetData).toEqual(true);
            expect(baseItemHandler.UpdateAdhocFunction).toHaveBeenCalled();
            expect(baseItemHandler.ExecuteQueryDefinition).toHaveBeenCalled();
        });
    });

    describe(".SaveQueryDefinitionWithJump", function () {
        it("should call save function", function () {
            // prepare
            var data = {
                save: $.noop,
                definition: {}
            };
            spyOn(data, 'save');
            baseItemHandler.SaveQueryDefinitionWithJump(data.save, data.definition);

            // assert
            expect(data.save).toHaveBeenCalled();
        });
    });

    describe(".SaveQueryDefinitionDone", function () {
        it("should close popup and show notification", function () {
            // prepare
            spyOn(baseItemHandler, 'GetName').and.returnValue('');
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HideProgressbar').and.callFake($.noop);
            spyOn(toast, 'MakeSuccessTextFormatting').and.callFake($.noop);
            baseItemHandler.SaveQueryDefinitionDone();

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.ForcedSetData).toEqual(true);
            expect(baseItemHandler.QueryDefinitionHandler.HideProgressbar).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".SaveQueryDefinitionFail", function () {
        it("should hide progress bar", function () {
            // prepare
            spyOn(baseItemHandler.QueryDefinitionHandler, 'HideProgressbar').and.callFake($.noop);
            baseItemHandler.SaveQueryDefinitionFail();

            // assert
            expect(baseItemHandler.QueryDefinitionHandler.HideProgressbar).toHaveBeenCalled();
        });
    });

    describe(".Update", function () {
        var mock;
        beforeEach(function () {
            mock = {
                done: $.noop,
                fail: $.noop
            };
            spyOn(mock, 'done');
            spyOn(mock, 'fail');
            spyOn(resolveAngleDisplayHandler, 'ShowResolveAngleDisplayPopup');
            spyOn(errorHandlerModel, 'BuildCustomAjaxError');
        });

        it("should update successfully", function () {
            // prepare
            var handler = $.Deferred().resolve().promise;
            baseItemHandler.Update(handler, [], mock.done, mock.fail);

            // assert
            expect(mock.done).toHaveBeenCalled();
            expect(mock.fail).not.toHaveBeenCalled();
        });

        it("should not update because conflicted", function () {
            // prepare
            var handler = $.Deferred().reject({
                status: 422,
                responseText: '\\"tasks\\"',
                settings: {}
            }).promise;
            baseItemHandler.Update(handler, [], mock.done, mock.fail);

            // assert
            expect(mock.done).not.toHaveBeenCalled();
            expect(mock.fail).toHaveBeenCalled();
            expect(resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup).toHaveBeenCalled();
            expect(errorHandlerModel.BuildCustomAjaxError).not.toHaveBeenCalled();
        });

        it("should not update because another error", function () {
            // prepare
            var handler = $.Deferred().reject({
                status: 404,
                settings: {}
            }).promise;
            baseItemHandler.Update(handler, [], mock.done, mock.fail);

            // assert
            expect(mock.done).not.toHaveBeenCalled();
            expect(mock.fail).toHaveBeenCalled();
            expect(resolveAngleDisplayHandler.ShowResolveAngleDisplayPopup).not.toHaveBeenCalled();
            expect(errorHandlerModel.BuildCustomAjaxError).toHaveBeenCalled();
        });
    });

    describe(".UpdateData", function () {
        it("should update data", function () {
            // prepare
            baseItemHandler.Data({});
            spyOn(baseItemHandler, 'GetUpdateHandler').and.returnValue($.when);
            var mock = {
                done: $.noop,
                fail: $.noop
            };
            spyOn(mock, 'done');
            spyOn(mock, 'fail');
            baseItemHandler.UpdateData({}, false, mock.done, mock.fail);

            // assert
            expect(mock.done).toHaveBeenCalled();
            expect(mock.fail).not.toHaveBeenCalled();
        });
    });

    describe(".UpdateState", function () {
        it("should update state", function () {
            // prepare
            baseItemHandler.Data({});
            spyOn(baseItemHandler, 'GetUpdateHandler').and.returnValue($.when);
            spyOn(baseItemHandler, 'SetData');
            var mock = {
                done: $.noop,
                fail: $.noop
            };
            spyOn(mock, 'done');
            spyOn(mock, 'fail');
            baseItemHandler.UpdateState({}, mock.done, mock.fail);

            // assert
            expect(mock.done).toHaveBeenCalled();
            expect(mock.fail).not.toHaveBeenCalled();
            expect(baseItemHandler.SetData).not.toHaveBeenCalled();
        });
    });

    describe(".GetUpdateHandler", function () {
        var handler;
        beforeEach(function () {
            baseItemHandler.UpdateAdhocFunction = 'adhoc-handler';
            handler = 'not-adhoc-handler';
        });

        var tests = [
            {
                title: 'should get adhoc handler (no data)',
                data: {},
                is_adhoc: false,
                expected: 'adhoc-handler'
            },
            {
                title: 'should get adhoc handler (is adhoc item)',
                data: { value: true },
                is_adhoc: true,
                expected: 'adhoc-handler'
            },
            {
                title: 'should not get adhoc handler',
                data: { value: true },
                is_adhoc: false,
                expected: 'not-adhoc-handler'
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                spyOn(baseItemHandler, 'IsAdhoc').and.returnValue(test.is_adhoc);

                // assert
                expect(baseItemHandler.GetUpdateHandler(test.data, handler)).toEqual(test.expected);
            });
        });
    });
});
