function AngleStateView() { }
AngleStateView.extend(ItemStateView);

AngleStateView.prototype.GetPublishDisplaysTemplate = function () {
    return [
        '<li class="accordion-item publish-displays">',
            '<div class="accordion-header open">',
                '<i class="open-indicator icon icon-caret-down"></i>',
                '<i class="close-indicator icon icon-caret-right"></i>',
                '<span class="group-name" data-bind="text: Localization.PublishSettings_PanelDisplays"></span> ',
                '(<span class="group-count" data-bind="text: Displays().length"></span>)',
            '</div>',
            '<div class="accordion-body">',
                '<ul class="listview display-listview scrollable">',
                    '<!-- ko foreach: { data: Displays(), as: \'display\' } -->',
                    '<li class="listview-item">',
                        '<label>',
                            '<input type="checkbox" name="Display" data-bind="checked: display.is_public, disable: !display.can_set_state, click: function() { return $root.CheckUpdatedPublishSettingsData(); }">',
                            '<span class="label"></span>',
                        '</label>',
                        '<div class="displayNameContainer small">',
                            '<div class="front">',
                                '<i class="icon" data-bind="css: display.css()"></i>',
                            '</div>',
                            '<span class="name" data-bind="text: display.name, attr: { title: display.name }"></span>',
                        '</div>',
                    '</li>',
                    '<!-- /ko -->',
                '</ul>',
            '</div>',
        '</li>'
    ].join('');
};

AngleStateView.prototype.GetPublishLimitationsTemplate = function () {
    return [
        '<div class="card publish-limitations">',
            '<div class="card-header" data-bind="text: Localization.AngleDetailPublishTabLimitationLabel"></div>',
            '<div class="card-body">',
                '<label>',
                    '<input type="checkbox" id="AllowMoreDetails" name="AllowMoreDetails" data-bind="checked: Data.not_allow_more_details, enable: $root.CanSetAllowMoreDetails()">',
                    '<span class="label" data-bind="text: Localization.AngleDetailPublishTabAllowMoreDetails"></span>',
                    '<a class="btn-info" data-bind="click: ShowInfoAllowMoreDetailsPopup"><i class="icon icon-info"></i></a>',
                '</label>',
                '<label>',
                    '<input type="checkbox" id="AllowFollowups" name="AllowFollowups" data-bind="checked: Data.not_allow_followups, enable: $root.CanSetAllowFollowups()">',
                    '<span class="label" data-bind="text: Localization.AngleDetailPublishTabAllowFollowups"></span>',
                '</label>',
            '</div>',
        '</div>'
    ].join('');
};

AngleStateView.prototype.GetPublishTemplate = function () {
    var self = this;
    return [
        '<div class="scrollable">',
            self.GetPublishSummaryTemplate(),
            '<ul class="accordion">',
                self.GetPublishDisplaysTemplate(),
                self.GetPublishLabelsTemplate(),
            '</ul>',
            '<div class="group-message required clearfix"></div>',
            '<hr/>',
            self.GetPublishLimitationsTemplate(),
        '</div>',
        self.GetPublishButtonsTemplate()
    ].join('');
};

AngleStateView.prototype.GetValidateTemplate = function () {
    return [
        '<div class="form-row">',
            '<div class="form-col">',
                '<div class="SignValidated" data-bind="css: { gray: !Data.is_validated() }"></div>',
            '</div>',
            '<div class="form-col">',
                '<div class="validate-popup-caption" data-bind="text: Localization.Button_Validated"></div>',
                '<!-- ko if: Data.is_validated -->',
                '<div class="validate-popup-subcaption" data-bind="text: Localization.ValidateSetting_AngleValidated"></div>',
                '<!-- /ko -->',
                '<!-- ko ifnot: Data.is_validated -->',
                '<div class="validate-popup-subcaption" data-bind="text: Localization.ValidateSetting_AngleNotValidated"></div>',
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