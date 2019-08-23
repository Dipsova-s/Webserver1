function ItemStateView() {
    "use strict";

    var self = this;

    self.GetPublishSummaryTemplate = function () {
        return [
            '<div class="card card-dark publish-summary">',
                '<div class="card-header" data-bind="text: Localization.PublishSettings_Summary"></div>',
                '<div class="card-body">',
                    '<div data-bind="text: Summary.bp_text()"></div>',
                    '<div data-bind="text: Summary.language_text()"></div>',
                    '<div data-bind="text: Summary.privilege_label_text()"></div>',
                    '<div data-bind="text: Summary.search_label_text()"></div>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetPublishLabelsTemplate = function () {
        return [
            '<!-- ko foreach: { data: Labels, as: \'group\' } -->',
            '<li class="accordion-item publish-labels">',
                '<div class="accordion-header open">',
                    '<i class="open-indicator icon icon-caret-down"></i>',
                    '<i class="close-indicator icon icon-caret-right"></i>',
                    '<span class="group-name" data-bind="text: group.name"></span> ',
                    '(<span class="group-count" data-bind="text: group.count()"></span>)',
                '</div>',
                '<div class="accordion-body">',
                    '<!-- ko foreach: { data: group.categories, as: \'category\' } -->',
                    '<div class="label-selection" data-bind="attr: { \'data-id\': category.id }, template: { afterRender: category.render }"></div>',
                    '<div class="label-selection-message required clearfix"></div>',
                    '<!-- /ko -->',
                '</div>',
            '</li>',
            '<!-- /ko -->'
        ].join('');
    };
    self.GetPublishButtonsTemplate = function () {
        return [
            '<div class="btn-wrapper btn-wrapper-popup">',
                '<span class="save-validate-message required"></span>',
                '<!-- ko if: CanUpdateItem() -->',
                '<a id="SavePublishSettingsButton" class="btn btn-secondary float-right" data-bind="click: SavePublishSettings, attr: { \'data-busy\': Localization.Saving }"><span data-bind="text: Localization.Save"></span></a>',
                '<!-- /ko -->',
                '<!-- ko if: Data.is_published() && CanUnpublishItem() -->',
                '<a id="UnpublishButton" class="btn btn-primary float-right" data-bind="click: UnpublishItem, attr: { \'data-busy\': Localization.Button_Unpublishing }"><span data-bind="text: Localization.Button_Unpublish"></span></a>',
                '<!-- /ko -->',
                '<!-- ko if: !Data.is_published() && CanPublishItem() -->',
                '<a id="PublishButton" class="btn btn-primary float-right" data-bind="click: PublishItem, attr: { \'data-busy\': Localization.Button_Publishing }"><span data-bind="text: Localization.Button_Publish"></span></a>',
                '<!-- /ko -->',
            '</div>'
        ].join('');
    };
    self.GetPublishTemplate = function () {
        return '';
    };
    self.GetValidateTemplate = function (localizations) {
        return '';
    };
}