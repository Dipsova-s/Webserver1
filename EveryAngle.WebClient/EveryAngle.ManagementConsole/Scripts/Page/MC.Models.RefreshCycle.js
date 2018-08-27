(function (win, models) {
    function RefreshCycle() {
        /* start private variables */
        var fnCheckTestExtraction;
        var self = this;
        /* end private variables */

        /* start public variables */
        self.SaveUri = '';
        self.DeleteUri = '';
        self.ModelId = '';
        self.ModelUri = '';
        self.TasksUri = '';
        self.TestExtractionUri = '';
        self.GetTasksHistoriesUri = '';
        self.ModelServerUri = '';
        self.DeleteList = [];
        self.ActionsList = [];
        self.GetTasksHistoryUri = '';
        self.GetTaskHistoryUri = '';
        self.TaskHistoryUri = '';
        self.GetActionListUri = '';
        self.TableList = [];
        self.CurrentTaskRow = '';
        self.RefreshCycleForm = null;
        self.Timer = null;
        /* end public variables */

        /* start initial functions */
        self.Initial = function (data) {
            self.SaveUri = '';
            self.ModelId = '';
            self.ModelUri = '';
            self.TasksUri = '';
            self.DeleteUri = '';
            self.TestExtractionUri = '';
            self.GetTasksHistoriesUri = '';
            self.ModelServerUri = '';
            self.DeleteList = [];
            self.ReloadTestExtractionUri = '';
            self.GetTasksHistoryUri = '';
            self.GetTaskHistoryUri = '';
            self.TaskHistoryUri = '';
            self.GetActionListUri = '';
            jQuery.extend(self, data || {});
            self.InitialLayout();
        };
        self.InitialLayout = function () {
            setTimeout(function () {
                var pageContainer = $('#RefreshCycleContainer');
                MC.ajax.registerPageUnloadEvent('refreshcycle', self.ClearActionList);
                MC.util.showServerClock('#ServerTimeInfo', ', {0:HH:mm:ss}');
                disableLoading();
                pageContainer.busyIndicator(true);
                self.LoadActionList().then(function () {
                    pageContainer.find('> .k-loading-mask >.k-loading-image').hide();
                    return $.when(
                        self.CheckViewExtractionButton(),
                        self.InitialRefreshCycleForm(),
                        self.InitialRefreshCycleGrid(),
                        self.InitialRefreshCycleHistoryGrid()
                    );
                })
                .always(function () {
                    self.InitialCopyToClipboard();
                    MC.form.page.init($.noop);
                    pageContainer.busyIndicator(false);
                });
            }, 1);
        };
        self.InitialRefreshCycleForm = function () {
            self.RefreshCycleForm = self.GetRefreshCycleForm();
             
            // days field
            MC.ui.customcheckbox(self.RefreshCycleForm.find('[data-role="customcheckbox"]'));

            // start time, end time, max run time fields
            self.RefreshCycleForm.find('.timePicker').kendoTimePicker({
                format: 'HH:mm',
                // needed for a shift in time on DST while currently browsing
                min: new Date(2000, 0, 1, 0, 0, 0),
                max: new Date(2000, 0, 1, 23, 59, 0),
                change: function () {
                    MC.util.task.setTimePickerPreview(this);
                }
            });

            // prevent error popup when open start time picker
            var startTimeElement = self.RefreshCycleForm.find('input[name="StartTime"]');
            MC.util.hideErrorContainerIfOpenTimePicker(startTimeElement);

            // initial slide toggle form button
            $('#btnAddNewRefreshCycle').click(function () {
                if (self.HasClosedForm()) {
                    // if already close it will open form
                    self.ClickSlideToggleForm();
                }
                else {
                    // if click add new in edit mode it will set flag to prevent form collapse
                    if (!$('#refreshCycleForm').hasClass('new')) {
                        $(this).addClass('active');
                    }
                    // trigger cancel edit mode
                    self.CancelEditTask();
                }
            });

            return $.when();
        };
        self.InitialRefreshCycleGrid = function () {
            var grid = jQuery('#TaskDetailGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.RefreshCycleGridDataBound);
                return grid.dataSource.read();
            }
            return $.when();
        };
        self.InitialCopyToClipboard = function () {
            MC.util.clipboard('.btnCopyCommand');
        };
        self.RefreshCycleGridDataBound = function (e) {
            MC.ui.customcheckbox();

            MC.util.setGridRowId(e.sender, 'id');

            e.sender.content.find('tr').each(function (index, row) {
                row = $(row);
                self.SetRefreshAction(row);
            });

            MC.util.setGridWidth(e.sender, e.sender.columns.length - 1, 75);

            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('a[data-parameters*="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);
        };
        self.InitialRefreshCycleHistoryGrid = function () {
            var grid = jQuery('#TaskHistoryGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.RefreshCycleHistoryGridDataBound);
                if (!MC.ajax.isReloadMainContent)
                    return grid.dataSource.read();
            }
            return $.when();
        };
        self.RefreshCycleHistoryGridDataBound = function (e) {
            MC.ui.localize();

            MC.util.setGridWidth(e.sender, e.sender.columns.length - 1, 75);
        };
        /* end initial functions */

        /* start form handler functions */
        self.GetRefreshCycleForm = function () {
            return $('#refreshCycleForm');
        };
        self.HasClosedForm = function () {
            var toggleArea = $('#refreshCycleForm').find('.slideToggleFormArea');
            return toggleArea.css('display') === 'none';
        };
        self.ClickSlideToggleForm = function (cancelToggle) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();
            var addButton = $('#btnAddNewRefreshCycle');
            var toggleArea = self.RefreshCycleForm.find('.slideToggleFormArea');

            if (self.HasClosedForm()) {

                // cleanup error validation styles
                $('#refreshCycleForm .error').removeClass('error');

                // prevent show when pass this param
                if (!cancelToggle) {
                    toggleArea.slideDown(200);
                }

            }
            else {

                // prevent hide when pass this param
                if (!cancelToggle) {

                    // cleanup form
                    self.ResetFormData();

                    // if user already in edit mode and click add new button it will prevent slideup
                    if (!addButton.hasClass('active')) {
                        toggleArea.slideUp(200);
                    }
                    // remove flag
                    else {
                        addButton.removeClass('active')
                    }
                }

            }
        };
        self.BindingDataToForm = function (data) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();

            var isExternal = MC.util.task.isTriggerExternal(data);
            var isContinuousTask = MC.util.task.isContinuous(data);
            var triggerDays = MC.util.task.getTriggerDays(data);

            // start binding the data to input elements
            // external
            var externalElement = self.RefreshCycleForm.find('[name="IsExternal"]');
            externalElement.prop('checked', isExternal);
            self.TriggerTypeChange(externalElement);

            // continuous
            var continuousElement = self.RefreshCycleForm.find('[name="IsContinuous"]');
            continuousElement.prop('checked', isContinuousTask);
            self.ContinuousChange(continuousElement);

            // name
            self.RefreshCycleForm.find('[name="TaskName"]').val(data.name);

            // enabled
            self.RefreshCycleForm.find('[name="IsEnabled"]').prop('checked', data.enabled);

            // action list 
            self.RefreshCycleForm.find('[name="Action"]').val(data.ActionList); 

            // delta
            var deltaElement = self.RefreshCycleForm.find('[name="IsDelta"]');
            deltaElement.prop('checked', data.Delta);
            self.DeltaChange(deltaElement);

            // new_and_changed_tables_only
            var changedTablesOnlyElement = self.RefreshCycleForm.find('[name="ChangedTablesOnly"]');
            changedTablesOnlyElement.prop('checked', data.ChangedTablesOnly);
            self.ChangedTablesOnlyChange(changedTablesOnlyElement);

            // days
            self.RefreshCycleForm.find('[name="Days"]').each(function (index, day) {
                if (MC.util.task.getTriggerDayStatus(triggerDays, index)) {
                    $(day).next('span').trigger('click');
                }
            });

            if (data.RefreshCycleTrigger) {
                // start time
                if (jQuery.isNumeric(data.RefreshCycleTrigger.start_time)) {
                    var startTimePickerValue = MC.util.unixtimeToTimePicker(data.RefreshCycleTrigger.start_time, false);
                    var startTime = self.RefreshCycleForm.find('input[name="StartTime"]').data('handler');
                    startTime.value(startTimePickerValue);
                    startTime.trigger('change');
                }

                // restart delay
                if (jQuery.isNumeric(data.RefreshCycleTrigger.restart_delay)) {
                    var restartDelayPickerValue = MC.util.unixtimeToTimePicker(data.RefreshCycleTrigger.restart_delay, true);
                    self.RefreshCycleForm.find('input[name="RestartDelay"]').data('handler').value(restartDelayPickerValue);
                }

                // until
                if (jQuery.isNumeric(data.RefreshCycleTrigger.end_time)) {
                    var endTimePickerValue = MC.util.unixtimeToTimePicker(data.RefreshCycleTrigger.end_time, false);
                    var endTime = self.RefreshCycleForm.find('input[name="EndTime"]').data('handler');
                    endTime.value(endTimePickerValue);
                    endTime.trigger('change');
                }
            }
            
            // maximum run time
            if (jQuery.isNumeric(data.max_run_time)) {
                var timeStopPickerValue = MC.util.unixtimeToTimePicker(data.max_run_time, true);
                self.RefreshCycleForm.find('input[name="TimeStop"]').data('handler').value(timeStopPickerValue);
            }

            // parameters [action list = 'tables']
            self.BindingSpecifyTablesDataToForm(data);

            // task uri
            self.RefreshCycleForm.find('[name="Uri"]').val(data.Uri);

        };
        self.BindingSpecifyTablesDataToForm = function (data) { 
            var tableList = data.SpecifyTables.split(' ');

            // parameters [action list = 'tables']
            self.RefreshCycleForm.find('[name="Parameters"]').val(tableList.join(' '));
            self.RefreshCycleForm.find('.specifyTablesCountItems').text(data.SpecifyTables ? tableList.length : 0);

            var specifyTablesLabel = self.RefreshCycleForm.find('#SelectedTableList'); 
            specifyTablesLabel.text(tableList.join(', '));
             
            self.UpdateSpecifyTableLabelVisible(specifyTablesLabel, data.ActionList); 
        };
        self.UpdateSpecifyTableLabelVisible = function (specifyTablesLabel, value) { 
            // if value of action list = 'tables' it will show textbox label
            if (specifyTablesLabel.text() && value && value.toLowerCase() === 'tables') {
                specifyTablesLabel.removeClass('hidden');
            }
            else {
                specifyTablesLabel.addClass('hidden');
            }
        };
        self.ResetFormData = function () {
            self.RefreshCycleForm = self.GetRefreshCycleForm();

            // external
            var externalElement = self.RefreshCycleForm.find('input[name="IsExternal"]');
            externalElement.prop('checked', false);
            self.TriggerTypeChange(self.RefreshCycleForm.find('[name="IsExternal"]'));

            // continuous
            var continuousElement = self.RefreshCycleForm.find('input[name="IsContinuous"]');
            continuousElement.prop('checked', false);
            self.ContinuousChange(continuousElement);

            // name
            self.RefreshCycleForm.find('input[name="TaskName"]').val('');

            // action list 
            self.RefreshCycleForm.find('[name="Action"]').val(''); 

            // delta
            var deltaElement = self.RefreshCycleForm.find('input[name="IsDelta"]');
            deltaElement.prop('checked', false);
            self.DeltaChange(deltaElement);

            // new_and_changed_tables_only
            var changedTablesOnlyElement = self.RefreshCycleForm.find('input[name="ChangedTablesOnly"]');
            changedTablesOnlyElement.prop('checked', false);
            self.ChangedTablesOnlyChange(changedTablesOnlyElement);

            // days
            self.RefreshCycleForm.find('.cellDays .checked').trigger('click');

            // start time
            var startTime = self.RefreshCycleForm.find('input[name="StartTime"]').data('handler');
            startTime.value(null);
            startTime.trigger('change');

            // restart delay
            self.RefreshCycleForm.find('input[name="RestartDelay"]').data('handler').value(null);

            // until
            var endTime = self.RefreshCycleForm.find('input[name="EndTime"]').data('handler');
            endTime.value(null);
            endTime.trigger('change');

            // maximum run time
            self.RefreshCycleForm.find('input[name="TimeStop"]').data('handler').value(null);

            // enabled
            self.RefreshCycleForm.find('input[name="IsEnabled"]').prop('checked', true);

            // parameters [action list = 'tables']
            self.RefreshCycleForm.find('[name="Parameters"]').val('');
            self.RefreshCycleForm.find('.specifyTablesCountItems').text('0');
            self.RefreshCycleForm.find('#SelectedTableList').empty();

            // task uri
            self.RefreshCycleForm.find('[name="Uri"]').val('');

            // add class 'new' to the form
            self.RefreshCycleForm.addClass('new');
        };
        /* end form handler functions */

        /* start action list handler functions */
        self.LoadActionList = function () {
            if (self.ActionsList.length) {
                return $.when();
            }

            return $.when(MC.ajax.request({
                url: self.GetActionListUri
            }))
            .done(function (actionList) {
                self.ActionsList = actionList;
            });
        };
        self.GetActionList = function (preValue) {
            var actionList = jQuery.extend([], self.ActionsList);
            return actionList;
        };
        self.SetPreValueActionList = function (actionList, preValue) {
            actionList.unshift(preValue);
            return actionList;
        };
        self.ClearActionList = function (lastUrl, currentUrl) {
            var isLastUrlValid = lastUrl.indexOf('refreshcycle/getrefreshcycle') !== -1;
            var isCurrentUrlValid = currentUrl.indexOf('refreshcycle/getrefreshcycle') === -1;
            if (isLastUrlValid && isCurrentUrlValid) {
                self.ActionsList = [];
            }
        };
        self.OnActionListChanged = function (element) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();

            var actionListContainer = self.RefreshCycleForm.find('[name="Action"]').closest('.contentSectionInfoItem'); 
            var specifyTablesLabel = actionListContainer.find('#SelectedTableList');
            var value = element.value;

            self.UpdateSpecifyTableLabelVisible(specifyTablesLabel, value);
        }
        self.CreateActionListDropdown = function (dropdownElement) {
            var preValue = {
                id: '',
                name: Localization.MC_PleaseSelect
            };

            var dataSource = self.SetPreValueActionList(self.GetActionList(), preValue);

            var kendoDropdown = dropdownElement.kendoDropDownList({
                dataValueField: 'id',
                valueTemplate: '#: name #',
                template: '#: name #',
                dataSource: {
                    data: dataSource
                },
                open: self.onOpenActionListDropdown,
                change: self.onChangeActionListDropdown
            })
            .data('kendoDropDownList');

            return kendoDropdown;
        };
        self.onOpenActionListDropdown = function (e) {
            if (e.sender.element.filter('[name="Action"]').length) {
                e.sender.list.width(145);
                MC.form.validator.hideErrorMessage();
            }
        };
        self.onChangeActionListDropdown = function (e) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();

            var actionListContainer = self.RefreshCycleForm.find('[name="Action"]').closest('.contentSectionInfoItem');
            var specifyTablesButton = actionListContainer.find('.descriptionLabel');
            var specifyTablesLabel = actionListContainer.find('#SelectedTableList');
            var value = this.value();

            // if value of action list = 'tables' it will show button
            if (value === 'tables') {
                specifyTablesButton.removeClass('hidden');
                specifyTablesLabel.removeClass('hidden');
            }
            else {
                specifyTablesButton.addClass('hidden');
                specifyTablesLabel.addClass('hidden');
            }
        };
        self.ShowActionLists = function () {
            var actionListPopupElement = $('#popupActionLists');
            var actionListGridElement = $('#GridActionLists');

            if (!actionListPopupElement || !actionListGridElement) {
                return;
            }
            
            var actionListPopup = actionListPopupElement.data('kendoWindow');
            var actionListGrid = actionListGridElement.data('kendoGrid');
            var dataSource = self.GetActionList();

            actionListGrid.dataSource.data(dataSource);

            if (!actionListPopup.__bind_resize_event) {
                actionListPopup.__bind_resize_event = true;

                actionListPopup.bind('resize', function (e) {
                    actionListGridElement.height(actionListPopup.element.outerHeight() - 2);
                    actionListGrid.resize(true);
                });
            }

            setTimeout(function () {
                actionListPopup.trigger('resize');
            }, 100);
        };
        self.SetRefreshAction = function (tableRow) {
            tableRow = $(tableRow);

            var actionResult = '';
            var refreshActionCell = tableRow.find('[data-refresh-id]');
            var refreshActionId = refreshActionCell.data('refresh-id');
            var refreshAction = self.ActionsList.findObject('id', refreshActionId);

            if (refreshAction) {
                var tableValues = tableRow.find('input[name="SpecifyTables"]').val().split(' ').join(',');
                actionResult = kendo.format('{0}<br/>{1}', refreshAction.name, tableValues);
            }
            else {
                actionResult = refreshActionId;
            }

            refreshActionCell.html(actionResult);
        };
        /* end action list handler functions */

        /* start task handler functions */
        self.EditTask = function (btn) {
            btn = $(btn);
            var buttonHasDisabled = btn.hasClass('disabled');
            var grid = $('#TaskDetailGrid').data('kendoGrid');
            if (grid && !buttonHasDisabled) {
                var tr = btn.parents('tr:first').addClass('editRow');
                var trSiblings = tr.siblings();
                var uid = tr.data('uid');
                var data = grid.dataSource.getByUid(uid);
                var btnMain = tr.find('.btn:first');

                // make another row to be grey color and prevent click all buttons
                trSiblings.addClass('inactiveRow');
                trSiblings.find('a').addClass('disabled');

                // binding data to form
                self.BindingDataToForm(data);

                // change button behavior to [cancel edit button]
                if (btnMain.hasClass('btnEdit')) {
                    btnMain.removeClass('btnEdit').addClass('btnCancel');
                    btnMain.data('clickTarget', btnMain.next('.btnGroupInner').find('.btnCancel'));
                }

                // remove create flag
                self.RefreshCycleForm.removeClass('new');

                // trigger toggle form
                self.ClickSlideToggleForm(!self.HasClosedForm());
            }
        };
        self.CancelEditTask = function (btn) {
            var triggerClickCancelEditTask = function () {
                // find cancel edit button in grid and click it
                var grid = $('#TaskDetailGrid');
                grid.find('.btnGroupContainer > .btnCancel').next().find('.btnCancel').trigger('click');
            };

            if (!btn) {
                // if click add button when edit mode
                triggerClickCancelEditTask();
                return;
            }
            else {
                btn = $(btn);
                var uri = btn.siblings('input[name="Uri"]');
                // when click cancel button in form
                if (uri.length) {

                    // handle when form is edit mode
                    if (uri.val()) {
                        triggerClickCancelEditTask();
                        return;
                    }

                }
                else {
                    // when click cancel button in grid
                    var tr = btn.parents('tr:first');
                    var btnMain = tr.find('.btn:first');
                    var trSiblings = tr.siblings();
                    var cells = tr.data('default');

                    // cleanup classname and allow to click buttons
                    trSiblings.removeClass('inactiveRow');
                    trSiblings.find('a:not([data-disabled=true])').removeClass('disabled');
                    tr.removeClass('editRow');

                    // replace with old value, except "Action" column
                    $.each(cells, function (index, cell) {
                        if (!$(cell).hasClass('gridColumnToolbar'))
                            tr.find('td').eq(index).replaceWith(cell);
                    });

                    // change button behavior to [edit button]
                    if (btnMain.hasClass('btnCancel')) {
                        btnMain.removeClass('btnCancel').addClass('btnEdit');
                        btnMain.data('clickTarget', btnMain.next('.btnGroupInner').find('.btnEdit'))
                    }

                    // trigger change grid elements
                    self.SetRefreshAction(tr);
                }
            }

            // trigger slide form
            self.ClickSlideToggleForm();
        };
        self.DeltaChange = function (checkbox) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();
            var delta = $(checkbox).prop('checked');

            var changedTablesOnlyElement = self.RefreshCycleForm.find('input[name="ChangedTablesOnly"]');
            changedTablesOnlyElement.prop('disabled', delta);
        };
        self.ChangedTablesOnlyChange = function (checkbox) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();
            var changedTablesOnly = $(checkbox).prop('checked');

            var deltaElement = self.RefreshCycleForm.find('input[name="IsDelta"]');
            deltaElement.prop('disabled', changedTablesOnly);
        };
        self.ContinuousChange = function (checkbox) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();
            var isContinuous = $(checkbox).prop('checked');

            var endTime = self.RefreshCycleForm.find('input[name*="EndTime"]').data('kendoTimePicker');
            if (endTime) {
                endTime.enable(isContinuous);
            }

            var restartDelay = self.RefreshCycleForm.find('input[name*="RestartDelay"]').data('kendoTimePicker');
            if (restartDelay) {
                restartDelay.enable(isContinuous);
            }

        };
        self.TriggerTypeChange = function (checkbox) {
            self.RefreshCycleForm = self.GetRefreshCycleForm();
            var action = $(checkbox).prop('checked') ? 'slideUp' : 'slideDown';
            self.RefreshCycleForm.find('.scheduleArea')[action](200);
        };
        /* end task handler functions */

        /* start task view model */
        self.CreateTaskModel = function () {
            return {
                name: '',
                delete_after_completion: false,
                actions: [],
                enabled: true,
                triggers: [],
                max_run_time: 0, uri: ''
            };
        };
        self.CreateActionModel = function () {
            return {
                action_type: 'refresh_model',
                arguments: []
            };
        };
        self.CreateArgumentModel = function (name, value) {
            return {
                name: name,
                value: value
            };
        };
        self.CreateTriggerModel = function () {
            return {
                trigger_type: 'schedule',
                continuous: false,
                frequency: 'Weekly',
                days: [],
                start_time: 0,
                end_time: null,
                restart_delay: null
            };
        };
        self.CreateDayModel = function (day, active) {
            return {
                day: day,
                active: active
            };
        };
        /* end task view model */

        /* start CRUD task functions */
        self.GetTaskData = function () {
            self.RefreshCycleForm = self.GetRefreshCycleForm();

            var isCreateMode = self.RefreshCycleForm.hasClass('new');
            var taskModel = self.CreateTaskModel();
            var actionModel = self.CreateActionModel();
            var triggerData = self.GetTaskTriggerData(self.RefreshCycleForm);
            var actionList = self.RefreshCycleForm.find('[name="Action"]');
            var actionListParams = self.RefreshCycleForm.find('[name^=Parameters]');
            var maxRuntime = self.RefreshCycleForm.find('[name^="TimeStop"]');

            actionModel.arguments.push(self.CreateArgumentModel('model', self.ModelId));
            actionModel.arguments.push(self.CreateArgumentModel('action_list', self.RefreshCycleForm.find('[name="Action"]').val()));

            var deltaElement = self.RefreshCycleForm.find('[name^="IsDelta"]');
            var isDelta = !deltaElement.prop('disabled') && deltaElement.prop('checked');
            actionModel.arguments.push(self.CreateArgumentModel('delta', isDelta));

            var changedTablesOnlyElement = self.RefreshCycleForm.find('[name^="ChangedTablesOnly"]');
            var changedTablesOnly = !changedTablesOnlyElement.prop('disabled') && changedTablesOnlyElement.prop('checked');
            actionModel.arguments.push(self.CreateArgumentModel('new_and_changed_tables_only', changedTablesOnly));

            if (actionList.val() === 'tables')
                actionModel.arguments.push(self.CreateArgumentModel('parameters', jQuery.trim(actionListParams.val())));

            taskModel.name = self.RefreshCycleForm.find('[name^="TaskName"]').val();
            taskModel.enabled = self.RefreshCycleForm.find('[name^="IsEnabled"]').is(':checked');
            taskModel.triggers.push(triggerData);
            taskModel.actions.push(actionModel);

            if (maxRuntime.val() != '' || maxRuntime.val() == '00:00')
                taskModel.max_run_time = MC.util.timePickerToUnixTime(maxRuntime.data('kendoTimePicker').value(), true);

            // if edit mode
            if (!isCreateMode)
                taskModel.uri = self.RefreshCycleForm.find('[name^="Uri"]').val();
            else
                delete taskModel.uri;

            return JSON.stringify(taskModel);
        };
        self.GetTaskTriggerData = function (row) {
            var days = row.find('[data-role="customcheckbox"] :checkbox');
            var isExternalTriggerType = row.find('[name^="IsExternal"]').is(':checked');
            var triggerData = self.CreateTriggerModel();

            if (isExternalTriggerType) {
                triggerData.trigger_type = 'external';
                delete triggerData.continuous;
                delete triggerData.frequency;
                delete triggerData.days;
                delete triggerData.start_time;
                delete triggerData.end_time;
                delete triggerData.restart_delay;
            }
            else {
                triggerData.continuous = row.find('[name^="IsContinuous"]').is(':checked');
                triggerData.start_time = MC.util.timePickerToUnixTime(row.find('[name="StartTime"]').data('kendoTimePicker').value(), false);

                if (triggerData.continuous) {
                    triggerData.restart_delay = MC.util.timePickerToUnixTime(row.find('[name="RestartDelay"]').data('kendoTimePicker').value(), true);
                    triggerData.end_time = MC.util.timePickerToUnixTime(row.find('[name^="EndTime"]').data('kendoTimePicker').value(), false);
                }

                days.each(function (index, checkbox) {
                    var day = self.CreateDayModel(index, checkbox.checked);
                    triggerData.days.push(day);
                });
            }
            return triggerData;
        };
        self.SaveTask = function () {
            MC.form.clean();
            self.RefreshCycleForm = self.GetRefreshCycleForm();

            if (!self.RefreshCycleForm.valid()) {
                MC.form.validator.hideErrorMessage();

                var firstErrorElement = self.RefreshCycleForm.find('.error:first');

                if (firstErrorElement.is(':checkbox')) {
                    firstErrorElement.valid();
                }
                else if (firstErrorElement.is('select')) {
                    setTimeout(function () {
                        firstErrorElement.focus();
                        setTimeout(function () {
                            $('#errorContainer .error:first').show();
                        });
                    });
                }
                else {
                    firstErrorElement.focus();
                }

                self.RefreshCycleForm.find('.error').removeClass('error');

                return;
            }

            MC.ajax.request({
                url: self.SaveUri,
                parameters: {
                    'tasksUri': self.TasksUri,
                    'tasksData': self.GetTaskData()
                },
                type: 'POST'
            })
            .done(function () {
                MC.ajax.reloadMainContent();
            })
            .fail(function () {
                $('#loading .loadingClose').one('click.close', function () {
                    MC.ajax.reloadMainContent();
                });
            });

        };
        self.DeleteTask = function (event, button) {
            var isDisabled = $(button).hasClass('disabled');
            if (!isDisabled) {
                var confirmMessage = MC.form.template.getRemoveMessage(button);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    MC.ajax.request({
                        element: button,
                        type: 'Delete',
                        url: self.DeleteUri
                    })
                    .done(function () {
                        var grid = jQuery('#TaskDetailGrid').data('kendoGrid');
                        if (grid) {
                            grid.dataSource.read();
                        }
                        self.ResetFormData();
                    });
                });
            }
            MC.util.preventDefault(event);
        };
        /* end CRUD task functions */

        /* start task management functions */
        self.ExecuteTask = function (obj, uri) {
            if (!$(obj).hasClass('disabled')) {
                var data = {
                    'start': true,
                    'reason': 'Manual execute from MC'
                };

                MC.ajax.request({
                    url: self.ExecuteTaskUri,
                    parameters: { "tasksUri": uri, "data": JSON.stringify(data) },
                    type: 'POST',
                    ajaxSuccess: function () {
                        MC.ajax.reloadMainContent();
                    }
                });
            }
        };
        self.AbortTask = function (obj, uri) {
            if (!$(obj).hasClass('disabled')) {
                var data = {
                    'abort': true,
                    'reason': 'Manual abort from MC'
                };

                MC.ajax.request({
                    url: self.AbortTaskUri,
                    parameters: { "tasksUri": uri, "data": JSON.stringify(data) },
                    type: 'POST',
                    ajaxSuccess: function () {
                        MC.ajax.reloadMainContent();
                    }
                });
            }
        };
        /* end task management functions */

        /* start specify table functions */
        self.ShowSpecifyTablesPopup = function () {
            var win = $('#popupSpecifyTables').data('kendoWindow');

            if (win) {
                var gridElement = win.element.find('.k-grid');
                var grid = gridElement.data('kendoGrid');

                self.CurrentTaskRow = $('#TaskDetailGrid').find('tr.editRow');

                setTimeout(function () {
                    MC.ui.popup('setScrollable', { element: '#popupSpecifyTables' });
                    self.SetSpecifyTablesToTableList();
                    self.SetTableListToGrid();
                    grid.resize(true);
                    self.ClearSpecifyTableGridLayout();
                }, 1);
            }
        };
        self.SetSpecifyTablesToTableList = function () {
            self.TableList = [];
            self.RefreshCycleForm = self.GetRefreshCycleForm();
            var specifyTablesParams = self.RefreshCycleForm.find('input[name="Parameters"]').val();
            var parameters = specifyTablesParams ? specifyTablesParams.split(' ') : [];

            $.each(parameters, function (index, parameter) {
                self.TableList.push({ local_name: parameter, specify_tables: true });
            });
        };
        self.SetTableListToGrid = function () {
            var grid = $("#Grid").data("kendoGrid");
            if (grid && !grid.__bind_databound) {
                grid.dataSource.data([]);
                grid.bind('dataBound', function (e) {
                    var dataItems = e.sender.dataItems();
                    $.each(dataItems, function (key, value) {
                        var table = self.TableList.findObject('local_name', value.local_name)
                        if (table)
                            value.set("specify_tables", table.specify_tables);
                        else
                            value.set("specify_tables", false);
                    });
                });
                grid.__bind_databound = true;
            }
        };
        self.ClearSpecifyTableGridLayout = function () {
            $('#popupSpecifyTables .k-scrollbar-vertical').scrollTop(0);
            $('#popupSpecifyTables .gridToolbarFilter input').val('').data('defaultValue', '***********').trigger('keyup');
        };
        self.AddSpecificTable = function (obj) {
            var grid = $("#Grid").data("kendoGrid");
            var tr = $(obj).closest('tr')[0];
            var data = grid.dataItem(tr);
            var table = self.TableList.findObject('local_name', data.local_name);
            var isSpecifyTables = $(obj).is(':checked');

            if (table)
                table.specify_tables = isSpecifyTables;
            else
                self.TableList.push({ local_name: data.local_name, specify_tables: isSpecifyTables });
        };
        self.SetSpecifyTables = function () {
            var grid = jQuery('#TaskDetailGrid').data('kendoGrid');
            if (!grid)
                return;

            self.RefreshCycleForm = self.GetRefreshCycleForm();

            var taskData = { SpecifyTables: [] };

            // refresh checkbox state
            $.each(self.TableList, function (key, value) {
                if (value.specify_tables)
                    taskData.SpecifyTables.push(value.local_name);
            });

            // update form data
            taskData.SpecifyTables = taskData.SpecifyTables.join(' ');
            self.BindingSpecifyTablesDataToForm(taskData);

            // close popup
            setTimeout(function () {
                MC.ui.popup('close');
            }, 1);
        };
        /* end specify table functions */

        /* start refresh cycle testing functions */
        self.ShowModelServerInfo = function (e, obj) {
            MC.util.modelServerInfo.showInfoPopup(e, obj);
        };
        self.TestExtraction = function (e) {
            self.ReloadTestExtraction('test');
            MC.util.preventDefault(e);
        };
        self.ReloadTestExtraction = function (todo) {
            if (typeof todo == 'undefined') todo = 'reload';

            var testExecution = function (todo) {
                if (todo == 'reload') {
                    return MC.ajax.request({
                        url: self.ReloadTestExtractionUri,
                        parameters: { "modelId": self.ModelId, "modelServerUri": self.ModelServerUri },
                        type: 'GET'
                    });
                }
                else {
                    var tasksData = {
                        "id": "EATest_" + self.ModelId,
                        "name": "Test_" + self.ModelId,
                        "actions": [
                            {
                                "action_type": "refresh_model",
                                "arguments": [
                                    {
                                        "name": "model",
                                        "value": self.ModelId
                                    },
                                    {
                                        "name": "action_list",
                                        "value": "EATest"
                                    },
                                    {
                                        "name": "delta",
                                        "value": false
                                    }
                                ]
                            }
                        ],
                        "delete_after_completion": false,
                        "triggers": [
                            {
                                "days": [
                                    {
                                        "day": 0,
                                        "active": false
                                    },
                                    {
                                        "day": 1,
                                        "active": false
                                    },
                                    {
                                        "day": 2,
                                        "active": false
                                    },
                                    {
                                        "day": 3,
                                        "active": false
                                    },
                                    {
                                        "day": 4,
                                        "active": false
                                    },
                                    {
                                        "day": 5,
                                        "active": false
                                    },
                                    {
                                        "day": 6,
                                        "active": false
                                    }
                                ],
                                "frequency": "Weekly",
                                "continuous": false,
                                "trigger_type": "schedule",
                                "start_time": 0,
                                "restart_delay": 0
                            }
                        ]
                    };

                    return MC.ajax.request({
                        url: self.TestExtractionUri,
                        parameters: { "modelId": self.ModelId, "modelServerUri": self.ModelServerUri, "tasksUri": self.TasksUri, "tasksData": JSON.stringify(tasksData) },
                        type: 'POST'
                    });
                }
            };

            MC.ajax.abortAll();
            clearTimeout(fnCheckTestExtraction);

            $('#popupTestExtraction').removeClass('popupError');
            $('#TestExtractionContainer').empty();

            //MC.ui.popup('requestStart');

            var deferred = $.Deferred();
            testExecution(todo)
                .done(function (data, status, xhr) {
                    $('#popupTestExtraction').removeClass('popupError');
                    $('#TestExtractionContainer').html(data);
                    $('#TestExtractionContainer table').kendoGrid({
                        scrollable: true
                    });
                    $('#TestExtractionContainer table td').addClass('columnNumber');

                    deferred.resolve(data, status, xhr);
                })
                .fail(function (xhr, status, error) {
                    var message = MC.ajax.getErrorMessage(xhr, null, error);
                    $('#popupTestExtraction').addClass('popupError');
                    $('#TestExtractionContainer')
                        .html(message)
                        .append('<a class="btn btnPrimary btnRetry">Retry</a>');

                    MC.ajax.setErrorDisable(xhr, status, error, deferred);
                })
                .always(function () {
                    MC.ajax.reloadMainContent();

                    $('#TestExtractionContainer .btnRetry').click(function (e) {
                        self.ReloadTestExtraction('reload');
                    });

                    setTimeout(function () {
                        MC.ui.popup('requestEnd');

                        //fnCheckTestExtraction = setTimeout(function () {
                        //    self.ReloadTestExtraction('reload');
                        //}, 30 * 1000);
                    }, 100);
                });

            deferred.promise();
        }
        self.CheckViewExtractionButton = function () {
            return MC.ajax.request({
                url: self.CheckExtractorUri,
                parameters: { modelServerUri: self.ModelServerUri },
                type: 'GET'
            }).done(function (response) {
                if (response.IsExtracting) {
                    $('#btnViewExtraction')
                        .removeClass('disabled')
                        .data('parameters', { modelServerUri: response.ExtractorUri, isCurrentInstance: false })
                        .on('click', function (event) {
                            MC.Models.RefreshCycle.ShowModelServerInfo(event, this);
                        });
                }
            });
        };
        /* end refresh cycle testing functions */
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        RefreshCycle: new RefreshCycle()
    });

})(window, MC.Models);
