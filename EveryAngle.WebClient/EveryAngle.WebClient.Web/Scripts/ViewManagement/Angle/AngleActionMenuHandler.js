function AngleActionMenuHandler(base) {
    "use strict";

    var self = jQuery.extend(base, this);

    /*BOF: Model Methods*/
    self.RenderActionDropdownList = function () {
        // collect data
        var data = [];
        if (self.IsEditMode())
            data = self.GetEditModeMenu();
        else if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN))
            data = self.GetListDrilldownMenu();
        else if (angleInfoModel.Data() != null && angleInfoModel.Data().uri === WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.ANGLE))
            data = self.GetDisplayMenu([]);

        // render html
        var menuHtml = [];
        jQuery.each(data, function (index, action) {
            menuHtml[index] = '<a class="actionDropdownItem ' + action.Id + (action.Enable ? '' : ' disabled') + (action.Visible ? '' : ' alwaysHide') + '" onclick="anglePageHandler.CallActionDropdownFunction(this, \'' + action.Id + '\')">' + action.Text + '</a>';
        });
        jQuery('#ActionDropdownListPopup .k-window-content').html(menuHtml.join(''));
    };
    self.GetEditModeMenu = function () {
        var actionIds = [
            enumHandlers.ANGLEACTION.SAVE.Id,
            enumHandlers.ANGLEACTION.SAVEAS.Id,
            enumHandlers.ANGLEACTION.EDITDISPLAY.Id,
            enumHandlers.ANGLEACTION.PASTEDISPLAY.Id,
            enumHandlers.ANGLEACTION.EXECUTEDISPLAY.Id
        ];
        var forcePrivilege = { Visible: true };
        return self.GetDisplayMenu(actionIds, forcePrivilege);
    };
    self.GetListDrilldownMenu = function () {
        /*
        M4-9633: Single item view: enable Actions menu: Add Followup
        1.Single item view: enable Actions menu: Add Followup
        2.Show menu
        2.1.Add follow up
        2.2.Export to Excel
        */

        var actionIds = [
            enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id,
            enumHandlers.ANGLEACTION.ADDFOLLOWUP.Id
        ];
        var forcePrivilege = { Visible: true };
        return self.GetDisplayMenu(actionIds, forcePrivilege);
    };
    self.GetDisplayMenu = function (actionIds, forcePrivilege) {
        /// <summary>get safe decimal places</summary>
        /// <param name="actionIds" type="Array">list of action id which will be used, empty array means use all</param>
        /// <param name="forcePrivilege" type="Object" optional="true">extend all results with this settings</param>
        /// <returns type="Array"></returns>

        var data = [];
        var privileges = self.GetPrivilegeData();
        jQuery.each(enumHandlers.ANGLEACTION, function (key, action) {
            if (!actionIds.length || jQuery.inArray(action.Id, actionIds) !== -1)
                data.push(jQuery.extend(privileges[action.Id], forcePrivilege, action));
        });
        return data;
    };
    self.GetPrivilegeData = function () {
        var privileges = {};

        privileges[enumHandlers.ANGLEACTION.ADDFOLLOWUP.Id] = { Enable: self.CanAddFollowup(), Visible: true };
        privileges[enumHandlers.ANGLEACTION.ADDTODASHBOARD.Id] = { Enable: self.CanAddToDashboard(), Visible: true };
        privileges[enumHandlers.ANGLEACTION.COPYDISPLAY.Id] = { Enable: self.CanCopyDisplay(), Visible: true };

        // create chart, pivot or list from aggregated display
        var createDisplayData = self.GetCreateDisplayFromAggregationData();
        jQuery.extend(privileges, createDisplayData);

        privileges[enumHandlers.ANGLEACTION.EDITDISPLAY.Id] = { Enable: self.CanEditDisplay(), Visible: true };

        // execute display will be visible in editmode, so it don't care about disable or enable
        privileges[enumHandlers.ANGLEACTION.EXECUTEDISPLAY.Id] = { Enable: self.HandlerValidation.Display.CanPostResult, Visible: self.CanExecuteDisplay() };

        // both Excel and CSV can use the same priviledge
        var canExportItem = self.CanExport();
        privileges[enumHandlers.ANGLEACTION.EXPORTTOCSV.Id] = { Enable: canExportItem, Visible: true };
        privileges[enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id] = { Enable: canExportItem, Visible: true };

        // find only available in list display
        privileges[enumHandlers.ANGLEACTION.FIND.Id] = { Enable: self.CanFindRow(), Visible: true };

        privileges[enumHandlers.ANGLEACTION.NEWDISPLAY.Id] = { Enable: self.CanCreateNewDisplay(), Visible: true };
        privileges[enumHandlers.ANGLEACTION.PASTEDISPLAY.Id] = { Enable: self.CanPasteDisplay(), Visible: true };
        privileges[enumHandlers.ANGLEACTION.SAVE.Id] = { Enable: self.CanQuickSave(), Visible: true };
        privileges[enumHandlers.ANGLEACTION.SAVEAS.Id] = { Enable: self.CanQuickSaveAs(), Visible: true };

        // SCHEDULEANGLE visibility will depend on priviledge and it can use for saved Display
        var scheduleAnglesData = self.GetScheduleAnglesData();
        jQuery.extend(privileges, scheduleAnglesData);

        return privileges;
    };
    self.CanAddToDashboard = function () {
        var isSavedItem = !angleInfoModel.IsTemporaryAngle() && !displayModel.IsTemporaryDisplay();
        return !self.HandlerValidation.Angle.InvalidBaseClasses
            && !angleInfoModel.IsTemplate()
            && privilegesViewModel.IsAllowExecuteDashboard()
            && isSavedItem;
    };
    self.CanAddFollowup = function () {
        return !self.HandlerValidation.Angle.InvalidBaseClasses
            && resultModel.Data().authorizations.add_followup
            && resultModel.Data().object_count;
    };
    self.CanFindRow = function () {
        // find only available in list display
        var isList = displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.LIST;
        return isList && self.IsDisplayExecuted();
    };
    self.CanQuickSave = function () {
        return displayModel.Data().authorizations.update;
    };
    self.CanQuickSaveAs = function () {
        return angleInfoModel.Data().authorizations.create_private_display
            && !self.HandlerValidation.Angle.InvalidBaseClasses
            && angleInfoModel.AllowMoreDetails();
    };
    self.CanEditDisplay = function () {
        // all user can open Display popup for set their personal things
        return true;
    };
    self.CanExecuteDisplay = function () {
        // execute display will be visible in editmode
        return self.IsEditMode();
    };
    self.CanCreateNewDisplay = function () {
        var canCreateDisplay = angleInfoModel.Data().authorizations.create_private_display
            || angleInfoModel.Data().authorizations.create_public_display;
        return canCreateDisplay
            && self.HandlerValidation.Angle.CanPostResult
            && angleInfoModel.AllowMoreDetails();
    };
    self.CanCreateDisplayFromAggregation = function () {
        return resultModel.Data().authorizations.change_field_collection
            && !self.HandlerValidation.Angle.InvalidQueryStepsAll;
    };
    self.GetCreateDisplayFromAggregationData = function () {
        var allowCreateList = false;
        var allowCreateChart = false;
        var allowCreatePivot = false;
        var visibleCreateList = false;
        var visibleCreateChart = false;
        var visibleCreatePivot = false;
        var canCreateDisplayFromChartOrPivot = self.CanCreateDisplayFromAggregation();
        if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.PIVOT) {
            visibleCreateList = true;
            visibleCreateChart = true;
            if (canCreateDisplayFromChartOrPivot) {
                allowCreateList = true;
                allowCreateChart = true;
            }
        }
        else if (displayModel.Data().display_type === enumHandlers.DISPLAYTYPE.CHART) {
            var isChartGauge = chartHandler.GetDisplayDetails().chart_type === enumHandlers.CHARTTYPE.GAUGE.Code;
            visibleCreateList = true;
            visibleCreatePivot = true;
            if (canCreateDisplayFromChartOrPivot && !isChartGauge) {
                allowCreateList = true;
                allowCreatePivot = true;
            }
        }

        var data = {};
        data[enumHandlers.ANGLEACTION.CREATELIST.Id] = { Enable: allowCreateList, Visible: visibleCreateList };
        data[enumHandlers.ANGLEACTION.CREATECHART.Id] = { Enable: allowCreateChart, Visible: visibleCreateChart };
        data[enumHandlers.ANGLEACTION.CREATEPIVOT.Id] = { Enable: allowCreatePivot, Visible: visibleCreatePivot };
        return data;
    };
    self.CanCopyDisplay = function () {
        return displayCopyHandler.CanCopyDisplay();
    };
    self.CanPasteDisplay = function () {
        return displayCopyHandler.CanPasteDisplay();
    };
    self.CanScheduleAngles = function () {
        var canAccessMC = userModel.IsPossibleToManageSystem();
        var canAccessAutomationTasks = userModel.IsPossibleToScheduleAngles() && systemInformationHandler.IsSupportAngleAutomation();
        return canAccessMC || canAccessAutomationTasks;
    };
    self.GetScheduleAnglesData = function () {
        // enable if it's saved Display
        var isEnable = !displayModel.IsTemporaryDisplay();

        // visible if it's have a priviledge
        var isVisible = self.CanScheduleAngles();

        var data = {};
        data[enumHandlers.ANGLEACTION.SCHEDULEANGLE.Id] = { Enable: isEnable, Visible: isVisible };
        return data;
    };
    self.CanExport = function () {
        var canExport = userModel.GetAllowExportAuthorizationByModelUri(angleInfoModel.Data().model);
        var isDisplayExecuted = self.IsDisplayExecuted();
        return canExport && isDisplayExecuted;
    };
    self.IsDisplayExecuted = function () {
        var canDisplayExecuted = !self.HandlerValidation.Angle.InvalidBaseClasses
            && !self.HandlerValidation.Display.InvalidAggregates
            && !self.HandlerValidation.Display.InvalidFilters;
        var isExecuteSuccess = resultModel.Data().successfully_completed;
        return canDisplayExecuted && isExecuteSuccess;
    };

    self.CallActionDropdownFunction = function (obj, selectedValue) {
        if (!jQuery(obj).hasClass('disabled')) {
            var actions = {};
            actions[enumHandlers.ANGLEACTION.ADDTODASHBOARD.Id] = [self, self.ShowAddToDashboardPopup];
            actions[enumHandlers.ANGLEACTION.SAVE.Id] = [self, self.QuickSaveDisplay];
            actions[enumHandlers.ANGLEACTION.SAVEAS.Id] = [self, self.QuickSaveDisplayAs];
            actions[enumHandlers.ANGLEACTION.COPYDISPLAY.Id] = [displayCopyHandler, displayCopyHandler.CopyDisplay];
            actions[enumHandlers.ANGLEACTION.PASTEDISPLAY.Id] = [displayCopyHandler, displayCopyHandler.PasteDisplay];
            actions[enumHandlers.ANGLEACTION.EDITDISPLAY.Id] = [displayDetailPageHandler, displayDetailPageHandler.ShowPopup];
            actions[enumHandlers.ANGLEACTION.NEWDISPLAY.Id] = [displayModel, displayModel.CreateNewDisplay];
            actions[enumHandlers.ANGLEACTION.CREATELIST.Id] = [displayModel, displayModel.CreateDisplayFromChartOrPivot, [enumHandlers.DISPLAYTYPE.LIST]];
            actions[enumHandlers.ANGLEACTION.CREATECHART.Id] = [displayModel, displayModel.CreateDisplayFromChartOrPivot, [enumHandlers.DISPLAYTYPE.CHART]];
            actions[enumHandlers.ANGLEACTION.CREATEPIVOT.Id] = [displayModel, displayModel.CreateDisplayFromChartOrPivot, [enumHandlers.DISPLAYTYPE.PIVOT]];
            actions[enumHandlers.ANGLEACTION.ADDFOLLOWUP.Id] = [self, self.ShowAddFollowupPopup];
            actions[enumHandlers.ANGLEACTION.FIND.Id] = [self, self.ShowListFindPopup];
            actions[enumHandlers.ANGLEACTION.EXPORTTOEXCEL.Id] = [self, self.ShowExportExcelPopup];
            actions[enumHandlers.ANGLEACTION.EXPORTTOCSV.Id] = [self, self.ShowExportCsvPopup];
            actions[enumHandlers.ANGLEACTION.EXECUTEDISPLAY.Id] = [self, self.ExitEditMode];
            actions[enumHandlers.ANGLEACTION.SCHEDULEANGLE.Id] = [scheduleAngleHandler, scheduleAngleHandler.ShowPopup];

            var action = actions[selectedValue];
            if (action)
                action[1].apply(action[0], action[2]);
            else
                popup.Alert(Localization.Warning_Title, Localization.NotImplement);
        }
    };
    self.QuickSaveDisplay = function () {
        if (angleInfoModel.IsTemporaryAngle()) {
            popup.Alert(Localization.Warning_Title, Localization.ErrorCannotSaveDisplay);
        }
        else if (displayModel.IsTemporaryDisplay()) {
            displayDetailPageHandler.IsQuickSave = true;
            displayDetailPageHandler.ShowSaveAsPopup(false);
        }
        else {
            displayDetailPageHandler.IsQuickSave = true;
            displayDetailPageHandler.Save();
        }
    };
    self.QuickSaveDisplayAs = function () {
        displayDetailPageHandler.IsQuickSave = true;
        displayDetailPageHandler.ShowSaveAsPopup(!displayModel.IsTemporaryDisplay());
    };
    self.ShowListFindPopup = function () {
        self.HandlerFind = new FindPopupHandler();
        self.HandlerFind.ShowPopup();
    };
    self.ShowExportExcelPopup = function () {
        if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
            exportExcelHandler.ShowExportExcelPopup(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN);
        }
        else {
            exportExcelHandler.ShowExportExcelPopup(displayModel.Data().display_type);
        }
    };
    self.ShowExportCsvPopup = function () {
        exportHandler.ShowExportPopup({ ExportType: enumHandlers.ANGLEACTION.EXPORTTOCSV.Id, DisplayType: displayModel.Data().display_type });
    };
    self.ShowAddFollowupPopup = function () {
        var filterHandler = new WidgetFilterHandler(null, []);
        filterHandler.ModelUri = angleInfoModel.Data().model;
        filterHandler.Data(displayQueryBlockModel.TempQuerySteps());
        filterHandler.FilterFor = filterHandler.FILTERFOR.DISPLAY;
        followupPageHandler.SetHandlerValues(filterHandler, angleQueryStepModel.QuerySteps(), displayQueryBlockModel.TempQuerySteps());

        if (WC.Utility.UrlParameter(enumHandlers.ANGLEPARAMETER.LISTDRILLDOWN)) {
            /*
            M4-9633: Single item view: enable Actions menu: Add Followup
            3.When clicked Add follow up
            3.1.Show add follow up popup
            */
            followupPageHandler.ShowPopup({ ListDrilldown: true });
        }
        else {
            followupPageHandler.ShowPopup({ IsAdhoc: true });
        }
    };

    /*EOF: Model Methods*/
}
