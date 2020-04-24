function AngleSaveAsHandler(angleHandler, displayHandler) {
    "use strict";

    var self = this;
    self.AngleHandler = angleHandler;
    self.DisplayHandler = displayHandler;
    self.ItemSaveAsHandler = new ItemSaveAsHandler();

    self.Initial = function () {
        self.ItemSaveAsHandler.SetData(self.AngleHandler.Data().multi_lang_name, true);

        // override
        self.ItemSaveAsHandler.Save = jQuery.proxy(self.Save, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.SaveDone = jQuery.proxy(self.SaveDone, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.SaveFail = jQuery.proxy(self.SaveFail, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.GetWarningText = self.GetWarningText;
    };
    self.ShowPopup = function () {
        self.ItemSaveAsHandler.ShowPopup(Localization.SaveAngleAs);
    };
    self.GetWarningText = function () {
        var validationResult = self.AngleHandler.GetValidationResult();
        if (!validationResult.Valid)
            return Localization.Info_SaveAsAngleWarning;

        var hasInvalid = false;
        jQuery.each(self.AngleHandler.Displays, function (index, display) {
            if (!display.GetValidationResult().Valid) {
                hasInvalid = true;
                return false;
            }
        });
        return hasInvalid ? Localization.Info_SaveAsAngleWarning : '';
    };
    self.GetSaveData = function () {
        var data = jQuery.extend(self.AngleHandler.CloneData(), self.ItemSaveAsHandler.GetData());
        var languages = jQuery.map(data.multi_lang_name, function (name) { return name.lang; });
        data.multi_lang_description = self.ItemSaveAsHandler.GetLanguages(data.multi_lang_description, languages);
        return data;
    };
    self.Save = function () {
        var data = self.GetSaveData();
        var displayId = self.GetCurrentDisplayId(data);
        self.ItemSaveAsHandler.ShowProgressbar();
        self.AngleHandler.CreateNew(data, jQuery.proxy(self.SaveDone, self, displayId), self.SaveFail);
    };
    self.GetCurrentDisplayId = function (data) {
        var displayUri = self.DisplayHandler.Data().uri;
        var currentDisplay = data.display_definitions.findObject('uri', displayUri);
        return currentDisplay ? currentDisplay.id : null;
    };
    self.SaveDone = function (displayId) {
        self.ItemSaveAsHandler.ClosePopup();
        toast.MakeSuccessTextFormatting(self.AngleHandler.GetName(), Localization.Toast_SaveItem);
        self.ItemSaveAsHandler.Redirect(displayId);
    };
    self.SaveFail = function () {
        self.ItemSaveAsHandler.HideProgressbar();
    };

    // constructor
    self.Initial();
}