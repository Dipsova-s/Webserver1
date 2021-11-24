/// <chutzpah_reference path="/../../Dependencies/page/MC.AutomationTasks.Tasks.js" />
/// <chutzpah_reference path="/../../Dependencies/custom/MC.ui.popup.js" />

describe("MC.AutomationTasks.Tasks", function () {

    var automationTask;

    beforeEach(function () {
        automationTask = MC.AutomationTasks.Tasks;
    });

    describe(".GetArgumentValue", function () {

        it("argument value undefined get empty string", function () {
            // prepare
            var expectedValue = '';
            var actualValue = automationTask.GetArgumentValue();

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("normal argument get correct value", function () {
            // prepare
            var expectedValue = 8;
            var data = 8;
            var actualValue = automationTask.GetArgumentValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("object argument get correct value", function () {
            // prepare
            var expectedValue = 5;
            var data = { argument_type: 'value', value: 5 };
            var actualValue = automationTask.GetArgumentValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("object argument lists get correct value", function () {
            // prepare
            var expectedValue = '5,10';
            var data = [{ argument_type: 'value', value: 5 }, { argument_type: 'value', value: 10 }];
            var actualValue = automationTask.GetArgumentsListValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });

        it("normal argument lists get correct value", function () {
            // prepare
            var expectedValue = '25,30';
            var data = [25, 30];
            var actualValue = automationTask.GetArgumentsListValue(data);

            // assert
            expect(expectedValue).toEqual(actualValue);
        });
    });

    describe(".TriggerTypeDropdownChanged", function () {

        it("should call AdjustLayoutByTriggerType function", function () {
            // prepare
            spyOn(automationTask, 'TriggerTypeDropdownChanged').and.callFake($.noop);
            automationTask.TriggerTypeDropdownChanged({ sender: { value: $.noop } });

            // assert
            expect(automationTask.TriggerTypeDropdownChanged).toHaveBeenCalled();
        });

    });

    describe(".SetValueToEventTypesDropdown", function () {

        // tests data
        var eventTypes = { event: 'event', external: 'external' };
        var triggerType = [{ event: 'xxxxx' }];
        var kendoDropdown = { value: $.noop };
        var testValues = [{
            title: 'cannot set event dropdown and show element',
            taskData: { triggers: [] },
            triggerType: eventTypes.event,
            eventTypesDropdown: kendoDropdown,
            expectValueCall: false
        },
        {
            title: 'can set event dropdown and show element',
            taskData: { triggers: triggerType },
            triggerType: eventTypes.event,
            eventTypesDropdown: kendoDropdown,
            expectValueCall: true
        },
        {
            title: 'cannot set event dropdown and hide element',
            taskData: { triggers: triggerType },
            triggerType: eventTypes.external,
            eventTypesDropdown: kendoDropdown,
            expectValueCall: false
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                // initial
                spyOn(testValue.eventTypesDropdown, 'value').and.callFake($.noop);
                spyOn(MC.AutomationTasks.Tasks, 'SetValueToEventModelsDropdown').and.callFake($.noop);

                // begin test
                automationTask.SetValueToEventTypesDropdown(testValue.taskData, testValue.triggerType, testValue.eventTypesDropdown);

                // assert
                if (testValue.expectValueCall) {
                    expect(testValue.eventTypesDropdown.value).toHaveBeenCalled();
                }
                else {
                    expect(testValue.eventTypesDropdown.value).not.toHaveBeenCalled();
                }

            });
        });

    });

    describe('.SetValueToEventModelsDropdown', function () {

        // tests data
        var tests = [{
            title: 'should set event model to dropdown, when model is no null',
            arguments: {
                triggerData: {
                    arguments: {
                        findObject: $.noop
                    }
                },
                modelsDropdown: { value: $.noop }
            },
            expectedFuncCall: true
        },
        {
            title: 'should not set event model to dropdown, when model is null',
            arguments: {
                triggerData: {
                    arguments: {
                        findObject: $.noop
                    }
                },
                modelsDropdown: { value: $.noop }
            },
            expectedFuncCall: false
        }];

        $.each(tests, function (index, test) {
            it(test.title, function () {

                // initial
                spyOn(test.arguments.modelsDropdown, 'value').and.callFake($.noop);
                if (test.expectedFuncCall) {
                    spyOn(test.arguments.triggerData.arguments, 'findObject').and.callFake(function () {
                        return {
                            name: 'model',
                            value: 'EA4IT'
                        };
                    });
                }

                // begin test
                automationTask.SetValueToEventModelsDropdown(test.arguments.triggerData, test.arguments.modelsDropdown);

                // assert
                if (test.expectedFuncCall) {
                    expect(test.arguments.modelsDropdown.value).toHaveBeenCalled();
                }
                else {
                    expect(test.arguments.modelsDropdown.value).not.toHaveBeenCalled();
                }
            });
        });

    });

    describe(".AdjustLayoutByTriggerType", function () {

        // tests data
        var kendoDropdown = { wrapper: { show: $.noop, hide: $.noop } };
        var testValues = [{
            title: 'if action type is event',
            actionType: 'event',
            eventTypesDropdown: kendoDropdown,
            expectShowEventTypeDropdown: true
        },
        {
            title: 'if action type is schedule',
            actionType: 'schedule',
            eventTypesDropdown: kendoDropdown,
            expectShowEventTypeDropdown: false
        },
        {
            title: 'if action type is external',
            actionType: 'external',
            eventTypesDropdown: kendoDropdown,
            expectShowEventTypeDropdown: false
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                // initial
                spyOn(testValue.eventTypesDropdown.wrapper, 'show').and.callFake($.noop);
                spyOn(testValue.eventTypesDropdown.wrapper, 'hide').and.callFake($.noop);

                // begin test
                automationTask.AdjustLayoutByTriggerType(testValue.actionType, testValue.eventTypesDropdown);

                // assert
                if (testValue.expectShowEventTypeDropdown) {
                    expect(testValue.eventTypesDropdown.wrapper.show).toHaveBeenCalled();
                }
                else {
                    expect(testValue.eventTypesDropdown.wrapper.hide).toHaveBeenCalled();
                }

            });
        });

    });

    describe(".SetAbilityToEditControl", function () {

        // tests data
        var testValues = [{
            title: 'if action type is external',
            data: {
                task: { id: 0, name: 'test', Uri: 'https://app.com/task/1', status: 'running', created: { Uri: 'hero' }, Triggers: [{ trigger_type: 'external' }] },
                manageSystemPrivilege: true,
                canScheduleAngles: true,
                currentUser: 'hero'
            }
        }];

        $.each(testValues, function (index, testValue) {
            it(testValue.title, function () {

                // initial
                spyOn(MC.util.task, 'getTriggerExternalUrl').and.callFake($.noop);

                // begin test
                automationTask.SetAbilityToEditControl(testValue.data.task, testValue.data.manageSystemPrivilege, testValue.data.canScheduleAngles, testValue.data.currentUser);

                // assert
                expect(MC.util.task.getTriggerExternalUrl).toHaveBeenCalled();
            });
        });

        var data = {
            status: 'none',
            name: 'task',
            Uri: 'http://www.ea.com',
            run_as_user: 'run_as_user'
        };

        it("Show copy task command when has ManageSystemPrivilege", function () {
            spyOn(MC.util.task, 'getTriggerExternalUrl').and.callFake($.noop);
            var result = automationTask.SetAbilityToEditControl(
                data, true, false, "");
            expect(result).toContain("popupCopyTask");
        });

        it("Hide copy task command when has no ManageSystemPrivilege", function () {
            spyOn(MC.util.task, 'getTriggerExternalUrl').and.callFake($.noop);
            var result = automationTask.SetAbilityToEditControl(
                data, false, true, 'run_as_user');
            expect(result.indexOf('popupCopyTask') === -1).toBe(true);
        });

        it("Show delete command with data-parameters", function () {
            spyOn(automationTask, 'CanManageTask').and.returnValue(false);
            var template = automationTask.SetAbilityToEditControl(data, false, true, 'run_as_user');
            expect(template).toContain("data-parameters='{\"taskUri\":\"http://www.ea.com\"}'");
        });

        it("Show execute task command when has CanScheduleAngles", function () {
            spyOn(automationTask, 'CanManageTask').and.returnValue(false);
            var template = automationTask.SetAbilityToEditControl(data, false, true, 'run_as_user');
            expect(template).toContain("<input type=\"hidden\" name=\"uri\" value=\"http:\/\/www.ea.com\" \/><a href=\"\"  onclick=\"MC.AutomationTasks.Tasks.EditTask(event, this)\" data-parameters='{\"tasksUri\":\"http:\/\/www.ea.com\"}' class=\"btn btnEdit\">Edit<\/a><a data-parameters='{\"taskUri\":\"http:\/\/www.ea.com\"}' data-delete-template=\"Delete Task: {reference}?\" data-delete-field-index=\"0\" onclick=\"MC.AutomationTasks.Tasks.DeleteTask(event,this)\" class=\"btn btnDelete disabled\">Delete<\/a>");
        });
    });

    describe(".ActionButtonTemplate", function () {
        it("Show all button if user has manage system privilege", function () {
            // prepare
            var data = {
                run_as_user:'test'
            };
            automationTask.CanManageSystem = true;
            var template = automationTask.ActionButtonTemplate(data);
            expect(template).toContain("<a href=\"#AddActionPopup\" class=\"btn btnEdit\"  onclick=\"MC.AutomationTasks.Tasks.ShowEditActionPopup('undefined', true)\" data-role=\"mcPopup\" data-width=\"700\" data-min-width=\"600\" data-height=\"575\" data-min-height=\"350\">Edit<\/a><a href=\"#popupCopyAction\" onclick=\"MC.AutomationTasks.Tasks.CopyActionPopup('', 'undefined')\" data-role=\"mcPopup\" title=\"undefined\" data-width=\"500\" data-min-height=\"180\" data-min-width=\"475\" class=\"btn btnCopy alwaysHidden\" >Copy</a><a onclick=\"MC.AutomationTasks.Tasks.ExecuteAdhocTaskAction('undefined')\" class=\"btn btn btnExecute alwaysHidden\">Execute now<\/a><a class=\"btn btnDelete\" data-parameters=\\'{\"uid\":\"= undefined\"}\\' data-delete-template=\"Delete Field: {reference}?\" class=\"btn btnDelete\" onclick=\"MC.form.template.markAsRemove(this)\">Delete<\/a>");
        });
        it("Show all button if user has schedule angle privilege and task owner", function () {
            // prepare
            var data = {
                run_as_user: 'test'
            };
            automationTask.CanManageSystem = false;
            automationTask.CanScheduleAngles = true;
            automationTask.IsTaskOwner = true;
            var template = automationTask.ActionButtonTemplate(data);
            expect(template).toContain("<a href=\"#AddActionPopup\" class=\"btn btnEdit\"  onclick=\"MC.AutomationTasks.Tasks.ShowEditActionPopup('undefined', true)\" data-role=\"mcPopup\" data-width=\"700\" data-min-width=\"600\" data-height=\"575\" data-min-height=\"350\">Edit<\/a><a href=\"#popupCopyAction\" onclick=\"MC.AutomationTasks.Tasks.CopyActionPopup('', 'undefined')\" data-role=\"mcPopup\" title=\"undefined\" data-width=\"500\" data-min-height=\"180\" data-min-width=\"475\" class=\"btn btnCopy alwaysHidden\" >Copy</a><a onclick=\"MC.AutomationTasks.Tasks.ExecuteAdhocTaskAction('undefined')\" class=\"btn btn btnExecute alwaysHidden\">Execute now<\/a><a class=\"btn btnDelete\" data-parameters=\\'{\"uid\":\"= undefined\"}\\' data-delete-template=\"Delete Field: {reference}?\" class=\"btn btnDelete\" onclick=\"MC.form.template.markAsRemove(this)\">Delete<\/a>");
        });
        it("Show only view button and disabled delete button if user has only schedule angle privilege", function () {
            // prepare
            var data = {
                run_as_user: 'test'
            };
            automationTask.CanManageSystem = false;
            automationTask.CanScheduleAngles = true;
            automationTask.IsTaskOwner = false;
            var template = automationTask.ActionButtonTemplate(data);
            expect(template).toContain("<a href=\"#AddActionPopup\" class=\"btn btnEdit\"  onclick=\"MC.AutomationTasks.Tasks.ShowEditActionPopup('undefined', false)\" data-role=\"mcPopup\" data-width=\"700\" data-min-width=\"600\" data-height=\"575\" data-min-height=\"350\">View<\/a><a class=\"btn btnDelete disabled\">Delete<\/a>");
            expect(template).toContain("disabled");
        });
    });

    describe(".GetActionsGridColumnDefinitions", function () {

        it("should get task action columns", function () {
            // prepare
            var columns = automationTask.GetActionsGridColumnDefinitions();

            // assert
            expect(columns.length).toEqual(10);
            expect(columns[0].field).toEqual('order');
            expect(columns[1].field).toEqual('action_type_name');
            expect(typeof columns[1].template).toEqual('function');
            expect(columns[2].field).toEqual('action_detail');
            expect(typeof columns[2].template).toEqual('function');
            expect(columns[3].field).toEqual('model_name');
            expect(typeof columns[3].template).toEqual('function');
            expect(columns[4].field).toEqual('angle_name');
            expect(columns[5].field).toEqual('display_name');
            expect(columns[6].field).toEqual('run_as_user');
            expect(columns[7].field).toEqual('condition_name');
            expect(typeof columns[7].template).toEqual('function');
            expect(columns[8].field).toEqual('approval_state');
            expect(columns[9].field).toEqual('action');
        });

    });

    describe(".GetActionTypeName", function () {

        it("should get action name from action type 'datastore'", function () {
            // prepare
            var actionData = { action_type: automationTask.ACTION_TYPE_ID.DATASTORE };
            var result = automationTask.GetActionTypeName(actionData);

            // assert
            expect(result).toEqual(Localization.MC_ActionType_Datastore);
        });

        it("should get action name from action type 'script'", function () {
            // prepare
            var actionData = { action_type: automationTask.ACTION_TYPE_ID.SCRIPT };
            var result = automationTask.GetActionTypeName(actionData);

            // assert
            expect(result).toEqual(Localization.MC_ActionType_Script);
        });

    });

    describe(".GetActionDetail", function () {

        it("should get action details from action type 'datastore' #1", function () {
            // prepare
            var actionData = {
                action_type: automationTask.ACTION_TYPE_ID.DATASTORE,
                arguments: [
                    { name: 'datastore', value: 'test_id' }
                ]
            };
            automationTask.DataStoreValues = [];
            var result = automationTask.GetActionDetail(actionData);

            // assert
            expect(result).toEqual('test_id');
        });

        it("should get action details from action type 'datastore' #2", function () {
            // prepare
            var actionData = {
                action_type: automationTask.ACTION_TYPE_ID.DATASTORE,
                arguments: [
                    { name: 'datastore', value: 'test_id' }
                ]
            };
            automationTask.DataStoreValues = [
                { id: 'test_id', name: 'test_name' }
            ];
            var result = automationTask.GetActionDetail(actionData);

            // assert
            expect(result).toEqual('test_name');
        });

        it("should get action details from action type 'script' #1", function () {
            // prepare
            var actionData = {
                action_type: automationTask.ACTION_TYPE_ID.SCRIPT,
                arguments: [
                    { name: 'script', value: 'test_id' }
                ]
            };
            automationTask.Scripts = [];
            var result = automationTask.GetActionDetail(actionData);

            // assert
            expect(result).toEqual('test_id');
        });

        it("should get action details from action type 'script' #2", function () {
            // prepare
            var actionData = {
                action_type: automationTask.ACTION_TYPE_ID.SCRIPT,
                arguments: [
                    { name: 'script', value: 'test_id' }
                ]
            };
            automationTask.Scripts = [
                { id: 'test_id', name: 'test_name' }
            ];
            var result = automationTask.GetActionDetail(actionData);

            // assert
            expect(result).toEqual('test_name');
        });

    });

    describe(".GetModelName", function () {

        it("should get model id if no model data", function () {
            // prepare
            automationTask.AllModels = [];
            var result = automationTask.GetModelName('model_test');

            // assert
            expect(result).toEqual('model_test');
        });

        it("should get model name if has model data", function () {
            // prepare
            automationTask.AllModels = [
                { id: 'model_test', short_name: 'model_test_name' }
            ];
            var result = automationTask.GetModelName('model_test');

            // assert
            expect(result).toEqual('model_test_name');
        });

    });

    describe(".GetModelNameFromActionData", function () {

        it("should get model name from action data #1", function () {
            // prepare
            var actionData = { arguments: [] };
            automationTask.AllModels = [
                { id: 'model_test', short_name: 'model_test_name' }
            ];
            var result = automationTask.GetModelNameFromActionData(actionData);

            // assert
            expect(result).toEqual('');
        });

        it("should get model name from action data #2", function () {
            // prepare
            var actionData = { arguments: [{ name: 'model', value: 'model_test' }] };
            automationTask.AllModels = [
                { id: 'model_test', short_name: 'model_test_name' }
            ];
            var result = automationTask.GetModelNameFromActionData(actionData);

            // assert
            expect(result).toEqual('model_test_name');
        });

    });

    describe(".GetConditionName", function () {

        beforeEach(function () {
            spyOn(automationTask, 'GetArgumentConditionOperator').and.returnValue('operator');
        });

        it("should get condition if datastore and condition value is null", function () {
            // prepare
            spyOn(automationTask, 'GetArgumentConditionValue').and.returnValue(null);
            var actionData = { action_type: automationTask.ACTION_TYPE_ID.DATASTORE };
            var result = automationTask.GetConditionName(actionData);

            // assert
            expect(result).toEqual('operator');
        });

        it("should get condition if datastore and condition value is not null", function () {
            // prepare
            spyOn(automationTask, 'GetArgumentConditionValue').and.returnValue('value');
            var actionData = { action_type: automationTask.ACTION_TYPE_ID.DATASTORE };
            var result = automationTask.GetConditionName(actionData);

            // assert
            expect(result).toEqual('operator value');
        });

        it("should get condition if not datastore", function () {
            // prepare
            spyOn(automationTask, 'GetArgumentConditionValue').and.returnValue('value');
            var actionData = { action_type: automationTask.ACTION_TYPE_ID.SCRIPT };
            var result = automationTask.GetConditionName(actionData);

            // assert
            expect(result).toEqual('');
        });

    });

    describe(".GetActionsGridDataSource", function () {

        var angle = JSON.stringify({
            id: 'angle2',
            display_definitions: [
                { id: 'display21', uri: '/angles/2/displays/21' }
            ]
        });

        var actions = [
            {
                // full information
                action_type: 'action_type2',
                AngleName: 'AngleName2',
                AngleUri: '/models/1/angles/2',
                DisplayName: 'DisplayName2',
                approval_state: 'approval_state2',
                notification: 'notification2',
                arguments: [
                    { name: 'angle_id', value: 'angle2' },
                    { name: 'display_id', value: 'display21' }
                ],
                uri: '/tasks/2',
                order: 4,
                Angle: angle
            },
            {
                // no Angle information
                action_type: 'action_type1',
                AngleName: '',
                AngleUri: '/models/1/angles/1',
                DisplayName: '',
                run_as_user: 'test_user',
                approval_state: 'approval_state1',
                notification: 'notification1',
                arguments: [
                    { name: 'angle_id', value: 'angle1' },
                    { name: 'display_id', value: 'display11' }
                ],
                uri: '/tasks/1',
                order: 3
            },
            {
                // no Angle information
                action_type: 'action_type3',
                AngleName: '',
                AngleUri: '/models/1/angles/3',
                DisplayName: '',
                run_as_user: '',
                approval_state: 'approval_state3',
                notification: 'notification3',
                arguments: [
                    { name: 'angle_id', value: 'angle1' },
                    { name: 'display_id', value: 'display12' }
                ],
                uri: '/tasks/3',
                order: 5
            }
        ];

        it("should get correct datasource", function () {
            // prepare
            var result = automationTask.GetActionsGridDataSource(actions);

            // assert
            expect(result.data[0].action_type).toEqual('action_type1');
            expect(result.data[0].angle_name).toEqual('angle1');
            expect(result.data[0].display_name).toEqual('display11');
            expect(result.data[0].display_uri).toEqual('');
            expect(result.data[0].approval_state).toEqual('approval_state1');
            expect(result.data[0].notification).toEqual('notification1');
            expect(result.data[0].uri).toEqual('/tasks/1');
            expect(result.data[0].order).toEqual(0);
            expect(result.data[0].AngleUri).toEqual('/models/1/angles/1');
            expect(result.data[0].run_as_user).toEqual('test_user')

            expect(result.data[1].action_type).toEqual('action_type2');
            expect(result.data[1].angle_name).toEqual('AngleName2');
            expect(result.data[1].display_name).toEqual('DisplayName2');
            expect(result.data[1].display_uri).toEqual('/angles/2/displays/21');
            expect(result.data[1].approval_state).toEqual('approval_state2');
            expect(result.data[1].notification).toEqual('notification2');
            expect(result.data[1].uri).toEqual('/tasks/2');
            expect(result.data[1].order).toEqual(1);
            expect(result.data[1].AngleUri).toEqual('/models/1/angles/2');

            expect(result.data[2].action_type).toEqual('action_type3');
            expect(result.data[2].angle_name).toEqual('angle1');
            expect(result.data[2].display_name).toEqual('display12');
            expect(result.data[2].display_uri).toEqual('');
            expect(result.data[2].approval_state).toEqual('approval_state3');
            expect(result.data[2].notification).toEqual('notification3');
            expect(result.data[2].uri).toEqual('/tasks/3');
            expect(result.data[2].order).toEqual(2);
            expect(result.data[2].AngleUri).toEqual('/models/1/angles/3');
            expect(result.data[2].run_as_user).toEqual('')

            expect(result.sort.field).toEqual('order');
            expect(result.sort.dir).toEqual('asc');
        });
    });

    describe(".SetEmailRecipientsColumns", function () {

        var grid;
        var gridFunction = { wrapper: $(), showColumn: $.noop, hideColumn: $.noop };
        beforeEach(function () {
            spyOn(gridFunction, 'showColumn');
            spyOn(gridFunction, 'hideColumn');
            grid = $('<div id="RecipientsGrid" />').data('kendoGrid', gridFunction);
            grid.appendTo('body');
        });

        afterEach(function () {
            grid.remove();
        });

        it("should show column if datastore type", function () {
            // prepare
            spyOn(automationTask, 'IsDatastoreAction').and.returnValue(true);
            automationTask.SetEmailRecipientsColumns();

            // assert
            expect(gridFunction.showColumn).toHaveBeenCalled();
        });

        it("should show column if not datastore type", function () {
            // prepare
            spyOn(automationTask, 'IsDatastoreAction').and.returnValue(false);
            automationTask.SetEmailRecipientsColumns();

            // assert
            expect(gridFunction.hideColumn).toHaveBeenCalled();
        });

    });

    describe(".ConditionDropdownChanged", function () {

        var textbox;
        beforeEach(function () {
            textbox = $('<input id="condition_value" type="text" value="100" />');
            textbox.appendTo('body');
        });

        afterEach(function () {
            textbox.remove();
        });

        it("should set textbox to correct state if Always operator", function () {
            // prepare
            automationTask.ConditionDropdownChanged({
                sender: {
                    value: function () {
                        return automationTask.ACTION_CONDITION_OPERATOR.ALWAYS;
                    }
                }
            });

            // assert
            expect(textbox.hasClass('error')).toEqual(false);
            expect(textbox.hasClass('required')).toEqual(false);
            expect(textbox.prop('disabled')).toEqual(true);
            expect(textbox.val()).toEqual('');
        });

        it("should set textbox to correct state if not Always operator", function () {
            // prepare
            automationTask.ConditionDropdownChanged({
                sender: {
                    value: function () {
                        return 'any';
                    }
                }
            });

            // assert
            expect(textbox.hasClass('error')).toEqual(false);
            expect(textbox.hasClass('required')).toEqual(true);
            expect(textbox.prop('disabled')).toEqual(false);
            expect(textbox.val()).toEqual('100');
        });

    });

    describe(".IsDatastoreAction", function () {

        var dropdown;
        var dropdownFunction = { value: $.noop };
        beforeEach(function () {
            dropdown = $('<div id="action_type" />').data('kendoDropDownList', dropdownFunction);
            dropdown.appendTo('body');
        });

        afterEach(function () {
            dropdown.remove();
        });

        it("should get true if action type is datastore", function () {
            // prepare
            spyOn(dropdownFunction, 'value').and.returnValue(automationTask.ACTION_TYPE_ID.DATASTORE);
            var result = automationTask.IsDatastoreAction();

            // assert
            expect(result).toEqual(true);
        });

        it("should get false if action type is not datastore", function () {
            // prepare
            spyOn(dropdownFunction, 'value').and.returnValue('any');
            var result = automationTask.IsDatastoreAction();

            // assert
            expect(result).toEqual(false);
        });

    });

    describe(".AddDisplayExcelTemplateToddlExcelTemplate", function () {

        var dropdown;
        beforeEach(function () {
            dropdown = $('<div id="template_file" />').kendoDropDownList({
                dataTextField: "File",
                dataValueField: "File",
                dataSource: [
                    { File: 'excel_template_00.xlsx' },
                    { File: 'excel_template_01.xlsx' },
                    { File: 'excel_template_02.xlsx' }
                ]
            });
            dropdown.appendTo('body');
        });

        afterEach(function () {
            dropdown.remove();
        });

        it("should Add default excel template to Template file dropdown", function () {
            // prepare
            var ddlExcelTemplate = $('#template_file').data('kendoDropDownList');
            automationTask.DisplayExcelTemplate = 'excel_template_02.xlsx';
            var addedItem = '[Use default] excel_template_02.xlsx';

            automationTask.AddDisplayExcelTemplateToddlExcelTemplate(ddlExcelTemplate);

            // assert
            var result = jQuery.grep(ddlExcelTemplate.dataSource.data(), function (option) {
                return option.File === addedItem;
            });
            expect(result.length).toBe(1);
            expect(ddlExcelTemplate.value()).toBe(addedItem);
        });
    });

    describe(".RemoveDisplayExcelTemplateFromddlExcelTemplate", function () {

        var dropdown;
        beforeEach(function () {
            dropdown = $('<div id="template_file" />').kendoDropDownList({
                dataTextField: "File",
                dataValueField: "File",
                dataSource: [
                    { File: 'excel_template_00.xlsx' },
                    { File: 'excel_template_01.xlsx' },
                    { File: 'excel_template_02.xlsx' },
                    { File: '[Use default] excel_template_02.xlsx' }
                ]
            });
            dropdown.appendTo('body');
        });

        afterEach(function () {
            dropdown.remove();
        });

        it("should remove default excel template from Template file dropdown", function () {
            // prepare
            var ddlExcelTemplate = $('#template_file').data('kendoDropDownList');
            var addedItem = '[Use default] excel_template_02.xlsx';
            automationTask.StandardExcelTemplate = 'excel_template_01.xlsx';
            automationTask.RemoveDisplayExcelTemplateFromddlExcelTemplate(ddlExcelTemplate);

            // assert
            var result = jQuery.grep(ddlExcelTemplate.dataSource.data(), function (option) {
                return option.File === addedItem;
            });
            expect(result.length).toBe(0);
            expect(ddlExcelTemplate.value()).toBe(automationTask.StandardExcelTemplate);
        });
    });

    describe(".ConfigureDefaultTemplateFile", function () {
        beforeEach(function () {
            spyOn(automationTask, 'AddDisplayExcelTemplateToddlExcelTemplate').and.returnValue($.noop);
            spyOn(automationTask, 'RemoveDisplayExcelTemplateFromddlExcelTemplate').and.returnValue($.noop);
        });

        it("should set display excel template and call AddDisplayExcelTemplate", function () {
            // Prepare
            var display = { display_details : '{ "excel_template": "excel_template_00.xlsx" }' };

            var result = automationTask.ConfigureDefaultTemplateFile(display, null);

            // Assert
            expect(automationTask.AddDisplayExcelTemplateToddlExcelTemplate).toHaveBeenCalled();
            expect(automationTask.RemoveDisplayExcelTemplateFromddlExcelTemplate).toHaveBeenCalled();
            expect(automationTask.DisplayExcelTemplate).toBe('excel_template_00.xlsx');
            expect(result).toBe(true);

        });

        it("should reset display excel template and call RemoveDisplayExcelTemplate", function () {
            // Prepare
            var display = { display_details : '{}' };

            var result = automationTask.ConfigureDefaultTemplateFile(display, null);

            // Assert
            expect(automationTask.RemoveDisplayExcelTemplateFromddlExcelTemplate).toHaveBeenCalled();
            expect(automationTask.DisplayExcelTemplate).toBe('');
            expect(result).toBe(true);
        });

        it("should reset display excel template and call RemoveDisplayExcelTemplate when display_detail is undefined", function () {
            // Prepare
            var display = { };

            var result = automationTask.ConfigureDefaultTemplateFile(display, null);

            // Assert
            expect(automationTask.RemoveDisplayExcelTemplateFromddlExcelTemplate).toHaveBeenCalled();
            expect(automationTask.DisplayExcelTemplate).toBe('');
            expect(result).toBe(true);
        });

        it("should reset display excel template and return false", function () {
            // Prepare
            var display = null;

            var result = automationTask.ConfigureDefaultTemplateFile(display, null);

            // Assert
            expect(automationTask.RemoveDisplayExcelTemplateFromddlExcelTemplate).toHaveBeenCalled();
            expect(automationTask.DisplayExcelTemplate).toBe('');
            expect(result).toBe(false);
        });
    });

    describe(".GetActionData", function () {

        var container;
        var dropdownFunction = {
            value: $.noop,
            dataItem: function () {
                return { uri: 'uri', name: 'name' };
            }
        };
        var datastoreArguments = [
            { name: 'action_type', value: 'datastore' }
        ];
        var programScriptArguments = [
            { name: 'action_type', value: 'script' }
        ];
        beforeEach(function () {
            spyOn(automationTask, 'GetDatastoreActionArgumentsFromUI').and.returnValue(datastoreArguments);
            spyOn(automationTask, 'GetScriptActionArgumentsFromUI').and.returnValue(programScriptArguments);
            spyOn(automationTask, 'GetEmailNotificationDataFromUI').and.returnValue('notification');
            automationTask.CurrentAngle = {};

            container = $('<div/>').appendTo('body');
            $('<div id="action_type"/>').data('kendoDropDownList', dropdownFunction).appendTo(container);
            $('<div id="approvalddl"/>').data('kendoDropDownList', dropdownFunction).appendTo(container);
            $('<div id="display_id"/>').data('kendoDropDownList', dropdownFunction).appendTo(container);
            $('<input name="action_run_as_user" value="test_user"/>').appendTo(container);
        });

        afterEach(function () {
            container.remove();
        });

        it("should get run as user value", function () {
            var result = automationTask.GetActionData();

            // assert
            expect(result.run_as_user).toEqual('test_user');
        });

        it("should get data if action type is datastore", function () {
            // prepare
            spyOn(dropdownFunction, 'value').and.returnValue(automationTask.ACTION_TYPE_ID.DATASTORE);
            var result = automationTask.GetActionData();

            // assert
            expect(result.arguments.findObject('action_type').value).toEqual('datastore');
        });

        it("should get data if action type is not datastore", function () {
            // prepare
            spyOn(dropdownFunction, 'value').and.returnValue('any');
            var result = automationTask.GetActionData();

            // assert
            expect(result.arguments.findObject('action_type').value).toEqual('script');
        });

        it("should have uri of Angle in return object", function () {
            automationTask.CurrentAngle = { uri: '/models/1/angles/1' };
            spyOn(dropdownFunction, 'value').and.returnValue(automationTask.ACTION_TYPE_ID.DATASTORE);
            var result = automationTask.GetActionData();

            expect(result.AngleUri).toEqual(automationTask.CurrentAngle.uri);
        });

    });

    describe(".GetData", function () {

        var uid;
        var dataItems = {
            1: { is_edited: false },
            2: { is_edited: false },
            3: { is_edited: true }
        };

        beforeEach(function () {
            uid = 0;
            automationTask.IsTaskActionsSorted = false;
            spyOn(automationTask, 'GetTaskData').and.returnValue({});
            spyOn(jQuery.fn, 'hasClass').and.returnValue(false);
            spyOn(jQuery.fn, 'data').and.callFake(function (dataId) {
                if (dataId === 'uid') {
                    uid++;
                    return uid;
                }
                else if (dataId === 'kendoGrid') {
                    return {
                        items: function () {
                            var items = [];
                            for (var i = 0; i < Object.keys(dataItems).length; i++) {
                                items.push(i);
                            }
                            return items;
                        },
                        dataSource: {
                            getByUid: function (uid) {
                                return dataItems[uid];
                            }
                        }
                    };
                }
            });
        });

        it("should PUT task action(s) that only contains 'is_edited'", function () {
            var result = automationTask.GetData();
            expect(result.actions.length).toEqual(1);

            // verify sort index as well
            expect(result.actions[0].order).toEqual(2);
        });
        it("should PUT all task actions when task action has the sorting", function () {
            automationTask.IsTaskActionsSorted = true;
            var result = automationTask.GetData();
            expect(result.actions.length).toEqual(3);
        });

    });

    describe(".HideOrShowModelTimestampIndex", function () {
        beforeEach(function () {
            ddlElement = $('<div id="datastore"><input id="model_timestamp_index"/></div>').data('kendoDropDownList', {
                value: $.noop,
                dataItem: ko.observableArray([
                    { id: 'Datastore_test1', value:'Datastore_test1' },
                    { Code: 'Datastore_test2', value: 'Datastore_test2' }
                ])
            }).appendTo('body');
            $("#model_timestamp_index").kendoNumericTextBox({
                value: 1
            });
        });

        afterEach(function () {
            ddlElement.remove();
        });
        it("When display type is chart or pivot model_timestamp_index value should be -1", function () {           
            spyOn(automationTask, "IsChartOrPivot").and.returnValue(true);
            spyOn(automationTask, "IsExcelDataStore").and.returnValue(true);
            spyOn($.fn, 'hide').and.returnValue($.noop);
            automationTask.HideOrShowModelTimestampIndex();
            expect($.fn.hide).toHaveBeenCalled();
            var modelTimestampIndexValue = $("#model_timestamp_index").data('handler').value();
            expect(modelTimestampIndexValue).toBe(-1);
        });
        it("When display type is List model_timestamp_index value should be 1", function () {
            spyOn(automationTask, "IsChartOrPivot").and.returnValue(false);
            spyOn(automationTask, "IsExcelDataStore").and.returnValue(false);
            spyOn($.fn, 'show').and.returnValue($.noop);
            automationTask.HideOrShowModelTimestampIndex();
            expect($.fn.show).toHaveBeenCalled();
            var modelTimestampIndexValue = $("#model_timestamp_index").data('handler').value();
            expect(modelTimestampIndexValue).toBe(1);
        });
    });

    describe(".SetTemplateFileValue", function () {
        var ui, arg = {};
        beforeEach(function () {
            ui = {
                value: $.noop,
                trigger: $.noop
            };
            spyOn(ui, 'value');
            spyOn(ui, 'trigger');
        });
        it("should set value", function () {
            // prepare
            arg.value = 'my-value';
            automationTask.SetTemplateFileValue(ui, arg);

            // assert
            expect(ui.value).toHaveBeenCalledWith('my-value');
            expect(ui.trigger).toHaveBeenCalledWith('change');
        });
        it("should not set value", function () {
            // prepare
            arg.value = '';
            automationTask.SetTemplateFileValue(ui, arg);

            // assert
            expect(ui.value).not.toHaveBeenCalled();
            expect(ui.trigger).not.toHaveBeenCalled();
        });
    });

    describe(".CopyActionPopup", function () {
        it("should call the popup and make request", function () {
            spyOn(MC.ui, 'popup');
            var handler = {
                setOptions: function () { },
            };
            var doneHandler = { done: function () { return true; } }
            spyOn($.fn, 'data').and.returnValue(handler);
            spyOn(MC.ajax, 'request').and.returnValue(doneHandler);
            spyOn(automationTask, 'SetSelectedActionBasedOnUid');
            automationTask.CopyActionPopup("", "");
            expect(MC.ui.popup).toHaveBeenCalled();
            expect(MC.ajax.request).toHaveBeenCalled();
            expect(automationTask.SetSelectedActionBasedOnUid).toHaveBeenCalled();
        });
    });

    describe(".SetSelectedActionBasedOnUid", function () {
        it("should set SelectedAction", function () {
            var returnedValue = "Value has been set";
            var handler = {
                dataSource: {
                    getByUid: function () {
                        return returnedValue;
                    }
                }
            };
            spyOn($.fn, 'data').and.returnValue(handler);
            automationTask.SetSelectedActionBasedOnUid("");
            expect(automationTask.SelectedAction).toEqual(returnedValue);
        });
    });

    describe(".CreateCopyTasksDropdown", function () {
        it("should create copy tasks dropdown", function () {
            var taskUrl = "/sampletask", data = [
                { Uri: "/sampleUrl", name: "Sample" }
            ];
            spyOn($.fn, 'kendoDropDownList');
            automationTask.CreateCopyTasksDropdown(data, taskUrl);
            expect(automationTask.SelectedTaskUri).toEqual(taskUrl);
            expect($.fn.kendoDropDownList).toHaveBeenCalled();
        });
    });

    describe(".CopyAction", function () {

        it("should not perform copy function for invalid copy", function () {
            spyOn($.fn, 'valid').and.returnValue(false);
            spyOn(automationTask, 'AddAdocCopyAction');
            spyOn(MC.ajax, 'request');
            automationTask.CopyAction();
            expect(automationTask.AddAdocCopyAction).not.toHaveBeenCalled();
            expect(MC.ajax.request).not.toHaveBeenCalled();
        });

        it("should perform adoc copy action when selected task is same as current task", function () {
            var handler = { close: $.noop };
            spyOn($.fn, 'valid').and.returnValue(true);
            spyOn($.fn, 'data').and.returnValue(handler);
            spyOn(automationTask, 'AddAdocCopyAction');
            spyOn(automationTask, 'GetCopyActionData');
            automationTask.SelectedTaskUri = "/sampleTaskUri";
            automationTask.TaskUri = "/sampleTaskUri"
            automationTask.CopyAction();
            expect(automationTask.AddAdocCopyAction).toHaveBeenCalled();
        });

        it("should perform copy action for valid task", function () {
            spyOn($.fn, 'valid').and.returnValue(true);
            automationTask.SelectedTaskUri = "/sampleSelectedTaskUri";
            automationTask.TaskUri = "/sampleTaskUri"
            spyOn(automationTask, 'AddAdocCopyAction');
            spyOn(automationTask, 'GetCopyActionData');
            var handler = { done: function () { return { error: function () { return true; } }; } };
            spyOn(MC.ajax, 'request').and.returnValue(handler);
            automationTask.CopyAction();
            expect(MC.ajax.request).toHaveBeenCalled();
        });
    });

    describe(".CopyTaskDropdownChanged", function () {
        it("should update SelectedTaskUri", function () {
            var senderValue = {
                sender: { value: function () { return "This value is set" } }
            };
            automationTask.CopyTaskDropdownChanged(senderValue);
            expect(automationTask.SelectedTaskUri).toEqual(senderValue.sender.value());
        });
    });

    describe(".GetCopyActionData", function () {
        it("should update action data object when action type is export_angle_to_datastore", function () {
            var currentActionData = {
                run_as_user: "run as user",
                action_type: "export_angle_to_datastore",
                approval_state: "approval_state",
                AngleUri: "AngleUri",
                angle_name: "angle_name",
                display_name: "display_name",
                display_uri: "display_uri",
                arguments: "arguments",
                notification: "notification"
            }
            var actionData = automationTask.GetCopyActionData(currentActionData);
            expect(actionData.run_as_user).toEqual(currentActionData.run_as_user);
            expect(actionData.action_type).toEqual(currentActionData.action_type);
            expect(actionData.approval_state).toEqual(currentActionData.approval_state);
            expect(actionData.AngleUri).toEqual(currentActionData.AngleUri);
            expect(actionData.angle_name).toEqual(currentActionData.angle_name);
            expect(actionData.display_uri).toEqual(currentActionData.display_uri);
            expect(actionData.display_name).toEqual(currentActionData.display_name);
            expect(actionData.arguments).toEqual(currentActionData.arguments);
            expect(actionData.notification).toEqual(currentActionData.notification);
        });

        it("should update action data object when action type is not export_angle_to_datastore", function () {
            var currentActionData = {
                run_as_user: "run as user",
                action_type: "action type",
                approval_state: "approval_state",
                angle_name: "",
                display_name: "",
                display_uri: "",
                arguments: "arguments",
                notification: "notification",
                Angle: null
            }
            var actionData = automationTask.GetCopyActionData(currentActionData);
            expect(actionData.run_as_user).toEqual(currentActionData.run_as_user);
            expect(actionData.action_type).toEqual(currentActionData.action_type);
            expect(actionData.approval_state).toEqual(currentActionData.approval_state);
            expect(actionData.Angle).toEqual(currentActionData.Angle);
            expect(actionData.angle_name).toEqual(currentActionData.angle_name);
            expect(actionData.display_uri).toEqual(currentActionData.display_uri);
            expect(actionData.display_name).toEqual(currentActionData.display_name);
            expect(actionData.arguments).toEqual(currentActionData.arguments);
            expect(actionData.notification).toEqual(currentActionData.notification);
        });
    });

});
