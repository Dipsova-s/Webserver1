//this function call when want to set breadcurmbs to view model
var businessprocessSearchModel = new BusinessprocessSearchModel();

function BusinessprocessSearchModel() {
    "use strict";

    /*BOF: Model Properties */
    var self = this;

    self.Initial = function () {
        businessProcessesModel.Topbar = new BusinessProcessesViewModel();
        businessProcessesModel.Topbar.MultipleActive(true);
        businessProcessesModel.Topbar.CanEmpty(false);
        businessProcessesModel.Topbar.SmartTitle(true);
        businessProcessesModel.Topbar.Mode(userSettingModel.GetByName(enumHandlers.USERSETTINGS.COMPRESSED_BP_BAR) ? businessProcessesModel.Topbar.MODE.COMPACT : businessProcessesModel.Topbar.MODE.FULL);
        businessProcessesModel.Topbar.ClickHeaderCallback(self.ClickHeaderCallback);
        businessProcessesModel.Topbar.ClickCallback(self.ClickCallback);
        businessProcessesModel.Topbar.ApplyHandler('#SearchFacetBusinessProcesses');
        self.SetCurrentActive();

        setTimeout(function () {
            jQuery('#SearchFacetBusinessProcesses').removeClass('initializing');
        }, 500);
    };

    self.SetBusinessFilterFromUrlToUI = function (businessFilterParameter) {
        if (businessFilterParameter !== null) {
            var currentActiveList = {};
            var bps = WC.Utility.ToArray(searchQueryModel.GetParams().fq.json[enumHandlers.SEARCHFQPARAMETER.BP]);
            jQuery.each(bps, function (k, v) {
                currentActiveList[v] = true;
            });
            businessProcessesModel.Topbar.CurrentActive(currentActiveList);
        }
    };

    self.ClickHeaderCallback = function () {
        searchQueryModel.Search();
    };

    self.ClickCallback = function (data, event, changed) {
        if (data.is_allowed !== null && data.is_allowed === false)
            return false;

        var isActive = jQuery.inArray(data.id, businessProcessesModel.Topbar.GetActive()) !== -1;
        if ($.address.value() === '/' && !isActive) {
            self.SetCurrentActive();
        }
        searchPageHandler.ClearAllSelectedRows();
        searchQueryModel.Search();
    };

    self.SetCurrentActive = function () {
        var currentActiveList = {},
            currentBusinessProcesses = WC.Utility.ToArray(userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_BUSINESS_PROCESSES));
        jQuery.each(businessProcessesModel.Topbar.Data(), function (k, v) {
            if (jQuery.inArray(v.id, currentBusinessProcesses) !== -1)
                currentActiveList[v.id] = true;
            else
                currentActiveList[v.id] = false;
        });
        businessProcessesModel.Topbar.CurrentActive(currentActiveList);
    };
}
