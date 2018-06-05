function WidgetLanguagesView() {
    "use strict";

    var self = this;

    self.Template = [
        '<!-- ko stopBinding: true -->',
        '<div class="widgetLanguagesWrapper">',
            '<h2 data-bind="text: Labels.HeaderLanguage"></h2>',
            '<div class="row">',
                '<div class="field" data-bind="text: Labels.LabelLanguageSelector"></div>',
                '<div class="input languageWrapper">',
                    '<div class="languageList" data-bind="foreach: { data: Languages.List, as: \'lang\' }">',
                        '<!-- ko if: lang.is_selected -->',
                        '<div class="LanguageItem">',
                            '<div class="Language ToggleDisplay" data-bind="css: { Focus: lang.id === $root.Languages.Selected().id }">',
                                '<a data-bind="text: lang.name, click: $root.LanguageSetSelect"></a>',
                                '</div>',
                            '<div class="LanguageDelete" data-bind="visible: ko.toJS($root.Languages.List()).findObjects(\'is_selected\', true).length > 1 && $root.CanChangeLanguage(), click: $root.LanguageDelete">x</div>',
                        '</div>',
                        '<!-- /ko -->',
                    '</div>',

                    '<div class="btnAddLanguage" data-bind="click: $root.LaguagesToggleAvailable, visible: $root.CanChangeLanguage()">+</div>',

                    '<div class="languageAvailableList">',
                        '<div data-bind="if: !ko.toJS(Languages.List()).hasObject(\'is_selected\', false)">',
                            '<div class="Item">' + Localization.Not_Available + '</div>',
                        '</div>',
                        '<div data-bind="foreach: { data: Languages.List, as: \'lang\' }">',
                            '<div class="Item" data-bind="visible: !lang.is_selected(), text: name, click: $root.LanguageAdd"></div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="row rowLanguageName">',
                '<div class="field" data-bind="text: Labels.LabelLanguageName"></div>',
                '<div class="input">',
                    '<input maxlength="255" required data-required-msg="Required" type="text" class="eaText eaTextSize40 languageName"  data-bind="value: Languages.Selected().language_name, enable: $root.CanChangeLanguage()" />',
                '</div>',
            '</div>',
            '<div class="row">',
                '<div class="input">',
                    '<textarea class="editor languageDescription"></textarea>',
                '</div>',
            '</div>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
}
