(function (win, automationTasks) {

    win.Tasks = function () {
        var _self = {};
        _self.canSetAction = false;
        _self.uid = null;
        _self.modelId = null;
        _self.fnCheck = null;

        var self = this;

        self.NULL = '[[NULL]]';
        self.AllTaskPageUri = '';
        self.DataStoresUri = '';
        self.ExecuteTaskUri = '';
        self.DeleteTaskUri = '';
        self.SaveAutomatedTaskUri = '';
        self.EditTaskPage = '';
        self.DataStoreValues = {};
        self.GetUserUri = '';
        self.FindAngleUri = '';
        self.TaskUri = '';
        self.GetTaskActionUri = '';
        self.TaskHistoryUri = '';
        self.CurrentAngle = {};
        self.DisplayExcelTemplate = '';
        self.StandardExcelTemplate = '';
        self.ModelPrivileges = '';
        self.TasksActionsUri = '';
        self.CheckTaskActionUri = '';
        self.GetFieldsUri = '';
        self.GetFieldSourceUri = '';
        self.GetFieldDomainUri = '';
        self.WebClientAngleUrl = '';
        self.VerifyModelPriviledgeUri = '';
        self.IsTaskActionsSorted = false;
        self.GetHistoryUri = '';
        self.CheckExecutionTaskUri = '';
        self.CurrentUser = '';
        self.CanManageSystem = '';
        self.CanScheduleAngles = '';
        self.IsTaskOwner = '';
        self.DefaultApprovalState = '';
        self.AllTaskUri = '';
        self.SelectedTaskUriUri = '';
        self.CopyActionUri = '';
        self.SelectedAction = '';
        self.TestConnectionUri = '';
        self.CurrentDatastorePlugin = '';

        self.Status = {
            NotStarted: 'notstarted',
            Running: 'running',
            Finished: 'finished',
            Failed: 'failed',
            Cancelled: 'cancelled',
            Disabled: 'disabled',
            Queued: 'queued',
            Cancelling: 'cancelling'
        };

        self.InitialAllTasks = function (data) {

            self.DataStoresUri = '';
            self.ExecuteTaskUri = '';
            self.DeleteTaskUri = '';
            self.SaveAutomatedTaskUri = '';
            self.EditTaskPage = '';
            self.DataStoreValues = {};
            self.GetUserUri = '';
            self.FindAngleUri = '';
            self.TaskUri = '';
            self.TaskHistoryUri = '';
            self.CurrentAngle = {};
            self.DisplayExcelTemplate = '';
            self.StandardExcelTemplate = '';
            self.ModelPrivileges = '';
            self.TasksActionsUri = '';
            self.CheckTaskActionUri = '';
            self.GetFieldsUri = '';
            self.CopyTaskUri = '';
            self.VerifyModelPriviledgeUri = '';
            self.IsTaskActionsSorted = false;
            self.GetHistoryUri = '';
            self.CheckExecutionTaskUri = '';
            self.CurrentUser = '';
            self.CanManageSystem = '';
            self.CanScheduleAngles = '';
            self.IsTaskOwner = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {

                var tasksGrid = jQuery('#TasksGrid').data('kendoGrid');
                if (tasksGrid) {
                    tasksGrid.bind('dataBound', self.TaskActionsGridDataBound);
                    tasksGrid.dataSource.read();
                }

                var taskHistoryGrid = jQuery('#TaskHistoryGrid').data('kendoGrid');
                if (taskHistoryGrid) {
                    MC.util.gridScrollFixed(taskHistoryGrid);

                    taskHistoryGrid.bind('dataBound', self.RefreshCycleHistoryGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        taskHistoryGrid.dataSource.read();
                    }
                    else {
                        taskHistoryGrid.trigger('dataBound');
                    }
                }

                self.InitialCopyToClipboard();
            }, 1);
        };
        self.RefreshCycleHistoryGridDataBound = function () {
            MC.ui.localize();
        };
        self.InitialRunAsUserAutoComplete = function (options) {

            var settings = jQuery.extend({
                dataTextField: "Id",
                ignoreCase: true,
                minLength: 1,
                filter: 'contains',
                dataSource: new kendo.data.DataSource({
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            MC.ajax.request({
                                url: self.GetUserUri,
                                parameters: { q: jQuery("input[name^='RunasUser']").val(), offset: 0, limit: 100 },
                                type: "GET",
                                ajaxStart: function () {
                                    disableLoading();
                                }
                            })
                                .done(options.success);
                        }
                    }
                })
            }, options || {});

            //M4-15415: [ACCEPTATIE][MC] Name field cleared when creating automated task
            var obj = jQuery("input[name^='RunasUser']");
            obj.kendoAutoComplete(settings);
        };

        self.InitialRunAsUserForActionAutoComplete = function (options) {
            var settings = jQuery.extend({
                dataTextField: "Id",
                ignoreCase: true,
                minLength: 1,
                filter: 'contains',
                dataSource: new kendo.data.DataSource({
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            MC.ajax.request({
                                url: self.GetUserUri,
                                parameters: { q: jQuery("input[name^='action_run_as_user']").val(), offset: 0, limit: 100 },
                                type: "GET",
                                ajaxStart: function () {
                                    disableLoading();
                                }
                            })
                                .done(options.success);
                        }
                    }
                })
            }, options || {});

            //M4-15415: [ACCEPTATIE][MC] Name field cleared when creating automated task
            var obj = jQuery("input[name^='action_run_as_user']");
            obj.kendoAutoComplete(settings);
        };

        self.InitialCopyToClipboard = function () {
            MC.util.clipboard('.btnCopyCommand');
        };
        self.SetAbilityToEditControl = function (data, manageSystemPrivilege, canScheduleAngles, currentUser) {
            var currentStatus = data.status;
            var uri = data.Uri;

            var canManageTask = self.CanManageTask(manageSystemPrivilege, canScheduleAngles, currentUser, data.run_as_user);
            var isExecuting = currentStatus === 'running' || currentStatus === 'queued';
            var template = '';

            template += "<input type=\"hidden\" name=\"uri\" value=\"" + uri + "\" />";
            if (canManageTask) {
                template += "<a href=\"" + MC.AutomationTasks.Tasks.EditTaskPage + "\"  onclick=\"MC.AutomationTasks.Tasks.EditTask(event, this)\" data-parameters='{\"tasksUri\":\"" + uri + "\"}' class=\"btn btnEdit\">" + Localization.Edit + "</a>";
                if (manageSystemPrivilege) {
                    template += "<a href=\"#popupCopyTask\" onclick=\"MC.AutomationTasks.Tasks.CopyTaskPopup('" + uri + "', '" + data.uid + "')\" data-role=\"mcPopup\" title=\"" + Localization.MC_CopyTask + "\" data-width=\"500\" data-min-height=\"180\" data-min-width=\"475\" class=\"btn btnCopy\">" + Localization.Copy + "</a>";
                }
                template += "<a onclick=\"MC.AutomationTasks.Tasks.ExecuteTask(this,'" + uri + "')\" class=\"btn btn btnExecute" + (isExecuting ? " disabled" : "") + "\">" + Localization.MC_ExecuteNow + "</a>";

                if (MC.util.task.isTriggerExternal(data)) {
                    template += "<a class=\"btn btn btnCopy btnCopyCommand\" data-clipboard-text=\"" + MC.util.task.getTriggerExternalUrl(data) + "\">" + Localization.MC_CopyCommand + "</a>";
                }

                template += "<a onclick=\"MC.AutomationTasks.Tasks.AbortTask(this,'" + uri + "')\" class=\"btn btnAbort" + (!isExecuting ? " disabled" : "") + "\">" + Localization.MC_Abort + "</a>";
            }
            else if (canScheduleAngles) {
                template += "<a href=\"" + MC.AutomationTasks.Tasks.EditTaskPage + "\"  onclick=\"MC.AutomationTasks.Tasks.EditTask(event, this)\" data-parameters='{\"tasksUri\":\"" + uri + "\"}' class=\"btn btnEdit\">" + Localization.Edit + "</a>";
            }
            else {
                template += "<a href=\"" + MC.AutomationTasks.Tasks.EditTaskPage + "\"  onclick=\"MC.AutomationTasks.Tasks.EditTask(event, this)\" data-parameters='{\"tasksUri\":\"" + uri + "\"}' class=\"btn btnEdit\">" + Localization.View + "</a>";
            }
            template += "<a data-parameters='{\"taskUri\":\"" + uri + "\"}' data-delete-template=\"" + Localization.MC_DeleteTaskConfirm + "\" data-delete-field-index=\"0\" onclick=\"MC.AutomationTasks.Tasks.DeleteTask(event,this)\" class=\"btn btnDelete" + (isExecuting || !canManageTask ? ' disabled' : '') + "\">" + Localization.Delete + "</a>";
            return template;
        };
        self.CanManageTask = function (manageSystemPrivilege, canScheduleAngles, currentUser, taskOwner) {
            var canSchedule = canScheduleAngles && currentUser === taskOwner;
            return manageSystemPrivilege || canSchedule;
        };
        self.EditTask = function (event, obj) {
            MC.util.redirect(event, obj);
        };

        self.CopyTaskPopup = function (taskUri, uid) {
            MC.ui.popup('setScrollable', {
                element: '#popupCopyTask'
            });

            var win = $('#popupCopyTask').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });

            $("#TaskUri").val(taskUri);
            var dataItem = $('#TasksGrid').data('kendoGrid').dataSource.getByUid(uid);
            $("#TaskName").val(dataItem.name + '_copy');

            MC.form.validator.init('#formCopyTask');
            $('#formCopyTask').submit(function (e) {
                $('#popupCopyTask .btnSubmit').trigger('click');
                e.preventDefault();
            });
        };
        self.CopyTask = function () {
            if (!jQuery('#formCopyTask').valid())
                return;

            var taskUri = $("#TaskUri").val();
            var taskName = $("#TaskName").val();

            MC.ajax
                .request({
                    url: self.CopyTaskUri,
                    parameters: { taskUri: taskUri, taskName: taskName },
                    type: 'POST'
                })
                .done(function () {
                    jQuery('#popupCopyTask').data('kendoWindow').close();
                    MC.ajax.reloadMainContent();
                })
                .error(function () {
                    $('#popupCopyTask .btnClose').trigger('click');
                });
        };

        self.ExecuteTask = function (obj, uri) {
            if (!$(obj).hasClass('disabled')) {
                var data = {
                    'start': true,
                    'reason': Localization.MC_ManualExecute
                };

                MC.ajax.request({
                    url: self.ExecuteTaskUri,
                    parameters: { "tasksUri": uri, "data": JSON.stringify(data) },
                    type: 'POST'
                })
                    .done(function () {
                        MC.ajax.reloadMainContent();
                    });
            }
        };

        self.ExecuteAdhocTaskAction = function (uid) {
            MC.util.massReport.initial();
            MC.util.massReport.setStatus(Localization.MC_CurrentProgress, Localization.ProgressExecuting, '');

            var action = jQuery('#TaskActionsGrid').data("kendoGrid").dataSource.getByUid(uid);
            var task = {};
            task.delete_after_completion = true;
            task.start_immediately = true;
            task.actions = [action];
            task.name = Localization.SingleActionExecute + self.TaskData.name;
            if (self.CanManageTask(self.CanManageSystem, self.CanScheduleAngles, self.CurrentUser, self.TaskData.run_as_user)) {
                task.run_as_user = self.TaskData.run_as_user
            } else {
                task.run_as_user = action.run_as_user;
            }
            task.triggers = self.TaskData.triggers;

            self.ExecuteSingleAction(task)
                .then(function (data) {
                    // check result
                    return self.CheckExecutionTask(data.History);
                })
                .then(function (history) {
                    MC.util.massReport.setStatus(Localization.MC_CurrentProgress, Localization.ProgressGettingReport, '');
                    return self.GetTaskHistory(kendo.format('{0}/?task_id={1}', self.TaskHistoryUri, history.task_id));
                })
                .done(function (response) {
                    MC.util.massReport.closeReport();
                    $('#adhocTaskPopup').data('correlationid', response.correlation_id);
                    $('#adhocTaskPopup').trigger('click');
                    $("#popupLogTable_wnd_title").html(task.name);
                });
        };
        self.ExecuteSingleAction = function (task) {
            return MC.ajax.request({
                url: self.ExecuteTaskUri,
                parameters: {
                    task: JSON.stringify(task)
                },
                type: 'POST'
            });
        };
        // check execution status
        self.CheckExecutionTask = function (uri) {
            var deferred = $.Deferred();
            var query = {};
            query['uri'] = uri;

            var checkExecution = function () {
                MC.ajax
                    .request({
                        url: self.CheckExecutionTaskUri,
                        parameters: query
                    })
                    .fail(function (xhr, status, error) {
                        MC.ajax.setErrorDisable(xhr, status, error, deferred);
                    })
                    .done(function (data, status) {
                        if (data) {
                            var taskStatus = data.result.toLowerCase();
                            if (taskStatus === self.Status.Finished) {
                                MC.util.massReport.reports[0] = '<li class="success">' + Localization.MC_TaskSuccess + '</li>';
                                deferred.resolve(data, status);
                            }
                            else if (taskStatus === self.Status.Failed || taskStatus === self.Status.Cancelled) {
                                MC.util.massReport.reports[0] = '<li class="fail">' + self.Status + '</li>';
                                deferred.resolve(data, status);
                            }
                            else {
                                MC.util.massReport.setStatus(Localization.MC_CurrentProgress, Localization.ProgressExecuting, data.result);
                                setTimeout(function () {
                                    checkExecution();
                                }, 1000);
                            }
                        }
                        else {
                            setTimeout(function () {
                                MC.util.massReport.setStatus(Localization.MC_CurrentProgress, Localization.ProgressExecuting, '');
                                checkExecution();
                            }, 1000);
                        }
                    });
            };

            checkExecution();
            return deferred.promise();
        };
        self.GetTaskHistory = function (uri) {
            return MC.ajax.request({
                url: self.GetHistoryUri,
                parameters: { eventlogUri: uri },
                type: 'GET'
            });
        };
        self.ShowLogTable = function (e) {
            var correlationId = $(e).data('correlationid');
            MC.ui.logpopup.ShowLogTable(e, correlationId);
        };

        self.AbortTask = function (obj, uri) {
            if (!$(obj).hasClass('disabled')) {
                var data = {
                    'abort': true,
                    'reason': Localization.MC_ManualAbort
                };

                MC.ajax.request({
                    url: self.AbortTaskUri,
                    parameters: { "tasksUri": uri, "data": JSON.stringify(data) },
                    type: 'POST'
                })
                    .done(function () {
                        MC.ajax.reloadMainContent();
                    });
            }
        };
        self.GetDaysCheckbox = function (data) {
            return MC.util.task.getDaysCheckbox(data);
        };

        self.SaveAutomatedTaskUri = '';
        self.DataStoreValues = [];
        self.Scripts = [];
        self.AllModels = [];
        self.GetUserUri = '';
        self.FindAngleUri = '';
        self.TaskUri = '';
        self.TaskData = {};
        self.TaskHistoryUri = '';
        self.EditTaskPage = '';
        self.GetDataStoreTemplateUri = '';
        self.GetDataStoreTemplate = {};
        self.OPERATOR = {
            HASVALUE: { Text: Localization.OperatorHasValue, Value: 'has_value' },
            HASNOVALUE: { Text: Localization.OperatorHasNoValue, Value: 'has_no_value' },
            EQUALTO: { Text: Localization.OperatorIsEqualTo, Value: 'equal_to' },
            NOTEQUALTO: { Text: Localization.OperatorIsNotEqualTo, Value: 'not_equal_to' },
            ISIN: { Text: Localization.OperatorIsIn, Value: 'equal_to' },
            ISNOTIN: { Text: Localization.OperatorIsNotIn, Value: 'not_equal_to' },
            SMALLERTHAN: { Text: Localization.OperatorIsSmallerThan, Value: 'less_than' },
            GREATERTHAN: { Text: Localization.OperatorIsGreaterThan, Value: 'greater_than' },
            SMALLERTHANOREQUALTO: { Text: Localization.OperatorIsSmallerThanOrEqualTo, Value: 'less_than_or_equal' },
            GREATERTHANOREQUALTO: { Text: Localization.OperatorIsGreaterThanOrEqualTo, Value: 'greater_than_or_equal' },
            BETWEEN: { Text: Localization.OperatorIsBetween, Value: 'between' },
            NOTBETWEEN: { Text: Localization.OperatorIsNotBetween, Value: 'not_between' },
            INLIST: { Text: Localization.OperatorIsInList, Value: 'in_set' },
            NOTINLIST: { Text: Localization.OperatorIsNotInList, Value: 'not_in_set' },
            CONTAIN: { Text: Localization.OperatorContainsSubstring, Value: 'contains' },
            NOTCONTAIN: { Text: Localization.OperatorDoesNotContainSubstring, Value: 'does_not_contain' },
            STARTWITH: { Text: Localization.OperatorStartsWithSubstring, Value: 'starts_with' },
            NOTSTARTWITH: { Text: Localization.OperatorDoesNotStartWithSubstring, Value: 'does_not_start_with' },
            ENDON: { Text: Localization.OperatorEndsOnSubstring, Value: 'ends_on' },
            NOTENDON: { Text: Localization.OperatorDoesNotEndOnSubstring, Value: 'does_not_end_on' },
            MATCHPATTERN: { Text: Localization.OperatorMatchesPattern, Value: 'matches_pattern' },
            NOTMATCHPATTERN: { Text: 'does not matches pattern(s)', Value: 'does_not_match_pattern' },
            BEFORE: { Text: Localization.OperatorIsBefore, Value: 'less_than' },
            AFTER: { Text: Localization.OperatorIsAfter, Value: 'greater_than' },
            BEFOREORON: { Text: Localization.OperatorIsBeforeOrOn, Value: 'less_than_or_equal' },
            AFTERORON: { Text: Localization.OperatorIsAfterOrOn, Value: 'greater_than_or_equal' },
            BEFOREOREQUAL: { Text: Localization.OperatorIsBeforeOrOn, Value: 'less_than_or_equal' },
            AFTEROREQUAL: { Text: Localization.OperatorIsAfterOrOn, Value: 'greater_than_or_equal' }
        };
        self.EqualAgruments = [
            self.OPERATOR.EQUALTO.Value,
            self.OPERATOR.NOTEQUALTO.Value,
            self.OPERATOR.SMALLERTHAN.Value,
            self.OPERATOR.GREATERTHAN.Value,
            self.OPERATOR.SMALLERTHANOREQUALTO.Value,
            self.OPERATOR.GREATERTHANOREQUALTO.Value,
            self.OPERATOR.BEFORE.Value,
            self.OPERATOR.AFTER.Value,
            self.OPERATOR.BEFOREORON.Value,
            self.OPERATOR.AFTERORON.Value,
            self.OPERATOR.BEFOREOREQUAL.Value,
            self.OPERATOR.AFTEROREQUAL.Value
        ];
        self.BetweenAgruments = [
            self.OPERATOR.BETWEEN.Value,
            self.OPERATOR.NOTBETWEEN.Value
        ];
        self.ListAgruments = [
            self.OPERATOR.INLIST.Value,
            self.OPERATOR.NOTINLIST.Value
        ];
        self.ContainAgruments = [
            self.OPERATOR.CONTAIN.Value,
            self.OPERATOR.NOTCONTAIN.Value,
            self.OPERATOR.STARTWITH.Value,
            self.OPERATOR.NOTSTARTWITH.Value,
            self.OPERATOR.ENDON.Value,
            self.OPERATOR.NOTENDON.Value,
            self.OPERATOR.MATCHPATTERN.Value,
            self.OPERATOR.NOTMATCHPATTERN.Value
        ];
        self.NoAgruments = [
            self.OPERATOR.HASVALUE.Value,
            self.OPERATOR.HASNOVALUE.Value
        ];

        self.ACTION_CONDITION_OPERATOR = {
            ALWAYS: Localization.MC_Always,
            EXACTLY: Localization.MC_Exactly,
            LESS_THAN: Localization.MC_LessThan,
            GREATER_THAN: Localization.MC_MoreThan
        };

        self.APPROVAL_STATE_ID = {
            APPROVED: 'approved',
            DISABLED: 'disabled',
            REQUESTED: 'requested',
            REJECTED: 'rejected'
        };
        self.APPROVAL_STATE = {};
        self.APPROVAL_STATE[self.APPROVAL_STATE_ID.APPROVED] = Localization.MC_Approved;
        self.APPROVAL_STATE[self.APPROVAL_STATE_ID.DISABLED] = Localization.MC_Disabled;
        self.APPROVAL_STATE[self.APPROVAL_STATE_ID.REQUESTED] = Localization.MC_Requested;
        self.APPROVAL_STATE[self.APPROVAL_STATE_ID.REJECTED] = Localization.MC_Rejected;

        self.TRIGGER_TYPE_ID = {
            SCHEDULE: 'schedule',
            EXTERNAL: 'external',
            EVENT: 'event'
        };
        self.TRIGGER_TYPE = {};
        self.TRIGGER_TYPE[self.TRIGGER_TYPE_ID.SCHEDULE] = Localization.MC_Schedule;
        self.TRIGGER_TYPE[self.TRIGGER_TYPE_ID.EXTERNAL] = Localization.MC_External;
        self.TRIGGER_TYPE[self.TRIGGER_TYPE_ID.EVENT] = Localization.MC_Event;

        self.EVENT_TYPE = {
            currentinstance_changed: Localization.MC_TaskEvent_CurrentinstanceChanged
        };

        self.ACTION_TYPE_ID = {
            DATASTORE: 'export_angle_to_datastore',
            SCRIPT: 'run_external_command'
        };
        self.ACTION_TYPE = {};
        self.ACTION_TYPE[self.ACTION_TYPE_ID.DATASTORE] = Localization.MC_ActionType_Datastore;
        self.ACTION_TYPE[self.ACTION_TYPE_ID.SCRIPT] = Localization.MC_ActionType_Script;

        self.DEFAULT_EMAIL_SUBJECT = {};
        self.DEFAULT_EMAIL_SUBJECT[self.ACTION_TYPE_ID.DATASTORE] = "{rowstotal} items in Angle '{anglename}' on {modeltimestamp}";
        self.DEFAULT_EMAIL_SUBJECT[self.ACTION_TYPE_ID.SCRIPT] = "{rowstotal} items in Angle '{anglename}' on {modeltimestamp}";

        var nameConditionMinimumRows = 'condition_minimum_rows';
        var nameConditionMaximumRows = 'condition_maximum_rows';
        self.InitialTask = function (data) {

            self.SaveAutomatedTaskUri = '';
            self.DataStoreValues = [];
            self.Scripts = [];
            self.AllModels = [];
            self.GetUserUri = '';
            self.FindAngleUri = '';
            self.TaskUri = '';
            self.TaskData = {};
            self.EditTaskPage = '';
            self.GetDataStoreTemplateUri = '';
            self.GetDataStoreTemplate = {};
            self.GetFieldsUri = '';
            self.GetFieldSourceUri = '';
            self.GetFieldDomainUri = '';
            self.WebClientAngleUrl = '';

            jQuery.extend(self, data || {});

            // set language
            self.WebClientAngleUrl = kendo.format(self.WebClientAngleUrl, userLanguage);
            setTimeout(function () {
                self.InitialKendoComponents();
                //ajax get task data
                disableLoading();
                $('#formTask').busyIndicator(true);
                MC.ajax.request({
                    url: self.GetTaskActionUri,
                    parameters: { tasksUri: self.TaskUri },
                    type: 'GET'
                })
                    .done(self.TaskGridDataBound)
                    .always(function () {
                        $('#formTask').busyIndicator(false);
                    });
            }, 1);
        };
        self.TaskGridDataBound = function (actions) {
            self.TaskData.actions = actions;
            self.SetEditTask(self.TaskData);
            self.InitialActionsGrid(self.TaskData);
            // show action popup if AngleUri
            if (self.AngleUri) {
                var preSelectedAngle = $('td[data-display-uri="' + self.AngleUri + '"]:first').parent().find('.btnEdit:last');
                if (preSelectedAngle.length) {
                    preSelectedAngle.trigger('click');
                }
                else {
                    $('.btn.btnAdd').trigger('click');
                }
            }
            MC.form.page.init(self.GetData);
        };
        self.InitialKendoComponents = function () {
            self.CreateTriggerTypeDropdown();
            self.CreateEventTypeDropdown();

            // binding server time info to sub header
            MC.util.showServerClock('#ServerTimeInfo', ', {0:HH:mm:ss}');

            jQuery('[name="TimeStop"]').kendoTimePicker({
                format: 'HH:mm',

                // needed for a shift in time on DST while currently browsing
                min: new Date(2000, 0, 1, 0, 0, 0),
                max: new Date(2000, 0, 1, 23, 59, 0)
            });

            jQuery('[name="StartTime"]').kendoTimePicker({
                format: 'HH:mm',
                change: function () {
                    MC.util.task.setTimePickerPreview(this);
                }
            });
        };
        self.CreateTriggerTypeDropdown = function () {
            var triggerTypeDatasources = [];
            jQuery.each(self.TRIGGER_TYPE, function (key, value) {
                triggerTypeDatasources.push({ id: key, text: value });
            });
            $('#trigger_type').kendoDropDownList({
                dataTextField: "text",
                dataValueField: "id",
                dataSource: triggerTypeDatasources,
                change: self.TriggerTypeDropdownChanged
            });
        };
        self.TriggerTypeDropdownChanged = function (e) {
            var eventTypesDropdown = jQuery('#event_type').data('kendoDropDownList');
            var triggerType = e.sender.value();
            self.AdjustLayoutByTriggerType(triggerType, eventTypesDropdown);
        };
        self.CreateEventTypeDropdown = function () {
            var eventTypeDatasources = [];
            jQuery.each(self.EVENT_TYPE, function (key, value) {
                eventTypeDatasources.push({ id: key, text: value });
            });
            $('#event_type').kendoDropDownList({
                dataTextField: "text",
                dataValueField: "id",
                dataSource: eventTypeDatasources
            });
        };
        self.SetValueToEventTypesDropdown = function (taskData, triggerType, eventTypesDropdown, modelsDropdown) {
            if (triggerType !== self.TRIGGER_TYPE_ID.EVENT)
                return;

            var triggerData = taskData.triggers[0];
            if (triggerData) {
                // set value to event type
                eventTypesDropdown.value(triggerData.event);
                self.SetValueToEventModelsDropdown(triggerData, modelsDropdown);
            }
        };
        self.SetValueToEventModelsDropdown = function (triggerData, modelsDropdown) {
            var model = triggerData.arguments.findObject('model');
            // set value to model (always need to select type = 'event')
            if (model) {
                modelsDropdown.value(model.value);
            }
        };
        self.SetEditTask = function (taskData) {
            var dayCheckboxes = jQuery('[data-role="customcheckbox"] .input');
            var taskNameTextbox = jQuery('#TaskName');
            var runAsUserTextbox = jQuery('#RunasUser');
            var enabledCheckbox = jQuery('#IsEnabled');

            var triggerTypeDropdown = jQuery('#trigger_type').data('kendoDropDownList');
            var eventTypesDropdown = jQuery('#event_type').data('kendoDropDownList');
            var modelsDropdown = jQuery('#model').data('kendoDropDownList');
            var startTimePicker = jQuery('[name="StartTime"]').data('kendoTimePicker');
            var maximumRunTimePicker = jQuery('[name="TimeStop"]').data('kendoTimePicker');

            var triggerDaysList = MC.util.task.getTriggerDays(taskData);
            var triggerType = MC.util.task.getTriggerType(taskData);
            var startTimeValue = MC.util.task.getStartTime(taskData);

            // start data binding
            taskNameTextbox.val(taskData.name);
            runAsUserTextbox.val(taskData.run_as_user);

            if (taskData.id) {
                enabledCheckbox.prop('checked', taskData.enabled);
                maximumRunTimePicker.value(MC.util.unixtimeToTimePicker(taskData.max_run_time, true));
            }
            else {
                enabledCheckbox.prop('checked', true);
            }

            triggerTypeDropdown.value(triggerType);

            if (startTimeValue !== null) {
                startTimePicker.value(MC.util.unixtimeToTimePicker(startTimeValue, false));
                startTimePicker.trigger('change');
            }
            else {
                startTimePicker.value(null);
            }
            dayCheckboxes.each(function (index, dayCheckbox) {
                var hasSelectedDay = MC.util.task.getTriggerDayStatus(triggerDaysList, index);
                if (hasSelectedDay) {
                    $(dayCheckbox).trigger('click');
                }
                else {
                    dayCheckbox.checked = false;
                }
            });
            // end data binding

            // start manage components
            MC.util.hideErrorContainerIfOpenTimePicker(startTimePicker.element);
            self.InitialRunAsUserAutoComplete();
            self.AdjustLayoutByTriggerType(triggerType, eventTypesDropdown);
            self.SetValueToEventTypesDropdown(taskData, triggerType, eventTypesDropdown, modelsDropdown);
            // end manage components
        };
        self.AdjustLayoutByTriggerType = function (triggerType, eventTypesDropdown) {
            var scheduleLayout = jQuery('#ScheduleSection');
            var eventLayout = jQuery('#EventSection');

            if (triggerType === self.TRIGGER_TYPE_ID.EVENT) {
                scheduleLayout.hide();
                eventLayout.show();
                eventTypesDropdown.wrapper.show();
            }
            else if (triggerType === self.TRIGGER_TYPE_ID.SCHEDULE) {
                scheduleLayout.show();
                eventLayout.hide();
                eventTypesDropdown.wrapper.hide();
            }
            else if (triggerType === self.TRIGGER_TYPE_ID.EXTERNAL) {
                scheduleLayout.hide();
                eventLayout.hide();
                eventTypesDropdown.wrapper.hide();
            }
        };
        self.InitialActionsGrid = function (dataItem) {
            // grid columns
            var columns = self.GetActionsGridColumnDefinitions();

            // generate grid data source
            dataItem.actions = dataItem.actions || [];
            var dataSource = self.GetActionsGridDataSource(dataItem.actions);

            jQuery('#TaskActionsGrid').empty().kendoGrid({
                dataSource: dataSource,
                height: 300,
                columns: columns,
                scrollable: true,
                resizable: true,
                dataBound: self.TaskActionsGridDataBound
            });

            MC.util.sortableGrid('#TaskActionsGrid', function () {
                self.IsTaskActionsSorted = true;
                var taskActionsGrid = jQuery('#TaskActionsGrid').data("kendoGrid");
                jQuery.each(taskActionsGrid.items(), function (index, action) {
                    var uid = jQuery(action).data("uid");
                    var dataitem = taskActionsGrid.dataSource.getByUid(uid);
                    dataitem.set("order", index);
                });
            });
        };

        self.GetActionsGridColumnDefinitions = function () {
            var columns = [
                {
                    field: 'order',
                    title: ' ',
                    width: 50,
                    headerAttributes: { 'class': 'gridColumnToolbar' },
                    attributes: { 'class': 'gridColumnToolbar' },
                    template: '<a class="btnMove" title="Move"></a>'
                },
                { field: 'action_type_name', title: Localization.MC_TaskAction_ColumnAction, width: 80, template: self.GetActionTypeName },
                { field: 'action_detail', title: Localization.MC_TaskAction_ColumnDetail, width: 80, template: self.GetActionDetail },
                { field: 'model_name', title: Localization.MC_TaskAction_ColumnModel, width: 80, template: self.GetModelNameFromActionData },
                { field: 'angle_name', title: Localization.MC_TaskAction_ColumnAngle },
                { field: 'display_name', title: Localization.MC_TaskAction_ColumnDisplay, attributes: { 'data-display-uri': '#= display_uri #' } },
                { field: 'run_as_user', title: Localization.MC_TaskAction_ColumnRunAsUser },
                { field: 'condition_name', title: Localization.MC_TaskAction_ColumnCondition, width: 140, template: self.GetConditionName },
                { field: 'approval_state', title: Localization.MC_TaskAction_ColumnApprovalState, width: 100 },
                {
                    field: 'action',
                    title: ' ',
                    width: 80,
                    headerAttributes: { 'class': 'gridColumnToolbar' },
                    attributes: { 'class': 'gridColumnToolbar' },
                    template: self.ActionButtonTemplate
                }
            ];
            return columns;
        };

        self.ActionButtonTemplate = function (data) {
            var template = '';
            var isEditMode = false;
            if (self.TaskUri != null && self.TaskUri != '') {
                isEditMode = true;
            }
            var canScheduleTask = self.CanManageSystem || self.CanScheduleAngles && self.IsTaskOwner;
            if (canScheduleTask || (self.CanScheduleAngles && self.CurrentUser === data.run_as_user)) {
                template += "<a href=\"#AddActionPopup\" class=\"btn btnEdit\"  onclick=\"MC.AutomationTasks.Tasks.ShowEditActionPopup('" + data.uid + "', true)\" data-role=\"mcPopup\" data-width=\"700\" data-min-width=\"600\" data-height=\"575\" data-min-height=\"350\">" + Localization.Edit + "</a>";
                template += "<a href=\"#popupCopyAction\" onclick=\"MC.AutomationTasks.Tasks.CopyActionPopup('" + self.TaskUri + "', '" + data.uid + "')\" data-role=\"mcPopup\" title=\"" + Localization.MC_CopyAction + "\" data-width=\"500\" data-min-height=\"180\" data-min-width=\"475\" class=\"btn btnCopy" + (isEditMode ? "" : " alwaysHidden") + "\" >" + Localization.Copy + "</a>";
                template += "<a onclick=\"MC.AutomationTasks.Tasks.ExecuteAdhocTaskAction('" + data.uid + "')\" class=\"btn btn btnExecute" + (isEditMode ? "" : " alwaysHidden") + "\">" + Localization.MC_ExecuteNow + "</a>";
                template += "<a class=\"btn btnDelete\" data-parameters=\\'{\"uid\":\"= " + data.uid + "\"}\\' data-delete-template=\"" + Localization.MC_DeleteFieldConfirm + "\" class=\"btn btnDelete\" onclick=\"MC.form.template.markAsRemove(this)\">" + Localization.Delete + "</a>";
            }
            else {
                template += "<a href=\"#AddActionPopup\" class=\"btn btnEdit\"  onclick=\"MC.AutomationTasks.Tasks.ShowEditActionPopup('" + data.uid + "', false)\" data-role=\"mcPopup\" data-width=\"700\" data-min-width=\"600\" data-height=\"575\" data-min-height=\"350\">" + Localization.View + "</a>";
                template += "<a class=\"btn btnDelete disabled\">" + Localization.Delete + "</a>";
            }
            return template;
        };

        self.GetActionTypeName = function (data) {
            return self.ACTION_TYPE[data.action_type];
        };
        self.GetActionDetail = function (data) {
            if (data.action_type === self.ACTION_TYPE_ID.DATASTORE) {
                var datastoreId = self.GetArgumentValueByName(data.arguments, 'datastore');
                return (self.DataStoreValues.findObject('id', datastoreId) || { name: datastoreId }).name;
            }
            else if (data.action_type === self.ACTION_TYPE_ID.SCRIPT) {
                var scriptId = self.GetArgumentValueByName(data.arguments, 'script');
                return (self.Scripts.findObject('id', scriptId) || { name: scriptId }).name;
            }
            return '';
        };
        self.GetModelName = function (modelId) {
            return (self.AllModels.findObject('id', modelId) || { short_name: modelId }).short_name;
        };
        self.GetModelNameFromActionData = function (data) {
            var modelId = self.GetArgumentValueByName(data.arguments, 'model') || '';
            return self.GetModelName(modelId);
        };
        self.GetConditionName = function (data) {
            if (data.action_type === self.ACTION_TYPE_ID.DATASTORE) {
                var conditionOperator = self.GetArgumentConditionOperator(data.arguments);
                var conditionValue = self.GetArgumentConditionValue(data.arguments, conditionOperator);
                return conditionOperator + (conditionValue === null ? '' : ' ' + conditionValue);
            }
            else {
                return '';
            }
        };
        self.GetActionsGridDataSource = function (actions) {
            var data = [];

            // sort before create data
            actions.sort(function (a, b) {
                a.order = a.order || 0;
                b.order = b.order || 0;
                if (a.order < b.order)
                    return -1;
                else if (a.order > b.order)
                    return 1;
                else return 0;
            });

            var sortIndex = 0;
            jQuery.each(actions, function (index, action) {
                var angleId = self.GetArgumentValueByName(action.arguments, 'angle_id');
                var displayId = self.GetArgumentValueByName(action.arguments, 'display_id');
                var model = {
                    run_as_user: action.run_as_user,
                    action_type: action.action_type,
                    angle_name: action.AngleName || angleId,
                    display_name: action.DisplayName || displayId,
                    display_uri: '',
                    AngleUri: action.AngleUri,
                    approval_state: action.approval_state,
                    notification: action.notification,
                    arguments: action.arguments,
                    uri: action.uri,
                    order: sortIndex
                };
                if (action.Angle) {
                    var display = JSON.parse(action.Angle).display_definitions.findObject('id', displayId);
                    if (display)
                        model.display_uri = display.uri;
                }
                sortIndex++;
                data.push(model);
            });

            return {
                data: data,
                sort: { field: 'order', dir: 'asc' }
            };
        };
        self.TaskActionsGridDataBound = function () {
            MC.ui.customcheckbox();
            MC.ui.btnGroup();
            MC.ui.popup();

        };
        self.GetArgumentValueByName = function (args, name) {
            var results = jQuery.grep(args, function (arg) { return arg.name === name; });
            return results.length ? results[0].value : null;
        };
        self.GetArgumentConditionOperator = function (args) {
            var min = self.GetArgumentValueByName(args, nameConditionMinimumRows);
            var max = self.GetArgumentValueByName(args, nameConditionMaximumRows);

            if (min === null && max === null)
                return self.ACTION_CONDITION_OPERATOR.ALWAYS;

            if (min === null)
                return self.ACTION_CONDITION_OPERATOR.LESS_THAN;

            if (max === null)
                return self.ACTION_CONDITION_OPERATOR.GREATER_THAN;

            return self.ACTION_CONDITION_OPERATOR.EXACTLY;
        };
        self.GetArgumentConditionValue = function (args, operator) {
            var min = self.GetArgumentValueByName(args, nameConditionMinimumRows);
            var max = self.GetArgumentValueByName(args, nameConditionMaximumRows);

            if (operator === self.ACTION_CONDITION_OPERATOR.ALWAYS)
                return null;

            if (operator === self.ACTION_CONDITION_OPERATOR.LESS_THAN)
                return parseFloat(max);

            if (operator === self.ACTION_CONDITION_OPERATOR.GREATER_THAN)
                return parseFloat(min);

            return min;
        };
        self.SetDatastoreSettings = function (dataItem, models) {
            if (!dataItem.Uri) {
                $('#DatastoreSettings').empty().hide();
                return;
            }

            $('#AddActionPopup .popupContent').scrollTop(0);
            MC.ui.popup('requestStart');
            $.when(self.GetDataStoreTemplate[dataItem.Uri] || MC.ajax.request({
                url: self.GetDataStoreTemplateUri,
                parameters: { datstoreUri: dataItem.Uri }
            }))
                .done(function (response) {
                    self.GetDataStoreTemplate[dataItem.Uri] = response;

                    var containerSettings = $('#DatastoreSettings').show();
                    containerSettings.html(response + ($.trim(response) ? '<hr/>' : ''));

                    MC.ui.popup();
                    MC.ui.percentage();
                    MC.ui.modeltimestamp();
                    MC.ui.autosyncinput();
                    self.CurrentDatastorePlugin = self.DataStoreValues.findObject("Uri", dataItem.Uri).datastore_plugin;

                    var ddlExcelTemplate = $('#template_file').data('kendoDropDownList');
                    if (ddlExcelTemplate) {
                        ddlExcelTemplate.bind('change', self.SetActionButtons);
                        self.StandardExcelTemplate = ddlExcelTemplate.value();
                        self.AddDisplayExcelTemplateToddlExcelTemplate(ddlExcelTemplate);
                    }

                    $.each(models || [], function (index, arg) {
                        var input = containerSettings.find('[id="' + arg.name + '"]');
                        self.SetDatastoreSettingValue(input, arg);
                    });
                })
                .always(function () {
                    setTimeout(function () {
                        self.HideOrShowFormat();
                        MC.ui.popup('requestEnd');
                    }, 100);
                });
        };
        self.SetDatastoreSettingValue = function (input, arg) {
            var settingType = input.data('setting-type');
            if (MC.ui.isKendoTypeSetting(settingType)) {
                var inputUI = input.data('handler');
                if (arg.name === 'template_file') {
                    self.SetTemplateFileValue(inputUI, arg);
                }
                else {
                    inputUI.value(arg.value);
                    if (arg.name === 'max_rows_to_export')
                        self.SetDatastoreSettingMaxRowsToExportValue(inputUI, arg.value);
                }
            }
            else if (settingType === 'boolean') {
                input.prop('checked', !!arg.value);
            }
            else if (settingType === 'date' && $.isNumeric(arg.value)) {
                var currentDate = new Date(arg.value * 1000);
                var datepicker = input.data('handler');
                datepicker.value(currentDate);
            }
            else if (settingType === 'text') {
                input.val(arg.value);
                if (arg.name === "action_subfolder") {
                    self.UpdateSubFolderField(arg);
                }
            }
        };
        self.SetDatastoreSettingMaxRowsToExportValue = function (integerInput, value) {
            if (value !== null) {
                var model = self.AllModels.findObject('id', jQuery('#model_id').val());
                var modelPrivilege = model !== null ? JSON.parse(self.ModelPrivileges).findObject('model', model.Uri) : null;
                if (modelPrivilege) {
                    var inputValue = Math.min(modelPrivilege.Privileges.max_export_rows || Number.MAX_VALUE, value);
                    integerInput.value(inputValue);
                    integerInput.max(modelPrivilege.Privileges.max_export_rows);
                }
            }
        };
        self.GetDataStoreSettings = function () {
            var datastoreData = [];

            jQuery('.connection_settings input[type!="hidden"]').each(function (index, input) {
                var setting = self.GetDataStoreSettingInfo(jQuery(input));
                if (setting.type && setting.id && setting.id === "action_subfolder" && setting.value && !datastoreData.hasObject('id', setting.id)) {
                    datastoreData.push({
                        "name": setting.id,
                        "value": setting.value.startsWith("\\") ? setting.value : "\\" + setting.value
                    });
                }
            });

            jQuery('.dataSettings input[type!="hidden"]').each(function (index, input) {
                var setting = self.GetDataStoreSettingInfo(jQuery(input));
                if (setting.type === 'enum' && setting.id === 'template_file' &&
                    self.IsDefaultDisplayExcelTemplate(setting.value)) {
                    setting.value = '';
                }
                if (setting.type && setting.id && !datastoreData.hasObject('id', setting.id)) {
                    datastoreData.push({
                        "name": setting.id,
                        "value": setting.value
                    });
                }
            });

            var angleParameters = self.GetDataStoreExecutionParameters();
            if (angleParameters.length) {
                datastoreData.push({
                    "name": 'execution_parameters',
                    "value": angleParameters
                });
            }
            return datastoreData;
        };
        self.GetDataStoreSettingInfo = function (input) {
            var setting = { 'id': input.attr('id'), 'value': null, 'type': input.data('setting-type') };
            if (MC.ui.isKendoTypeSetting(setting.type)) {
                setting.value = input.data('handler').value();
            }
            else if (setting.type === 'boolean') {
                setting.value = input.is(':checked');
            }
            else if (setting.type === 'date') {
                var currentTime = new Date(input.val());
                var ymd = kendo.toString(currentTime, 'yyyyMMdd');
                setting.value = parseInt(ymd);
            }
            else if (setting.type === 'text') {
                setting.value = input.val();
            }
            return setting;
        };
        self.GetDataStoreExecutionParameters = function () {
            var angleParameters = [];
            var isNullOrUndefined = function (val) {
                return val === null || typeof val === 'undefined';
            };
            var getInputValue = function (element) {
                var value;
                var handler = element.data('handler');
                if (handler) {
                    value = handler.dataItem && handler.dataItem() ? handler.dataItem().id : handler.value();
                }
                else if (element.val()) {
                    value = element.val();
                }
                return !element.hasClass('enumerated') && isNullOrUndefined(value) ? undefined : value;
            };
            $('#AngleParametersGrid  .k-grid-content tr').each(function (index, row) {
                row = $(row);

                var parameterArguments = [];
                var arg1 = row.find('[name^="argument1"]');
                if (arg1.data('type') === 'single') {
                    var arg1Value = getInputValue(arg1);
                    if (typeof arg1Value !== 'undefined')
                        parameterArguments[0] = arg1Value;
                }
                else if (arg1.data('type') === 'double') {
                    var arg1DoubleValue = getInputValue(arg1);

                    var arg2Double = row.find('[name^="argument2"]');
                    var arg2DoubleValue = getInputValue(arg2Double);

                    if (typeof arg1DoubleValue !== 'undefined' && typeof arg2DoubleValue !== 'undefined')
                        parameterArguments = [arg1DoubleValue, arg2DoubleValue];
                }
                else {
                    if (arg1.data('role') === 'multiselect') {
                        parameterArguments = arg1.data('kendoMultiSelect').value();
                    }
                    else if (arg1.val()) {
                        parameterArguments = arg1.val().split(',');

                        if (arg1.filter('.int, .double, .percentage, .currency, .period').length) {
                            jQuery.each(parameterArguments, function (index, value) {
                                parameterArguments[index] = parseFloat(value);
                            });
                        }
                    }
                    else {
                        parameterArguments = [];
                    }
                }
                angleParameters.push({
                    "execution_parameter_id": row.find('[name="parameter_id"]').val(),
                    "arguments": parameterArguments
                });
            });
            return angleParameters;
        };
        self.SetEmailNotification = function (notification) {
            if (notification) {
                $('#email_enable').prop('checked', true);
                $('#email_attach_result').prop('checked', notification.attach_result);
                self.SetEmailSubject(notification.subject);
                self.SetRecipientsData(notification.recipients);

                var editor = $('#email_body').data('kendoEditor');
                if (editor)
                    editor.value(notification.body);

                self.SetEnableEmailNotification(true);
            }
            else {
                $('#email_enable').prop('checked', false);
                $('#email_attach_result').prop('checked', false);
                self.SetEmailSubject();
                self.SetRecipientsData([]);
                self.SetEnableEmailNotification(false);
            }

            self.SetEmailRecipientsColumns();
        };
        self.SetEnableEmailNotification = function (isChecked) {
            var emailUI = $('#CheckRecipients, #email_subject, #email_body, .contentSectionInfoEmail .k-editor').removeClass('error');
            var emailUI2 = $('input[name="email_address"], input[name="is_result"], input[name="is_success"], input[name="is_failed"]').removeClass('error');
            if (isChecked) {
                $('.emailSettingSection').show();
                var scrollTop = $('#AddActionPopup .popupContent').scrollTop();
                $('#AddActionPopup .popupContent').scrollTop(scrollTop + 500);
                $('.contentSectionInfoEmail .k-editor').removeClass('disabled');
                $('.btnAddRecipient').removeClass('disabled');
                $('#RecipientsGrid .btnDelete').removeClass('disabled');
                emailUI.addClass('required').prop('disabled', false);
                $('#email_attach_result').prop('disabled', false);
                emailUI2.prop('disabled', false);
            }
            else {
                $('.emailSettingSection').hide();
                $('.contentSectionInfoEmail .k-editor').addClass('disabled');
                $('.btnAddRecipient').addClass('disabled');
                $('#RecipientsGrid .btnDelete').addClass('disabled');
                emailUI.removeClass('required').prop('disabled', true);
                $('#email_attach_result').prop('disabled', true);
                emailUI2.prop('disabled', true);
            }

            MC.form.validator.hideErrorMessage();
        };
        self.InitialManageActionAngleDisplaySection = function () {
            $('#angle_id')
                .on('keypress', function (e) {
                    if (e.keyCode === 32) {
                        e.preventDefault();
                    }

                    if (e.keyCode === 13) {
                        self.FindAngle();
                    }
                })
                .on('paste', function () {
                    setTimeout(function () {
                        self.FindAngle();
                    }, 1);
                });

            $('#display_id').kendoDropDownList({
                dataSource: [],
                dataTextField: "name",
                dataValueField: "id",
                valueTemplate: '<span class="iconDisplay #: data.display_type #">#: data.name #</span>',
                template: '<span class="iconDisplay #: data.display_type.toLowerCase() #">#: data.name #</span>',
                open: function () {
                    MC.form.validator.hideErrorMessage();
                },
                change: function (e) {
                    if (!e.sender.dataItem())
                        return;

                    var currentAngleParameters = [];
                    var angleQueryStepBlock = self.CurrentAngle.query_definition.findObject('queryblock_type', 'query_steps');
                    if (angleQueryStepBlock) {
                        var currentParameter = self.GetDataStoreSettings().findObject('name', 'execution_parameters');
                        if (currentParameter) {
                            $.each(currentParameter.value, function (index, parameter) {
                                if (angleQueryStepBlock.query_steps.hasObject('execution_parameter_id', parameter.execution_parameter_id)) {
                                    currentAngleParameters.push(parameter);
                                }
                            });
                        }
                    }
                    self.SetAngleParametersData(self.CurrentAngle, currentAngleParameters.length ? [{ name: 'execution_parameters', value: currentAngleParameters }] : []);
                    self.HideOrShowFormat();

                    var displayUri = e.sender.dataItem().uri;
                    self.SetLinkToDisplay(displayUri, _self.modelId);
                    self.SetDatastoreOnDisplayChange(e.sender.dataItem());
                }
            });

            self.SetLinkToDisplay(null, null);
            self.SetDatastoreOnDisplayChange(null);
        };
        self.InitialManageActionEmailSection = function () {
            self.InitialRecipientsGrid();

            var defaultSubjects = {};
            $.each(self.DEFAULT_EMAIL_SUBJECT, function (key, subject) {
                defaultSubjects[key] = subject;
            });
            $('#email_subject')
                .data(defaultSubjects)
                .on('change', function () {
                    self.SetEmailSubject(this.value);
                });

            $('#email_body').kendoEditor({
                execute: function (e) {
                    if (e.name === 'createlink') {
                        setTimeout(function () {
                            var label = jQuery('#k-editor-link-target').next('label').removeAttr('class');
                            var labelText = label.text();
                            label.empty();
                            label.append(jQuery('#k-editor-link-target').attr('checked', 'checked'));
                            label.append('<span class="label">' + labelText + '</span>');
                        }, 1);
                    }

                    if (e.name === 'createlink' || e.name === 'insertimage') {
                        setTimeout(function () {
                            jQuery('.k-dialog-insert').attr('class', 'btn btnPrimary');
                            jQuery('.k-dialog-close').attr('class', 'btn');
                        }, 1);
                    }
                },
                keyup: function (e) {
                    if (e.sender.element.hasClass('error') || e.sender.element.hasClass('valid')) {
                        if (!e.sender.value()) {
                            e.sender.wrapper.addClass('error');
                        }
                        else {
                            e.sender.wrapper.removeClass('error');
                            MC.form.validator.hideErrorMessage();
                        }
                    }
                },
                select: function (e) {
                    if (e.sender.element.hasClass('error') || e.sender.element.hasClass('valid')) {
                        e.sender.element.valid();
                    }
                    else {
                        MC.form.validator.hideErrorMessage();
                    }
                },
                tools: [
                    "formatting",
                    "bold",
                    "italic",
                    "underline",
                    "justifyLeft",
                    "justifyCenter",
                    "justifyRight",
                    "insertUnorderedList",
                    "insertOrderedList",
                    "outdent",
                    "indent",
                    "createLink",
                    "unlink",
                    "insertImage",
                    "tableWizard",
                    "tableWizard",
                    "createTable",
                    "addRowAbove",
                    "addRowBelow",
                    "addColumnLeft",
                    "addColumnRight",
                    "deleteRow",
                    "deleteColumn"
                ]
            });
        };
        self.InitialRecipientsGrid = function () {

            // grid columns
            var columns = [

                {
                    field: 'email_address',
                    title: 'Recipient',
                    template: '<input name="email_address" value="#=email_address#" type="text">'
                },
                {
                    field: 'result',
                    title: 'Result',
                    width: 65,
                    headerAttributes: { 'class': 'columnBoolean' },
                    attributes: { 'class': 'columnBoolean' },
                    template: '<label data-tooltip-title="' + Localization.MC_TooTipRecipientsResult + '"><input name="is_result" class="check_task_email_result" value="#=result#" type="checkbox" #= result ? checked="checked" : "" #><span class="label"></span></label>'
                },
                {
                    field: 'success',
                    title: 'Success',
                    width: 65,
                    attributes: { 'class': 'columnBoolean' },
                    template: '<label data-tooltip-title="' + Localization.MC_TooTipRecipientsSuccess + '"><input name="is_success" class="check_task_email_result" value="#=success#" type="checkbox" #= success ? checked="checked" : "" #><span class="label"></span></label>'
                },
                {
                    field: 'failed',
                    title: 'Failure',
                    width: 65,
                    headerAttributes: { 'class': 'columnBoolean' },
                    attributes: { 'class': 'columnBoolean' },
                    template: '<label data-tooltip-title="' + Localization.MC_TooTipRecipientsFailure + '"><input name="is_failed" class="check_task_email_result" value="#=failed#" type="checkbox" #= failed ? checked="checked" : "" #><span class="label"></span></label>'
                },
                {
                    field: 'action',
                    title: ' ',
                    width: 60,
                    headerAttributes: { 'class': 'gridColumnToolbar' },
                    attributes: { 'class': 'gridColumnToolbar' },
                    template: '<a data-delete-template="' + Localization.MC_DeleteRecipient + '" data-delete-field-index="0" onclick="MC.form.template.markAsRemove(this)" class="btn btnDelete">Delete</a>'
                }
            ];

            jQuery('#RecipientsGrid').empty().kendoGrid({
                dataSource: {
                    data: [],
                    sort: { field: 'order', dir: 'asc' }
                },
                height: 150,
                columns: columns,
                scrollable: true,
                resizable: true
            });

            MC.form.template.init();
        };
        self.SetRecipientsData = function (recipients) {
            var grid = jQuery('#RecipientsGrid').data('kendoGrid');
            if (grid) {
                // generate grid data source
                var data = [];
                recipients.sort(function (a, b) {
                    a.order = a.order || 0;
                    b.order = b.order || 0;
                    if (a.order < b.order) return -1;
                    else if (a.order > b.order) return 1;
                    else return 0;
                });

                jQuery.each(recipients, function (index, recipient) {

                    var model = {
                        email_address: recipient.email_address,
                        result: recipient.result,
                        success: recipient.success,
                        failed: recipient.failed
                    };

                    data.push(model);
                });

                grid.dataSource.data(data);
            }
        };
        self.SetEmailRecipientsColumns = function () {
            var grid = $('#RecipientsGrid').data('kendoGrid');
            if (self.IsDatastoreAction()) {
                grid.wrapper.addClass('showResult');
                grid.showColumn('result');
            }
            else {
                grid.wrapper.addClass('hideResult');
                grid.hideColumn('result');
            }
        };
        self.SetEmailSubject = function (subject) {
            var actionType = $('#action_type').data('kendoDropDownList').value();
            var defaultSubject = $('#email_subject').data(actionType);
            var emailSubject = typeof subject === 'undefined' ? defaultSubject : subject;
            $('#email_subject').data(actionType, emailSubject).val(emailSubject);
        };
        self.InitialManageActionPopup = function (title) {
            MC.ui.popup('setScrollable', {
                element: '#AddActionPopup'
            });
            var win = $('#AddActionPopup').data('kendoWindow');
            if (win) {
                if (!win.__bind_close_event) {
                    win.__bind_close_event = true;
                    win.bind('close', function (e) {
                        // clear all ui
                        MC.ajax.clearAllKendoUI($('#AddActionPopup .popupContent'));

                        $('#AddActionPopup .popupToolbar').find('.btnCheckAction, .btnAddAction').addClass('disabled');
                        e.sender.element.find('.popupContent').empty();
                        MC.form.validator.hideErrorMessage();
                    });
                }

                // set title
                setTimeout(function () {
                    win.setOptions({ title: title });
                    MC.ui.popup('setTooltip', {
                        element: '#AddActionPopup'
                    });
                    MC.form.validator.init('#FormEditAction');
                }, 100);
            }

            var template = $('#TemplateManageAction').val();
            $('#AddActionPopup .popupContent').html(template);
            MC.form.template.autoTemplate();
            self.InitialRunAsUserForActionAutoComplete();
            self.CreateActionTypeDropdown();
            self.CreateScriptDropdown();
            self.CreateDatastoreDropdown();
            self.InitialManageActionAngleDisplaySection();
            self.CreateApprovalStateDropdown();
            self.CreateConditionDropdown();
            self.InitialAngleParametersGrid();
            self.InitialManageActionEmailSection();

            MC.ui.popup();
        };
        self.ShowAddActionPopup = function () {
            _self.canSetAction = true;
            _self.uid = null;
            _self.modelId = null;

            setTimeout(function () {
                self.InitialManageActionPopup(Localization.MC_TaskAction_TitleAddAction);

                $('#action_type').data('kendoDropDownList').trigger('change');
                $('#datastore').data('kendoDropDownList').trigger('change');

                var runAsUserTextbox = jQuery('#action_run_as_user');
                var runAsUser = null;
                if (!self.CanManageTask(self.CanManageSystem, self.CanScheduleAngles, self.CurrentUser, self.TaskData.run_as_user)) {
                    runAsUser = self.CurrentUser;
                }
                runAsUserTextbox.val(runAsUser);
                self.CurrentAngle = {};
                self.DisplayExcelTemplate = '';
                self.StandardExcelTemplate = '';
                self.SetEmailNotification(null);
                self.SetActionButtons();

                if (self.AngleUri) {
                    $('#angle_id').val(self.AngleUri);
                    $('.btn.btnFindAngle').trigger('click');
                    self.AngleUri = null;
                }
                $('#AddActionPopup .popupContent').scrollTop(0);
            }, 1);
        };
        self.GetAngleByUri = function (uri, canSeeScheduledtasks) {
            if (!uri) {
                self.CurrentAngle = null;
                return $.when(null);
            }

            disableLoading();
            $('#AddActionPopup').busyIndicator(true);

            return $.when(
                MC.ajax.request({
                    url: self.FindAngleUri,
                    parameters: { "angleUri": uri, "canSeeScheduledtasks": canSeeScheduledtasks },
                    type: 'GET'
                }))
                .done(function (data) {
                    self.CurrentAngle = data;
                })
                .always(function () {
                    $('#AddActionPopup').busyIndicator(false);
                });
        };
        self.ShowEditActionPopup = function (uid, canEdit) {
            _self.canSetAction = canEdit;
            _self.uid = uid;
            _self.modelId = null;

            setTimeout(function () {
                // hide action button in the action grid
                $(document).trigger('click');

                self.InitialManageActionPopup(Localization.MC_TaskAction_TitleEditAction);
                var grid = $('#TaskActionsGrid').data('kendoGrid');
                var dataItem = grid.dataSource.getByUid(_self.uid);

                // action_type
                var actionTypeDroppdown = $('#action_type').data('kendoDropDownList');
                actionTypeDroppdown.value(dataItem.action_type);
                actionTypeDroppdown.trigger('change');

                //action_run_as_user
                var runAsUserTextbox = jQuery('#action_run_as_user');
                runAsUserTextbox.val(dataItem.run_as_user);

                // approval
                jQuery('#approvalddl').data('kendoDropDownList').value(dataItem.approval_state);

                if (dataItem.action_type === self.ACTION_TYPE_ID.DATASTORE) {
                    self.GetAngleByUri(dataItem.AngleUri, true).done(function () {
                        self.SetEditDatastoreActionType(dataItem);
                    });
                }
                else if (dataItem.action_type === self.ACTION_TYPE_ID.SCRIPT) {
                    self.SetEditScriptActionType(dataItem);
                }

                // abort_task_when_error
                var abortTaskWhenError = self.GetArgumentValueByName(dataItem.arguments, 'abort_task_when_error');
                jQuery('#abort_task_when_error').prop('checked', abortTaskWhenError);

                // notification
                self.SetEmailNotification(dataItem.notification);

                // set buttons
                self.SetActionButtons();
                $('#AddActionPopup .popupContent').scrollTop(0);
            }, 1);
        };
        self.CreateActionTypeDropdown = function () {
            var template = '<span class="actionTypeIcon icon-#= id #"></span>#: text #';
            var actionTypeDatasources = [];
            jQuery.each(self.ACTION_TYPE, function (key, value) {
                actionTypeDatasources.push({ id: key, text: value });
            });
            $('#action_type').kendoDropDownList({
                dataTextField: "text",
                dataValueField: "id",
                valueTemplate: template,
                template: template,
                dataSource: actionTypeDatasources,
                change: self.ActionTypeDropdownChanged
            });
        };
        self.ActionTypeDropdownChanged = function (e) {
            var container = $('#FormEditAction');
            var actionType = e.sender.value();
            if (actionType === self.ACTION_TYPE_ID.DATASTORE) {
                container.find('.scriptActionType').hide();
                container.find('.datastoreActionType').show();
                $('#EmailResultSettings').show();

                // attach result depends on some of datastores
                var ddlDatastore = jQuery('#datastore').data('kendoDropDownList');
                self.HideOrShowAttachResult(ddlDatastore.dataItem());
            }
            else if (actionType === self.ACTION_TYPE_ID.SCRIPT) {
                container.find('.datastoreActionType').hide();
                container.find('.scriptActionType').show();
                $('#EmailResultSettings').hide();
                self.HideOrShowAttachResult();
            }
            self.SetEmailSubject();
            self.SetEmailRecipientsColumns();

            // set buttons
            self.SetActionButtons();
        };
        self.CreateScriptDropdown = function () {
            var template = '#: name + (id ? " (." + filetype + ")" : "") #';
            $('#script').kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                valueTemplate: template,
                template: template,
                dataSource: self.Scripts,
                open: self.ScriptDropdownOpen
            });
        };
        self.ScriptDropdownOpen = function () {
            MC.form.validator.hideErrorMessage();
        };
        self.CreateDatastoreDropdown = function () {
            $('#datastore').kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: self.DataStoreValues,
                open: self.DatastoreDropdownOpen,
                change: self.DatastoreDropdownChanged,
                cascade: self.DatastoreDropdownCascade
            });
        };
        self.DatastoreDropdownOpen = function () {
            MC.form.validator.hideErrorMessage();
        };
        self.DatastoreDropdownChanged = function (e) {
            self.SetDatastoreSettings(e.sender.dataItem(), null);
            self.HideOrShowAttachResult(e.sender.dataItem());
            self.HideOrShowFormat();
        };
        self.DatastoreDropdownCascade = function (e) {
            self.SetDatastoreFieldsValidation(e.sender.dataItem());
        };
        self.CreateApprovalStateDropdown = function () {
            var approvalDatasources = [];
            jQuery.each(self.APPROVAL_STATE, function (key, value) {
                approvalDatasources.push({ id: key, text: value });
            });
            $('#approvalddl').kendoDropDownList({
                dataTextField: "text",
                dataValueField: "id",
                dataSource: approvalDatasources
            });
            jQuery('#approvalddl')
                .data('kendoDropDownList')
                .value(self.DefaultApprovalState);
        };
        self.CreateConditionDropdown = function () {
            var conditionDatasources = [];
            jQuery.each(self.ACTION_CONDITION_OPERATOR, function (key, value) {
                conditionDatasources.push({ id: value });
            });
            $('#condition_operator').kendoDropDownList({
                dataTextField: "id",
                dataValueField: "id",
                dataSource: conditionDatasources,
                change: self.ConditionDropdownChanged
            });
        };
        self.ConditionDropdownChanged = function (e) {
            if (e.sender.value() === self.ACTION_CONDITION_OPERATOR.ALWAYS) {
                $('#condition_value').removeClass('error required').prop('disabled', true);
                $('#condition_value').val('');
            }
            else {
                $('#condition_value').removeClass('error').prop('disabled', false);
                $('#condition_value').addClass('required');
            }
        };
        self.SetEditDatastoreActionType = function (dataItem) {
            // model_id
            var modelId = self.GetArgumentValueByName(dataItem.arguments, 'model');
            _self.modelId = modelId;
            jQuery('#model_id').val(_self.modelId);
            jQuery('#model_name').text(self.GetModelNameFromActionData(dataItem));

            // angle_id + display_id
            var setDisplayInfo = function (dataSource, display, displayId) {

                var ddlDisplays = $('#display_id').data('kendoDropDownList');

                if (display && dataSource.length) {
                    ddlDisplays.setDataSource(dataSource);

                    // check if current user can manage private items or can set action then enable otherwise disable

                    var model = self.AllModels.findObject('id', _self.modelId);
                    if (model) {
                        var modelPrivilege = JSON.parse(self.ModelPrivileges).findObject('model', model.Uri);
                        if (modelPrivilege && modelPrivilege.Privileges.manage_private_items || self.CanSetAction()) {
                            jQuery('#angle_id').val(display.uri);
                            ddlDisplays.enable(true);
                            // set link
                            self.SetLinkToDisplay(display.uri, _self.modelId);
                            self.SetDatastoreOnDisplayChange(display);
                        } else {
                            ddlDisplays.enable(false);
                            // set link
                            self.SetLinkToDisplay(null, null);
                            self.SetDatastoreOnDisplayChange(null);
                        }
                    }
                }
                ddlDisplays.value(displayId);
            };
            var angleId = self.GetArgumentValueByName(dataItem.arguments, 'angle_id');
            var displayId = self.GetArgumentValueByName(dataItem.arguments, 'display_id');
            var angleName = dataItem.angle_name || angleId;

            if (self.CurrentAngle) {
                // set angle name
                jQuery('#angle_name').text(angleName);

                var display = self.CurrentAngle.display_definitions.findObject('id', displayId);
                self.CurrentAngle.display_definitions.sortObject('name', -1, false);

                // set info + link
                setDisplayInfo(self.CurrentAngle.display_definitions, display, displayId);

                // parameterized
                self.SetAngleParametersData(self.CurrentAngle, JSON.parse(JSON.stringify(dataItem.arguments)));
            }

            // condition operator
            var conditionOperator = self.GetArgumentConditionOperator(dataItem.arguments);
            var conditionOperatorSection = $('#condition_operator').data('kendoDropDownList');
            conditionOperatorSection.value(conditionOperator);
            conditionOperatorSection.trigger('change');

            // condition value
            var conditionValue = self.GetArgumentConditionValue(dataItem.arguments, conditionOperator);
            $('#condition_value').val(conditionValue);

            // datastore
            var datastoreId = self.GetArgumentValueByName(dataItem.arguments, 'datastore');
            var ddlDatastore = jQuery('#datastore').data('kendoDropDownList');
            ddlDatastore.value(datastoreId);
            self.SetDatastoreSettings(ddlDatastore.dataItem(), dataItem.arguments);
            self.HideOrShowAttachResult(ddlDatastore.dataItem());
            self.HideOrShowFormat();
        };
        self.SetEditScriptActionType = function (dataItem) {
            // script
            var scriptId = self.GetArgumentValueByName(dataItem.arguments, 'script');
            jQuery('#script').data('kendoDropDownList').value(scriptId);

            // parameters
            var parameters = self.GetArgumentValueByName(dataItem.arguments, 'parameters');
            jQuery('#parameters').val(parameters);

            // run_as_user
            var runAsUser = self.GetArgumentValueByName(dataItem.arguments, 'run_as_user');
            jQuery('#run_as_user').val(runAsUser);

            // password
            // password always leave as empty
        };
        self.IsDatastoreAction = function () {
            var actionType = $('#action_type').data('kendoDropDownList').value();
            return actionType === self.ACTION_TYPE_ID.DATASTORE;
        };
        self.CanCheckAction = function () {
            return self.TaskUri && self.CanSetAction();
        };
        self.VisibleCheckAction = function () {
            return self.IsDatastoreAction();
        };
        self.CanSetAction = function () {
            var ddlDisplay = $('#display_id').data('kendoDropDownList');
            var ddlExcelTemplate = $('#template_file').data('kendoDropDownList');
            var canSelectDisplay = false;
            var isValidExcelTemplate = true;
            if (ddlDisplay) {
                canSelectDisplay = !ddlDisplay.wrapper.find('.k-state-disabled').length && ddlDisplay.dataSource.data().length;
            }
            if (ddlExcelTemplate && self.IsDefaultDisplayExcelTemplate(ddlExcelTemplate.value())) {
                var template = ddlExcelTemplate.options.dataSource.findObject('File', self.DisplayExcelTemplate);
                if (!template) {
                    isValidExcelTemplate = false;
                }
            }
            return _self.canSetAction && canSelectDisplay && isValidExcelTemplate;
        };
        self.SetActionButtons = function () {
            if (self.CanCheckAction()) {
                $('#AddActionPopup .popupToolbar a.btnCheckAction').removeClass('disabled').attr("onclick", 'MC.AutomationTasks.Tasks.CheckAction()');
            }
            else {
                $('#AddActionPopup .popupToolbar a.btnCheckAction').addClass('no disabled').removeAttr("onclick");
            }

            if (self.VisibleCheckAction()) {
                $('#AddActionPopup .popupToolbar a.btnCheckAction').removeClass('alwaysHidden');
            }
            else {
                $('#AddActionPopup .popupToolbar a.btnCheckAction').addClass('alwaysHidden');
            }

            if (self.CanSetAction() || !self.IsDatastoreAction()) {
                if (!_self.uid)
                    $('#AddActionPopup .popupToolbar a.btnAddAction').removeClass('disabled').attr("onclick", 'MC.AutomationTasks.Tasks.AddAction()');
                else
                    $('#AddActionPopup .popupToolbar a.btnAddAction').removeClass('disabled').attr("onclick", 'MC.AutomationTasks.Tasks.EditAction()');
            }
            else {
                $('#AddActionPopup .popupToolbar a.btnAddAction').addClass('no disabled').removeAttr("onclick");
            }
        };

        var fieldsData = {};
        var fieldSourcesData = {};
        var fieldDomainsData = {};
        self.BATCHPARAMETERSTYPE = {
            SELECTALL: 'selectall',
            CLEARALL: 'clearall',
            INVERT: 'invert'
        };
        self.GetArgumentValue = function (argObject) {
            var argumentValue = '';
            if (typeof argObject !== 'undefined') {
                if (argObject === null)
                    argumentValue = null;
                else if (argObject.argument_type && argObject.argument_type === "value")
                    argumentValue = typeof argObject.value === 'undefined' ? null : argObject.value;
                else
                    argumentValue = argObject;
            }
            return argumentValue;
        };
        self.GetArgumentsListValue = function (argObjects) {
            var argumentValues = [];
            $.each(argObjects, function (index, arg) {
                if (arg === null)
                    argumentValues.push(self.NULL);
                else if (typeof arg === 'object' && arg.argument_type === 'value')
                    argumentValues.push(typeof arg.value === 'undefined' ? self.NULL : arg.value);
                else if (typeof arg !== 'object')
                    argumentValues.push(arg);
            });
            return argumentValues.join(',');
        };
        self.InitialAngleParametersGrid = function () {

            if (typeof window.cleanMultipleParameterValue === 'undefined')
                window.cleanMultipleParameterValue = self.CleanMultipleParameterValue;
            if (typeof window.changeMultipleParametersCallback === 'undefined')
                window.changeMultipleParametersCallback = self.OnChangeMultipleParametersCallback;
            if (typeof window.validateMultipleParameters === 'undefined')
                window.validateMultipleParameters = self.ValidateMultipleParameters;

            // grid columns
            var columns = [
                {
                    field: 'name',
                    title: 'Field',
                    width: 130,
                    template: '<input name="parameter_id" type="hidden" value="#= execution_parameter_id #" />#= name #'
                },
                {
                    field: 'operator',
                    title: 'Operator',
                    width: 130,
                    template: function (data) {
                        var operatorText = data.operator;
                        $.each(self.OPERATOR, function (key, operator) {
                            if (operator.Value === data.operator) {
                                if (data.operator === self.OPERATOR.CONTAIN.Value) {
                                    operatorText = Localization.OperatorContainsSubstringEnum;
                                }
                                else if (data.operator === self.OPERATOR.STARTWITH.Value) {
                                    operatorText = Localization.OperatorStartsWithSubstringEnum;
                                }
                                else {
                                    operatorText = operator.Text;
                                }
                                return false;
                            }
                        });
                        return '<input name="operator" type="hidden" value="' + data.operator + '" />' + operatorText;
                    }
                },
                {
                    field: 'arguments',
                    title: 'Filters',
                    template: function (data) {
                        if ($.inArray(data.operator, self.EqualAgruments) !== -1) {
                            var arg1 = self.GetArgumentValue(data.arguments[0]);
                            return '<input data-type="single" class="' + data.fieldtype + '" name="argument1-' + data.execution_parameter_id + '" value="' + arg1 + '" type="text">';
                        }
                        else if ($.inArray(data.operator, self.BetweenAgruments) !== -1) {
                            var argBetween1 = self.GetArgumentValue(data.arguments[0]);
                            var argBetween2 = self.GetArgumentValue(data.arguments[1]);
                            return '<div class="actionExecutionBetween"><input data-type="double" class="parameterized_between ' + data.fieldtype + '" name="argument1-' + data.execution_parameter_id + '" value="' + argBetween1 + '" type="text"> and </div>'
                                + '<div class="actionExecutionBetween"><input data-type="double" class="parameterized_between ' + data.fieldtype + '" name="argument2-' + data.execution_parameter_id + '" value="' + argBetween2 + '" type="text"></div>';
                        }
                        else {
                            var inputVals = self.GetArgumentsListValue(data.arguments);
                            if (data.fieldtype === 'enumerated' && $.inArray(data.operator, self.ListAgruments) !== -1) {
                                return '<input'
                                    + ' data-type="multiple"'
                                    + ' class="enumerated"'
                                    + ' name="argument1-' + data.execution_parameter_id + '"'
                                    + ' value="' + inputVals + '"'
                                    + ' type="text"'
                                    + ' />';
                            }
                            else {
                                return '<input'
                                    + ' data-type="multiple"'
                                    + ' class="' + data.fieldtype + '"'
                                    + ' data-role="multipleinput"'
                                    + ' name="argument1-' + data.execution_parameter_id + '"'
                                    + ' value="' + inputVals + '"'
                                    + ' type="text"'
                                    + ' data-default-text="Add filter"'
                                    + ' data-autosize="false"'
                                    + ' data-width="100%"'
                                    + ' data-height="100%"'
                                    + ' data-regexp="validateMultipleParameters"'
                                    + ' data-on-change="changeMultipleParametersCallback"'
                                    + ' data-clean="cleanMultipleParameterValue"'
                                    + ' />';
                            }
                        }
                    }
                }
            ];
            jQuery('#AngleParametersGrid').empty().kendoGrid({
                dataSource: {
                    data: []
                },
                height: 250,
                columns: columns,
                scrollable: true,
                resizable: true,
                dataBound: self.AngleParametersGridDataBound
            });

            MC.form.template.init();
        };
        self.OnChangeMultipleParametersCallback = function (input, value, index) {
            input = $(input);
            var tagElement = $(input.data('options').holder + ' > .tag > span').eq(index);
            if (input.hasClass('currency')) {
                value = kendo.toString(parseFloat(value), '#.#################### ' + userCurrency);
            }
            else if (input.hasClass('percentage')) {
                value = parseFloat(value);
                var decimals = value.getSafeDecimals(-2);
                value *= 100;
                value = value.safeParse(decimals);
                value = kendo.toString(value, '#.#################### \\%');
            }
            else if (input.hasClass('period')) {
                value = kendo.toString(parseInt(value, 10), '# days');
            }
            tagElement.text(value);
        };
        self.CleanMultipleParameterValue = function (value) {
            var input = $(this);
            if (input.hasClass('percentage')) {
                value = parseFloat(value);
                var decimals = value.getSafeDecimals(2);
                value /= 100;
                value = value.safeParse(decimals);
            }
            else if (input.hasClass('double') || input.hasClass('currency')
                || input.hasClass('int') || input.hasClass('period')) {
                value = parseFloat(value);
            }

            return value;
        };
        self.ValidateMultipleParameters = function (value) {
            var input = $(this);
            if (input.hasClass('double') || input.hasClass('currency') || input.hasClass('percentage')) {
                return !isNaN(value);
            }
            else if (input.hasClass('int') || input.hasClass('period')) {
                return /^-?\d+$/g.test(value);
            }

            return true;
        };
        self.AngleParametersGridDataBound = function (e) {
            var items = e.sender.items();
            $.each(e.sender.dataItems(), function (index, dataItem) {
                var row = $(items[index]);
                var enumInput = row.find('.enumerated');
                var intInput = row.find('.int');
                var doubleInput = row.find('.double');
                var percentageInput = row.find('.percentage');
                var currencyInput = row.find('.currency');
                var periodInput = row.find('.period');

                if (intInput.length) {
                    intInput.not('[data-type="multiple"]').each(function () {
                        $(this).kendoNumericTextBox({
                            decimals: 0,
                            format: '#'
                        });
                    });
                }
                else if (doubleInput.length) {
                    doubleInput.not('[data-type="multiple"]').each(function () {
                        $(this).kendoNumericTextBox({
                            decimals: 20,
                            format: '#.####################'
                        });
                    });
                }
                else if (percentageInput.length) {
                    percentageInput.not('[data-type="multiple"]').each(function () {
                        $(this).kendoPercentageTextBox({
                            decimals: 20,
                            format: '#.#################### \\%'
                        });
                    });
                }
                else if (currencyInput.length) {
                    currencyInput.not('[data-type="multiple"]').each(function () {
                        $(this).kendoNumericTextBox({
                            decimals: 20,
                            format: '#.#################### ' + userCurrency
                        });
                    });
                }
                else if (periodInput.length) {
                    periodInput.not('[data-type="multiple"]').each(function () {
                        $(this).kendoNumericTextBox({
                            decimals: 0,
                            format: '# days'
                        });
                    });
                }
                else if (enumInput.length) {
                    // single or double
                    enumInput.not('[data-type="multiple"]').each(function () {
                        $(this).kendoDropDownList({
                            dataSource: dataItem.domains,
                            dataTextField: 'short_name',
                            dataValueField: 'id',
                            valueTemplate: '#: (short_name === long_name ? short_name : short_name + " (" + long_name + ")") #',
                            template: '#: (short_name === long_name ? short_name : short_name + " (" + long_name + ")") #'
                        });
                    });

                    // multiple
                    enumInput.filter('[data-type="multiple"]:not([data-role="multipleinput"])').each(function () {
                        var enumValues = [];
                        $.each(enumInput.val().split(','), function (index, value) {
                            enumValues.push(value === self.NULL ? null : value);
                        });
                        $(this).kendoMultiSelect({
                            dataSource: dataItem.domains,
                            placeholder: "Add filter",
                            dataTextField: "short_name",
                            dataValueField: "id",
                            headerTemplate: '<div class="dropdown-header k-widget k-header multipleSelectHeader">'
                                + '<a class="btn btnSelectAll" onclick="MC.AutomationTasks.Tasks.BatchParameters(' + index + ', MC.AutomationTasks.Tasks.BATCHPARAMETERSTYPE.SELECTALL)" title="Select all"></a>'
                                + '<a class="btn btnClearAll" onclick="MC.AutomationTasks.Tasks.BatchParameters(' + index + ', MC.AutomationTasks.Tasks.BATCHPARAMETERSTYPE.CLEARALL)" title="Deselect all"></a>'
                                + '<a class="btn btnInvert" onclick="MC.AutomationTasks.Tasks.BatchParameters(' + index + ', MC.AutomationTasks.Tasks.BATCHPARAMETERSTYPE.INVERT)" title="Invert selection"></a>'
                                + '</div>',
                            tagTemplate: '#: (short_name === long_name ? short_name : short_name + " (" + long_name + ")") #',
                            template: '#: (short_name === long_name ? short_name : short_name + " (" + long_name + ")") #',
                            value: enumValues,
                            filter: 'startswith',
                            autoClose: false
                        });
                    });
                }
            });

            MC.ui.multipleinput();
        };
        self.BatchParameters = function (rowIndex, todo) {
            var input = $('#AngleParametersGrid .k-grid-content tr').eq(rowIndex).find('[data-type="multiple"]');
            var inputData = input.data('kendoMultiSelect');

            if (!inputData)
                return;

            var selectedValues = inputData.value();
            var fnUpdateBatch = function () {
                try {
                    inputData.input.trigger('focusout');
                    inputData.dataSource.filter({});

                    var values;
                    if (todo === self.BATCHPARAMETERSTYPE.SELECTALL) {
                        values = $.map(inputData.dataSource.data(), function (data) {
                            return data[inputData.options.dataValueField];
                        });
                    }
                    else if (todo === self.BATCHPARAMETERSTYPE.CLEARALL) {
                        values = [];
                    }
                    else {
                        values = [];
                        $.each(inputData.dataSource.data(), function (index, data) {
                            if ($.inArray(data[inputData.options.dataValueField], selectedValues) === -1) {
                                values.push(data[inputData.options.dataValueField]);
                            }
                        });
                    }
                    inputData.value(values);

                    // recheck
                    setTimeout(function () {
                        try {
                            inputData.value(values);
                        }
                        catch (ex) {
                            setTimeout(fnUpdateBatch, 10);
                        }
                    }, 10);
                }
                catch (ex) {
                    setTimeout(fnUpdateBatch, 10);
                }
            };
            fnUpdateBatch();
        };
        self.SetAngleParametersData = function (angle, actionArguments) {
            var actionButtons = $('#AddActionPopup .popupToolbar').find('.btnCheckAction, .btnAddAction');
            actionButtons.addClass('disabled');

            if (!fieldsData[angle.model])
                fieldsData[angle.model] = {};

            var grid = jQuery('#AngleParametersGrid').data('kendoGrid');
            if (!grid)
                return;

            var executionFields = [];
            var executionParameterList = [];
            var executionParametersArgument = (actionArguments || []).findObject('name', 'execution_parameters');
            var existExecutionParameterList = executionParametersArgument ? executionParametersArgument.value : [];

            var display = angle.display_definitions.findObject('id', $('#display_id').val());
            var blocks = angle.query_definition.slice();
            if (display)
                $.merge(blocks, display.query_blocks);

            $.each(blocks, function (index, query) {
                if (!query.query_steps)
                    return;

                $.each(query.query_steps, function (index, step) {
                    if (!step.is_execution_parameter)
                        return;

                    if (!(step.arguments instanceof Array))
                        step.arguments = [];

                    // is value and not empty operator type
                    if ($.inArray(step.operator, self.NoAgruments) === -1
                        && (!step.arguments.length || step.arguments[0].argument_type === 'value')) {
                        var exisitngParameter = existExecutionParameterList.findObject('execution_parameter_id', step.execution_parameter_id);
                        executionParameterList.push({
                            execution_parameter_id: step.execution_parameter_id,
                            arguments: exisitngParameter ? exisitngParameter.arguments : step.arguments,
                            field: step.field,
                            name: step.field,
                            operator: step.operator,
                            fieldtype: 'text',
                            domains: []
                        });

                        if (!fieldsData[angle.model][step.field.toLowerCase()])
                            executionFields.push(step.field);
                    }
                });
            });
            executionFields = executionFields.distinct();

            if (executionParameterList.length) {
                $('#AngleParametersGrid').show();
                if (!$('#AddActionPopup > .k-loading-mask').length) {
                    $('#AngleParametersGrid').busyIndicator(true);
                }
                var fnCheckAngleParametersGrid = setInterval(function () {
                    if (!$('#AddActionPopup > .k-loading-mask').length) {
                        $('#AngleParametersGrid').busyIndicator(true);
                    }
                }, 50);
                var fieldUri = webAPIUrl + angle.model + '/fields?ids=' + executionFields.join(',');
                $.when(executionFields.length ?
                    MC.ajax.request({
                        url: self.GetFieldsUri,
                        parameters: { "fieldsUri": fieldUri },
                        type: 'GET',
                        ajaxStart: function () {
                            disableLoading();
                        }
                    }) : { fields: [] }
                )
                    .then(function (dataField) {
                        var fieldSourceUri = [];
                        var fieldDomainUri = [];

                        $.each(dataField.fields, function (index, field) {
                            fieldsData[angle.model][field.id.toLowerCase()] = field;
                        });

                        $.each(executionParameterList, function (index, executionParameter) {
                            var field = fieldsData[angle.model][executionParameter.field.toLowerCase()];
                            if (field) {
                                if (field.source && !fieldSourcesData[field.source]) {
                                    fieldSourceUri.push(field.source);
                                }
                                if (field.domain && !fieldDomainsData[field.domain]) {
                                    fieldDomainUri.push(field.domain);
                                }
                            }
                        });

                        var getFieldSource = function (uri) {
                            disableLoading();
                            return MC.ajax.request({
                                url: self.GetFieldSourceUri + '?fieldsSourceUri=' + escape(uri)
                            })
                                .done(function (data) {
                                    fieldSourcesData[data.uri] = data;
                                });
                        };

                        var getFieldDomain = function (uri) {
                            disableLoading();
                            return MC.ajax.request({
                                url: self.GetFieldDomainUri + '?fieldsDomainUri=' + escape(uri)
                            })
                                .done(function (data) {
                                    if (data.may_be_sorted) {
                                        data.elements.sortObject('short_name', -1, false);
                                    }
                                    fieldDomainsData[data.uri] = data;
                                });
                        };

                        var requests = [];
                        $.each(fieldSourceUri.distinct(), function (index, uri) {
                            requests.push(getFieldSource(uri));
                        });
                        $.each(fieldDomainUri.distinct(), function (index, uri) {
                            requests.push(getFieldDomain(uri));
                        });
                        return $.when.apply($, requests);
                    })
                    .done(function () {
                        var executionParameterData = [];
                        var allowedFieldTypes = ['enumerated', 'text', 'number', 'int', 'double', 'percentage', 'period'];
                        $.each(executionParameterList, function (index, executionParameter) {
                            var field = fieldsData[angle.model][executionParameter.field.toLowerCase()];
                            if (field && $.inArray(field.fieldtype, allowedFieldTypes) !== -1) {

                                // name
                                var sourceData = field.source ? fieldSourcesData[field.source] || null : null;
                                var fieldName = sourceData ? sourceData.short_name : '';
                                if (fieldName) fieldName += ' - ';
                                fieldName += field.short_name;
                                executionParameter.name = fieldName;

                                // domains
                                if (fieldDomainsData[field.domain]) {
                                    executionParameter.domains = fieldDomainsData[field.domain].elements;
                                }

                                // field type
                                executionParameter.fieldtype = field.fieldtype;

                                executionParameterData.push(executionParameter);
                            }
                        });

                        grid.dataSource.data(executionParameterData);
                    })
                    .always(function () {
                        clearInterval(fnCheckAngleParametersGrid);
                        setTimeout(function () {
                            $('#AngleParametersGrid').busyIndicator(false);
                        }, 100);

                        // set buttons
                        self.SetActionButtons();
                    });
            }
            else {
                $('#AngleParametersGrid').hide();
                grid.dataSource.data([]);

                // set buttons
                self.SetActionButtons();
            }
        };
        self.IsExportExcelAsList = function (dislayData) {
            if (dislayData.display_type === 'chart') {
                return false;
            }
            else {
                var isContainColumn = false;
                $.each(dislayData.fields, function (index, field) {
                    var details = {};
                    try {
                        details = JSON.parse(field.field_details);
                        if (details && details['pivot_area'] === 'column') {
                            isContainColumn = true;
                            return false;
                        }
                    }
                    catch (ex) {
                        // do nothing
                    }
                });
            }
            return !isContainColumn;
        };
        self.HideOrShowFormat = function () {
            // List always show header/enum format
            // Chart hide header/enum format if excel
            // Pivot hide header/enum format if excel and it export as Pivot

            var action;
            if (self.IsExcelDataStore() && self.IsChartOrPivot()) {
                var displayData = $('#display_id').data('kendoDropDownList').dataItem();
                if (self.IsExportExcelAsList(displayData)) {
                    action = 'show';
                }
                else {
                    action = 'hide';

                    // [0] -> header_format
                    // [1] -> enum_format
                    var formatDisplays = {
                        chart: ['display', 'display'],
                        pivot: ['id', 'id']
                    };
                    var formatDisplay = formatDisplays[displayData.display_type];

                    // set value to chart or pivot
                    var headerFormat = $('#header_format').data('handler');
                    if (headerFormat)
                        headerFormat.value(formatDisplay[0]);
                    var enumFormat = $('#enum_format').data('handler');
                    if (enumFormat)
                        enumFormat.value(formatDisplay[1]);
                }
            }
            else {
                action = 'show';
            }
            $('#row-header_format')[action]();
            $('#row-enum_format')[action]();

            self.HideOrShowMaxRowsToExport();
            self.HideOrShowModelTimestampIndex();
        };
        self.HideOrShowMaxRowsToExport = function () {
            var ddlDatastore = jQuery('#datastore').data('kendoDropDownList').dataItem();
            if (ddlDatastore && self.IsChartOrPivot()) {
                $('#row-max_rows_to_export').hide();

                // set value to chart or pivot
                var maxRowsExport = $('#max_rows_to_export').data('handler');
                if (maxRowsExport)
                    maxRowsExport.value(-1);
            }
            else {
                $('#row-max_rows_to_export').show();
            }
        };
        self.HideOrShowModelTimestampIndex = function () {
            var ddlDatastore = jQuery('#datastore').data('kendoDropDownList').dataItem();
            if (ddlDatastore && self.IsChartOrPivot() && self.IsExcelDataStore()) {
                $('#row-model_timestamp_index').hide();

                // set value to chart or pivot
                var maxRowsExport = $('#model_timestamp_index').data('handler');
                if (maxRowsExport)
                    maxRowsExport.value(-1);
            }
            else {
                $('#row-model_timestamp_index').show();
            }
        };
        self.IsExcelDataStore = function () {
            var ddlDatastore = jQuery('#datastore').data('kendoDropDownList').dataItem();
            return ddlDatastore && ddlDatastore.datastore_plugin === 'msexcel';
        };
        self.IsChartOrPivot = function () {
            var displayData = $('#display_id').data('kendoDropDownList').dataItem();
            return displayData && (displayData.display_type === 'chart' || displayData.display_type === 'pivot');
        };
        self.SetLinkToDisplay = function (displayUri, modelId) {
            if (displayUri && self.CanAccessWebClient(modelId)) {
                var angleUrlTemplate = self.WebClientAngleUrl + '#/?angle={0}&display={1}&editmode=true';
                var angleUri = displayUri.split('/', 5).join('/');
                $('#linkDisplay').attr('href', kendo.format(angleUrlTemplate, angleUri, displayUri)).removeClass('disabled');
            }
            else {
                $('#linkDisplay').removeAttr('href').addClass('disabled');
            }
        };
        self.SetDatastoreOnDisplayChange = function (display) {
            var ddlDatastore = $('#datastore').data('kendoDropDownList');
            var ddlExcelTemplate = $('#template_file').data('kendoDropDownList');
            ddlDatastore.enable(self.ConfigureDefaultTemplateFile(display, ddlExcelTemplate));
        };
        self.ConfigureDefaultTemplateFile = function (display, ddlExcelTemplate) {
            if (display) {
                if (display.display_details) {
                    var displayDetailObject = JSON.parse(display.display_details)
                    var excelTemplate = displayDetailObject.excel_template;
                    if (typeof excelTemplate !== 'undefined') {
                        self.DisplayExcelTemplate = excelTemplate;
                        self.RemoveDisplayExcelTemplateFromddlExcelTemplate(ddlExcelTemplate);
                        self.AddDisplayExcelTemplateToddlExcelTemplate(ddlExcelTemplate);
                    }
                    else {
                        self.RemoveDisplayExcelTemplateFromddlExcelTemplate(ddlExcelTemplate);
                        self.DisplayExcelTemplate = '';
                    }
                }
                else {
                    self.RemoveDisplayExcelTemplateFromddlExcelTemplate(ddlExcelTemplate);
                    self.DisplayExcelTemplate = '';
                }
                return true;
            }
            else {
                self.RemoveDisplayExcelTemplateFromddlExcelTemplate(ddlExcelTemplate);
                self.DisplayExcelTemplate = '';
                return false;
            }
        };
        self.AddDisplayExcelTemplateToddlExcelTemplate = function (ddlExcelTemplate) {
            if (ddlExcelTemplate && self.DisplayExcelTemplate !== '') {
                var defaultTemplate = kendo.format(Localization.Default_Placeholder, self.DisplayExcelTemplate);
                var dataSource = ddlExcelTemplate.dataSource;
                var template = dataSource.options.data.findObject('File', self.DisplayExcelTemplate);
                if (template) {
                    dataSource.add({
                        File: defaultTemplate,
                        Uri: template.Uri,
                        HasInnoweraProcess: template.HasInnoweraProcess,
                        InnoweraProcessDetails: template.InnoweraProcessDetails
                    });
                } else {
                    dataSource.add({
                        File: defaultTemplate
                    });
                }
                dataSource.sync();
                ddlExcelTemplate.value(defaultTemplate);
                ddlExcelTemplate.trigger('change');
            }
        };
        self.RemoveDisplayExcelTemplateFromddlExcelTemplate = function (ddlExcelTemplate) {
            if (ddlExcelTemplate) {
                var dataSource = ddlExcelTemplate.dataSource.data();
                var defaultOption = jQuery.grep(dataSource, function (option) {
                    return option.File.indexOf(Localization.Default_Placeholder.split(' ')[0]) === 0;
                });
                if (defaultOption.length !== 0) {
                    dataSource.remove(defaultOption[0]);
                }
                ddlExcelTemplate.value(self.StandardExcelTemplate);
                ddlExcelTemplate.trigger('change');
            }
        };
        self.IsDefaultDisplayExcelTemplate = function (displayExcelTemplate) {
            return Localization.Default_Placeholder.split(' ')[0] === displayExcelTemplate.split(' ')[0];
        };
        self.SetTemplateFileValue = function (inputUI, arg) {
            if (arg.value) {
                inputUI.value(arg.value);
                inputUI.trigger('change');
            }
        };
        self.CanAccessWebClient = function (modelId) {
            var model = self.AllModels.findObject('id', modelId);
            if (model) {
                var modelPrivilege = JSON.parse(self.ModelPrivileges).findObject('model', model.Uri);
                return modelPrivilege && modelPrivilege.Privileges.access_data_via_webclient;
            }
            return false;
        };
        self.BeforeFindAngle = function () {
            _self.modelId = null;
            jQuery('#model_id').val('');
            jQuery('#model_name').text('');
            jQuery('#hdnAngleId').val('');
            jQuery('#angle_name').attr('title', '');
            self.SetLinkToDisplay(null, null);
            self.SetDatastoreOnDisplayChange(null);
        };
        self.FindAngle = function () {
            var btnFindAngle = $('#AddActionPopup .btnFindAngle');
            if (!jQuery('#angle_id').valid() || btnFindAngle.hasClass('disabled'))
                return;

            var matchesAngleDisplay = jQuery('#angle_id').val().match(/(\/?models\/\d+\/angles\/\d+)(\/displays\/\d+)?/ig);
            if (!matchesAngleDisplay || !matchesAngleDisplay.length)
                return;

            var angleDisplayUrl = '';
            $.each(matchesAngleDisplay, function (index, matchAngleDisplay) {
                if (matchAngleDisplay.length > angleDisplayUrl.length) angleDisplayUrl = matchAngleDisplay;
            });
            if (angleDisplayUrl.charAt(0) !== '/')
                angleDisplayUrl = '/' + angleDisplayUrl;

            var angleDisplayPaths = angleDisplayUrl.split('/');
            var angleUrl, displayUrl;
            if (angleDisplayPaths.length === 5) {
                angleUrl = angleDisplayPaths.join('/');
                displayUrl = null;
            }
            else {
                angleUrl = angleDisplayPaths.slice(0, 5).join('/');
                displayUrl = '/' + angleDisplayPaths.slice(5).join('/');
            }

            btnFindAngle.addClass('disabled');
            self.BeforeFindAngle();
            jQuery('#angle_name').addClass('textInfo').text('Finding.. "' + angleUrl + '"');

            var ddlDisplays = $('#display_id').data('kendoDropDownList');
            ddlDisplays.setDataSource([]);
            ddlDisplays.enable(true);

            var deferred = jQuery.Deferred();
            self.GetAngleByUri(angleUrl, false)
                .done(function (data) {
                    _self.modelId = data.modelId;

                    var modelName = self.GetModelName(_self.modelId);
                    jQuery('#model_id').val(_self.modelId);
                    jQuery('#model_name').text(modelName);
                    jQuery('#hdnAngleId').val(data.id);
                    jQuery('#angle_name').removeClass('textInfo').attr('title', data.name).text(data.name);

                    var ddlDisplays = $('#display_id').data('kendoDropDownList');

                    data.display_definitions.sortObject('name', -1, false);
                    ddlDisplays.setDataSource(data.display_definitions);
                    $('#display_id').val('');
                    var displayId = '';
                    if (displayUrl) {
                        var angleDisplayUrl = angleUrl + displayUrl;
                        var display = data.display_definitions.findObject('uri', angleDisplayUrl);
                        if (display) {
                            displayId = display.id;
                            self.SetLinkToDisplay(angleDisplayUrl, _self.modelId);
                            self.SetDatastoreOnDisplayChange(display);
                        }
                        else {
                            setTimeout(function () {
                                $('#display_id').valid();
                            }, 10);
                        }
                    }
                    ddlDisplays.value(displayId);
                    $('#display_id').val(displayId || '');

                    self.SetAngleParametersData(data);
                    self.HideOrShowFormat();

                    deferred.resolve();
                })
                .fail(function (xhr, status, error) {
                    jQuery('#angle_name').text('Angle "' + angleUrl + '" was not found');

                    MC.ajax.setErrorDisable(xhr, status, error, deferred);
                })
                .always(function () {
                    btnFindAngle.removeClass('disabled');
                    self.SetActionButtons();
                });

            deferred.promise();
        };
        self.GetActionRecipientsData = function () {
            var recipients = [];
            var emailAddresses = $('#RecipientsGrid .k-grid-content tr');
            $.each(emailAddresses, function (index, recipient) {
                recipient = $(recipient);
                if (!recipient.hasClass('rowMaskAsRemove')) {
                    var emailAddress = recipient.find('[name="email_address"]').val();
                    if (emailAddress && checkEmailAddress(emailAddress)) {
                        recipients.push({
                            "email_address": emailAddress,
                            "result": recipient.find('[name^="is_result"]').is(":visible") && recipient.find('[name^="is_result"]').is(":checked"),
                            "success": recipient.find('[name^="is_success"]').is(":checked"),
                            "failed": recipient.find('[name^="is_failed"]').is(":checked")
                        });
                    }
                }
            });
            return recipients;
        };
        self.GetActionData = function () {
            var actionData = {};
            actionData.run_as_user = jQuery('[name^="action_run_as_user"]').val();
            actionData.action_type = $('#action_type').data('kendoDropDownList').value();
            actionData.approval_state = jQuery('#approvalddl').data('kendoDropDownList').value();

            // general
            if (actionData.action_type === self.ACTION_TYPE_ID.DATASTORE) {
                var displayData = $('#display_id').data('kendoDropDownList').dataItem() || { name: '', uri: '' };

                actionData.Angle = JSON.stringify(self.CurrentAngle);
                actionData.AngleUri = self.CurrentAngle.uri;
                actionData.angle_name = $('#angle_name').text();
                actionData.display_name = displayData.name;
                actionData.display_uri = displayData.uri;
                actionData.arguments = self.GetDatastoreActionArgumentsFromUI();
            }
            else {
                actionData.Angle = null;
                actionData.angle_name = '';
                actionData.display_name = '';
                actionData.display_uri = '';
                actionData.arguments = self.GetScriptActionArgumentsFromUI();
            }

            // action arguments for all action type
            actionData.arguments.push(self.GetAbortTaskWhenErrorActionArgumentResult());

            // notification
            actionData.notification = self.GetEmailNotificationDataFromUI();

            return actionData;
        };
        self.GetDatastoreActionArgumentsFromUI = function () {
            var datastoreId = $('#datastore').data('kendoDropDownList').value();
            var modelId = $('#model_id').val();
            var angleId = self.CurrentAngle.id;
            var displayId = $('#display_id').data('kendoDropDownList').value();
            var conditionOperator = $('#condition_operator').data('kendoDropDownList').value();
            var conditionValue = $('#condition_value').val();
            var actionArguments = [
                {
                    "name": "datastore",
                    "value": datastoreId
                },
                {
                    "name": "model",
                    "value": modelId
                },
                {
                    "name": "angle_id",
                    "value": angleId
                },
                {
                    "name": "display_id",
                    "value": displayId
                }
            ];

            switch (conditionOperator) {
                case Localization.MC_Exactly:
                    actionArguments.push({ 'name': 'condition_minimum_rows', 'value': parseInt(conditionValue, 10) });
                    actionArguments.push({ 'name': 'condition_maximum_rows', 'value': parseInt(conditionValue, 10) });
                    break;
                case Localization.MC_LessThan:
                    actionArguments.push({ 'name': 'condition_maximum_rows', 'value': parseInt(conditionValue, 10) });
                    break;
                case Localization.MC_MoreThan:
                    actionArguments.push({ 'name': 'condition_minimum_rows', 'value': parseInt(conditionValue, 10) });
                    break;
                default:
                    break;
            }

            var datastoreSettings = self.GetDataStoreSettings();
            return actionArguments.concat(datastoreSettings);
        };
        self.GetScriptActionArgumentsFromUI = function () {
            var scriptId = $('#script').data('kendoDropDownList').value();
            var parameters = $('#parameters').val();
            var runAsUser = $('#run_as_user').val();
            var password = $('#password').val();
            var actionArguments = [
                {
                    "name": "script",
                    "value": scriptId
                },
                {
                    "name": "parameters",
                    "value": parameters
                },
                {
                    "name": "run_as_user",
                    "value": runAsUser
                },
                {
                    "name": "password",
                    "value": password
                }
            ];

            return actionArguments;
        };
        self.GetAbortTaskWhenErrorActionArgumentResult = function () {
            var abortTaskWhenError = $('#abort_task_when_error').prop('checked');
            return {
                "name": "abort_task_when_error",
                "value": abortTaskWhenError
            };
        };
        self.GetEmailNotificationDataFromUI = function () {
            var notification = null;
            if ($('#email_enable').is(':checked')) {
                var recipients = self.GetActionRecipientsData();
                var editor = $('#email_body').data('kendoEditor');

                notification = {
                    'notification_type': 'email',
                    'attach_result': $('#email_attach_result').is(':visible') && $('#email_attach_result').prop('checked'),
                    'subject': $('#email_subject').is(':visible') ? $('#email_subject').val() : '',
                    'body': editor && editor.wrapper.is(':visible') ? editor.value() : '',
                    'recipients': recipients
                };
            }
            return notification;
        };
        self.AddAction = function () {
            if (!self.IsActionValidated()) {
                return;
            }

            var kendoGrid = $('#TaskActionsGrid').data('kendoGrid');
            var datasource = kendoGrid.dataSource;
            var data = self.GetActionData();
            data.order = datasource.data().length;
            if (data.run_as_user === "") {
                data.run_as_user = null;
            }
            data.is_edited = true;
            datasource.add(data);

            var win = $('#AddActionPopup').data('kendoWindow');
            win.close();
        };
        self.EditAction = function () {
            if (!self.IsActionValidated()) {
                return;
            }

            var data = self.GetActionData();
            var grid = $('#TaskActionsGrid').data('kendoGrid');
            var dataItem = grid.dataSource.getByUid(_self.uid);
            if (data.run_as_user === "") {
                data.run_as_user = null;
            }
            dataItem.set("run_as_user", data.run_as_user);
            dataItem.set("action_type", data.action_type);
            dataItem.set("angle_name", data.angle_name);
            dataItem.set("display_name", data.display_name);
            dataItem.set("display_uri", data.display_uri);
            dataItem.set("AngleUri", data.AngleUri);
            dataItem.set("approval_state", data.approval_state);
            dataItem.set('notification', data.notification);
            dataItem.set('arguments', data.arguments);
            dataItem.set('is_edited', true);

            var win = $('#AddActionPopup').data('kendoWindow');
            win.close();
        };
        self.CheckAction = function () {
            if (!self.IsActionValidated()) {
                return;
            }

            var data = self.GetActionData();
            var action = {
                "action_type": data.action_type,
                "arguments": data.arguments
            };

            var win = MC.util.showPopupOK(Localization.MC_CheckAction, '', '', 450, 180);
            MC.ui.popup('requestStart');

            MC.ajax.request({
                url: self.CheckTaskActionUri,
                parameters: { taskUri: self.TaskUri + '/actions?mode=check', ActionData: JSON.stringify(action) },
                type: 'POST'
            })
                .done(function (e) {
                    var result = JSON.parse(e);
                    var popupMessage;
                    if (result.IsSuccessful) {
                        popupMessage = Localization.MC_TaskCheckAction_Success;
                    }
                    else {
                        popupMessage = MC_TaskCheckAction_Failure;
                        popupMessage += "<ul>";
                        $.each(result.ErrorMessages, function (key, value) {
                            popupMessage += "<li>" + value + "</li>";
                        });
                        popupMessage += "</ul>";
                    }
                    win.element.find('.popupContent').html(popupMessage);
                })
                .fail(function (xhr, status, error) {
                    var errorMessage = JSON.parse(xhr.responseText);
                    win.element.find('.popupContent').html('<pre>' + errorMessage.message + '</pre>');
                    MC.ajax.setErrorDisable(xhr, status, error);
                })
                .always(function () {
                    setTimeout(function () {
                        MC.ui.popup('requestEnd');
                    }, 100);
                });
        };
        self.IsActionValidated = function () {
            var recipients = self.GetActionRecipientsData();
            if ($('#email_enable').prop('checked') && recipients.length) {
                $('#CheckRecipients').val('yes');
            }
            else {
                $('#CheckRecipients').val('');
            }

            if (!$('#FormEditAction').valid()) {
                if ($('#email_body').hasClass('error')) {
                    $('#AddActionPopup .popupContent').scrollTop($('#FormEditAction').height());
                    $('#email_body').parents('.k-editor').addClass('error');
                }
                else {
                    $('#email_body').parents('.k-editor').removeClass('error');
                }

                var firstErrorElement = $('#FormEditAction .error:not(table):visible:first');
                firstErrorElement.focus();
                MC.form.validator.hideErrorMessage();
                setTimeout(function () {
                    firstErrorElement.focus();
                    setTimeout(function () {
                        $('#errorContainer .error:first').show();
                    }, 1);
                }, 1);
                return false;
            }
            else if (!$('#CheckRecipients').valid()) {
                setTimeout(function () {
                    $('#FormEditAction .error:first').focus();
                }, 1);
                return false;
            }

            return true;
        };
        self.HideOrShowAttachResult = function (data) {
            if (data && data.is_file_based && data.is_file_based === true) {
                $('#email_attach_result').show();
                $('#email_attach_result').next().show();
            }
            else {
                $('#email_attach_result').hide();
                $('#email_attach_result').next().hide();
            }
        };
        self.GetTaskData = function () {
            //prepare data
            var timeStop = jQuery('[name^="TimeStop"]').val();
            var data = {
                "name": jQuery('[name^="TaskName"]').val(),
                "delete_after_completion": false,
                "run_as_user": jQuery('[name^="RunasUser"]').val(),
                "actions": [],
                "enabled": jQuery('[name^="IsEnabled"]').is(':checked'),
                "max_run_time": timeStop !== '' ? MC.util.timePickerToUnixTime(jQuery('[name^="TimeStop"]').data('kendoTimePicker').value(), true) : 0,
                "actions_uri": self.TasksActionsUri,
                "triggers": []
            };

            //send data type event
            var triggerType = jQuery('#trigger_type').val();
            if (triggerType === self.TRIGGER_TYPE_ID.EVENT) {
                data.triggers = [{
                    "arguments": [{
                        "name": "model",
                        "value": jQuery('[name^="model"]').val()
                    }],
                    "event": jQuery('#event_type').val(),
                    "trigger_type": triggerType
                }];
            }
            else if (triggerType === self.TRIGGER_TYPE_ID.SCHEDULE) {
                var days = [];
                jQuery('[data-role="customcheckbox"] :checkbox').each(function (index, chk) {
                    days.push({ day: index, active: chk.checked });
                });

                data.triggers = [{
                    "days": days,
                    "trigger_type": triggerType,
                    "continuous": false,
                    "frequency": "Weekly",
                    "start_time": MC.util.timePickerToUnixTime(jQuery('[name="StartTime"]').data('kendoTimePicker').value(), false)
                }];

                data.uri = jQuery('[name^="uri"]').val();
            }
            else if (triggerType === self.TRIGGER_TYPE_ID.EXTERNAL) {
                data.triggers = [{
                    "trigger_type": triggerType
                }];
            }
            return data;
        };
        self.GetData = function () {
            var data = self.GetTaskData();
            data.actions = [];
            data.actionsDelete = [];

            var taskActionsGrid = $('#TaskActionsGrid').data('kendoGrid');
            if (!taskActionsGrid)
                return data;

            var sortIndex = -1;
            $.each(taskActionsGrid.items(), function (index, task) {
                task = $(task);
                var dataItem = taskActionsGrid.dataSource.getByUid(task.data('uid'));
                if (!dataItem) {
                    return;
                }

                if (task.hasClass('rowMaskAsRemove')) {
                    // if task action is new, it no need for request to delete on the server
                    if (dataItem.uri) {
                        data.actionsDelete.push(dataItem.uri);
                    }
                }
                else {
                    sortIndex++;

                    if (!self.IsTaskActionsSorted && !dataItem.is_edited) {
                        // skip to adding task actions if it unsort or unedited
                        return true;
                    }

                    var notification = dataItem.notification;
                    if (notification) {
                        if (!notification.recipients.length) {
                            notification = null;
                        }
                        else if (notification.toJSON) {
                            notification = notification.toJSON();
                        }
                    }

                    var action = {
                        "run_as_user": dataItem.run_as_user,
                        "action_type": dataItem.action_type,
                        "arguments": dataItem.arguments,
                        'approval_state': dataItem.approval_state,
                        "notification": notification,
                        "Uri": dataItem.uri,
                        "order": sortIndex
                    };

                    data.actions.push(action);
                }

            });
            return data;
        };
        self.CreateNewTaskUri = function (e, obj) {
            $(obj).data('parameters', {
                tasksUri: self.TaskUri
            });
            MC.util.redirect(e, obj);
        };
        self.SaveAutomateTask = function () {
            MC.form.clean();
            MC.ui.loading.hide(true);

            var rowActions = $('#TaskActionsGrid .k-grid-content tr:not(.rowMaskAsRemove)');
            $('#check_actions').val(rowActions.length ? 'yes' : '');

            if (!jQuery('#formTask').valid()) {
                $('#formTask .error:first').focus();
                return false;
            }

            var data = self.SaveAutomatedTaskUri ? self.GetData() : "";
            var deleteActionData = data ? JSON.stringify(data.actionsDelete) : "";
            if (data) {
                delete data.actionsDelete;
            }
            MC.ajax.request({
                url: self.SaveAutomatedTaskUri,
                parameters: { taskUri: self.TaskUri, taskData: JSON.stringify(data), deleteActionData: deleteActionData },
                type: 'POST'
            })
                .done(function (response) {
                    MC.form.page.init(self.GetData);
                    if (self.TaskUri) {
                        location.hash = self.AllTaskPageUri;
                    }
                    else {
                        location.hash = self.EditTaskPage + '?parameters=' + JSON.stringify(response.parameters);
                    }
                });
        };
        self.RemoveNewItem = function (obj) {
            MC.form.template.remove(obj);
        };
        self.DeleteTask = function (e, obj) {
            if (!$(obj).hasClass("disabled")) {

                var confirmMessage = MC.form.template.getRemoveMessage(obj);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    MC.ajax.request({
                        element: obj,
                        type: 'Delete',
                        url: self.DeleteTaskUri
                    })
                        .done(function () {
                            var grid = jQuery('#TasksGrid').data('kendoGrid');
                            if (grid) {
                                grid.dataSource.read();
                            }
                        });
                });
            }
            MC.util.preventDefault(e);
        };

        self.SetDatastoreFieldsValidation = function (dataItem) {
            setTimeout(function () {
                if (dataItem.datastore_plugin === 'odbc' || dataItem.datastore_plugin === 'mssql') {
                    $('#table_name').addClass('table_name');
                }
            }, 100);
        };

        self.CopyActionPopup = function (taskUri, uid) {
            MC.ui.popup('setScrollable', {
                element: '#popupCopyAction'
            });

            var win = $('#popupCopyAction').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });
            self.SetSelectedActionBasedOnUid(uid);
            MC.ajax.request({
                url: self.AllTaskUri,
                type: 'Get'
            })
                .done(function (data) {
                    self.CreateCopyTasksDropdown(data, taskUri);
                    MC.form.validator.init('#formCopyAction');
                    $('#formCopyAction').submit(function (e) {
                        $('#popupCopyAction .btnSubmit').trigger('click');
                        e.preventDefault();
                    });
                });

        }
        self.CreateCopyTasksDropdown = function (data, taskUri) {
            var taskDatasources = [];
            self.SelectedTaskUri = taskUri;

            jQuery.each(data, function (_key, value) {
                taskDatasources.push({ id: value.Uri, text: value.name });
            });

            $('#taskAvailableToCopy').kendoDropDownList({
                dataTextField: "text",
                dataValueField: "id",
                dataSource: taskDatasources,
                change: self.CopyTaskDropdownChanged,
                value: self.SelectedTaskUri
            });
        };

        self.CopyAction = function () {
            if (!jQuery('#formCopyAction').valid())
                return;

            var taskUri = self.SelectedTaskUri;
            var actionData = self.GetCopyActionData(self.SelectedAction);

            if (taskUri === self.TaskUri) {
                self.AddAdocCopyAction(actionData);
                jQuery('#popupCopyAction').data('kendoWindow').close();
            }
            else {
                MC.ajax
                    .request({
                        url: self.CopyActionUri,
                        parameters: { taskUri: taskUri, actiondata: JSON.stringify(actionData) },
                        type: 'POST'
                    })
                    .done(function () {
                        jQuery('#popupCopyAction').data('kendoWindow').close();
                    })
                    .error(function () {
                        $('#popupCopyAction .btnClose').trigger('click');
                    });
            }
        };

        self.CopyTaskDropdownChanged = function (e) {
            self.SelectedTaskUri = e.sender.value();
        };

        self.AddAdocCopyAction = function (currentActionData) {
            var kendoGrid = $('#TaskActionsGrid').data('kendoGrid');
            var datasource = kendoGrid.dataSource;

            currentActionData.order = datasource.data().length;

            if (currentActionData.run_as_user === "") {
                currentActionData.run_as_user = null;
            }
            currentActionData.is_edited = true;
            datasource.add(currentActionData);
        };

        self.SetSelectedActionBasedOnUid = function (uid) {
            var action = jQuery('#TaskActionsGrid').data("kendoGrid").dataSource.getByUid(uid);
            self.SelectedAction = action;
        };

        self.GetCopyActionData = function (currentActionData) {
            var actionData = {};
            actionData.run_as_user = currentActionData.run_as_user;
            actionData.action_type = currentActionData.action_type;
            actionData.approval_state = currentActionData.approval_state;

            // general
            if (actionData.action_type === self.ACTION_TYPE_ID.DATASTORE) {

                actionData.AngleUri = currentActionData.AngleUri;
                actionData.angle_name = currentActionData.angle_name;
                actionData.display_name = currentActionData.display_name;
                actionData.display_uri = currentActionData.display_uri;
                actionData.arguments = currentActionData.arguments;
            }
            else {
                actionData.Angle = null;
                actionData.angle_name = '';
                actionData.display_name = '';
                actionData.display_uri = '';
                actionData.arguments = currentActionData.arguments;
            }

            // notification
            actionData.notification = currentActionData.notification;

            return actionData;
        };

        self.TestConnection = function () {
            var btnTestConnection = $('#btnTestConnection');
            if (btnTestConnection.hasClass('disabled'))
                return;

            btnTestConnection.addClass('disabled');
            jQuery('#row-test-connection .statusInfo').text(Localization.MC_TestingConnection);

            var deferred = jQuery.Deferred();
            disableLoading();
            MC.ajax
                .request({
                    url: self.TestConnectionUri,
                    parameters: {
                        "plugin": self.CurrentDatastorePlugin,
                        "datastoreId" : self.GetDatastoreId(),
                        'jsonData': JSON.stringify(self.GetTestConnectionData())
                    },
                    type: 'POST'
                })
                .done(function () {
                    jQuery('#row-test-connection .statusInfo').text(Localization.MC_Info_TestConnectionSuccess);
                    deferred.resolve();
                })
                .fail(function (xhr, status, error) {
                    jQuery('#row-test-connection .statusInfo').text(JSON.parse(xhr.responseText).message);
                    MC.ajax.setErrorDisable(xhr, status, error, deferred);
                })
                .always(function () {
                    btnTestConnection.removeClass('disabled');
                });

            deferred.promise();
        };
        self.GetDatastoreUri = function () {
            return $('#datastore').data('kendoDropDownList') && $('#datastore').data('kendoDropDownList').dataItem() && $('#datastore').data('kendoDropDownList').dataItem().Uri;
        };
        self.GetDatastoreId = function () {
            var datastoreId = '', datastoreUri = self.GetDatastoreUri();
            if (datastoreUri) {
                var str = datastoreUri;
                var n = str.lastIndexOf('/');
                datastoreId = str.substring(n + 1);
            }
            return datastoreId;
        };
        self.GetTestConnectionData = function () {
            var data = self.GetSettingsData('.contentSectionInfoItem .connection_folder');
            //getting hidden values.
            data = self.GetHiddenDataForTestConnection('.contentSectionInfoItem .connection_folder',data);
            return { setting_list: data };
        };
        self.GetHiddenDataForTestConnection = function (container,datastoreData) {
            jQuery(container).find('input[type = "hidden"]').each(function (index, input) {
                var id = jQuery(input).attr('id')
                if (!datastoreData.hasObject('id', id)) {
                    datastoreData.push({
                        "id": id,
                        "value": jQuery(input).val(),
                        "type": "text"
                    });
                }
            });
            return datastoreData
        };
        self.GetSettingsData = function (container) {
            var datastoreData = [];

            jQuery(container).find('input[type != "hidden"]').each(function (index, input) {
                var setting = self.GetDataStoreSettingInfo(jQuery(input));
                if (setting.type && setting.id && !datastoreData.hasObject('id', setting.id)) {
                    datastoreData.push({
                        "id": setting.id,
                        "value": setting.value,
                        "type": setting.type
                    });
                }
            });

            return datastoreData;
        };

        self.GetHiddenSettingsId = function () {
            return jQuery('#settingId').val()
        };

        self.UpdateOutputFolder = function (e) {
            _self.fnCheck && clearTimeout(_self.fnCheck);
            _self.fnCheck = setTimeout(function () {
                self.UpdateOutputFolderfield(e.value, self.GetHiddenSettingsId());
            }, 500);

        };

        self.UpdateOutputFolderfield = function (subfoldervalue, settingId) {
            var ouputFolderInput = $('#' + settingId + "_Output_Folder"), datastoreOutputFolderValue = $("#" + settingId + "_intial").val(), outputfolderValue = "";
            var seperator = subfoldervalue.startsWith("\\") || datastoreOutputFolderValue.endsWith("\\") ? "" : "\\";
            outputfolderValue = datastoreOutputFolderValue + seperator + subfoldervalue;
            ouputFolderInput.val(outputfolderValue);
        };

        self.UpdateSubFolderField = function (arg) {
            var settingId = self.GetHiddenSettingsId();
            var subfolderValue = arg.value.replace($('#' + settingId+'_intial').val(), "");
            $('#action_subfolder').val(subfolderValue);
            self.UpdateOutputFolderfield(subfolderValue, settingId);
        };
    };

    win.MC.AutomationTasks = automationTasks || {};
    jQuery.extend(win.MC.AutomationTasks, {
        Tasks: new Tasks()
    });

})(window, MC.AutomationTasks);
