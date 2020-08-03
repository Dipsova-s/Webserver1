function DashboardSidePanelView() {
    var self = this;
    self.GetSectionInfoTemplate = function () {
        return [
            '<div class="card section-info">',
                '<div class="card-header section-info-header">',
                    '<div class="displayNameContainer small">',
                        '<div class="front">',
                            '<i class="icon icon-dashboard"></i>',
                        '</div>',
                        '<div class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true" data-bind="text: DashboardModel.Data().name()"></div>',
                        '<div class="rear">',
                            '<i class="icon" data-bind="css: { \'icon-private\': !DashboardModel.Data().is_published(), \'none\': DashboardModel.Data().is_published() }"></i>',
                            '<a class="icon" data-bind="css: { \'icon-star-active\': IsStarred(), \'icon-star-inactive\': !IsStarred(), disabled: !CanUpdateUserSpecific() }, click: SetFavorite"></a>',
                            '<a class="icon icon-pencil action action-edit-description" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowEditDescriptionPopup, attr: { \'data-tooltip-text\': Localization.Edit }"></a>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="card-body section-info-body" data-bind="text: DashboardModel.GetModel()"></div>',
            '</div>'
        ].join('');
    };
    self.GetSectionFiltersTemplate = function () {
       return [
            '<div class="accordion-item section-definition">',
                '<div class="accordion-header open">',
                    '<i class="open-indicator icon icon-caret-down"></i>',
                    '<i class="close-indicator icon icon-caret-right"></i>',
                    '<span data-bind="text: Localization.DashboardFilters_Title"></span>',
                    '<div class="accordion-toolbar">',
                        '<!-- ko if: CanAdd() -->',
                        '<a class="icon icon-plus action action-edit-filters" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowAddFilterPopup, css: { disabled: !CanAdd() }, attr: { \'data-tooltip-text\': Localization.AddFilter }"></a>',
                        '<!-- /ko -->',
                    '</div>',
                '</div>',
                '<div class="accordion-body definition-body">',
                    '<div class="definition-body-inner"></div>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetSectionExecuteAtLogonTemplate = function () {
        return [
            '<div class="card section-execute-at-logon" data-bind="if: CanUpdate()">',
                '<div class="card-body">',
                    '<div class="form-row">',
                        '<div class="form-col">',
                            '<label>',
                                '<input id="ExecuteOnLogin" name="ExecuteOnLogin" class="chk-execute-login" type="checkbox" data-bind="checked: GetExecuteAtLogon(), enable: CanExecuteAtLogon(), click: ExecuteOnLoginChanged"/>',
                                '<span class="label" data-bind="text: Localization.ExecuteAtLogin"></span>',
                            '</label>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetSectionWidgetsTemplate = function () {
        return [
            '<div class="accordion-item section-widgets">',
                '<div class="accordion-header open">',
                    '<i class="open-indicator icon icon-caret-down"></i>',
                    '<i class="close-indicator icon icon-caret-right"></i>',
                    '<span data-bind="text: Localization.AppliedDashboardDisplays"></span>',
                '</div>',
                '<div class="accordion-body widgets-body"></div>',
            '</div>'
        ].join('');
    };
 }
DashboardSidePanelView.extend(SidePanelView);
