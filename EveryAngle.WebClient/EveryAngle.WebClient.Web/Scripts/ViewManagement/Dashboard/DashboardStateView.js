function DashboardStateView() { }
DashboardStateView.extend(ItemStateView);

DashboardStateView.prototype.GetPublishWidgetsTemplate = function () {
    return [
        '<li class="accordion-item publish-displays publish-widgets">',
            '<div class="accordion-header open">',
                '<i class="open-indicator icon icon-caret-down"></i>',
                '<i class="close-indicator icon icon-caret-right"></i>',
                '<span class="group-name" data-bind="text: Localization.PublishSettings_PanelWidgets"></span> ',
                '(<span class="group-count" data-bind="text: Widgets().length"></span>)',
            '</div>',
            '<div class="accordion-body">',
                '<!-- ko if: $root.HasPrivateDisplays() -->',
                '<div class="widget-section-message">',
                    '<span data-bind="text: Localization.PublishSettings_WidgetsInvalid"></span>',
                    '<a data-bind="click: $root.ShowWidgetDefinition, text: Localization.PublishSettings_WidgetLinkGoToDefinition"></a>',
                '</div>',
                '<!-- /ko -->',
                '<ul class="listview display-listview scrollable">',
                    '<!-- ko foreach: { data: Widgets(), as: \'widget\' } -->',
                    '<li class="listview-item" data-bind="css: { disabled: widget.is_public }">',
                        '<div class="displayNameContainer small">',
                            '<div class="front">',
                                '<i class="icon" data-bind="css:widget.display_icon"></i>',
                            '</div>',
                            '<span class="name" data-bind="text: widget.name, attr: { title: widget.name }"></span>',
                            '<div class="rear">',
                                '<!-- ko if: !widget.is_public -->',
                                '<i class="icon icon-private"></i>',
                                '<!-- /ko -->',
                                '<!-- ko if: widget.link && !widget.is_public -->',
                                '<a class="icon icon-link widget-link" target="_blank" data-bind="click: widget.click, attr: { href: widget.link, title: Captions.Button_Dashboard_WidgetGotoAngle }"></a>',
                                '<!-- /ko -->',
                            '</div>',
                        '</div>',
                    '</li>',
                    '<!-- /ko -->',
                '</ul>',
            '</div>',
        '</li>'
    ].join('');
};

DashboardStateView.prototype.GetPublishTemplate = function () {
    var self = this;
    return [
        '<div class="scrollable">',
            self.GetPublishSummaryTemplate(),
            '<ul class="accordion">',
                self.GetPublishWidgetsTemplate(),
                self.GetPublishLabelsTemplate(),
            '</ul>',
            '<div class="group-message required clearfix"></div>',
        '</div>',
        '<!-- ko if: !Data.is_validated() -->',
        self.GetPublishButtonsTemplate(),
        '<!-- /ko -->'
    ].join('');
};

DashboardStateView.prototype.GetValidateTemplate = function () {
    return [
        '<div class="form-row">',
            '<div class="form-col">',
                '<div class="SignValidated" data-bind="css: { gray: !Data.is_validated() }"></div>',
            '</div>',
            '<div class="form-col">',
                '<div class="validate-popup-caption" data-bind="text: Localization.Button_Validated"></div>',
                '<!-- ko if: Data.is_validated -->',
                '<div class="validate-popup-subcaption" data-bind="text: Localization.ValidateSetting_DashboardValidated"></div>',
                '<!-- /ko -->',
                '<!-- ko ifnot: Data.is_validated -->',
                '<div class="validate-popup-subcaption" data-bind="text: Localization.ValidateSetting_DashboardNotValidated"></div>',
                '<!-- /ko -->',
            '</div>',
            '<div class="form-col float-right">',
                '<div class="switch">',
                    '<label>',
                        '<input id="ValidateCheckBox" type="checkbox" data-bind="checked: Data.is_validated, click: ValidateItem"/>',
                        '<span class="lever" />',
                    '</label>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
};