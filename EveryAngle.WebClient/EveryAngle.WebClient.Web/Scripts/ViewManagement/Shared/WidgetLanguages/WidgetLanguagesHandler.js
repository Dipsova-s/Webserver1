function WidgetLanguagesHandler(container, multiLangNames, multiLangDescriptions) {
    "use strict";

    var self = this;
    self.Identity = 'WidgetLanguagesHandler';
    self.Element = jQuery(container);
    self.ElementName = null;
    self.ElementDescription = null;
    self.EditorDescription = null;
    self.ShowDescription = ko.observable(true);
    self.AutoUpdateToModel = ko.observable(false);
    self.LanguageSetSelectCallback = jQuery.noop;
    self.LanguageAddCallback = jQuery.noop;
    self.LanguageDeleteCallback = jQuery.noop;
    self.Model = null;
    self.Labels = {
        HeaderLanguage: Localization.Description,
        LabelLanguageSelector: Localization.Language,
        LabelLanguageName: Localization.AngleName
    };
    self.View = new WidgetLanguagesView();
    self.Languages = {
        Selected: ko.observable({}),
        List: ko.observableArray([])
    };
    self.MultiLangNamesModel = WC.Utility.ToArray(multiLangNames).slice();
    self.MultiLangDescriptionsModel = WC.Utility.ToArray(multiLangDescriptions).slice();

    self.ApplyHandler = function (template) {
        if (typeof template === 'undefined') {
            template = self.View.Template;
        }
        self.Element.html(template);

        self.InitialElements();
        self.PrepareLanguages();

        var currentBinding = ko.dataFor(self.Element.get(0));
        if (!currentBinding || currentBinding.Identity !== self.Identity) {
            var bindingTarget = self.Element.find('.widgetLanguagesWrapper');
            if (!bindingTarget.length) {
                bindingTarget = self.Element;
            }
            ko.applyBindings(self, bindingTarget.get(0));
        }
    };
    self.CanChangeLanguage = function () {
        return true;
    };
    self.SetEditorReadOnly = function (readonly) {
        if (self.EditorDescription) {
            self.EditorDescription.wrapper.next('.k-editor-disabled').remove();

            var editorBody = jQuery(self.EditorDescription.body);
            if (readonly) {
                self.EditorDescription.wrapper.after('<div class="k-editor-disabled k-state-disabled" />');
                editorBody.removeAttr('contenteditable').find('a').off('click.readonly').on('click.readonly', false);
            }
            else {
                editorBody.attr('contenteditable', true).find('a').off('click.readonly');
            }
        }
    };
    self.SetEditorHeight = function (editorHeight) {
        if (self.EditorDescription) {
            var editorToolbarHeight = self.EditorDescription.wrapper.find('.k-editor-toolbar-wrap').height();
            self.EditorDescription.wrapper.next('.k-editor-disabled').height(editorToolbarHeight + 10);
            self.EditorDescription.wrapper.height(editorHeight);
            if (self.EditorDescription.wrapper.height() > editorHeight) {
                self.EditorDescription.wrapper.find('.k-editable-area').height(Math.max(55, editorHeight - editorToolbarHeight - 18));
            }
        }
    };
    self.RefreshEditor = function () {
        if (self.EditorDescription) {
            var readonly = !jQuery(self.EditorDescription.body).attr('contenteditable');
            var editorBody = jQuery(self.EditorDescription.body);
            editorBody.add(editorBody.parent()).css('min-height', 'auto');
            setTimeout(function () {
                editorBody.add(editorBody.parent()).css('min-height', '');
            }, 10);
            self.SetEditorReadOnly(readonly);
        }
    };
    self.InitialElements = function () {
        self.ElementName = self.Element.find('.languageName')
                                .off('keyup.validator')
                                .on('keyup.validator', function () {
                                    jQuery(this).removeClass('k-invalid');
                                });
        self.ElementDescription = self.Element.find('.languageDescription');

        // description
        if (self.ElementDescription.length) {
            if (self.ShowDescription()) {
                var createEditor = function () {
                    self.EditorDescription = WC.HtmlHelper.Editor(self.ElementDescription, {
                        change: function (e) {
                            self.Languages.Selected().language_description(e.sender.value());
                        }
                    });
                };
                try {
                    createEditor();
                }
                catch (ex) {
                    createEditor();
                }

                self.EditorDescription.wrapper.find('iframe')
                    .contents().off('click.language_description')
                    .on('clic.language_description', function () {
                        jQuery(document).trigger('click.outside');
                    });

                self.SetEditorReadOnly(!self.CanChangeLanguage());
            }
            else {
                self.ElementDescription
                    .off('change.language_description')
                    .on('change.language_description', function () {
                        self.Languages.Selected().language_description(self.ElementDescription.val());
					})
					.closest('.row')
						.hide();
            }
        }
        else {
            self.EditorDescription = null;
        }
    };
    self.PrepareLanguages = function () {
        if (self.AutoUpdateToModel() && !self.Model) {
            self.AutoUpdateToModel(false);
        }
        self.Languages.Selected({});
        self.Languages.List.removeAll();
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        var langIndex, descriptionIndex, i = 0;

        /* M4-12354: Fixed angle/display languages to not depend on model's languages */
        jQuery.each(systemLanguageHandler.GetEnableLanguages(), function (index, value) {
            langIndex = self.MultiLangNamesModel.indexOfObject('lang', value.id);
            descriptionIndex = self.MultiLangDescriptionsModel.indexOfObject('lang', value.id);

            var modelLanguage = {
                id: value.id,
                name: value.name
            };

            // language_name + is_selected
            if (langIndex === -1) {
                modelLanguage.language_name = ko.observable('');
                modelLanguage.is_selected = ko.observable(false);
            }
            else {
                modelLanguage.language_name = ko.observable(self.MultiLangNamesModel[langIndex].text || '');
                modelLanguage.is_selected = ko.observable(true);
            }

            // language_description
            if (descriptionIndex === -1) {
                modelLanguage.language_description = ko.observable('');
            }
            else {
                modelLanguage.language_description = ko.observable(self.MultiLangDescriptionsModel[descriptionIndex].text || '');
            }
            self.Languages.List.push(modelLanguage);

            if (self.AutoUpdateToModel()) {
                self.Languages.List()[i].language_name.subscribe(function () {
                    var dataModel = self.Model.multi_lang_name().findObject('lang', this.id, false);
                    if (dataModel) {
                        dataModel.text = this.language_name();
                    }
                }, self.Languages.List()[i]);

                self.Languages.List()[i].language_description.subscribe(function () {
                    var dataModel = self.Model.multi_lang_description().findObject('lang', this.id, false);
                    if (dataModel) {
                        dataModel.text = this.language_description();
                    }
                }, self.Languages.List()[i]);
            }

            if (langIndex !== -1 && (!self.Languages.Selected().id || value.id.toLowerCase() === defaultLanguage)) {
                self.LanguageSetSelect(self.Languages.List()[i]);
            }
            i++;
        });

        if (self.Languages.List().length > 0) {
            self.Languages.List().sort(function (a, b) {
                return a.id - b.id || a.name.localeCompare(b.name);
            });
        }
    };
    self.LaguagesToggleAvailable = function (model, event) {
        var element = jQuery(event.currentTarget);
        var elementTarget = element.next();
        var containerWidth = self.Element.find('.languageWrapper').width();

        if (elementTarget.is(':hidden')) {
            var elementTargetWidth = elementTarget.width();
            var position = element.position();
            if (position.left + elementTargetWidth > containerWidth) {
                position.left -= (elementTargetWidth - element.width());
            }
            position.top += (element.height() + 1);
            elementTarget.show().css(position);
        }
        else {
            elementTarget.hide();
        }
    };
    self.LanguageSetSelect = function (model, event) {
        if (!model)
            return;

        self.Languages.Selected(model);

        if (self.EditorDescription)
            self.EditorDescription.value(model.language_description());

        if (self.ElementName.length) {
            self.ElementName.val(model.language_name());
            self.ElementName.removeClass('k-invalid');

            if (event)
                self.LanguageNameFocus();
        }

        self.LanguageSetSelectCallback(model);
    };
    self.LanguageAdd = function (model, event) {
        jQuery(event.currentTarget).parent().parent().hide();

        model.is_selected(true);

        self.LanguageAddCallback(model);
        self.LanguageSetSelect(model, {});

        if (self.AutoUpdateToModel()) {
            self.Model.multi_lang_name.push({
                lang: model.id,
                text: model.language_name()
            });

            self.Model.multi_lang_description.push({
                lang: model.id,
                text: model.language_description()
            });
        }
    };
    self.LanguageDelete = function (model, event) {
        model.is_selected(false);

        self.LanguageDeleteCallback(model);
        if (model.id === self.Languages.Selected().id) {
            var firstCurrentIndex = ko.toJS(self.Languages.List()).indexOfObject('is_selected', true);
            if (firstCurrentIndex !== -1)
                self.LanguageSetSelect(self.Languages.List()[firstCurrentIndex], {});
        }

        if (self.AutoUpdateToModel()) {
            self.Model.multi_lang_name.remove(function (dataModel) { return dataModel.lang === model.id; });
            self.Model.multi_lang_description.remove(function (dataModel) { return dataModel.lang === model.id; });
        }

        
    };
    self.LanguageNameFocus = function () {
        if (!jQuery.browser.mozilla) {
            try {
                // prevent error in IE
                self.ElementName[0].selectionStart = 0;
                self.ElementName[0].selectionEnd = 0;
            }
            catch (ex) {
                // do nothing
            }
        }
        self.ElementName[0].focus();
    };
}
