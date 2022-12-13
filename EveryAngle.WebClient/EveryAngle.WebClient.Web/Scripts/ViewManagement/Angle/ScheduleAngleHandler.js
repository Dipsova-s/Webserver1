var scheduleAngleHandler = new ScheduleAngleHandler();

function ScheduleAngleHandler() {
    "use strict";

    var self = this;

    /*  BOF: Methods */
    self.ShowPopup = function (option) {
        // initial popup settings
        var popupName = 'ScheduleAngle';
        var popupSettings = {
            title: Localization.ScheduleAngle,
            element: '#popup' + popupName,
            html: scheduleAngleHtmlTemplate(),
            className: 'popup' + popupName,
            resizable: false,
            actions: ["Close"],
            center: true,
            width: 400,
            minHeight: 100,
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: 'close',
                    position: 'right',
                    isSecondary: true
                },
                {
                    className: 'btnSubmit executing',
                    text: Localization.Ok,
                    click: function (e, obj) {
                        if (!popup.CanButtonExecute(obj))
                            e.preventDefault();
                        else
                            self.ClosePopup();
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            open: self.ShowPopupCallback,
            close: popup.Destroy
        };

        popup.Show(popupSettings);
    };

    self.ClosePopup = function () {
        popup.Close('#popupScheduleAngle');
    };

    self.ShowPopupCallback = function (e) {
        WC.HtmlHelper.DropdownList('#taskDropdownList', [], { enable: false });
        e.sender.element.find('.loader-spinner-inline').removeClass('alwaysHide');

        /* BOF: Generate datas for field dropdown list */
        self.GetTasks()
            .done(function (data) {
                self.PopulateTaskList(e, data);
            })
            .always(function () {
                e.sender.element.find('.loader-spinner-inline').addClass('alwaysHide');
            });
        /* EOF: Generate datas for field dropdown list */
    };

    self.CheckAlreadyAssignedDisplay = function (datas) {
        var selectedTaskId = '';
        if (displayModel.Data().used_in_task) {
            jQuery.each(datas, function (i, data) {
                jQuery.each(data.actions, function (j, action) {
                    var argAngle = action.arguments.findObject('name', 'angle_id');
                    var argDisplay = action.arguments.findObject('name', 'display_id');
                    var isThisAngle = argAngle && argAngle.value === angleInfoModel.Data().id;
                    var isThisDisplay = argDisplay && argDisplay.value === displayModel.Data().id;
                    if (isThisAngle && isThisDisplay) {
                        data.name += ' &check;';
                        if (!selectedTaskId)
                            selectedTaskId = data.uri;
                        return false;
                    }
                });
            });
        }
        return { selectedTaskId: selectedTaskId, tasks: datas };
    };

    self.BindingFieldDropdownList = function (datas, btnSubmit) {
        WC.HtmlHelper.DropdownList('#taskDropdownList').destroy();
        var dropdownList = WC.HtmlHelper.DropdownList('#taskDropdownList', datas.tasks,
        {
            dataTextField: 'name',
            dataValueField: 'uri',
            valueTemplate: '<span>#= name #</span>',
            template: '<span>#= name #</span>',
            change: function (e) {
                var taskValue = e.sender.value();
                jQuery('.popupScheduleAngle .btnSubmit')[!taskValue ? 'addClass' : 'removeClass']('executing');
                var uri = taskValue ? self.GetTaskUrl(taskValue) : '';
                btnSubmit.attr('href', uri);
            }
        });
        dropdownList.enable(true);
        dropdownList.value(datas.selectedTaskId);
        dropdownList.trigger('change');
    };

    self.GetTasks = function () {
        var uri = directoryHandler.GetDirectoryUri(enumHandlers.ENTRIESNAME.TASKS);
        return GetDataFromWebService(uri, { type: "export_angle_to_datastore", offset: 0, limit: systemSettingHandler.GetMaxPageSize() }, false);
    };

    self.PopulateTaskList = function (e, data) {
        var btnSubmit = e.sender.wrapper.find('.btnSubmit');
        btnSubmit.attr('target', '_blank');

        if (data.tasks.length && self.IsPrivilegeUser()) {
            // sort before check default selection
            data.tasks.sortObject('name', enumHandlers.SORTDIRECTION.ASC, false);

            // check default selection
            var taskList = self.CheckAlreadyAssignedDisplay(data.tasks);

            // add Select task option
            taskList.tasks.splice(0, 0, { name: Localization.SelectTask, uri: '' });

            // set data to dropdown list
            self.BindingFieldDropdownList(taskList, btnSubmit);
        }
        else {
            self.ClosePopup();
            popup.Alert(Localization.Warning_Title, Localization.NoTaskAvailable);
        }
    };
    self.IsPrivilegeUser = function () {
        var canAccessMC = userModel.IsPossibleToManageSystem();
        var canAccessAutomationTasks = userModel.IsPossibleToScheduleAngles() && systemInformationHandler.IsSupportAngleAutomation();
        return canAccessMC || canAccessAutomationTasks;
    };

    self.GetTaskUrl = function (taskUri) {
        return self.GetTaskUrlForDisplay(taskUri, displayModel.Data().uri);
    };

    self.GetTaskUrlForDisplay = function (taskUri, displayUri) {
        var taskUrl = "{0}admin/home/index#/Angle exports/Automation tasks/Edit task/?parameters={\"tasksUri\":\"{1}{2}\",\"angleUri\":\"{3}\"}";
        var uri = kendo.format(taskUrl, rootWebsitePath, webAPIUrl, taskUri, displayUri);
        return uri;
    };
}