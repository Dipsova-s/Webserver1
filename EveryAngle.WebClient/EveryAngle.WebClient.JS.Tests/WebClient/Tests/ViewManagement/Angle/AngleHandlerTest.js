/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleHandler", function () {
    var angleHandler;
    beforeEach(function () {
        angleHandler = new AngleHandler();
    });

    describe(".Initial", function () {
        it("should call functions", function () {
            //initial
            spyOn(angleHandler, 'SetData');
            spyOn(angleHandler, 'InitialQueryDefinition');

            // prepare
            angleHandler.Initial({});

            // assert
            expect(angleHandler.SetData).toHaveBeenCalled();
            expect(angleHandler.InitialQueryDefinition).toHaveBeenCalled();
            expect(typeof angleHandler.UpdateDataFunction).toEqual('function');
            expect(typeof angleHandler.UpdateStateFunction).toEqual('function');
            expect(typeof angleHandler.UpdateAdhocFunction).toEqual('function');
        });
    });

    describe(".SetData", function () {
        it("should set data", function () {
            // prepare
            var model = {
                id: 'my-id',
                is_published: true,
                is_template: true,
                is_validated: true,
                user_specific: {
                    is_starred: true,
                    private_note: 'my-note'
                },
                allow_followups: true,
                allow_more_details: true,
                assigned_labels: ['label1', 'label2']
            };
            angleHandler.SetData(model);

            // assert
            expect(angleHandler.Data().id()).toEqual('my-id');
            expect(angleHandler.Data().is_published()).toEqual(true);
            expect(angleHandler.Data().is_template()).toEqual(true);
            expect(angleHandler.Data().is_validated()).toEqual(true);
            expect(angleHandler.Data().user_specific.is_starred()).toEqual(true);
            expect(angleHandler.Data().user_specific.private_note()).toEqual('my-note');
            expect(angleHandler.Data().assigned_labels()).toEqual(['label1', 'label2']);
        });
    });

    describe(".GetData", function () {
        it("should get data", function () {
            var data = { id: 'angle1' };
            angleHandler.Displays = [new DisplayHandler({}, angleHandler)];
            angleHandler.Data(data);
            var result = angleHandler.GetData();

            // assert
            expect(result).not.toEqual(data);
            expect(result.id).toEqual('angle1');
            expect(result.display_definitions.length).toEqual(1);
        });
    });

    describe(".ClearData", function () {
        it("should clear data", function () {
            var data = { id: 'angle1' };
            angleHandler.Data({ id: 'angle1' });
            angleHandler.ClearData();

            // assert
            expect(angleHandler.Data().id()).toEqual('');
        });
    });

    describe(".GetRawData", function () {
        it("should get raw data", function () {
            angleHandler.SetRawData({ id: 'angle1' });
            var result = angleHandler.GetRawData();

            // assert
            expect(result.id).toEqual('angle1');
        });
    });

    describe(".GetCurrentDisplay", function () {
        it("should get current display", function () {
            angleHandler.SetCurrentDisplay({ id: 'display1' });
            var result = angleHandler.GetCurrentDisplay();

            // assert
            expect(result.id).toEqual('display1');
        });
    });

    describe(".CloneData", function () {
        var angle;
        beforeEach(function () {
            angle = {
                id: 'my-angle',
                allow_followups: false,
                allow_more_details: false,
                is_validated: true,
                is_published: true,
                is_template: true,
                user_specific: { is_starred: true, private_note: 'my-note' },
                angle_default_display: 'display1',
                display_definitions: []
            };
            var display1 = {
                uri: '/models/1/angles/1/displays/1',
                id: 'display1',
                is_angle_default: true,
                display_details: JSON.stringify({ drilldown_display: 'display2' })
            };
            var display2 = {
                uri: '/models/1/angles/1/displays/2',
                id: 'display2',
                is_angle_default: false,
                display_details: JSON.stringify({})
            };
            var display3 = {
                uri: '/models/1/angles/1/displays/3',
                id: 'display3',
                is_angle_default: false,
                display_details: JSON.stringify({ drilldown_display: 'displayN' })
            };
            spyOn(angleHandler, 'GetData').and.returnValue(angle);
            angleHandler.Displays = [
                new DisplayHandler(display1, angleHandler),
                new DisplayHandler(display2, angleHandler),
                new DisplayHandler(display3, angleHandler)
            ];
        });
        it("should get clone data of saved Angle", function () {
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler.Displays[0], 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler.Displays[1], 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler.Displays[2], 'IsAdhoc').and.returnValue(false);
            var result = angleHandler.CloneData();

            // assert
            expect(result.id).not.toEqual('my-angle');
            expect(result.allow_followups).toEqual(true);
            expect(result.allow_more_details).toEqual(true);
            expect(result.is_validated).toEqual(false);
            expect(result.is_published).toEqual(false);
            expect(result.is_template).toEqual(false);
            expect(result.user_specific).toEqual({ is_starred: false });
            expect(result.angle_default_display).not.toEqual('display1');
            expect(result.display_definitions.length).toEqual(3);
            expect(result.display_definitions[0].id).not.toEqual('display1');
            expect(result.display_definitions[0].is_angle_default).toEqual(true);
            expect(result.display_definitions[0].display_details).toContain('drilldown_display');
            expect(result.display_definitions[0].display_details).not.toContain('display2');
            expect(result.display_definitions[1].id).not.toEqual('display2');
            expect(result.display_definitions[1].is_angle_default).toEqual(false);
            expect(result.display_definitions[1].display_details).toEqual('{}');
            expect(result.display_definitions[2].id).not.toEqual('display3');
            expect(result.display_definitions[2].is_angle_default).toEqual(false);
            expect(result.display_definitions[2].display_details).not.toContain('drilldown_display');
            expect(result.display_definitions[2].display_details).not.toContain('displayN');
        });
        it("should get clone data of adhoc Angle", function () {
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler.Displays[0], 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler.Displays[1], 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler.Displays[2], 'IsAdhoc').and.returnValue(true);
            var result = angleHandler.CloneData();

            // assert
            expect(result.id).toEqual('my-angle');
            expect(result.allow_followups).toEqual(true);
            expect(result.allow_more_details).toEqual(true);
            expect(result.is_validated).toEqual(false);
            expect(result.is_published).toEqual(false);
            expect(result.is_template).toEqual(false);
            expect(result.user_specific).toEqual({ is_starred: false });
            expect(result.angle_default_display).toEqual('display1');
            expect(result.display_definitions.length).toEqual(3);
            expect(result.display_definitions[0].id).toEqual('display1');
            expect(result.display_definitions[0].is_angle_default).toEqual(true);
            expect(result.display_definitions[0].display_details).toContain('drilldown_display');
            expect(result.display_definitions[0].display_details).toContain('display2');
            expect(result.display_definitions[1].id).toEqual('display2');
            expect(result.display_definitions[1].is_angle_default).toEqual(false);
            expect(result.display_definitions[1].display_details).toEqual('{}');
            expect(result.display_definitions[2].id).toEqual('display3');
            expect(result.display_definitions[2].is_angle_default).toEqual(false);
            expect(result.display_definitions[2].display_details).not.toContain('drilldown_display');
            expect(result.display_definitions[2].display_details).not.toContain('displayN');
        });
    });

    describe(".Online", function () {
        it("should be online", function () {
            spyOn(modelsHandler, 'IsAvailable').and.returnValue(true);
            var result = angleHandler.Online();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".Load", function () {
        it("should load data", function () {
            spyOn(directoryHandler, 'ResolveDirectoryUri');
            spyOn(window, 'GetDataFromWebService').and.returnValue($.when());
            spyOn(angleHandler, 'LoadDone');
            angleHandler.Load();

            // assert
            expect(angleHandler.LoadDone).toHaveBeenCalled();
        });
    });

    describe(".LoadDone", function () {
        it("should set data for Angle and Displays", function () {
            angleHandler.Displays = [new DisplayHandler({}, angleHandler)];
            spyOn(angleHandler, 'Initial');
            angleHandler.LoadDone({});

            // assert
            expect(angleHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".ForceInitial", function () {
        it("should force to initial data", function () {
            spyOn(angleHandler, 'Initial');
            angleHandler.ForceInitial();

            // assert
            expect(angleHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".UpdateExecutionTimes", function () {
        it("should update execution times", function () {
            spyOn(userModel, 'Data').and.returnValue({
                full_name: 'my-name',
                uri: '/users/1'
            });
            spyOn(angleInfoModel, 'SetAngleSatistics');
            spyOn(angleInfoModel, 'Data').and.returnValue({
                user_specific: {}
            });
            angleHandler.UpdateExecutionTimes({
                executed: {
                    datetime: 123456
                }
            });

            // assert
            expect(angleHandler.Data().user_specific.times_executed).toEqual(1);
            expect(angleHandler.Data().executed.datetime).toEqual(123456);
            expect(angleHandler.Data().executed.full_name).toEqual('my-name');
            expect(angleHandler.Data().executed.user).toEqual('/users/1');
            expect(angleInfoModel.TimeExcuted()).toEqual(1);
        });
    });

    describe(".GetValidationResult", function () {
        it("should get a validation result", function () {
            var result = angleHandler.GetValidationResult();

            // assert
            expect(result.Valid).toEqual(true);
        });
    });

    describe(".InitialLabel", function () {
        it("should initial", function () {
            spyOn(angleHandler.AngleLabelHandler, 'Initial');
            angleHandler.InitialLabel();

            // assert
            expect(angleHandler.AngleLabelHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".InitialTag", function () {
        it("should initial tag", function () {
            spyOn(angleHandler.AngleTagHandler, 'Initial');
            angleHandler.InitialTag();

            // assert
            expect(angleHandler.AngleTagHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".SetStarred", function () {
        it("should update is_starred", function () {
            spyOn(angleHandler.AngleUserSpecificHandler, 'SaveStarred');
            angleHandler.SetStarred(null, {});

            // assert
            expect(angleHandler.AngleUserSpecificHandler.SaveStarred).toHaveBeenCalled();
        });
    });

    describe(".IsStarred", function () {
        it("should get is_starred", function () {
            spyOn(angleHandler.AngleUserSpecificHandler, 'IsStarred').and.returnValue(true);
            var result = angleHandler.IsStarred();

            // assert
            expect(angleHandler.AngleUserSpecificHandler.IsStarred).toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });

    describe(".CanUpdateUserSpecific", function () {
        it("can update user specific", function () {
            // prepare
            spyOn(angleHandler.AngleUserSpecificHandler, 'CanUpdate').and.returnValue(true);
            var result = angleHandler.CanUpdateUserSpecific();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".HasPrivateNote", function () {
        it("should have a private note", function () {
            // prepare
            spyOn(angleHandler.AngleUserSpecificHandler, 'HasPrivateNote').and.returnValue(true);
            var result = angleHandler.HasPrivateNote();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".GetPrivateNote", function () {
        it("should get a private note", function () {
            // prepare
            spyOn(angleHandler.AngleUserSpecificHandler, 'GetPrivateNote').and.returnValue('my-note');
            var result = angleHandler.GetPrivateNote();

            // assert
            expect(result).toEqual('my-note');
        });
    });

    describe(".InitialAngleUserSpecific", function () {
        it("should initial", function () {
            // prepare
            spyOn(angleHandler.AngleUserSpecificHandler, 'InitialPrivateNote');
            angleHandler.InitialAngleUserSpecific();

            // assert
            expect(angleHandler.AngleUserSpecificHandler.InitialPrivateNote).toHaveBeenCalled();
        });
    });

    describe(".SaveDescription", function () {
        it("should call confirm save", function () {
            //initial
            spyOn(angleHandler.parent.prototype, 'SaveDescription');
            spyOn(angleHandler, 'ConfirmSave');
            spyOn(angleHandler, 'IsDescriptionUsedInTask');

            // prepare
            angleHandler.SaveDescription();

            // assert
            expect(angleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".IsDescriptionUsedInTask", function () {
        it("should return true when angle description has changed and has displays used in task", function () {
            //initial
            spyOn(angleHandler, 'GetChangeData').and.returnValue(true);
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);
            spyOn(angleHandler, 'IsDisplaysUsedInTask').and.returnValue(true);

            // prepare
            var result = angleHandler.IsDescriptionUsedInTask();

            // assert
            expect(result).toBeTruthy();
            expect(angleHandler.GetChangeData).toHaveBeenCalled();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
            expect(angleHandler.IsDisplaysUsedInTask).toHaveBeenCalled();
        });

        it("should return true when angle description has changed and changed displays is used in task", function () {
            //initial
            spyOn(angleHandler, 'GetChangeData').and.returnValue(true);
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);
            spyOn(angleHandler, 'IsDisplaysUsedInTask').and.returnValue(false);
            spyOn(angleHandler, 'IsChangeDisplaysUsedInTask').and.returnValue(true);

            // prepare
            var result = angleHandler.IsDescriptionUsedInTask();

            // assert
            expect(result).toBeTruthy();
            expect(angleHandler.GetChangeData).toHaveBeenCalled();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
            expect(angleHandler.IsDisplaysUsedInTask).toHaveBeenCalled();
            expect(angleHandler.IsChangeDisplaysUsedInTask).toHaveBeenCalled();
        });

        it("should return false when angle description has not changed", function () {
            //initial
            spyOn(angleHandler, 'GetChangeData').and.returnValue(null);
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);

            // prepare
            var result = angleHandler.IsDescriptionUsedInTask();

            // assert
            expect(result).toBeFalsy();
            expect(angleHandler.GetChangeData).toHaveBeenCalled();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
        });
    });

    describe(".ShowEditDescriptionPopup", function () {
        it("should show popup", function () {
            //initial
            spyOn(angleHandler.parent.prototype, 'ShowEditDescriptionPopup').and.callFake($.noop);

            // prepare
            angleHandler.ShowEditDescriptionPopup();

            // assert
            expect(angleHandler.parent.prototype.ShowEditDescriptionPopup).toHaveBeenCalled();
        });
    });

    describe(".InitialQueryDefinition", function () {
        it("should initial query definition", function () {
            //initial
            spyOn(angleHandler.parent.prototype, 'InitialQueryDefinition');
            spyOn(angleHandler, 'SetQueryDefinitionAuthorizations');

            // prepare
            angleHandler.InitialQueryDefinition();

            // assert
            expect(angleHandler.parent.prototype.InitialQueryDefinition).toHaveBeenCalled();
            expect(angleHandler.SetQueryDefinitionAuthorizations).toHaveBeenCalled();
            expect(angleHandler.QueryDefinitionHandler.BlockUI).toEqual(true);
            expect(angleHandler.QueryDefinitionHandler.FilterFor).toEqual(WC.WidgetFilterHelper.FILTERFOR.ANGLE);
            expect(angleHandler.QueryDefinitionHandler.Texts.AskForExecutionParamter).not.toEqual('');
        });
    });

    describe(".GetQueryDefinitionSourceData", function () {
        it("should get a source definition", function () {
            //initial
            angleHandler.Data({ query_definition: [{}, {}] });

            // prepare
            var result = angleHandler.GetQueryDefinitionSourceData();

            // assert
            expect(result.length).toEqual(2);
        });
    });

    describe(".SetQueryDefinitionAuthorizations", function () {
        it("should set query definition's authorizations", function () {
            //initial
            spyOn(angleHandler, 'CanChangeFilter').and.returnValue(false);
            spyOn(angleHandler, 'CanChangeJump').and.returnValue(false);
            spyOn(angleHandler, 'CanExecuteQuerySteps').and.returnValue(false);
            spyOn(angleHandler, 'CanUpdateQuerySteps').and.returnValue(false);
            resultModel.Data({ authorizations: {} });

            // prepare
            angleHandler.SetQueryDefinitionAuthorizations();

            // assert
            expect(angleHandler.QueryDefinitionHandler.Authorizations.CanChangeFilter()).toEqual(false);
            expect(angleHandler.QueryDefinitionHandler.Authorizations.CanChangeJump()).toEqual(false);
            expect(angleHandler.QueryDefinitionHandler.Authorizations.CanExecute()).toEqual(false);
            expect(angleHandler.QueryDefinitionHandler.Authorizations.CanSave()).toEqual(false);
        });
    });

    describe(".AllowMoreDetails", function () {
        it("should allow more details", function () {
            //initial
            angleHandler.Data().allow_more_details(true);
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);

            // prepare
            var result = angleHandler.AllowMoreDetails();

            // assert
            expect(result).toEqual(true);
        });
        it("should not allow more details (allow_more_details=false)", function () {
            //initial
            angleHandler.Data().allow_more_details(false);
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(true);

            // prepare
            var result = angleHandler.AllowMoreDetails();

            // assert
            expect(result).toEqual(false);
        });
        it("should not allow more details (AllowMoreDetails=false)", function () {
            //initial
            angleHandler.Data().allow_more_details(true);
            spyOn(privilegesViewModel, 'AllowMoreDetails').and.returnValue(false);

            // prepare
            var result = angleHandler.AllowMoreDetails();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".AllowFollowups", function () {
        it("should allow followups", function () {
            //initial
            angleHandler.Data().allow_followups(true);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(true);

            // prepare
            var result = angleHandler.AllowFollowups();

            // assert
            expect(result).toEqual(true);
        });
        it("should not allow followup (allow_more_details=false)", function () {
            //initial
            angleHandler.Data().allow_followups(false);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(true);

            // prepare
            var result = angleHandler.AllowFollowups();

            // assert
            expect(result).toEqual(false);
        });
        it("should not allow followup (AllowFollowups=false)", function () {
            //initial
            angleHandler.Data().allow_followups(true);
            spyOn(privilegesViewModel, 'AllowFollowups').and.returnValue(false);

            // prepare
            var result = angleHandler.AllowFollowups();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanUseFilter", function () {
        it("can use a filter (AllowMoreDetails=true)", function () {
            //initial
            spyOn(angleHandler, 'AllowMoreDetails').and.returnValue(true);
            spyOn(angleHandler.QueryDefinitionHandler, 'GetFilters').and.returnValue([{}]);

            // prepare
            var result = angleHandler.CanUseFilter();

            // assert
            expect(result).toEqual(true);
        });
        it("can use a filter (no filter)", function () {
            //initial
            spyOn(angleHandler, 'AllowMoreDetails').and.returnValue(false);
            spyOn(angleHandler.QueryDefinitionHandler, 'GetFilters').and.returnValue([]);

            // prepare
            var result = angleHandler.CanUseFilter();

            // assert
            expect(result).toEqual(true);
        });
        it("cannot use a filter", function () {
            //initial
            spyOn(angleHandler, 'AllowMoreDetails').and.returnValue(false);
            spyOn(angleHandler.QueryDefinitionHandler, 'GetFilters').and.returnValue([{}]);

            // prepare
            var result = angleHandler.CanUseFilter();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanChangeFilter", function () {
        var tests = [
            {
                title: 'can change filter',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                can_use_jump: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: true
            },
            {
                title: 'cannot change filter',
                online: false,
                invalid_baseclass: false,
                can_use_baseclass: true,
                can_use_jump: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change filter',
                online: true,
                invalid_baseclass: true,
                can_use_baseclass: true,
                can_use_jump: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change filter',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: false,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change filter',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_more_details: false,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change filter',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_more_details: true,
                update: true,
                is_validated: true,
                expected: false
            },
            {
                title: 'cannot change filter',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_more_details: true,
                update: false,
                is_validated: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var titles = [
                'online = ' + test.online,
                'invalid_baseclass = ' + test.invalid_baseclass,
                'can_use_baseclass = ' + test.can_use_baseclass,
                'allow_more_details = ' + test.allow_more_details,
                'update = ' + test.update,
                'is_validated = ' + test.is_validated
            ];
            it(test.title + ' (' + titles.join(', ') + ')', function () {
                //initial
                var validation = { InvalidBaseClasses: test.invalid_baseclass };
                spyOn(angleHandler, 'Online').and.returnValue(test.online);
                spyOn(angleHandler, 'CanUseBaseClass').and.returnValue(test.can_use_baseclass);
                spyOn(angleHandler, 'CanUseJump').and.returnValue(test.can_use_jump);
                spyOn(angleHandler, 'AllowMoreDetails').and.returnValue(test.allow_more_details);
                angleHandler.Data({
                    authorizations: { update: test.update },
                    is_validated: ko.observable(test.is_validated)
                });

                // prepare
                var result = angleHandler.CanChangeFilter(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanChangeJump", function () {
        var tests = [
            {
                title: 'can change jump',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_followups: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: true
            },
            {
                title: 'cannot change jump',
                online: false,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_followups: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change jump',
                online: true,
                invalid_baseclass: true,
                can_use_baseclass: true,
                allow_followups: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change jump',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: false,
                allow_followups: true,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change jump',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_followups: false,
                allow_more_details: true,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change jump',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_followups: true,
                allow_more_details: false,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change jump',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_followups: true,
                allow_more_details: true,
                update: false,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot change jump',
                online: true,
                invalid_baseclass: false,
                can_use_baseclass: true,
                allow_followups: true,
                allow_more_details: true,
                update: true,
                is_validated: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var titles = [
                'online = ' + test.online,
                'invalid_baseclass = ' + test.invalid_baseclass,
                'can_use_baseclass = ' + test.can_use_baseclass,
                'allow_followups = ' + test.allow_followups,
                'allow_more_details = ' + test.allow_more_details,
                'update = ' + test.update,
                'is_validated = ' + test.is_validated
            ];
            it(test.title + ' (' + titles.join(', ') + ')', function () {
                //initial
                var validation = { InvalidBaseClasses: test.invalid_baseclass };
                spyOn(angleHandler, 'Online').and.returnValue(test.online);
                spyOn(angleHandler, 'CanUseBaseClass').and.returnValue(test.can_use_baseclass);
                spyOn(angleHandler, 'AllowFollowups').and.returnValue(test.allow_followups);
                spyOn(angleHandler, 'AllowMoreDetails').and.returnValue(test.allow_more_details);
                angleHandler.Data({
                    authorizations: { update: test.update },
                    is_validated: ko.observable(test.is_validated)
                });

                // prepare
                var result = angleHandler.CanChangeJump(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanExecuteQuerySteps", function () {
        it("can execute query steps", function () {
            //initial
            var validation = { InvalidBaseClasses: false };

            // prepare
            spyOn(angleHandler, 'Online').and.returnValue(true);
            var result = angleHandler.CanExecuteQuerySteps(validation);

            // assert
            expect(result).toEqual(true);
        });
        it("cannot execute query steps (online=false)", function () {
            //initial
            var validation = { InvalidBaseClasses: false };

            // prepare
            spyOn(angleHandler, 'Online').and.returnValue(false);
            var result = angleHandler.CanExecuteQuerySteps(validation);

            // assert
            expect(result).toEqual(false);
        });
        it("cannot execute query steps (InvalidBaseClasses=true)", function () {
            //initial
            var validation = { InvalidBaseClasses: true };

            // prepare
            spyOn(angleHandler, 'Online').and.returnValue(true);
            var result = angleHandler.CanExecuteQuerySteps(validation);

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanUpdateQuerySteps", function () {
        var tests = [
            {
                title: 'can save query steps',
                online: true,
                invalid_baseclass: false,
                update: true,
                is_validated: false,
                expected: true
            },
            {
                title: 'cannot save query steps',
                online: false,
                invalid_baseclass: false,
                update: true,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot save query steps',
                online: true,
                invalid_baseclass: true,
                update: true,
                is_validated: true,
                expected: false
            },
            {
                title: 'cannot save query steps',
                online: true,
                invalid_baseclass: false,
                update: true,
                is_validated: true,
                expected: false
            },
            {
                title: 'cannot save query steps',
                online: true,
                invalid_baseclass: false,
                update: false,
                is_validated: false,
                expected: false
            },
            {
                title: 'cannot save query steps',
                online: true,
                invalid_baseclass: false,
                update: false,
                is_validated: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            var titles = [
                'online = ' + test.online,
                'invalid_baseclass = ' + test.invalid_baseclass,
                'update = ' + test.update,
                'is_validated = ' + test.is_validated
            ];
            it(test.title + ' (' + titles.join(', ') + ')', function () {
                //initial
                var validation = { InvalidBaseClasses: test.invalid_baseclass };
                spyOn(angleHandler, 'Online').and.returnValue(test.online);
                angleHandler.Data({ authorizations: { update: test.update }, is_validated: ko.observable(test.is_validated) });

                // prepare
                var result = angleHandler.CanUpdateQuerySteps(validation);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetResultQueryDefinition", function () {
        it("should get base_angle block for Angle", function () {
            //initial
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler.QueryDefinitionHandler, 'GetExecutedParameters').and.returnValue([{}]);
            angleHandler.Data().uri = '/models/1/angles/1';

            // prepare
            var result = angleHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(1);
            expect(result.query_definition[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE);
            expect(result.query_definition[0].base_angle).toEqual('/models/1/angles/1');
        });
        it("should get base_angle block for Template", function () {
            //initial
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler.QueryDefinitionHandler, 'HasSourceChanged').and.returnValue(false);
            spyOn(angleHandler.QueryDefinitionHandler, 'GetExecutedParameters').and.returnValue([]);
            angleHandler.Data().uri = '/models/1/angles/abcd-efgh-ijkl';
            angleHandler.Data().uri_template = '/models/1/angles/2';

            // prepare
            var result = angleHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(1);
            expect(result.query_definition[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_ANGLE);
            expect(result.query_definition[0].base_angle).toEqual('/models/1/angles/2');
        });
        it("should get base_classes block if there are changes", function () {
            //initial
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler.QueryDefinitionHandler, 'HasSourceChanged').and.returnValue(true);
            spyOn(angleHandler.QueryDefinitionHandler, 'GetQueryDefinition').and.returnValue({
                query_definition: [{
                    base_classes: [],
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES
                }, {
                    query_steps: [],
                    queryblock_type: enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS
                }]
            });
            angleHandler.Data().model = '/models/1';
            angleHandler.Data().uri = '/models/1/angles/abcd-efgh-ijkl';

            // prepare
            var result = angleHandler.GetResultQueryDefinition();

            // assert
            expect(result.query_definition.length).toEqual(2);
            expect(result.model).toEqual('/models/1');
            expect(result.query_definition[0].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES);
            expect(result.query_definition[1].queryblock_type).toEqual(enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS);
        });
    });

    describe(".ClearAllPostResultsData", function () {
        it("should clear all Display results", function () {
            // prepare
            var display1 = new DisplayHandler({ id: 'display1' }, angleHandler);
            display1.ResultHandler.Data = { uri: '/results/1' };
            var display2 = new DisplayHandler({ id: 'display2' }, angleHandler);
            display2.ResultHandler.Data = { uri: '/results/2' };
            var display3 = new DisplayHandler({ id: 'display3' }, angleHandler);
            display3.ResultHandler.Data = { uri: '/results/3' };
            angleHandler.Displays = [display1, display2, display3];
            angleHandler.ClearAllPostResultsData();

            // assert
            expect(angleHandler.Displays[0].ResultHandler.Data).toEqual({});
            expect(angleHandler.Displays[1].ResultHandler.Data).toEqual({});
            expect(angleHandler.Displays[2].ResultHandler.Data).toEqual({});
        });
    });

    describe(".InitialDisplays", function () {
        it("should initial Displays (no Display, ForcedSetDisplays = false)", function () {
            // prepare
            var displays = [
                { id: 'display1', uri: '/displays/1' },
                { id: 'display2', uri: '/displays/2' },
                { id: 'display3', uri: '/displays/3' }
            ];
            angleHandler.Displays = [];
            angleHandler.ForcedSetDisplays = false;
            angleHandler.InitialDisplays(displays);

            // assert
            expect(angleHandler.Displays.length).toEqual(3);
            expect(angleHandler.GetDisplay('/displays/1').Data().id()).toEqual('display1');
            expect(angleHandler.GetDisplay('/displays/2').Data().id()).toEqual('display2');
            expect(angleHandler.GetDisplay('/displays/3').Data().id()).toEqual('display3');
        });
        it("should initial Displays (has Displays, ForcedSetDisplays = true)", function () {
            // prepare
            var displays = [
                { id: 'display1', uri: '/displays/1' },
                { id: 'display2', uri: '/displays/2' },
                { id: 'display3', uri: '/displays/3' }
            ];
            angleHandler.Displays = [{}];
            angleHandler.ForcedSetDisplays = true;
            angleHandler.InitialDisplays(displays);

            // assert
            expect(angleHandler.Displays.length).toEqual(3);
            expect(angleHandler.GetDisplay('/displays/1').Data().id()).toEqual('display1');
            expect(angleHandler.GetDisplay('/displays/2').Data().id()).toEqual('display2');
            expect(angleHandler.GetDisplay('/displays/3').Data().id()).toEqual('display3');
        });
        it("should not initial Displays", function () {
            // prepare
            var displays = [
                { id: 'display1', uri: '/displays/1' },
                { id: 'display2', uri: '/displays/2' },
                { id: 'display3', uri: '/displays/3' }
            ];
            angleHandler.Displays = [{}];
            angleHandler.ForcedSetDisplays = false;
            angleHandler.InitialDisplays(displays);

            // assert
            expect(angleHandler.Displays.length).toEqual(1);
        });
    });

    describe(".GetDefaultDisplay", function () {
        it("should get a default Display", function () {
            // prepare
            angleHandler.Data().angle_default_display = 'display2';
            angleHandler.Displays = [
                new DisplayHandler({ id: 'display1' }, angleHandler),
                new DisplayHandler({ id: 'display2' }, angleHandler)
            ];
            var result = angleHandler.GetDefaultDisplay();

            // assert
            expect(result.Data().id()).toEqual('display2');
        });
        it("should use the frist Display as a default Display", function () {
            // prepare
            angleHandler.Data().angle_default_display = 'display3';
            angleHandler.Displays = [
                new DisplayHandler({ id: 'display1', is_angle_default: false }, angleHandler),
                new DisplayHandler({ id: 'display2', is_angle_default: false }, angleHandler)
            ];
            var result = angleHandler.GetDefaultDisplay();

            // assert
            expect(result.Data().id()).toEqual('display1');
        });
    });

    describe(".GetRawDisplay", function () {
        it("should get raw Display", function () {
            // prepare
            var result = angleHandler.GetRawDisplay('');

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".SetRawDisplay", function () {
        it("should update raw Display", function () {
            // prepare
            angleHandler.Data({
                display_definitions: [
                    { uri: 'displays/1', id: 'id1' },
                    { uri: 'displays/2', id: 'id2' }
                ]
            });
            angleHandler.SetRawDisplay({ uri: 'displays/2', id: 'id2-new' });

            // assert
            expect(angleHandler.Data().display_definitions[1].id).toEqual('id2-new');
        });
        it("should add raw Display", function () {
            // prepare
            angleHandler.Data({
                display_definitions: [
                    { uri: 'displays/1', id: 'id1' },
                    { uri: 'displays/2', id: 'id2' }
                ]
            });
            angleHandler.SetRawDisplay({ uri: 'displays/3', id: 'id3-adhoc' });

            // assert
            expect(angleHandler.Data().display_definitions.length).toEqual(3);
        });
    });

    describe(".GetAdhocDisplays", function () {
        it("should get adhoc Displays", function () {
            // prepare
            angleHandler.Displays = [
                {
                    GetRawData: function () { return null; }
                },
                {
                    GetRawData: function () { return {}; }
                },
                {
                    GetRawData: function () { return null; }
                }
            ];
            var result = angleHandler.GetAdhocDisplays();

            // assert
            expect(result.length).toEqual(2);
        });
    });

    describe(".SetCurrentDisplay/.GetCurrentDisplay", function () {
        it("should set/get current Displays", function () {
            // prepare
            angleHandler.SetCurrentDisplay('my-display');

            // assert
            expect(angleHandler.GetCurrentDisplay()).toEqual('my-display');
        });
    });

    describe(".AddDisplay", function () {
        it("should add an adhoc Display", function () {
            // prepare
            angleHandler.Displays = [
                {
                    GetRawData: function () { return null; }
                },
                {
                    GetRawData: function () { return {}; }
                },
                {
                    GetRawData: function () { return null; }
                }
            ];
            spyOn(angleHandler, 'SetRawDisplay');
            spyOn(angleHandler, 'GetDisplay').and.returnValue(null);
            angleHandler.AddDisplay({}, null, true);

            // assert
            expect(angleHandler.Displays.length).toEqual(2);
            expect(angleHandler.SetRawDisplay).not.toHaveBeenCalled();
        });
        it("should add a saved Display", function () {
            // prepare
            angleHandler.Displays = [
                {
                    GetRawData: function () { return null; }
                },
                {
                    GetRawData: function () { return {}; }
                },
                {
                    GetRawData: function () { return null; }
                }
            ];
            spyOn(angleHandler, 'SetRawDisplay');
            spyOn(angleHandler, 'GetDisplay').and.returnValue(null);
            angleHandler.AddDisplay({}, null, false);

            // assert
            expect(angleHandler.Displays.length).toEqual(4);
            expect(angleHandler.SetRawDisplay).toHaveBeenCalled();
        });
        it("should not add a Display from a difference Angle", function () {
            // prepare
            angleHandler.Displays = [];
            angleHandler.Data({ uri: '/angles/1' });
            angleHandler.AddDisplay({ uri: '/angles/2/displays/2' }, null, false);

            // assert
            expect(angleHandler.Displays.length).toEqual(0);
        });
        it("should not add a Display", function () {
            // prepare
            angleHandler.Displays = [
                {
                    GetRawData: function () { return null; }
                },
                {
                    GetRawData: function () { return {}; }
                },
                {
                    GetRawData: function () { return null; }
                }
            ];
            spyOn(angleHandler, 'SetRawDisplay');
            spyOn(angleHandler, 'GetDisplay').and.returnValue({});
            angleHandler.AddDisplay({}, null, false);

            // assert
            expect(angleHandler.Displays.length).toEqual(3);
        });
    });

    describe(".RemoveDisplay", function () {
        beforeEach(function () {
            angleHandler.Displays = [{}, {}];
            angleHandler.Data().display_definitions = [{}, {}];
        });
        it("should remove Display on both source and current", function () {
            // prepare
            spyOn(Array.prototype, 'indexOfObject').and.returnValue(0);
            angleHandler.RemoveDisplay('');

            // assert
            expect(angleHandler.Displays.length).toEqual(1);
            expect(angleHandler.Data().display_definitions.length).toEqual(1);
        });
        it("should not remove Display", function () {
            // prepare
            spyOn(Array.prototype, 'indexOfObject').and.returnValue(-1);
            angleHandler.RemoveDisplay('');

            // assert
            expect(angleHandler.Displays.length).toEqual(2);
            expect(angleHandler.Data().display_definitions.length).toEqual(2);
        });
    });

    describe(".SaveDisplays", function () {
        var display3;
        beforeEach(function () {
            var display1 = new DisplayHandler({}, angleHandler);
            var display2 = new DisplayHandler({}, angleHandler);
            display3 = new DisplayHandler({}, angleHandler);
            spyOn(display1, 'CanCreateOrUpdate').and.returnValue(true);
            spyOn(display2, 'CanCreateOrUpdate').and.returnValue(false);
            spyOn(display3, 'CanCreateOrUpdate').and.returnValue(true);
            angleHandler.Displays = [display1, display2, display3];
            spyOn(Array.prototype, 'pushDeferred');
            spyOn(angleHandler, 'SaveDisplay').and.returnValue($.when());
        });
        it("should save all Displays with is_user_default=true", function () {
            // prepare
            display3.Data().user_specific.is_user_default(true);
            angleHandler.SaveDisplays();

            // assert
            expect(Array.prototype.pushDeferred).toHaveBeenCalledTimes(1);
            expect(angleHandler.SaveDisplay).toHaveBeenCalledTimes(1);
        });
        it("should save all Displays with is_user_default=false", function () {
            // prepare
            angleHandler.SaveDisplays();

            // assert
            expect(Array.prototype.pushDeferred).toHaveBeenCalledTimes(2);
            expect(angleHandler.SaveDisplay).toHaveBeenCalledTimes(0);
        });
    });

    describe(".SaveDisplay", function () {
        it("should save Display", function () {
            // prepare
            var display = new DisplayHandler({}, angleHandler);
            spyOn(display, 'CreateOrUpdate');
            angleHandler.SaveDisplay(display, false);

            // assert
            expect(display.CreateOrUpdate).toHaveBeenCalled();
        });
    });

    describe(".SaveDisplayDone", function () {
        it("should show a toast message with Display name", function () {
            // prepare
            var display = new DisplayHandler({}, angleHandler);
            spyOn(display, 'GetName');
            spyOn(toast, 'MakeSuccessTextFormatting');
            angleHandler.SaveDisplayDone(display);

            // assert
            expect(display.GetName).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".IsChangeDisplaysUsedInTask", function () {
        it("should return true when match the condition", function () {
            // prepare
            angleHandler.Displays = [
                {
                    GetCreateOrUpdateData: function () { return true; },
                    IsUsedInTask: function () { return true; }
                }
            ];
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);

            var result = angleHandler.IsChangeDisplaysUsedInTask();

            // assert
            expect(result).toBeTruthy();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
        });

        it("should return false when did not match the condition", function () {
            // prepare
            angleHandler.Displays = [
                {
                    GetCreateOrUpdateData: function () { return false; },
                    IsUsedInTask: function () { return true; }
                }
            ];
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);

            var result = angleHandler.IsChangeDisplaysUsedInTask();

            // assert
            expect(result).toBeFalsy();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
        });
    });

    describe(".IsDisplaysUsedInTask", function () {
        it("should return true when angle has the display that is used in task", function () {
            // prepare
            angleHandler.Displays = [
                {
                    IsUsedInTask: function () { return true; }
                }
            ];

            var result = angleHandler.IsDisplaysUsedInTask();

            // assert
            expect(result).toBeTruthy();
        });

        it("should return false when angle has not the display that is used in task", function () {
            // prepare
            angleHandler.Displays = [
                {
                    IsUsedInTask: function () { return false; }
                }
            ];

            var result = angleHandler.IsDisplaysUsedInTask();

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe(".IsChangeUsedInTask", function () {
        it("should return true when match the condition", function () {
            // prepare
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue(true);
            spyOn(angleHandler, 'IsDisplaysUsedInTask').and.returnValue(true);

            var result = angleHandler.IsChangeUsedInTask();

            // assert
            expect(result).toBeTruthy();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
            expect(angleHandler.GetCreateOrUpdateData).toHaveBeenCalled();
            expect(angleHandler.IsDisplaysUsedInTask).toHaveBeenCalled();
        });

        it("should return false when did not match the condition", function () {
            // prepare
            spyOn(angleHandler, 'CanCreateOrUpdate').and.returnValue(true);
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue(true);
            spyOn(angleHandler, 'IsDisplaysUsedInTask').and.returnValue(false);

            var result = angleHandler.IsChangeUsedInTask();

            // assert
            expect(result).toBeFalsy();
            expect(angleHandler.CanCreateOrUpdate).toHaveBeenCalled();
            expect(angleHandler.GetCreateOrUpdateData).toHaveBeenCalled();
            expect(angleHandler.IsDisplaysUsedInTask).toHaveBeenCalled();
        });
    });

    describe(".ConfirmSave", function () {
        beforeEach(function () {
            spyOn(angleHandler, 'ConfirmSaveWithUsedInTask');
            spyOn(popup, 'Confirm');
        });
        it("should confirm when angle is validated", function () {
            // prepare
            angleHandler.Data().is_validated(true);
            angleHandler.ConfirmSave(null, $.noop, $.noop);

            // assert
            expect(popup.Confirm).toHaveBeenCalled();
            expect(angleHandler.ConfirmSaveWithUsedInTask).not.toHaveBeenCalled();
        });
        it("should not confirm when angle is not validated", function () {
            // prepare
            angleHandler.Data().is_validated(false);
            angleHandler.ConfirmSave($.noop, $.noop, $.noop);

            // assert
            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(angleHandler.ConfirmSaveWithUsedInTask).toHaveBeenCalled();
        });
    });

    describe(".ConfirmSaveWithUsedInTask", function () {
        var fn = {};
        beforeEach(function () {
            fn.callback = $.noop;
            spyOn(fn, 'callback');
            spyOn(popup, 'Confirm');
        });
        it("should confirm when checker = true", function () {
            // prepare
            var checker = function () { return true; };
            angleHandler.ConfirmSaveWithUsedInTask(checker, fn.callback, $.noop);

            // assert
            expect(popup.Confirm).toHaveBeenCalled();
            expect(fn.callback).not.toHaveBeenCalled();
        });
        it("should not confirm when checker = false", function () {
            // prepare
            var checker = function () { return false; };
            angleHandler.ConfirmSave(checker, fn.callback, $.noop);

            // assert
            expect(popup.Confirm).not.toHaveBeenCalled();
            expect(fn.callback).toHaveBeenCalled();
        });
    });

    describe(".IsConflict", function () {
        it("should return true when this angle is changed/used in task or display in the angle is changed/used in task", function () {
            // prepare
            spyOn(angleHandler, 'IsChangeUsedInTask').and.returnValue(false);
            spyOn(angleHandler, 'IsChangeDisplaysUsedInTask').and.returnValue(true);

            var result = angleHandler.IsConflict();

            // assert
            expect(result).toBeTruthy();
            expect(angleHandler.IsChangeUsedInTask).toHaveBeenCalled();
            expect(angleHandler.IsChangeDisplaysUsedInTask).toHaveBeenCalled();
        });

        it("should return false when this angle is not hanged/used in task and display in the angle is not changed/used in task", function () {
            // prepare
            spyOn(angleHandler, 'IsChangeUsedInTask').and.returnValue(false);
            spyOn(angleHandler, 'IsChangeDisplaysUsedInTask').and.returnValue(false);

            var result = angleHandler.IsConflict();

            // assert
            expect(result).toBeFalsy();
            expect(angleHandler.IsChangeUsedInTask).toHaveBeenCalled();
            expect(angleHandler.IsChangeDisplaysUsedInTask).toHaveBeenCalled();
        });
    });

    describe(".SaveAll", function () {
        it("should save all Angle and Displays", function () {
            // prepare
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler, 'CreateOrUpdate').and.returnValue($.when());
            spyOn(angleHandler, 'SaveDisplays').and.returnValue($.when());
            angleHandler.SaveAll();

            // assert
            expect(angleHandler.CreateOrUpdate).toHaveBeenCalled();
            expect(angleHandler.SaveDisplays).toHaveBeenCalled();
        });
        it("should only save Angle for adhoc", function () {
            // prepare
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler, 'CreateOrUpdate').and.returnValue($.when());
            spyOn(angleHandler, 'SaveDisplays').and.returnValue($.when());
            angleHandler.SaveAll();

            // assert
            expect(angleHandler.CreateOrUpdate).toHaveBeenCalled();
            expect(angleHandler.SaveDisplays).not.toHaveBeenCalled();
        });
    });

    describe(".SaveDefaultDisplay", function () {
        beforeEach(function () {
            spyOn(angleHandler, 'UpdateData');
        });
        it("should not save (adhoc Angle)", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue({ id: 'my-id' });
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            angleHandler.SaveDefaultDisplay();

            // assert
            expect(angleHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should not save (no changes)", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue(null);
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            angleHandler.SaveDefaultDisplay();

            // assert
            expect(angleHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should not save (no angle_default_display)", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue({ id: 'my-id' });
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            angleHandler.SaveDefaultDisplay();

            // assert
            expect(angleHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should save", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue({ angle_default_display: 'new-id' });
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            angleHandler.SaveDefaultDisplay();

            // assert
            expect(angleHandler.UpdateData).toHaveBeenCalled();
        });
    });

    describe(".SaveAllDone", function () {
        it("should show a toast message with Angle name", function () {
            // prepare
            spyOn(angleHandler, 'GetName');
            spyOn(toast, 'MakeSuccessTextFormatting');
            angleHandler.SaveAllDone();

            // assert
            expect(angleHandler.GetName).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });
    });

    describe(".CreateOrUpdate", function () {
        it("should do nothing if no data", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue(null);
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler, 'CreateNew');
            spyOn(angleHandler, 'UpdateData');
            angleHandler.CreateOrUpdate();

            // assert
            expect(angleHandler.CreateNew).not.toHaveBeenCalled();
            expect(angleHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should create new if adhoc", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue({ id: '1' });
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler, 'CreateNew');
            spyOn(angleHandler, 'UpdateData');
            angleHandler.CreateOrUpdate();

            // assert
            expect(angleHandler.CreateNew).toHaveBeenCalled();
            expect(angleHandler.UpdateData).not.toHaveBeenCalled();
        });
        it("should update if not adhoc", function () {
            // prepare
            spyOn(angleHandler, 'GetCreateOrUpdateData').and.returnValue({ id: '1' });
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler, 'CreateNew');
            spyOn(angleHandler, 'UpdateData');
            angleHandler.CreateOrUpdate();

            // assert
            expect(angleHandler.CreateNew).not.toHaveBeenCalled();
            expect(angleHandler.UpdateData).toHaveBeenCalled();
        });
    });

    describe(".GetCreateOrUpdateData", function () {
        it("should get data for creating", function () {
            // prepare
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler, 'GetData').and.returnValue('create data');
            spyOn(angleHandler, 'GetChangeData').and.returnValue('update data');
            var result = angleHandler.GetCreateOrUpdateData();

            // assert
            expect(result).toEqual('create data');
        });
        it("should get data for updating", function () {
            // prepare
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler, 'GetData').and.returnValue('create data');
            spyOn(angleHandler, 'GetChangeData').and.returnValue('update data');
            var result = angleHandler.GetCreateOrUpdateData();

            // assert
            expect(result).toEqual('update data');
        });
    });

    describe(".GetChangeData", function () {
        it("should get changes data", function () {
            // prepare
            var result = angleHandler.GetChangeData({ id: 'test' }, { id: 'test2' });

            // assert
            expect($.isEmptyObject(result)).toEqual(false);
        });
    });

    describe(".CreateNew", function () {
        it("should create", function () {
            // prepare
            var callback = { done: $.noop, fail: $.noop };
            spyOn(callback, 'done');
            spyOn(callback, 'fail');
            spyOn(window, 'CreateDataToWebService').and.returnValue($.when());
            spyOn(angleInfoModel, 'DeleteTemporaryAngle');
            spyOn(angleInfoModel, 'SetData');
            spyOn(angleHandler, 'ForceInitial');
            angleHandler.CreateNew({}, callback.done, callback.fail);

            // assert
            expect(callback.done).toHaveBeenCalled();
            expect(callback.fail).not.toHaveBeenCalled();
            expect(angleInfoModel.SetData).toHaveBeenCalled();
            expect(angleHandler.ForceInitial).toHaveBeenCalled();
        });
    });

    describe(".UpdateDataFunction", function () {
        it("should update", function () {
            // prepare
            spyOn(window, 'UpdateDataToWebService').and.returnValue($.when({ name: 'new-name', changed: 'new-changed' }));
            spyOn(angleHandler, 'UpdateModel');
            spyOn(angleHandler, 'UpdateDisplayAuthorizations');
            spyOn(angleHandler, 'SetRawData');
            var data = {
                name: 'new-name'
            };
            angleHandler.UpdateDataFunction('', data);

            // assert
            expect(angleHandler.UpdateModel).toHaveBeenCalled();
            expect(angleHandler.UpdateDisplayAuthorizations).toHaveBeenCalled();
            expect(angleHandler.SetRawData).toHaveBeenCalled();
        });
    });

    describe(".UpdateStateFunction", function () {
        it("should update state", function () {
            // prepare
            spyOn(angleInfoModel, 'Data').and.returnValue({});
            spyOn(window, 'UpdateDataToWebService').and.returnValue($.when({}));
            spyOn(angleHandler, 'SetRawData');
            angleHandler.UpdateStateFunction('', {});

            // assert
            expect(angleHandler.SetRawData).toHaveBeenCalled();
        });
    });

    describe(".UpdateAdhocFunction", function () {
        it("should update adhoc", function () {
            // prepare
            spyOn(angleHandler, 'UpdateModel');
            angleHandler.UpdateAdhocFunction('', {});

            // assert
            expect(angleHandler.UpdateModel).toHaveBeenCalled();
        });
    });

    describe(".UpdateModel", function () {
        it("should update adhoc", function () {
            // prepare
            spyOn(angleInfoModel, 'SetData');
            spyOn(angleHandler, 'Initial');
            angleHandler.UpdateModel('', {});

            // assert
            expect(angleHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".UpdateDisplayAuthorizations", function () {
        it("should authorizations", function () {
            // prepare
            var displays = [
                { authorizations: 'my-authorizations-1' },
                { authorizations: 'my-authorizations-2' }
            ];
            var handler1 = null;
            var handler2 = { Data: ko.observable({ authorizations: 'my-authorizations-x' }) };
            var raw1 = { authorizations: 'my-authorizations-y' };
            var raw2 = null;
            spyOn(angleHandler, 'GetDisplay').and.returnValues(handler1, handler2);
            spyOn(angleHandler, 'GetRawDisplay').and.returnValues(raw1, raw2);
            angleHandler.UpdateDisplayAuthorizations(displays);

            // assert
            expect(handler2.Data().authorizations).toEqual('my-authorizations-2');
            expect(raw1.authorizations).toEqual('my-authorizations-1');
        });
    });

    describe(".CanCreate", function () {
        it("can create", function () {
            // prepare
            spyOn(privilegesViewModel, 'CanCreateAngle').and.returnValue(true);
            var result = angleHandler.CanCreate();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanUpdate", function () {
        it("can update", function () {
            // prepare
            angleHandler.Data({ authorizations: { update: true } });
            var result = angleHandler.CanUpdate();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanCreateOrUpdate", function () {
        it("should use creating privilege", function () {
            // prepare
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleHandler, 'CanCreate').and.returnValue(true);
            spyOn(angleHandler, 'CanUpdate').and.returnValue(false);
            var result = angleHandler.CanCreateOrUpdate();

            // assert
            expect(result).toEqual(true);
        });
        it("should use updating privilege", function () {
            // prepare
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleHandler, 'CanCreate').and.returnValue(true);
            spyOn(angleHandler, 'CanUpdate').and.returnValue(false);
            var result = angleHandler.CanCreateOrUpdate();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".CanEditId ", function () {
        it("should not be possible to edit id", function () {
            var result = angleHandler.CanEditId();
            // assert
            expect(result).toEqual(false);
        });
        it("should be possible to edit id", function () {
            // prepare
            angleHandler.SetEditId(true);
            var result = angleHandler.CanEditId();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".CanCreateTemplateAngle", function () {
        var tests = [
            {
                title: 'should return true when user can create template and it is not a temp angle',
                canCreateTemplate: true,
                isTempAngle: false,
                expected: true
            },
            {
                title: 'should return false when user can create template and it is a temp angle',
                canCreateTemplate: true,
                isTempAngle: true,
                expected: false
            },
            {
                title: 'should return false when user cant create template and it is not a temp angle',
                canCreateTemplate: false,
                isTempAngle: false,
                expected: false
            },
            {
                title: 'should return false when user cant create template and it is a temp angle',
                canCreateTemplate: false,
                isTempAngle: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(privilegesViewModel, 'CanCreateTemplateAngle').and.returnValue(test.canCreateTemplate);
                spyOn(angleHandler, 'IsAdhoc').and.returnValue(test.isTempAngle);
                var actual = angleHandler.CanCreateTemplateAngle();
                expect(actual).toEqual(test.expected);
            });
        });
    });

    describe(".CanSetTemplate", function () {
        var tests = [
            {
                title: 'should return true when user can mark template',
                istemplate: false,
                markTemplate: true,
                expected: true
            },
            {
                title: 'should return false when user cant mark template',
                istemplate: false,
                markTemplate: false,
                expected: false
            },
            {
                title: 'should return true when user can unmark template',
                istemplate: true,
                unmarkTemplate: false,
                expected: false
            },
            {
                title: 'should return false when user cant unmark template',
                istemplate: true,
                unmarkTemplate: true,
                expected: true
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleHandler, "Data").and.callFake(function () {
                    return {
                        is_template: function () { return test.istemplate; },
                        authorizations: {
                            unmark_template: test.unmarkTemplate,
                            mark_template: test.markTemplate
                        }
                    };
                });

                var actual = angleHandler.CanSetTemplate();
                expect(actual).toEqual(test.expected);
            });
        });
    });

    describe(".ShowStatisticPopup", function () {
        it("should call AngleStatisticHandler", function () {
            spyOn(angleHandler.AngleStatisticHandler, 'ShowPopup');
            angleHandler.ShowStatisticPopup();
            expect(angleHandler.AngleStatisticHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".IsStatisticVisible", function () {
        it("should return true when IsAchod() is false", function () {
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(false);
            var result = angleHandler.IsStatisticVisible();
            expect(result).toBeTruthy();
        });

        it("should return true when there is info in ResultHandler", function () {
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);

            var display = {
                ResultHandler: {
                    ExecutionInfo: $.noop
                }
            };
            spyOn(display.ResultHandler, 'ExecutionInfo').and.returnValue({});
            spyOn(angleHandler, 'GetCurrentDisplay').and.returnValue(display);
            var result = angleHandler.IsStatisticVisible();
            expect(result).toBeTruthy();
        });

        it("should return false when IsAdhoc() is true and there is no info in ResultHandler", function () {
            spyOn(angleHandler, 'IsAdhoc').and.returnValue(true);

            var display = {
                ResultHandler: {
                    ExecutionInfo: $.noop
                }
            };
            spyOn(display.ResultHandler, 'ExecutionInfo').and.returnValue(null);
            spyOn(angleHandler, 'GetCurrentDisplay').and.returnValue(display);
            var result = angleHandler.IsStatisticVisible();
            expect(result).toBeFalsy();
        });
    });

    describe(".Validate", function () {
        it("should call validate function(s)", function () {
            spyOn(angleHandler.AngleLabelHandler, 'Validate');

            angleHandler.Validate();

            expect(angleHandler.AngleLabelHandler.Validate).toHaveBeenCalled();
        });
    });
});
