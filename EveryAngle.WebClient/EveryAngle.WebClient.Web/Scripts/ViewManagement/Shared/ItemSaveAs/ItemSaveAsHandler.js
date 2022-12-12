function ItemSaveAsHandler() {
    "use strict";

    var _self = {};
    _self.names = {};
    _self.maxLength = 255;
    _self.copyText = ' (copy)';

    // elements
    _self.$container = jQuery();
    _self.$language = null;
    _self.$name = jQuery();

    var self = this;
    self.Language = null;
    self.View = new ItemSaveAsView();
    self.StateHandler = new ItemStateHandler();

    self.SetData = function (names, appendCopy) {
        jQuery.each(names, function (index, name) {
            _self.names[name.lang] = self.GetName(name.text, appendCopy);
        });
    };
    self.GetData = function () {
        var data = {
            multi_lang_name: []
        };
        jQuery.each(_self.names, function (language, name) {
            data.multi_lang_name.push({
                lang: language,
                text: name.substr(0, 255)
            });
        });
        return data;
    };
    self.GetName = function (name, appendCopy) {
        return !appendCopy || !name ? name : name.substr(0, _self.maxLength - _self.copyText.length) + _self.copyText;
    };
    self.ShowPopup = function (title) {
        var options = self.GetPopupOptions(title);
        popup.Show(options);
    };
    self.GetPopupOptions = function (title) {
        var self = this;
        return {
            element: '#PopupSaveAs',
            title: title,
            html: self.View.GetTemplate(),
            className: 'save-as-popup',
            actions: ['Close'],
            width: 500,
            height: 'auto',
            minWidth: 500,
            minHeight: 100,
            scrollable: false,
            resizable: false,
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    position: 'right',
                    click: 'close',
                    isSecondary: true
                },
                {
                    text: Localization.Ok,
                    position: 'right',
                    isPrimary: true,
                    className: 'btn-save executing',
                    attr: {
                        'data-busy': Localization.Saving
                    },
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj) && self.Validation())
                            self.Save();
                    }
                }
            ],
            open: self.ShowPopupCallback,
            close: popup.Destroy
        };
    };
    self.ShowPopupForInvalidBP = function (title) {
        const options = self.GetPopupOptionForInvalidBusinessProcess(title);
        popup.Show(options);
    };
    self.GetPopupOptionForInvalidBusinessProcess = function (title) {
        const self = this;
        const handle = '#' + 'AngleSavingWrapper';
        return {
            element: '#PopupSaveAs',
            title: title,
            html: self.View.GetTemplateForInvalidBP(),
            className: 'save-as-popup',
            actions: ['Close'],
            width: 350,
            height: 'auto',
            minWidth: 350,
            minHeight: 100,
            scrollable: false,
            resizable: false,
            center: false,
            draggable: false,
            resize: jQuery.proxy(self.StateHandler.OnPopupResized, self, handle),
            buttons: [
                {
                    text: Localization.FollowupsRightText,
                    position: 'right',
                    isPrimary: true,
                    className: 'btn-save executing',
                    attr: {
                        'data-busy': Localization.Saving
                    },
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj) && self.Validation())
                            self.Save();
                    }
                }
            ],
            open: self.ShowPopupCallback,
            close: popup.Destroy
        };
    };
    self.ShowPopupCallback = function (e) {
        _self.$container = e.sender.element;
        _self.$container.busyIndicator(true);
        systemLanguageHandler.LoadLanguages()
            .done(jQuery.proxy(self.InitialUI, self, _self.$container))
            .always(function () {
                _self.$container.busyIndicator(false);
                e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
            });
    };
    self.ClosePopup = function () {
        popup.Close('#PopupSaveAs');
    };
    self.InitialLanguages = function (container) {
        var element = container.find('.languages');
        var values = jQuery.map(_self.names, function (value, key) { return key; });
        _self.$language = WC.HtmlHelper.MultiSelect(element, {
            __init: false,
            data: systemLanguageHandler.GetEnableLanguages(),
            value: values,
            min: 1,
            render: self.LanguagesRender,
            change: self.LanguagesChange
        });
        _self.$language.settings.__init = true;

        // set custom stuff
        element.find('.multiple-select-button').attr({
            'data-role': 'tooltip',
            'data-tooltip-position': 'bottom',
            'data-tooltip-text': Localization.AddLanguage
        });
        element.off('click.set-active').on('click.set-active', '.multiple-select-item', function (e) {
            var target = jQuery(e.target);
            if (!target.hasClass('icon') && !target.hasClass('btn-remove')) {
                self.SetActive(jQuery(e.currentTarget).data('id'));
            }
        });

        // set default active
        self.SetDefaultActive();
    };
    self.LanguagesRender = function (where, item, itemElement) {
        itemElement.attr('data-id', item.id);
        if (where === 'value')
            itemElement.addClass('item-label-light');
    };
    self.LanguagesChange = function (what, item, itemElement) {
        if (!this.settings.__init)
            return;

        if (what === 'add') {
            _self.names[item.id] = '';
            self.SetActive(item.id);
            _self.$name.removeClass('invalid');
        }
        else {
            delete _self.names[item.id];

            if (itemElement.hasClass('active'))
                self.SetDefaultActive();
        }
    };
    self.InitialUI = function (container) {
        self.InitialNames(container);
        self.InitialLanguages(container);
        self.InitialWarningText(container);
    };
    self.InitialWarningText = function (container) {
        var warningElement = container.find('.row-warning');
        var warningText = self.GetWarningText();
        container.find('.warning-text').text(warningText);
        if (warningText)
            warningElement.removeClass('always-hide');
        else
            warningElement.addClass('always-hide');
    };
    self.GetWarningText = jQuery.noop;
    self.InitialNames = function (container) {
        _self.$name = container.find('.name');
        _self.$name
            .off('keyup.validation').on('keyup.validation', function () {
                var element = jQuery(this);
                if (!jQuery.trim(element.val()))
                    element.addClass('invalid');
                else
                    element.removeClass('invalid');
            })
            .off('change').on('change', function () {
                _self.names[self.Language] = jQuery.trim(jQuery(this).val());
            });
    };
    self.SetDefaultActive = function () {
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        if (typeof _self.names[defaultLanguage] !== 'undefined')
            self.SetActive(defaultLanguage);
        else
            self.SetActive(_self.$container.find('.multiple-select-item:eq(0)').data('id'));
    };
    self.SetActive = function (language) {
        self.Language = language;

        // set active
        _self.$container.find('.multiple-select-item[data-id=' + self.Language + ']').addClass('active')
            .siblings('.multiple-select-item').removeClass('active');

        // set name
        _self.$name.val(WC.Utility.ToString(_self.names[self.Language]));
        _self.$name.trigger('keyup.validation');

        // set focus name
        WC.HtmlHelper.SetFocusInput(_self.$name.get(0));
    };
    self.Validation = function () {
        var valid = true;
        _self.$name.removeClass('invalid');
        jQuery.each(_self.names, function (language, name) {
            if (!name) {
                self.SetActive(language);
                valid = false;
                return false;
            }
        });
        return valid;
    };
    self.GetLanguages = function (data, languages) {
        for (var i = data.length - 1; i >= 0; i--) {
            if (jQuery.inArray(data[i].lang, languages) === -1) {
                // remove
                data.splice(i, 1);
            }
        }
        return data;
    };
    self.Save = jQuery.noop;
    self.SaveDone = jQuery.noop;
    self.SaveFail = jQuery.noop;
    self.Redirect = jQuery.noop;
    self.ShowProgressbar = function () {
        _self.$container.closest('.k-window').find('.btn-save').addClass('btn-busy');
        _self.$container.busyIndicator(true);
        _self.$container.find('.k-loading-mask').addClass('k-loading-none');
    };
    self.HideProgressbar = function () {
        _self.$container.closest('.k-window').find('.btn-save').removeClass('btn-busy');
        _self.$container.busyIndicator(false);
    };
}