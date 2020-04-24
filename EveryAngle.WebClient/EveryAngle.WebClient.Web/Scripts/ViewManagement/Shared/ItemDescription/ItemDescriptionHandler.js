function ItemDescriptionHandler() {
    "use strict";

    var _self = {};
    _self.readonly = true;
    _self.language = '';
    _self.names = {};
    _self.canEditId = false;
    _self.itemid = '';
    _self.descriptions = {};

    // elements
    _self.$container = jQuery();
    _self.$language = null;
    _self.$name = jQuery();
    _self.$editor = null;
    _self.$itemid = jQuery();

    var self = this;
    self.View = new ItemDescriptionView();
    self.Initial = function (id, names, descriptions) {
        self.SetData(id, names, descriptions);
    };
    self.SetReadOnly = function (readonly) {
        _self.readonly = readonly;
    };
    self.ShowEditPopup = function (title) {
        var popupSettings = self.GetEditPopupOptions(title);
        popup.Show(popupSettings);
    };
    self.GetEditPopupOptions = function (title) {
        return {
            element: '#PopupDescriptionEditor',
            title: title,
            html: self.View.GetEditTemplate(),
            className: 'description-editor-popup',
            width: 830,
            height: 530,
            minWidth: 750,
            minHeight: 400,
            scrollable: false,
            buttons: [
                {
                    text: Localization.Save,
                    position: 'right',
                    isPrimary: true,
                    className: 'btn-save executing' + (_self.readonly ? ' disabled' : ''),
                    attr: {
                        'data-busy': Localization.Saving
                    },
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj) && self.Validation())
                            self.Save();
                    }
                }
            ],
            resize: self.ShowEditPopupResize,
            open: self.ShowEditPopupCallback,
            close: popup.Destroy
        };
    };
    self.ShowEditPopupCallback = function (e) {
        _self.$container = e.sender.element;
        _self.$container.busyIndicator(true);
        systemLanguageHandler.LoadLanguages()
            .done(function () {
                self.InitialNames(_self.$container);
                self.InitialDescriptions(_self.$container);
                self.InitialLanguages(_self.$container);
            })
            .always(function () {
                _self.$container.busyIndicator(false);
                e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
                self.ShowEditPopupResize();
            });
        self.InitialItemID(_self.$container);
    };
    self.ShowEditPopupResize = function () {
        if (!_self.$editor)
            return;

        var popupHeight = _self.$container.height();
        var siblingsHeight = _self.$editor.wrapper.closest('.form-row').siblings().map(function () {
            return jQuery(this).outerHeight();
        }).get().sum();
        var editorHeight = popupHeight - siblingsHeight - 5;
        var editorToolbarHeight = _self.$editor.wrapper.find('.k-editor-toolbar').height();
        _self.$editor.wrapper.next('.k-editor-disabled').height(editorToolbarHeight + 25);
        _self.$editor.wrapper.height(editorHeight);
        _self.$editor.wrapper.find('.k-editable-area').height('100%');
        if (_self.$editor.wrapper.height() > editorHeight) {
            _self.$editor.wrapper.find('.k-editable-area').height(Math.max(55, editorHeight - editorToolbarHeight - 18));
        }
    };
    self.CloseEditPopup = function () {
        popup.Close('#PopupDescriptionEditor');
    };
    self.InitialLanguages = function (container) {
        var element = container.find('.languages');
        var values = jQuery.map(_self.names, function (value, key) { return key; });
        _self.$language = WC.HtmlHelper.MultiSelect(element, {
            __init: false,
            data: systemLanguageHandler.GetEnableLanguages(),
            value: values,
            min: 1,
            readonly: _self.readonly,
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
            _self.descriptions[item.id] = '';
            self.SetActive(item.id);
            _self.$name.removeClass('invalid');
        }
        else {
            delete _self.names[item.id];
            delete _self.descriptions[item.id];

            if (itemElement.hasClass('active'))
                self.SetDefaultActive();
        }
    };
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
                _self.names[_self.language] = jQuery.trim(jQuery(this).val());
            });
        if (_self.readonly)
            _self.$name.prop('disabled', true);
    };
    self.InitialDescriptions = function (container) {
        _self.$editor = WC.HtmlHelper.Editor(container.find('.description'), {
            change: function (e) {
                _self.descriptions[_self.language] = jQuery.trim(e.sender.value());
            }
        });
        jQuery(_self.$editor.body)
            .addClass('scrollable editor-body')
            .off('click.editor')
            .on('click.editor', function () {
                _self.$language.hideList();
            });

        if (_self.readonly) {
            _self.$editor.wrapper.after('<div class="k-editor-disabled k-state-disabled" />');
            jQuery(_self.$editor.body).removeAttr('contenteditable')
                .find('a').off('click.readonly').on('click.readonly', false);
        }
    };
    self.SetDefaultActive = function () {
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        if (typeof _self.names[defaultLanguage] !== 'undefined')
            self.SetActive(defaultLanguage);
        else
            self.SetActive(_self.$container.find('.multiple-select-item:eq(0)').data('id'));
    };
    self.SetActive = function (language) {
        _self.language = language;

        // set active
        _self.$container.find('.multiple-select-item[data-id=' + _self.language + ']').addClass('active')
            .siblings('.multiple-select-item').removeClass('active');

        // set name
        _self.$name.val(WC.Utility.ToString(_self.names[_self.language]));
        _self.$name.trigger('keyup.validation');

        // set description
        _self.$editor.value(WC.Utility.ToString(_self.descriptions[_self.language]));

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

        return valid && self.ValidateItemID();
    };
    self.SetData = function (id, names, descriptions) {
        jQuery.each(names, function (index, name) {
            _self.names[name.lang] = name.text;
            if (!_self.descriptions[name.lang])
                _self.descriptions[name.lang] = '';
        });
        jQuery.each(descriptions, function (index, description) {
            _self.descriptions[description.lang] = description.text;
            if (!_self.names[description.lang])
                _self.names[description.lang] = '';
        });
        _self.itemid = id;
    };
    self.GetData = function () {
        var data = {
            multi_lang_name: [],
            multi_lang_description: []
        };
        jQuery.each(_self.names, function (language, name) {
            data.multi_lang_name.push({
                lang: language,
                text: name.substr(0, 255)
            });
            data.multi_lang_description.push({
                lang: language,
                text: _self.descriptions[language]
            });
        });
        data.id = _self.itemid;
        return data;
    };
    self.ShowProgressbar = function () {
        _self.$container.closest('.k-window').find('.btn-save').addClass('btn-busy');
        _self.$container.busyIndicator(true);
        _self.$container.find('.k-loading-mask').addClass('k-loading-none');
    };
    self.HideProgressbar = function () {
        _self.$container.closest('.k-window').find('.btn-save').removeClass('btn-busy');
        _self.$container.busyIndicator(false);
    };
    self.Save = jQuery.noop;

    /*Item id textbox*/
    self.CanEditId = function (canEditId) {
        _self.canEditId = canEditId;
    };
    self.InitialItemID = function (container) {
        _self.$itemid = container.find('.item-id');
        if (_self.canEditId) {
            _self.$itemid.val(_self.itemid);
            _self.$itemid
                .off('keyup.validation').on('keyup.validation', function () {
                    var element = jQuery(this);
                    if (!jQuery.trim(element.val()) || !(/^[a-z,_](\w*)$/i.test(element.val())))
                        element.addClass('invalid');
                    else
                        element.removeClass('invalid');
                })
                .off('change').on('change', function () {
                    _self.itemid = jQuery.trim(jQuery(this).val());
                });
            if (_self.readonly)
                _self.$itemid.prop('disabled', true);
        }
        else {
            _self.$itemid.closest('.form-row').remove();
        }
    };
    self.ValidateItemID = function () {
        var valid = true;
        //id
        if (_self.canEditId) {
            _self.$itemid.removeClass('invalid');
            if (!jQuery.trim(_self.itemid) || !(/^[a-z,_](\w*)$/i.test(_self.itemid))) {
                _self.$itemid.trigger('keyup.validation');
                return false;
            }
        }
        return valid;
    };
}