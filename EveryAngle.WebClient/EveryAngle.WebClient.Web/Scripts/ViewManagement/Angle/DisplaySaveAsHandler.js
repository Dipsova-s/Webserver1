function DisplaySaveAsHandler(angleHandler, displayHandler) {
    "use strict";

    var _self = {};
    _self.angleNames = {};

    // elements
    _self.$angleName = jQuery();

    var self = this;
    self.NewAngle = false;
    self.AngleHandler = angleHandler;
    self.DisplayHandler = displayHandler;
    self.ItemSaveAsHandler = new ItemSaveAsHandler();

    self.Initial = function () {
        jQuery.each(self.AngleHandler.Data().multi_lang_name, function (index, name) {
            _self.angleNames[name.lang] = self.ItemSaveAsHandler.GetName(name.text, !self.AngleHandler.IsAdhoc());
        });
        self.ItemSaveAsHandler.SetData(self.DisplayHandler.Data().multi_lang_name, !self.DisplayHandler.IsAdhoc());

        // override
        self.ItemSaveAsHandler.Save = jQuery.proxy(self.Save, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.SaveDone = jQuery.proxy(self.SaveDone, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.SaveFail = jQuery.proxy(self.SaveFail, self.ItemSaveAsHandler);
        self.ItemSaveAsHandler.__GetPopupOptions = self.ItemSaveAsHandler.GetPopupOptions;
        self.ItemSaveAsHandler.GetPopupOptions = self.GetPopupOptions;
        self.ItemSaveAsHandler.__InitialUI = self.ItemSaveAsHandler.InitialUI;
        self.ItemSaveAsHandler.InitialUI = self.InitialUI;
        self.ItemSaveAsHandler.GetWarningText = self.GetWarningText;
        self.ItemSaveAsHandler.__SetActive = self.ItemSaveAsHandler.SetActive;
        self.ItemSaveAsHandler.SetActive = self.SetActive;
        self.ItemSaveAsHandler.__Validation = self.ItemSaveAsHandler.Validation;
        self.ItemSaveAsHandler.Validation = self.Validation;
    };
    self.ShowPopup = function () {
        self.AngleHandler.AngleLabelHandler.Validate(false) ? self.ItemSaveAsHandler.ShowPopup(Localization.SaveAs) : self.ItemSaveAsHandler.ShowPopupForInvalidBP(Localization.SaveAs);
    };
    self.GetPopupOptions = function (title) {
        var options = self.ItemSaveAsHandler.__GetPopupOptions(title);
        options.html = self.ItemSaveAsHandler.View.GetDisplayTemplate();
        return options;
    };
    self.InitialUI = function (container) {
        // checkbox new angle
        self.InitialNewAngleOption(container);

        // angle name
        self.InitialAngleNames(container);

        // call here because _self.$angleName is required
        self.ItemSaveAsHandler.__InitialUI(container);
    };
    self.InitialNewAngleOption = function (container) {
        // cannot create a new Angle
        if (!self.AngleHandler.CanCreate())
            return;

        var rowNewAngle = container.find('.row-add-new');
        rowNewAngle.removeClass('always-hide');

        var chkNewAngle = container.find('.chk-new-angle');
        chkNewAngle.prop('disabled', false);
        chkNewAngle.prop('checked', false);
        chkNewAngle.off('change').on('change', jQuery.proxy(self.UpdateNewAngleOption, self, container));

        // adhoc Angle
        var infoElement = container.find('.info-text');
        infoElement.addClass('always-hide');
        if (self.AngleHandler.IsAdhoc()) {
            chkNewAngle.prop('disabled', true);
            chkNewAngle.prop('checked', true);
            infoElement.removeClass('always-hide');
        }
        chkNewAngle.trigger('change');
    };
    self.UpdateNewAngleOption = function (container) {
        var chkNewAngle = container.find('.chk-new-angle');
        self.NewAngle = chkNewAngle.prop('checked');
        if (self.NewAngle)
            container.find('.row-new-angle').removeClass('always-hide');
        else
            container.find('.row-new-angle').addClass('always-hide');
    };
    self.InitialAngleNames = function (container) {
        // angle name
        _self.$angleName = container.find('.angle-name');
        _self.$angleName
            .off('keyup.validation').on('keyup.validation', function () {
                var element = jQuery(this);
                if (!jQuery.trim(element.val()))
                    element.addClass('invalid');
                else
                    element.removeClass('invalid');
            })
            .off('change').on('change', function () {
                _self.angleNames[self.ItemSaveAsHandler.Language] = jQuery.trim(jQuery(this).val());
            });
    };
    self.GetWarningText = function () {
        var validationResult = self.DisplayHandler.GetValidationResult();
        return validationResult.Valid ? '' : Localization.Info_SaveAsDisplayWarning;
    };
    self.SetActive = function (language) {
        self.ItemSaveAsHandler.__SetActive(language);

        // set Angle name
        _self.$angleName.val(WC.Utility.ToString(_self.angleNames[language]));
        _self.$angleName.trigger('keyup.validation');
    };
    self.Validation = function () {
        var valid = self.ItemSaveAsHandler.__Validation();
        if (valid && self.NewAngle) {
            // check Angle name
            _self.$angleName.removeClass('invalid');
            var names = self.GetAngleData().multi_lang_name;
            jQuery.each(names, function (index, name) {
                if (!_self.angleNames[name.lang]) {
                    self.SetActive(name.lang);
                    valid = false;
                    return false;
                }
            });
        }
        return valid;
    };
    self.GetAngleData = function () {
        var data = {
            multi_lang_name: []
        };
        var names = self.ItemSaveAsHandler.GetData().multi_lang_name;
        jQuery.each(names, function (index, name) {
            data.multi_lang_name.push({
                lang: name.lang,
                text: WC.Utility.ToString(_self.angleNames[name.lang]).substr(0, 255)
            });
        });
        return data;
    };
    self.GetSaveData = function () {
        var data = jQuery.extend(self.DisplayHandler.CloneData(), self.ItemSaveAsHandler.GetData());
        var languages = jQuery.map(data.multi_lang_name, function (name) { return name.lang; });
        data.multi_lang_description = self.ItemSaveAsHandler.GetLanguages(data.multi_lang_description, languages);
        return data;
    };
    self.GetSaveAngleData = function (display) {
        var languages = jQuery.map(display.multi_lang_name, function (name) { return name.lang; });
        var data = jQuery.extend(self.AngleHandler.CloneData(), self.GetAngleData());
        data.multi_lang_description = self.ItemSaveAsHandler.GetLanguages(data.multi_lang_description, languages);
        data.angle_default_display = display.id;
        data.display_definitions = [display];
        return data;
    };
    self.Save = function () {
        if (!self.AngleHandler.Validate(true))
            return;

        var data = self.GetSaveData();
        self.ItemSaveAsHandler.ShowProgressbar();
        if (!self.NewAngle) {
            // save Display as
            var handler;
            if (self.DisplayHandler.IsAdhoc()) {
                handler = self.DisplayHandler;
            }
            else {
                handler = new DisplayHandler(data, self.AngleHandler);
                var originalData = self.DisplayHandler.GetRawData();
                var isAngleDefaultChanged = originalData.is_angle_default !== self.DisplayHandler.Data().is_angle_default();
                var isPersonalDefaultChanged = originalData.user_specific.is_user_default !== self.DisplayHandler.Data().user_specific.is_user_default();
                self.DisplayHandler.ForceInitial(originalData);
                self.SetAngleDefaultDisplay(isAngleDefaultChanged);
                self.SetPersonalDefaultDisplay(isPersonalDefaultChanged);
            }
            handler.CreateNew(data, self.SaveDone, self.SaveFail);
        }
        else {
            // save Angle as with this Display
            var angle = self.GetSaveAngleData(data);
            self.AngleHandler.CreateNew(angle, jQuery.proxy(self.SaveAngleDone, self, data.id), self.SaveFail);
        }
    };
    self.GetAngleDefaultDisplay = function () {
        var data = '';
        jQuery.each(self.AngleHandler.Displays, function (index, display) {
            var raw = display.GetRawData();
            if (raw && raw.is_angle_default) {
                data = display;
                return false;
            }
        });
        return data;
    };
    self.SetAngleDefaultDisplay = function (isAngleDefaultChanged) {
        // don't revert if no changes
        if (!isAngleDefaultChanged)
            return;

        //revert it
        var angleDefaultDisplay = self.GetAngleDefaultDisplay();
        if (angleDefaultDisplay) {
            angleDefaultDisplay.Data().is_angle_default(true);
            angleDefaultDisplay.SetAngleDefault();
        }
    };
    self.GetPersonalDefaultDisplay = function () {
        var data = '';
        jQuery.each(self.AngleHandler.Displays, function (index, display) {
            var raw = display.GetRawData();
            if (raw && raw.user_specific.is_user_default) {
                data = display;
                return false;
            }
        });
        return data;
    };
    self.SetPersonalDefaultDisplay = function (isPersonalDefaultChanged) {
        // don't revert if no changes
        if (!isPersonalDefaultChanged)
            return;

        var personalDisplay = self.GetPersonalDefaultDisplay();
        if (personalDisplay) {
            personalDisplay.Data().user_specific.is_user_default(true);
            personalDisplay.SetUserDefault();
        }
    }
    self.SaveDone = function (display) {
        if (!self.AngleHandler.GetDisplay(display.uri))
            self.AngleHandler.AddDisplay(display, null, false);
        self.ItemSaveAsHandler.ClosePopup();
        var displayHandler = new DisplayHandler(display, self.AngleHandler);
        toast.MakeSuccessTextFormatting(displayHandler.GetName(), Localization.Toast_SaveItem);
        self.ItemSaveAsHandler.Redirect(display.id);
    };
    self.SaveAngleDone = function (displayId) {
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