function SidePanelView() {}
SidePanelView.prototype.GetSectionInfoTemplate = function () {
    return '';
};
SidePanelView.prototype.GetSectionFiltersAndJumpsTemplate = function () {
    return [
        '<div class="accordion-item section-definition">',
            '<div class="accordion-header open">',
                '<i class="open-indicator icon icon-caret-down"></i>',
                '<i class="close-indicator icon icon-caret-right"></i>',
                '<span data-bind="text: Localization.Filters"></span>',
                '<div class="accordion-toolbar">',
                    '<!-- ko if: Authorizations.CanChangeJump() && CanAdd() -->',
                    '<a class="icon icon-followup action action-add-jump" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowAddJumpPopup, css: { disabled: !CanAdd() }, attr: { \'data-tooltip-text\': Localization.AddFollowUp }"></a>',
                    '<!-- /ko -->',
                    '<!-- ko if: CanAdd() -->',
                    '<a class="icon icon-plus action action-edit-filters" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowAddFilterPopup, css: { disabled: !CanAdd() }, attr: { \'data-tooltip-text\': Localization.AddFilter }"></a>',
                    '<!-- /ko -->',
                '</div>',
            '</div>',
            '<div class="accordion-body definition-body">',
                '<!-- ko if: $root.Parent -->',
                '<div class="query-definition-drop-area" data-bind="css: { \'empty\': !$root.Parent().GetFiltersAndJumps().length }">',
                    '<div class="definition-body-inner" data-bind="with: $root.Parent"></div>',
                    '<div data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="This Filter/Jump is on Angle level. Click to switch to the Angle Tab to edit or delete"  class="drop-area-cover" data-bind="text: Localization.Info_DropFilterToAngleDefinition, click: ClickDropArea"></div>',
                '</div>',
                '<!-- /ko -->',
                '<div class="definition-body-inner"></div>',
            '</div>',
            '<hr>',
        '</div>',
    ].join('');
};
SidePanelView.prototype.GetSectionDescriptionTemplate = function () {
    return [
        '<div class="accordion-item section-description">',
            '<div class="accordion-header open">',
                '<i class="open-indicator icon icon-caret-down"></i>',
                '<i class="close-indicator icon icon-caret-right"></i>',
                '<span data-bind="text: Localization.Description"></span>',
                '<div class="accordion-toolbar">',
                    '<a class="icon icon-pencil action action-edit-description" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowEditDescriptionPopup, attr: { \'data-tooltip-text\': Localization.Edit }"></a>',
                '</div>',
            '</div>',
            '<div class="accordion-body section-description-body" data-bind="html: GetDescriptionText()"></div>',
            '<hr>',
        '</div>',
    ].join('');
};
SidePanelView.prototype.GetSectionPersonalNoteTemplate = function () {
    return [
        '<div class="card section-personal-note" data-bind="css: { disabled: !CanUpdateUserSpecific() }">',
            '<div class="card-header">',
                '<span data-bind="text: Localization.PersonalNote"></span>',
            '</div>',
            '<div class="card-body section-personal-note-body" data-bind="text: HasPrivateNote() ? GetPrivateNote() : Localization.AddNote, css: { \'add-note\': !HasPrivateNote() }"></div>',
            '<hr style="display:none;">',
        '</div>',
    ].join('');
};
SidePanelView.prototype.GetSectionLabelsTemplate = function () {
     return [
        '<div class="accordion-item section-labels">',
            '<div class="accordion-header open">',
                '<i class="open-indicator icon icon-caret-down"></i>',
                '<i class="close-indicator icon icon-caret-right"></i>',
                '<span data-bind="text: Localization.Labels"></span>',
            '</div>',
            '<div class="accordion-body section-labels-body">',
                '<div class="form-row">',
                    '<div class="form-col form-col-body">',
                        '<div class="label-header" data-bind="text: Localization.BusinessProcesses"></div>',
                        '<div class="labels-wrapper business-processes-wrapper">',
                            '<div class="business-processes-selection"></div>',
                            '<div class="business-processes-selection-message required clearfix"></div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<!-- ko foreach: { data: Labels, as: \'group\' } -->',
                '<div class="form-row">',
                    '<div class="form-col form-col-body label-group-header">',
                        '<span class="group-name" data-bind="text: group.name"></span>',
                        ' (<span class="group-count" data-bind="text: group.count"></span>)',
                    '</div>',
                '</div>',
                '<div class="form-row">',
                    '<div class="form-col form-col-body publish-labels">',
                        '<!-- ko foreach: { data: group.categories, as: \'category\' } -->',
                        '<div class="label-header" data-bind="html: category.name + (category.is_required ? \' <em class=required>*</em>\' : \'\')"></div>',
                        '<div class="labels-wrapper">',
                            '<div class="label-selection" data-bind="attr: { \'data-id\': category.id }, template: { afterRender: category.render }"></div>',
                            '<div class="label-selection-message required clearfix"></div>',
                        '</div>',
                        '<!-- /ko -->',
                    '</div>',
                '</div>',
                '<!-- /ko -->',
                '<div class="group-message required clearfix"></div>',
            '</div>',
            '<hr>',
         '</div>',
    ].join('');
};
SidePanelView.prototype.GetSectionTagsTemplate = function () {
    return [
        '<div class="card section-tags">',
            '<div class="card-body">',
                '<div class="form-row">',
                    '<div class="form-col form-col-header">' + Localization.TagLabel + '</div>',
                '</div>',
                '<div class="form-row">',
                    '<div class="form-col form-col-body"><input class="tags-input"/></div>',
                '</div>',
            '</div>',
            '<hr>',
        '</div>',
    ].join('');
};