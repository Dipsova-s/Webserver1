function DashboardSaveAsHandler(dashboardPageHandler, dashboardModel) {
    "use strict";

    var self = this;
    self.DashboardPageHandler = dashboardPageHandler;
    self.DashboardModel = dashboardModel;
    self.ItemSaveAsHandler = new ItemSaveAsHandler();

    self.Initial = function () {
        self.ItemSaveAsHandler.SetData(self.DashboardModel.GetData().multi_lang_name, true);

        // override
        self.ItemSaveAsHandler.Save = jQuery.proxy(self.Save, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.SaveDone = jQuery.proxy(self.SaveDone, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.SaveFail = jQuery.proxy(self.SaveFail, self.ItemSaveAsHandler);
    };
    self.ShowPopup = function () {
        self.ItemSaveAsHandler.ShowPopup(Localization.SaveAsDashboard);
    };
    self.GetSaveData = function () {
        var data = jQuery.extend(self.DashboardPageHandler.CloneData(), self.ItemSaveAsHandler.GetData());
        var languages = jQuery.map(data.multi_lang_name, function (name) { return name.lang; });
        data.multi_lang_description = self.ItemSaveAsHandler.GetLanguages(data.multi_lang_description, languages);
        return data;
    };
    self.Save = function () {
        var data = self.GetSaveData();
        self.ItemSaveAsHandler.ShowProgressbar();
        self.DashboardModel.SaveAsDashboard(data)
            .done(function (dashboard) {
                self.DashboardPageHandler.QueryDefinitionHandler.ForcedSetData = true;
                self.DashboardModel.SetData(dashboard);
                self.SaveDone(dashboard);
            }).fail(self.SaveFail);
    };
    self.SaveDone = function (dashboard) {
        self.ItemSaveAsHandler.ClosePopup();
        toast.MakeSuccessTextFormatting(self.DashboardPageHandler.GetName(), Localization.Toast_SaveItem);
        self.ItemSaveAsHandler.Redirect(dashboard);
    };
    self.SaveFail = function () {
        self.ItemSaveAsHandler.HideProgressbar();
    };

    // constructor
    self.Initial();
}