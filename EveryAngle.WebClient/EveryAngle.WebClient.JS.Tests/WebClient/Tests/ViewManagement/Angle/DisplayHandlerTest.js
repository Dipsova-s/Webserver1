/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/FollowupPageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayOverviewHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayDrilldownHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/BaseDisplayResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/DisplayListResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/DisplayChartResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayResultHandler/DisplayPivotResultHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplayHandler.js" />

describe("DisplayHandler", function () {
    var displayHandler;
    beforeEach(function () {
        displayHandler = new DisplayHandler({}, new AngleHandler());
    });

    describe(".Initial", function () {
        it("should call functions", function () {
            //initial
            spyOn(displayHandler, 'SetData');
            spyOn(displayHandler, 'InitialQueryDefinition');

            //process
            displayHandler.Initial({}, new AngleHandler());

            //assert
            expect(displayHandler.SetData).toHaveBeenCalled();
            expect(displayHandler.InitialQueryDefinition).toHaveBeenCalled();
            expect(typeof displayHandler.UpdateDataFunction).toEqual('function');
            expect(typeof displayHandler.UpdateStateFunction).toEqual('function');
            expect(typeof displayHandler.UpdateAdhocFunction).toEqual('function');
        });
    });

    describe(".ForceInitial", function () {
        it("should force to initial", function () {
            //initial
            spyOn(displayHandler, 'Initial');

            //process
            displayHandler.ForceInitial({});

            //assert
            expect(displayHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".SetData", function () {
        it("should set data", function () {
            //process
            var model = {
                id: 'my-id',
                is_public: true,
                is_angle_default: true,
                user_specific: {
                    is_user_default: true,
                    execute_on_login: true
                }
            };
            displayHandler.SetData(model);

            //assert
            expect(displayHandler.Data().id()).toEqual('my-id');
            expect(displayHandler.Data().is_public()).toEqual(true);
            expect(displayHandler.Data().is_angle_default()).toEqual(true);
            expect(displayHandler.Data().user_specific.is_user_default()).toEqual(true);
            expect(displayHandler.Data().user_specific.execute_on_login()).toEqual(true);
        });
    });

    describe(".GetData", function () {
        it("should get data", function () {
            var data = { id: 'display1' };
            displayHandler.Data(data);
            var result = displayHandler.GetData();

            // assert
            expect(result).not.toEqual(data);
            expect(result.id).toEqual('display1');
        });
    });

    describe(".SetRawData", function () {
        it("should set a raw data", function () {
            //initial
            spyOn(displayHandler.AngleHandler, 'SetRawDisplay');

            // prepare
            displayHandler.SetRawData({});

            //assert
            expect(displayHandler.AngleHandler.SetRawDisplay).toHaveBeenCalled();
        });
    });

    describe(".GetRawData", function () {
        it("should get a raw data", function () {
            //initial
            displayHandler.AngleHandler.Data({
                display_definitions: [
                    { uri: '/displays/1' }
                ]
            });
            displayHandler.Data().uri = '/displays/1';

            // prepare
            var result = displayHandler.GetRawData();

            //assert
            expect(result).not.toEqual(null);
        });
    });

    describe(".GetDetails", function () {
        it("should get a display details", function () {
            //initial
            displayHandler.Data().display_details = '{"mydetails":"yes"}';

            // prepare
            var result = displayHandler.GetDetails();

            //assert
            expect(result).toEqual({ "mydetails": "yes" });
        });
    });

    describe(".SetDetails", function () {
        it("should set a display details", function () {
            //initial
            displayHandler.Data().display_details = '{"mydetails":"no"}';

            // prepare
            displayHandler.SetDetails({ "mydetails": "yes" });

            //assert
            expect(displayHandler.Data().display_details).toEqual('{"mydetails":"yes"}');
        });
    });

    describe(".Clone", function () {
        it("should clone handler", function () {
            var result = displayHandler.Clone();

            // assert
            expect(result instanceof DisplayHandler).toEqual(true);
        });
    });

    describe(".CloneData", function () {
        beforeEach(function () {
            var display = {
                id: 'display1',
                is_public: true,
                user_specific: JSON.stringify({})
            };
            spyOn(displayHandler, 'GetData').and.returnValue(display);
        });
        it("should get clone data of saved Display", function () {
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(false);
            var result = displayHandler.CloneData();

            // assert
            expect(result.id).not.toEqual('display1');
            expect(result.is_public).toEqual(false);
            expect(result.user_specific).toEqual({
                is_user_default: false,
                execute_on_login: false
            });
        });
        it("should get clone data of adhoc Display", function () {
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(true);
            var result = displayHandler.CloneData();

            // assert
            expect(result.id).toEqual('display1');
            expect(result.is_public).toEqual(false);
            expect(result.user_specific).toEqual({
                is_user_default: false,
                execute_on_login: false
            });
        });
    });

    describe(".SetDisplayResultHandler", function () {
        it("should set a handler for list Display", function () {
            // prepare
            displayHandler.SetDisplayResultHandler('list');

            //assert
            expect(displayHandler.DisplayResultHandler instanceof DisplayListResultHandler).toEqual(true);
        });
        it("should set a handler for chart Display", function () {
            // prepare
            displayHandler.SetDisplayResultHandler('chart');

            //assert
            expect(displayHandler.DisplayResultHandler instanceof DisplayChartResultHandler).toEqual(true);
        });
        it("should set a handler for pivot Display", function () {
            // prepare
            displayHandler.SetDisplayResultHandler('pivot');

            //assert
            expect(displayHandler.DisplayResultHandler instanceof DisplayPivotResultHandler).toEqual(true);
        });
        it("should not set a handler for an invalid Display", function () {
            // prepare
            displayHandler.SetDisplayResultHandler('xxx');

            //assert
            expect(displayHandler.DisplayResultHandler instanceof BaseDisplayResultHandler).toEqual(true);
        });
    });

    describe(".GetValidationResult", function () {
        it("should get a validation result", function () {
            var result = displayHandler.GetValidationResult();

            // assert
            expect(result.Valid).toEqual(true);
        });
    });

    describe(".CanUpdateUserSpecific", function () {
        it("can update user specific", function () {
            displayHandler.Data().authorizations.update_user_specific = true;
            var result = displayHandler.CanUpdateUserSpecific();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanUpdateAngleDefault", function () {
        var tests = [
            {
                angle: {
                    update: true,
                    is_published: false,
                    adhoc: true
                },
                display: {
                    is_angle_default: false,
                    is_public: false,
                    adhoc: true
                },
                expected: true
            },
            {
                angle: {
                    update: true,
                    is_published: true,
                    adhoc: false
                },
                display: {
                    is_angle_default: false,
                    is_public: true,
                    adhoc: false
                },
                expected: true
            },
            {
                angle: {
                    update: false,
                    is_published: false,
                    adhoc: true
                },
                display: {
                    is_angle_default: false,
                    is_public: true,
                    adhoc: false
                },
                expected: false
            },
            {
                angle: {
                    update: true,
                    is_published: false,
                    adhoc: true
                },
                display: {
                    is_angle_default: true,
                    is_public: true,
                    adhoc: false
                },
                expected: false
            },
            {
                angle: {
                    update: true,
                    is_published: true,
                    adhoc: true
                },
                display: {
                    is_angle_default: false,
                    is_public: false,
                    adhoc: false
                },
                expected: false
            },
            {
                angle: {
                    update: true,
                    is_published: false,
                    adhoc: false
                },
                display: {
                    is_angle_default: false,
                    is_public: true,
                    adhoc: true
                },
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var title = test.expected ? 'can update angle default' : 'cannot update angle default';
            title += ', angle=' + JSON.stringify(test.angle);
            title += ', display=' + JSON.stringify(test.display);
            it(title, function () {
                spyOn(displayHandler.AngleHandler, 'CanUpdate').and.returnValue(test.angle.update);
                displayHandler.AngleHandler.Data().is_published(test.angle.is_published);
                spyOn(displayHandler.AngleHandler, 'IsAdhoc').and.returnValue(test.angle.adhoc);
                displayHandler.Data().is_angle_default(test.display.is_angle_default);
                displayHandler.Data().is_public(test.display.is_public);
                spyOn(displayHandler, 'IsAdhoc').and.returnValue(test.display.adhoc);
                var result = displayHandler.CanUpdateAngleDefault();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".SetAngleDefault", function () {
        it("set angle default", function () {
            displayHandler.Data().uri = 'uri1';
            displayHandler.Data().id('id1');
            displayHandler.Data().is_angle_default(true);
            displayHandler.AngleHandler.Displays = [
                new DisplayHandler({}, displayHandler.AngleHandler),
                displayHandler,
                new DisplayHandler({}, displayHandler.AngleHandler)
            ];
            displayHandler.SetAngleDefault();

            // assert
            expect(displayHandler.Data().is_angle_default()).toEqual(true);
            expect(displayHandler.AngleHandler.Data().angle_default_display).toEqual('id1');
            expect(displayHandler.AngleHandler.Displays[0].Data().is_angle_default()).toEqual(false);
            expect(displayHandler.AngleHandler.Displays[1].Data().is_angle_default()).toEqual(true);
            expect(displayHandler.AngleHandler.Displays[2].Data().is_angle_default()).toEqual(false);
        });
    });

    describe(".SetUserDefault", function () {
        it("set angle default", function () {
            displayHandler.Data().uri = 'uri1';
            displayHandler.Data().user_specific.is_user_default(true);
            displayHandler.AngleHandler.Displays = [
                new DisplayHandler({}, displayHandler.AngleHandler),
                displayHandler,
                new DisplayHandler({}, displayHandler.AngleHandler)
            ];
            displayHandler.SetUserDefault();

            // assert
            expect(displayHandler.Data().user_specific.is_user_default()).toEqual(true);
            expect(displayHandler.AngleHandler.Displays[0].Data().user_specific.is_user_default()).toEqual(false);
            expect(displayHandler.AngleHandler.Displays[1].Data().user_specific.is_user_default()).toEqual(true);
            expect(displayHandler.AngleHandler.Displays[2].Data().user_specific.is_user_default()).toEqual(false);
        });
    });

    describe(".HasChanged", function () {
        it("should check from raw and data", function () {
            spyOn(displayHandler, 'GetData').and.returnValue({ id: 'd1' });
            spyOn(displayHandler, 'GetRawData').and.returnValue({ id: 'd1' });
            var result = displayHandler.HasChanged();

            // assert
            expect(result).toEqual(false);
            expect(displayHandler.GetData).toHaveBeenCalled();
            expect(displayHandler.GetRawData).toHaveBeenCalled();
        });
    });

    describe(".SaveDescription", function () {
        it("should call confirm save", function () {
            //initial
            spyOn(displayHandler.parent.prototype, 'SaveDescription');
            spyOn(displayHandler, 'ConfirmSave');
            spyOn(displayHandler, 'IsDescriptionUsedInTask');

            // prepare
            displayHandler.SaveDescription();

            // assert
            expect(displayHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".IsDescriptionUsedInTask", function () {
        it("should return true when display description has changed and this display is used in task", function () {
            //initial
            spyOn(displayHandler, 'GetChangeData').and.returnValue(true);
            spyOn(displayHandler, 'CanCreateOrUpdate').and.returnValue(true);
            spyOn(displayHandler, 'IsUsedInTask').and.returnValue(true);

            // prepare
            var result = displayHandler.IsDescriptionUsedInTask();

            // assert
            expect(result).toBeTruthy();
            expect(displayHandler.GetChangeData).toHaveBeenCalled();
            expect(displayHandler.CanCreateOrUpdate).toHaveBeenCalled();
            expect(displayHandler.IsUsedInTask).toHaveBeenCalled();
        });

        it("should return false when display description has not changed", function () {
            //initial
            spyOn(displayHandler, 'GetChangeData').and.returnValue(null);
            spyOn(displayHandler, 'CanCreateOrUpdate').and.returnValue(true);

            // prepare
            var result = displayHandler.IsDescriptionUsedInTask();

            // assert
            expect(result).toBeFalsy();
            expect(displayHandler.GetChangeData).toHaveBeenCalled();
            expect(displayHandler.CanCreateOrUpdate).toHaveBeenCalled();
        });
    });

    describe(".ShowEditDescriptionPopup", function () {
        it("should show popup", function () {
            //initial
            spyOn(displayHandler.parent.prototype, 'ShowEditDescriptionPopup');

            //prepare
            displayHandler.ShowEditDescriptionPopup();

            //assert
            expect(displayHandler.parent.prototype.ShowEditDescriptionPopup).toHaveBeenCalled();
        });
    });

    describe(".InitialDefaultDrilldown", function () {
        it("should initial", function () {
            //initial
            spyOn(displayHandler.DisplayDrilldownHandler, 'Initial');

            //prepare
            displayHandler.InitialDefaultDrilldown();

            //assert
            expect(displayHandler.DisplayDrilldownHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".InitialQueryDefinition", function () {
        it("should initial query definition", function () {
            //initial
            spyOn(displayHandler.parent.prototype, 'InitialQueryDefinition');
            spyOn(displayHandler, 'UpdateAngleQueryDefinition');
            spyOn(displayHandler, 'SetQueryDefinitionAuthorizations');

            // prepare
            displayHandler.InitialQueryDefinition();

            // assert
            expect(displayHandler.parent.prototype.InitialQueryDefinition).toHaveBeenCalled();
            expect(displayHandler.UpdateAngleQueryDefinition).toHaveBeenCalled();
            expect(displayHandler.SetQueryDefinitionAuthorizations).toHaveBeenCalled();
            expect(displayHandler.QueryDefinitionHandler.BlockUI).toEqual(true);
            expect(displayHandler.QueryDefinitionHandler.FilterFor).toEqual(WC.WidgetFilterHelper.FILTERFOR.DISPLAY);
            expect(displayHandler.QueryDefinitionHandler.Texts.ConfirmMoveFilter).not.toEqual('');
            expect(displayHandler.QueryDefinitionHandler.Texts.AskForExecutionParamter).not.toEqual('');
        });
    });

    describe(".GetQueryDefinitionSourceData", function () {
        it("should get from raw", function () {
            spyOn(displayHandler, 'GetRawData').and.returnValue({ query_blocks: 'raw-block' });
            spyOn(displayHandler, 'Data').and.returnValue({ query_blocks: 'data-block' });
            var result = displayHandler.GetQueryDefinitionSourceData();

            // assert
            expect(result).toEqual('raw-block');
        });
        it("should get from data", function () {
            spyOn(displayHandler, 'GetRawData').and.returnValue(null);
            spyOn(displayHandler, 'Data').and.returnValue({ query_blocks: 'data-block' });
            var result = displayHandler.GetQueryDefinitionSourceData();

            // assert
            expect(result).toEqual('data-block');
        });
    });

    describe(".UpdateAngleQueryDefinition", function () {
        it("should set update Angles's definition", function () {
            // prepare
            displayHandler.UpdateAngleQueryDefinition();

            // assert
            expect(displayHandler.QueryDefinitionHandler.Parent()).not.toEqual(null);
            expect(displayHandler.QueryDefinitionHandler.Parent().ReadOnly()).toEqual(true);
        });
    });

    describe(".CanMoveFilter", function () {
        it("can move filter", function () {
            // prepare
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler.Authorizations, 'CanSave').and.returnValue(true);
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler.Authorizations, 'CanChangeFilter').and.returnValue(true);
            var result = displayHandler.CanMoveFilter();

            // assert
            expect(result).toEqual(true);
        });
        it("can move filter (can_save=true)", function () {
            // prepare
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler.Authorizations, 'CanSave').and.returnValue(false);
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler.Authorizations, 'CanChangeFilter').and.returnValue(true);
            var result = displayHandler.CanMoveFilter();

            // assert
            expect(result).toEqual(true);
        });
        it("cannot move filter (can_change=false)", function () {
            // prepare
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler.Authorizations, 'CanSave').and.returnValue(true);
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler.Authorizations, 'CanChangeFilter').and.returnValue(false);
            var result = displayHandler.CanMoveFilter();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".SetQueryDefinitionAuthorizations", function () {
        it("should set query definition's authorizations", function () {
            //initial
            spyOn(validationHandler, 'GetQueryBlocksValidation').and.returnValue({});
            spyOn(displayHandler, 'CanChangeFilter').and.returnValue(false);
            spyOn(displayHandler, 'CanChangeJump').and.returnValue(false);
            spyOn(displayHandler, 'CanExecuteQuerySteps').and.returnValue(false);
            spyOn(displayHandler, 'CanUpdateQuerySteps').and.returnValue(false);
            displayHandler.QueryDefinitionHandler.Parent(new QueryDefinitionHandler());
            resultModel.Data({ authorizations: {} });

            // prepare
            displayHandler.SetQueryDefinitionAuthorizations();

            // assert
            expect(displayHandler.QueryDefinitionHandler.Authorizations.CanChangeFilter()).toEqual(false);
            expect(displayHandler.QueryDefinitionHandler.Authorizations.CanChangeJump()).toEqual(false);
            expect(displayHandler.QueryDefinitionHandler.Authorizations.CanExecute()).toEqual(false);
            expect(displayHandler.QueryDefinitionHandler.Authorizations.CanSave()).toEqual(false);
        });
    });

    describe(".CanChangeFilter", function () {
        var tests = [
            {
                title: 'can change filter if invalid_baseclass = false, invalid_followup = false, allow_more_details = true, can_jump = true',
                invalid_baseclass: false,
                invalid_followup: false,
                allow_more_details: true,
                can_jump: true,
                expected: true
            },
            {
                title: 'cannot change filter if invalid_baseclass = true, invalid_followup = false, allow_more_details = true, can_jump = true',
                invalid_baseclass: true,
                invalid_followup: false,
                allow_more_details: true,
                can_jump: true,
                expected: false
            },
            {
                title: 'cannot change filter if invalid_baseclass = false, invalid_followup = true, allow_more_details = true, can_jump = true',
                invalid_baseclass: false,
                invalid_followup: true,
                allow_more_details: true,
                can_jump: true,
                expected: false
            },
            {
                title: 'cannot change filter if invalid_baseclass = false, invalid_followup = false, allow_more_details = false, can_jump = true',
                invalid_baseclass: false,
                invalid_followup: false,
                allow_more_details: false,
                can_jump: true,
                expected: false
            },
            {
                title: 'cannot change filter if invalid_baseclass = false, invalid_followup = false, allow_more_details = true, can_jump = false',
                invalid_baseclass: false,
                invalid_followup: false,
                allow_more_details: true,
                can_jump: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                var validation = { InvalidBaseClasses: test.invalid_baseclass, InvalidFollowups: test.invalid_followup };
                spyOn(displayHandler.AngleHandler, 'AllowMoreDetails').and.returnValue(test.allow_more_details);
                spyOn(displayHandler, 'CanUseJump').and.returnValue(test.can_jump);
                var result = displayHandler.CanChangeFilter(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanChangeJump", function () {
        var tests = [
            {
                title: 'can change jump if invalid_baseclass = false, invalid_followup = false, allow_more_details = true, allow_followups = true',
                invalid_baseclass: false,
                invalid_followup: false,
                allow_more_details: true,
                allow_followups: true,
                expected: true
            },
            {
                title: 'cannot change jump if invalid_baseclass = true, invalid_followup = false, allow_more_details = true, allow_followups = true',
                invalid_baseclass: true,
                is_adhoc: false,
                allow_more_details: true,
                allow_followups: true,
                expected: false
            },
            {
                title: 'cannot change jump if invalid_baseclass = false, invalid_followup = true, allow_more_details = true, allow_followups = true',
                invalid_baseclass: false,
                invalid_followup: true,
                allow_more_details: true,
                allow_followups: true,
                expected: false
            },
            {
                title: 'cannot change jump if invalid_baseclass = false, invalid_followup = false, allow_more_details = false, allow_followups = true',
                invalid_baseclass: false,
                invalid_followup: false,
                allow_more_details: false,
                allow_followups: true,
                expected: false
            },
            {
                title: 'cannot change jump if invalid_baseclass = false, invalid_followup = false, allow_more_details = true, allow_followups = false',
                invalid_baseclass: false,
                invalid_followup: false,
                allow_more_details: true,
                allow_followups: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                var validation = { InvalidBaseClasses: test.invalid_baseclass, InvalidFollowups: test.invalid_followup };
                spyOn(displayHandler.AngleHandler, 'AllowMoreDetails').and.returnValue(test.allow_more_details);
                spyOn(displayHandler.AngleHandler, 'AllowFollowups').and.returnValue(test.allow_followups);
                var result = displayHandler.CanChangeJump(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanExecuteQuerySteps", function () {
        var tests = [
            {
                title: 'can execute query steps if invalid_baseclass = false, invalid_followup = false and invalid_filter = false',
                invalid_baseclass: false,
                invalid_followup: false,
                invalid_filter: false,
                expected: true
            },
            {
                title: 'cannot execute query steps if invalid_baseclass = true, invalid_followup = false and invalid_filter = false',
                invalid_baseclass: true,
                invalid_followup: false,
                invalid_filter: false,
                expected: false
            },
            {
                title: 'cannot execute query steps if invalid_baseclass = false, invalid_followup = true and invalid_filter = false',
                invalid_baseclass: false,
                invalid_followup: true,
                invalid_filter: false,
                expected: false
            },
            {
                title: 'cannot execute query steps if invalid_baseclass = false, invalid_followup = false and invalid_filter = true',
                invalid_baseclass: false,
                invalid_followup: false,
                invalid_filter: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                var validation = {
                    InvalidBaseClasses: test.invalid_baseclass,
                    InvalidFollowups: test.invalid_followup,
                    InvalidFilters: test.invalid_filter
                };
                var result = displayHandler.CanExecuteQuerySteps(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanUpdateQuerySteps", function () {
        var tests = [
            {
                title: 'can save query steps if invalid_baseclass = false, invalid_followup = false and update = true',
                invalid_baseclass: false,
                invalid_followup: false,
                update: true,
                expected: true
            },
            {
                title: 'cannot save query steps if invalid_baseclass = true, invalid_followup = false and update = true',
                invalid_baseclass: true,
                invalid_followup: false,
                update: true,
                expected: false
            },
            {
                title: 'cannot save query steps if invalid_baseclass = false, invalid_followup = true and update = true',
                invalid_baseclass: false,
                invalid_followup: true,
                update: true,
                expected: false
            },
            {
                title: 'cannot save query steps if invalid_baseclass = false, invalid_followup = false and update = false',
                invalid_baseclass: false,
                invalid_followup: false,
                update: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                displayHandler.Data({ authorizations: { update: test.update } });

                // prepare
                var validation = {
                    InvalidBaseClasses: test.invalid_baseclass,
                    InvalidFollowups: test.invalid_followup
                };
                var result = displayHandler.CanUpdateQuerySteps(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".SaveAngleQueryDefinition", function () {
        beforeEach(function () {
            displayHandler.QueryDefinitionHandler.Parent(new QueryDefinitionHandler());
            spyOn(displayHandler, 'SaveQueryDefinition');
            spyOn(displayHandler.AngleHandler, 'SaveQueryDefinition');
            spyOn(displayHandler.QueryDefinitionHandler, 'InsertQueryFilter');
            spyOn(displayHandler.AngleHandler.QueryDefinitionHandler, 'AddQueryFilter');
            spyOn(displayHandler.QueryDefinitionHandler.Parent(), 'Cancel');
        });
        it("should clean up function after executed", function () {
            // prepare
            displayHandler.SaveAngleQueryDefinition();

            // assert
            expect(displayHandler.SaveQueryDefinition).toHaveBeenCalled();
            expect(displayHandler.AngleHandler.SaveQueryDefinition).not.toHaveBeenCalled();
            expect(displayHandler.__CancelQueryDefinitionWithJump).toBeDefined();
            expect(displayHandler.__ExecuteQueryDefinition).toBeDefined();

            // call execution
            displayHandler.ExecuteQueryDefinition();

            // assert after executed
            expect(displayHandler.__CancelQueryDefinitionWithJump).not.toBeDefined();
            expect(displayHandler.__ExecuteQueryDefinition).not.toBeDefined();
            expect(displayHandler.AngleHandler.SaveQueryDefinition).toHaveBeenCalled();
        });
        it("should clean up function after cancelled", function () {
            // prepare
            displayHandler.SaveAngleQueryDefinition();

            // assert
            expect(displayHandler.SaveQueryDefinition).toHaveBeenCalled();
            expect(displayHandler.__CancelQueryDefinitionWithJump).toBeDefined();
            expect(displayHandler.__ExecuteQueryDefinition).toBeDefined();

            // call cancellation
            displayHandler.CancelQueryDefinitionWithJump();

            // assert after cancelled
            expect(displayHandler.__CancelQueryDefinitionWithJump).not.toBeDefined();
            expect(displayHandler.__ExecuteQueryDefinition).not.toBeDefined();
        });
    });

    describe(".SaveQueryDefinitionWithJump", function () {
        var data;
        beforeEach(function () {
            data = {
                save: $.noop,
                definition: {}
            };
            spyOn(data, 'save');
            spyOn(displayHandler.QueryDefinitionHandler, 'ShowProgressbar');
            spyOn(progressbarModel, 'ShowStartProgressBar');
            spyOn(progressbarModel, 'SetDisableProgressBar');
            spyOn(displayHandler, 'GetJumpDisplayData').and.returnValue($.when());
        });
        it("should save", function () {
            //initial
            spyOn(displayHandler.QueryDefinitionHandler, 'CanSave').and.returnValue(false);

            // prepare
            displayHandler.SaveQueryDefinitionWithJump(data.save, data.definition);

            // assert
            expect(displayHandler.QueryDefinitionHandler.ShowProgressbar).not.toHaveBeenCalled();
            expect(progressbarModel.ShowStartProgressBar).toHaveBeenCalled();
            expect(progressbarModel.SetDisableProgressBar).toHaveBeenCalled();
            expect(data.save).toHaveBeenCalled();
        });
    });

    describe(".GetJumpDisplayData", function () {
        beforeEach(function () {
            spyOn(followupPageHandler, 'GetDefaultJumpTemplate').and.returnValue($.when({
                display_type: 'template-chart',
                display_details: 'template-details',
                query_blocks: [{}],
                fields: [{}]
            }));
            spyOn(displayModel, 'GetDefaultListFields').and.returnValue($.when([{}, {}]));
            spyOn(modelFollowupsHandler, 'GetResultClassesByQueryStep').and.returnValue([]);
            spyOn(modelsHandler, 'GetResultQueryFieldsUri').and.returnValue('');
            displayHandler.QueryDefinitionHandler.Parent(new QueryDefinitionHandler());
        });
        var tests = [
            {
                title: 'should use a jump template',
                query_step: {},
                expected: {
                    call_get_template: true,
                    display_type: 'template-chart',
                    display_details: 'template-details',
                    query_blocks_length: 1,
                    fields_length: 1
                }
            },
            {
                title: 'should not use a jump template (no query_step)',
                query_step: null,
                expected: {
                    call_get_template: false,
                    display_type: 'list',
                    display_details: '{}',
                    query_blocks_length: 1,
                    fields_length: 2
                }
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // prepare
                displayHandler.GetJumpDisplayData(test.query_step, [], test.use_template)
                    .done(function (result) {
                        // assert
                        if (test.expected.call_get_template) {
                            expect(followupPageHandler.GetDefaultJumpTemplate).toHaveBeenCalled();
                            expect(displayModel.GetDefaultListFields).not.toHaveBeenCalled();
                            expect(modelFollowupsHandler.GetResultClassesByQueryStep).not.toHaveBeenCalled();
                            expect(modelsHandler.GetResultQueryFieldsUri).not.toHaveBeenCalled();
                        }
                        else {
                            expect(followupPageHandler.GetDefaultJumpTemplate).not.toHaveBeenCalled();
                            expect(displayModel.GetDefaultListFields).toHaveBeenCalled();
                            expect(modelFollowupsHandler.GetResultClassesByQueryStep).toHaveBeenCalled();
                            expect(modelsHandler.GetResultQueryFieldsUri).toHaveBeenCalled();
                        }
                        expect(result.display_type).toEqual(test.expected.display_type);
                        expect(result.display_details).toEqual(test.expected.display_details);
                        expect(result.query_blocks.length).toEqual(test.expected.query_blocks_length);
                        expect(result.fields.length).toEqual(test.expected.fields_length);
                    });
            });
        });
    });

    describe(".InitialAggregationUI", function () {
        it("should initial aggregation UI", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'InitialAggregationUI');
            displayHandler.InitialAggregationUI();

            // assert
            expect(displayHandler.DisplayResultHandler.InitialAggregationUI).toHaveBeenCalled();
        });
    });

    describe(".CanChangeAggregation", function () {
        var tests = [
            {
                title: 'can change aggregation if invalid_baseclass = false, invalid_followup = false, can_use_filter = true and can_use_jump = true',
                invalid_baseclass: false,
                invalid_followup: false,
                can_use_filter: true,
                can_use_jump: true,
                expected: true
            },
            {
                title: 'cannot change aggregation if invalid_baseclass = true, invalid_followup = false, can_use_filter = true and can_use_jump = true',
                invalid_baseclass: true,
                invalid_followup: false,
                can_use_filter: true,
                can_use_jump: true,
                expected: false
            },
            {
                title: 'cannot change aggregation if invalid_baseclass = false, invalid_followup = true, can_use_filter = true and can_use_jump = true',
                invalid_baseclass: false,
                invalid_followup: true,
                can_use_filter: true,
                can_use_jump: true,
                expected: false
            },
            {
                title: 'cannot change aggregation if invalid_baseclass = false, invalid_followup = false, can_use_filter = false and can_use_jump = true',
                invalid_baseclass: false,
                invalid_followup: false,
                can_use_filter: false,
                can_use_jump: true,
                expected: false
            },
            {
                title: 'cannot change aggregation if invalid_baseclass = false, invalid_followup = false, can_use_filter = true and can_use_jump = false',
                invalid_baseclass: false,
                invalid_followup: false,
                can_use_filter: true,
                can_use_jump: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(displayHandler, 'CanUseFilter').and.returnValue(test.can_use_filter);
                spyOn(displayHandler, 'CanUseJump').and.returnValue(test.can_use_jump);

                // prepare
                var validation = {
                    InvalidBaseClasses: test.invalid_baseclass,
                    InvalidFollowups: test.invalid_followup
                };
                var result = displayHandler.CanChangeAggregation(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanSortAggregationField", function () {
        it("can sort aggregation field", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'CanSortField').and.returnValue(true);
            var result = displayHandler.CanSortAggregationField();

            // assert
            expect(displayHandler.DisplayResultHandler.CanSortField).toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });

    describe(".GetAggregationSortingClassName", function () {
        it("should get class name", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'GetAggregationSortingClassName');
            displayHandler.GetAggregationSortingClassName();

            // assert
            expect(displayHandler.DisplayResultHandler.GetAggregationSortingClassName).toHaveBeenCalled();
        });
    });

    describe(".SortAggregationField", function () {
        it("should sort aggregation field", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'SortField');
            displayHandler.SortAggregationField();

            // assert
            expect(displayHandler.DisplayResultHandler.SortField).toHaveBeenCalled();
        });
    });

    describe(".GetAggregationOptions", function () {
        it("should get aggregation options", function () {
            // prepare
            spyOn(displayHandler, 'GetDetails').and.returnValue('my-options');
            var result = displayHandler.GetAggregationOptions();

            // assert
            expect(displayHandler.GetDetails).toHaveBeenCalled();
            expect(result).toEqual('my-options');
        });
    });

    describe(".SetAggregationOptions", function () {
        it("should set aggregation options", function () {
            // prepare
            spyOn(displayHandler, 'SetDetails');
            displayHandler.SetAggregationOptions();

            // assert
            expect(displayHandler.SetDetails).toHaveBeenCalled();
        });
    });

    describe(".EnsureAggregationOptions", function () {
        it("should set aggregation options", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'EnsureAggregationOptions');
            displayHandler.EnsureAggregationOptions();

            // assert
            expect(displayHandler.DisplayResultHandler.EnsureAggregationOptions).toHaveBeenCalled();
        });
    });

    describe(".ShowAggregationOptions", function () {
        it("should show aggregation options", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'ShowAggregationOptions');
            displayHandler.ShowAggregationOptions();

            // assert
            expect(displayHandler.DisplayResultHandler.ShowAggregationOptions).toHaveBeenCalled();
        });
    });

    describe(".GetAggregationField", function () {
        it("should get aggregation field", function () {
            // prepare
            displayHandler.Data().fields = [{ field: 'field1' }];
            var result = displayHandler.GetAggregationField({ field: 'field1' });

            // assert
            expect(result).not.toEqual(null);
        });
    });

    describe(".GetAggregationFieldLimit", function () {
        it("should get a limit of aggregation field", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'GetAggregationFieldLimit').and.returnValue(2);
            var result = displayHandler.GetAggregationFieldLimit();

            // assert
            expect(displayHandler.DisplayResultHandler.GetAggregationFieldLimit).toHaveBeenCalled();
            expect(result).toEqual(2);
        });
    });

    describe(".CanChangeCountFieldState", function () {
        it("can change a state of count field", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'CanChangeCountFieldState').and.returnValue(true);
            var result = displayHandler.CanChangeCountFieldState();

            // assert
            expect(displayHandler.DisplayResultHandler.CanChangeCountFieldState).toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });

    describe(".SetAggregationFields", function () {
        it("should set aggregation fields", function () {
            // prepare
            displayHandler.SetAggregationFields('my-fields');

            // assert
            expect(displayHandler.Data().fields).toEqual('my-fields');
        });
    });

    describe(".ValidateAggregation", function () {
        it("should validate aggregation", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'ValidateAggregation').and.returnValue(true);
            var result = displayHandler.ValidateAggregation();

            // assert
            expect(displayHandler.DisplayResultHandler.ValidateAggregation).toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });

    describe(".SetAggregationFormatTexts", function () {
        it("should set texts", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'SetAggregationFormatTexts');
            displayHandler.SetAggregationFormatTexts({});

            // assert
            expect(displayHandler.DisplayResultHandler.SetAggregationFormatTexts).toHaveBeenCalled();
        });
    });

    describe(".ExecutionStepsData", function () {
        it("should be unll by default", function () {
            // prepare
            var result = displayHandler.ExecutionStepsData;

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".SetPostResultData", function () {
        it("should set data", function () {
            //initial
            spyOn(displayHandler.ResultHandler, 'SetData');

            // prepare
            displayHandler.SetPostResultData({});

            // assert
            expect(displayHandler.ResultHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".ClearPostResultData", function () {
        it("should clear data", function () {
            //initial
            spyOn(displayHandler.ResultHandler, 'ClearData');

            // prepare
            displayHandler.ClearPostResultData();

            // assert
            expect(displayHandler.ResultHandler.ClearData).toHaveBeenCalled();
        });
    });

    describe(".PostResult", function () {
        beforeEach(function () {
            spyOn(displayHandler.ResultHandler, 'PostExecutionSteps').and.returnValue('extend-result');
            spyOn(displayHandler.ResultHandler, 'PostNewResult').and.returnValue('new-result');
            spyOn($, 'when').and.returnValue('use-existing');
        });
        it("should extend a result", function () {
            //initial
            displayHandler.ExecutionStepsData = {
                uri: '/results/1/execute_steps',
                data: []
            };

            // prepare
            var result = displayHandler.PostResult();

            // assert
            expect(displayHandler.ExecutionStepsData).toEqual(null);
            expect(displayHandler.ResultHandler.Data.execute_steps).toEqual('/results/1/execute_steps');
            expect(result).toEqual('extend-result');
        });
        it("should create a new result", function () {
            //initial
            spyOn(displayHandler.ResultHandler, 'HasChanged').and.returnValue(true);

            // prepare
            var result = displayHandler.PostResult();

            // assert
            expect(result).toEqual('new-result');
        });
        it("should use an existing result", function () {
            //initial
            spyOn(displayHandler.ResultHandler, 'HasChanged').and.returnValue(false);

            // prepare
            var result = displayHandler.PostResult();

            // assert
            expect(result).toEqual('use-existing');
        });
    });

    describe(".SetPostExecutionSteps", function () {
        it("should set execution step", function () {
            //initial
            displayHandler.ResultHandler.Data.execute_steps = '/results/1/execute_steps';

            // prepare
            displayHandler.SetPostExecutionSteps('new-steps');

            // assert
            expect(displayHandler.ExecutionStepsData).not.toEqual(null);
            expect(displayHandler.ExecutionStepsData.uri).toEqual('/results/1/execute_steps');
            expect(displayHandler.ExecutionStepsData.data.query_steps).toEqual('new-steps');
        });
    });

    describe(".GetResultQueryDefinition", function () {
        it("should get base_display block for Display", function () {
            //initial
            spyOn(displayHandler.AngleHandler, 'GetResultQueryDefinition').and.returnValue({
                query_definition: [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE
                }]
            });
            spyOn(displayHandler.QueryDefinitionHandler, 'HasSourceChanged').and.returnValue(false);
            spyOn(displayHandler.QueryDefinitionHandler, 'GetExecutedParameters').and.returnValue([{}]);
            displayHandler.Data().uri = '/models/1/angles/1/displays/1';

            // prepare
            var result = displayHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(1);
            expect(result.query_definition[0].execution_parameters.length).toEqual(1);
            expect(result.query_definition[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
            expect(result.query_definition[0].base_display).toEqual('/models/1/angles/1/displays/1');
        });
        it("should get base_display block for Template", function () {
            //initial
            spyOn(displayHandler.AngleHandler, 'GetResultQueryDefinition').and.returnValue({
                query_definition: [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE
                }]
            });
            spyOn(displayHandler.QueryDefinitionHandler, 'HasSourceChanged').and.returnValue(false);
            spyOn(displayHandler.QueryDefinitionHandler, 'GetExecutedParameters').and.returnValue([]);
            displayHandler.Data().uri = '/models/1/angles/1/displays/1';
            displayHandler.Data().uri_template = '/models/1/angles/1/displays/2';

            // prepare
            var result = displayHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(1);
            expect(result.query_definition[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_DISPLAY);
            expect(result.query_definition[0].base_display).toEqual('/models/1/angles/1/displays/2');
        });
        it("should get query_steps block for adhoc Display", function () {
            //initial
            spyOn(displayHandler.AngleHandler, 'GetResultQueryDefinition').and.returnValue({
                query_definition: [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES
                }]
            });
            spyOn(displayHandler.QueryDefinitionHandler, 'HasSourceChanged').and.returnValue(true);
            spyOn(displayHandler.QueryDefinitionHandler, 'GetQueryDefinition').and.returnValue({
                query_blocks: [
                    {
                        queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS,
                        query_steps: [{}]
                    }
                ]
            });
            displayHandler.Data().uri = '/models/1/angles/abcd-efgh-ijkl';

            // prepare
            var result = displayHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(1);
            expect(result.query_definition[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        });
        it("should not get any block for adhoc Display", function () {
            //initial
            spyOn(displayHandler.AngleHandler, 'GetResultQueryDefinition').and.returnValue({
                query_definition: [{
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES
                }]
            });
            spyOn(displayHandler.QueryDefinitionHandler, 'HasSourceChanged').and.returnValue(true);
            spyOn(displayHandler.QueryDefinitionHandler, 'GetQueryDefinition').and.returnValue({
                query_blocks: []
            });
            displayHandler.Data().uri = '/models/1/angles/abcd-efgh-ijkl';

            // prepare
            var result = displayHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(0);
        });
    });

    describe(".GetResultExecution", function () {
        it("should get result text", function () {
            //initial
            spyOn(displayHandler.ResultHandler, 'GetExecutionText').and.returnValue('result-text');

            // prepare
            var result = displayHandler.GetResultExecution();

            // assert
            expect(result).toEqual('result-text');
        });
    });

    describe(".CreateOrUpdate", function () {
        it("should do nothing if no data", function () {
            // prepare
            spyOn(displayHandler, 'GetCreateOrUpdateData').and.returnValue(null);
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(displayHandler, 'CreateNew');
            spyOn(displayHandler, 'UpdateData');
            displayHandler.CreateOrUpdate();

            // assert
            expect(displayHandler.CreateNew).not.toHaveBeenCalled();
            expect(displayHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should create new if adhoc", function () {
            // prepare
            spyOn(displayHandler, 'GetCreateOrUpdateData').and.returnValue({ id: '1' });
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(displayHandler, 'CreateNew');
            spyOn(displayHandler, 'UpdateData');
            displayHandler.CreateOrUpdate();

            // assert
            expect(displayHandler.CreateNew).toHaveBeenCalled();
            expect(displayHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should update if not adhoc", function () {
            // prepare
            spyOn(displayHandler, 'GetCreateOrUpdateData').and.returnValue({ id: '1' });
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(displayHandler, 'CreateNew');
            spyOn(displayHandler, 'UpdateData');
            displayHandler.CreateOrUpdate();

            // assert
            expect(displayHandler.CreateNew).not.toHaveBeenCalled();
            expect(displayHandler.UpdateData).toHaveBeenCalled();
        });
    });

    describe(".GetCreateOrUpdateData", function () {
        it("should get data for creating", function () {
            // prepare
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(displayHandler, 'GetData').and.returnValue('create data');
            spyOn(displayHandler, 'GetChangeData').and.returnValue('update data');
            var result = displayHandler.GetCreateOrUpdateData();

            // assert
            expect(result).toEqual('create data');
        });
        it("should get data for updating (include query_blocks)", function () {
            // prepare
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(displayHandler, 'GetData').and.returnValue('create data');
            spyOn(displayHandler, 'CanUseJump').and.returnValue(true);
            spyOn(displayHandler, 'GetChangeData').and.returnValue({ query_blocks: [] });
            var result = displayHandler.GetCreateOrUpdateData();

            // assert
            expect(result.query_blocks).toBeDefined();
        });
        it("should get data for updating (exclude query_blocks)", function () {
            // prepare
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(displayHandler, 'GetData').and.returnValue('create data');
            spyOn(displayHandler, 'CanUseJump').and.returnValue(false);
            spyOn(displayHandler, 'GetChangeData').and.returnValue({ query_blocks: [] });
            var result = displayHandler.GetCreateOrUpdateData();

            // assert
            expect(result.query_blocks).not.toBeDefined();
        });
    });

    describe(".GetChangeData", function () {
        it("should get changes data", function () {
            //process
            var currentData = {
                multi_lang_name: [
                    { lang: 'en', text: 'test new' }
                ],
                multi_lang_description: [
                    { lang: 'en', text: 'description' }
                ],
                is_angle_default: true
            };
            var compareData = {
                multi_lang_name: [
                    { lang: 'en', text: 'test' }
                ],
                multi_lang_description: [
                    { lang: 'en', text: 'description' }
                ]
            };
            var result = displayHandler.GetChangeData(currentData, compareData);

            //assert
            expect(result.multi_lang_name).toBeDefined();
            expect(result.multi_lang_description).not.toBeDefined();
            expect(result.is_angle_default).toBeDefined();
        });
    });

    describe(".CreateNew", function () {
        it("should create", function () {
            // prepare
            var callback = { done: $.noop, fail: $.noop };
            spyOn(callback, 'done');
            spyOn(callback, 'fail');
            spyOn(displayModel, 'DeleteTemporaryDisplay');
            spyOn(window, 'CreateDataToWebService').and.returnValue($.when());
            spyOn(displayHandler, 'UpdateModel');
            displayHandler.CreateNew({}, callback.done, callback.fail);

            // assert
            expect(callback.done).toHaveBeenCalled();
            expect(callback.fail).not.toHaveBeenCalled();
            expect(displayHandler.UpdateModel).toHaveBeenCalled();
        });
    });

    describe(".UpdateDataFunction", function () {
        it("should update", function () {
            // prepare
            spyOn(window, 'UpdateDataToWebService').and.returnValue($.when());
            spyOn(displayHandler, 'UpdateModel');
            displayHandler.UpdateDataFunction('', { query_blocks: [] });

            // assert
            expect(displayHandler.UpdateModel).toHaveBeenCalled();
        });
    });

    describe(".UpdateStateFunction", function () {
        it("should update state", function () {
            // prepare
            spyOn(displayModel, 'Data').and.returnValue({});
            spyOn(window, 'UpdateDataToWebService').and.returnValue($.when({}));
            spyOn(displayHandler, 'SetRawData');
            displayHandler.UpdateStateFunction('', {});

            // assert
            expect(displayHandler.SetRawData).toHaveBeenCalled();
        });
    });

    describe(".UpdateAdhocFunction", function () {
        it("should update adhoc", function () {
            // prepare
            spyOn(displayHandler, 'UpdateModel');
            displayHandler.UpdateAdhocFunction('', {});

            // assert
            expect(displayHandler.UpdateModel).toHaveBeenCalled();
        });
    });

    describe(".UpdateModel", function () {
        beforeEach(function () {
            spyOn(displayModel, 'LoadSuccess');
            spyOn(displayModel, 'SetTemporaryDisplay');
            spyOn(displayHandler, 'SetRawData');
            spyOn(displayHandler, 'Initial');
        });
        it("should update for adhoc", function () {
            // prepare
            spyOn(WC.ModelHelper, 'IsAdhocUri').and.returnValue(true);
            displayHandler.UpdateModel({}, true);

            // assert
            expect(displayModel.SetTemporaryDisplay).toHaveBeenCalled();
            expect(displayHandler.SetRawData).not.toHaveBeenCalled();
            expect(displayHandler.Initial).toHaveBeenCalled();
        });
        it("should update and raw for none-adhoc", function () {
            // prepare
            spyOn(WC.ModelHelper, 'IsAdhocUri').and.returnValue(false);
            displayHandler.UpdateModel({}, true);

            // assert
            expect(displayModel.SetTemporaryDisplay).not.toHaveBeenCalled();
            expect(displayHandler.SetRawData).toHaveBeenCalled();
            expect(displayHandler.Initial).toHaveBeenCalled();
        });
        it("should update for none-adhoc", function () {
            // prepare
            spyOn(WC.ModelHelper, 'IsAdhocUri').and.returnValue(false);
            displayHandler.UpdateModel({}, false);

            // assert
            expect(displayModel.SetTemporaryDisplay).not.toHaveBeenCalled();
            expect(displayHandler.SetRawData).not.toHaveBeenCalled();
            expect(displayHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".CanCreate", function () {
        it("can create", function () {
            // prepare
            spyOn(privilegesViewModel, 'CanCreateDisplay').and.returnValue(true);
            var result = displayHandler.CanCreate();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanUpdate", function () {
        it("can update", function () {
            // prepare
            displayHandler.Data({ authorizations: { update: true } });
            var result = displayHandler.CanUpdate();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanCreateOrUpdate", function () {
        it("should use creating privilege", function () {
            // prepare
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(displayHandler, 'CanCreate').and.returnValue(true);
            spyOn(displayHandler, 'CanUpdate').and.returnValue(false);
            var result = displayHandler.CanCreateOrUpdate();

            // assert
            expect(result).toEqual(true);
        });
        it("should use updating privilege", function () {
            // prepare
            spyOn(displayHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(displayHandler, 'CanCreate').and.returnValue(true);
            spyOn(displayHandler, 'CanUpdate').and.returnValue(false);
            var result = displayHandler.CanCreateOrUpdate();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe('.OnAggregationChangeCallback', function () {
        it('should call function', function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'OnAggregationChangeCallback');
            displayHandler.OnAggregationChangeCallback([{}, {}], 'area', 0, 1);

            // assert
            expect(displayHandler.DisplayResultHandler.OnAggregationChangeCallback).toHaveBeenCalled();
        });
    });

    describe(".ShowStatisticPopup", function () {
        it("should call DisplayStatisticHandler", function () {
            spyOn(displayHandler.DisplayStatisticHandler, 'ShowPopup');
            displayHandler.ShowStatisticPopup();
            expect(displayHandler.DisplayStatisticHandler.ShowPopup).toHaveBeenCalled();
        });
    });
    describe(".CanAddReferenceLine", function () {
        it("should return true if reference line can be added", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'CanAddReferenceLine').and.returnValue(true);
            var result = displayHandler.CanAddReferenceLine();

            // assert
            expect(displayHandler.DisplayResultHandler.CanAddReferenceLine).toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });
    describe(".ShowAddReferenceLinePopup", function () {
        it(" Show Add ReferenceLine Popup sholud be called", function () {
            // prepare
            spyOn(displayHandler.DisplayResultHandler, 'ShowAddReferenceLinePopup');
            displayHandler.ShowAddReferenceLinePopup();

            // assert
            expect(displayHandler.DisplayResultHandler.ShowAddReferenceLinePopup).toHaveBeenCalled();
        });
    });

});
