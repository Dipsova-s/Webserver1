function SaveDisplaysUsedInAutomationTasksHandler() {
    "use strict";

    var taskDetails = [];
    var self = this;
    self.AccessManagementConsoleStatus = ko.observable();
    self.TotalDisplaysCount = ko.observable()
    self.DisplaysInTask = ko.observableArray([]);
    self.CheckedDisplaysInTask = ko.observableArray([]);
    self.ShowSavePopup = function (changedDisplaysUsedInTask, callback, cancel) {
        var isOk = false;
        var popupName = 'SaveAllDisplaysUsedInAutomationTask',
            popupSettings = {
                title: Localization.ConfirmSaveDisplaysUsedInAutomationTask,
                element: '#Popup' + popupName,
                html: saveDisplaysUsedInAutomationTasksHtmlTemplate(),
                className: 'popup' + popupName,
                animation: false,
                width: 613,
                height: 386,
                minWidth: 613,
                open: function (e) {
                    e.sender.element.busyIndicator(true);
                    self.AccessManagementConsoleStatus(scheduleAngleHandler.IsPrivilegeUser());
                    self.TotalDisplaysCount(changedDisplaysUsedInTask.DispalyTotal);
                    self.LoadValues(changedDisplaysUsedInTask.Display, e);
                    WC.HtmlHelper.ApplyKnockout(self, e.sender.element);
                },
                close: function (e) {
                    if (!isOk && typeof cancel === 'function')
                        cancel.call();
                    e.sender.destroy();
                },
                buttons: [
                    {
                        text: Captions.Button_Cancel,
                        position: 'right',
                        click: 'close',
                        isSecondary: true
                    },
                    {
                        text: Localization.Save,
                        position: 'right',
                        isPrimary: true,
                        className: 'btn-save',
                        click: function (e, obj) {
                            isOk = true;
                            if (popup.CanButtonExecute(obj)) {
                                if (typeof callback === 'function')
                                    callback.call();
                                e.kendoWindow.close()
                            }
                        }
                    }
                ]
            };

        popup.Show(popupSettings);
    };

    self.IsDisplayRequiredToSave = function (displayUri) {
        var isDisplayPresent = false;
        ko.utils.arrayForEach(self.CheckedDisplaysInTask(), function (selectedDisplayUri) {
            if(selectedDisplayUri === displayUri) {
                isDisplayPresent = true;
                return false;
            }
        });
        return isDisplayPresent;
    };

    self.LoadTaskDetails = function (tasks, displayUri) {
        taskDetails = [];
        jQuery.each(tasks, function (_index, task) {
            var taskUri = task.task_uri && self.AccessManagementConsoleStatus() ? scheduleAngleHandler.GetTaskUrlForDisplay(task.task_uri, displayUri) : '';
            taskDetails.push({ Name: task.name, OwnerName: task.createdby, url: taskUri });
        });
    };

    self.GetDispalyTaskInfo = function (displayDetails) {
        var displayInTaskUri = displayDetails.uri + "/tasks";
        return GetDataFromWebService(displayInTaskUri);
    };

    self.LoadValues = function (changedDisplaysUsedInTask, e) {
        self.DisplaysInTask([]);
        self.CheckedDisplaysInTask([]);
        var atleastOneDisplayContainsTask = false;
        jQuery.each(changedDisplaysUsedInTask, function (index, display) {
            self.GetDispalyTaskInfo(display.Details)
                .done(function (data) {
                    var displayUri = display.Details.uri;
                    self.LoadTaskDetails(data.tasks, displayUri);
                    self.CheckedDisplaysInTask.push(displayUri); //initially all displays should be selected.
                    self.DisplaysInTask.push({ Name: display.Name, DisplayUri: displayUri, DisplayTypeClassName: 'icon-' + display.Details.display_type, Tasks: taskDetails });
                    taskDetails.length > 0 ? atleastOneDisplayContainsTask = true : 0;
                    if (index == changedDisplaysUsedInTask.length - 1) {
                        if (!atleastOneDisplayContainsTask)
                            e.sender.wrapper.find('.btn-save').trigger('click');
                        e.sender.element.busyIndicator(false);
                    }
                });
        });
    };
}