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
                    '<!-- ko if: !ReadOnly() && HasChanged(false, false) -->',
                    '<a class="icon icon-undo action action-cancel" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: Cancel, attr: { \'data-tooltip-text\': Localization.Tooltip_UndoAllChanges }"></a>',
                    '<!-- /ko -->',
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
                    '<div class="drop-area-cover" data-bind="text: Localization.Info_DropFilterToAngleDefinition"></div>',
                    '<hr />',
                '</div>',
                '<!-- /ko -->',
                '<div class="definition-body-inner"></div>',
            '</div>',
        '</div>'
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
        '</div>'
    ].join('');
};
SidePanelView.prototype.GetSectionPersonalNoteTemplate = function () {
    return [
        '<div class="card section-personal-note" data-bind="css: { disabled: !CanUpdateUserSpecific() }">',
            '<div class="card-header">',
                '<span data-bind="text: Localization.PersonalNote"></span>',
            '</div>',
            '<div class="card-body section-personal-note-body" data-bind="text: HasPrivateNote() ? GetPrivateNote() : Localization.AddNote, css: { \'add-note\': !HasPrivateNote() }"></div>',
        '</div>'
    ].join('');
};
SidePanelView.prototype.GetSectionBusinessProcessTemplate = function () {
    return [
        '<div class="card section-business-processes">',
            '<div class="card-body">',
                '<div class="business-processes-wrapper"></div>',
            '</div>',
        '</div>'
    ].join('');
};