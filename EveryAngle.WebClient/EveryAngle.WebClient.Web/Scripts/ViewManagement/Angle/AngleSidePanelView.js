function AngleSidePanelView() {
    var self = this;
    self.GetSectionInfoTemplate = function () {
        return [
            '<div class="card section-info">',
                '<div class="card-header section-info-header">',
                    '<div class="displayNameContainer small">',
                        '<div class="front">',
                            '<i class="icon" data-bind="css: { \'icon-angle\': !Data().is_template(), \'icon-template\': Data().is_template() }"></i>',
                        '</div>',
                        '<div class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true" data-bind="text: GetName()"></div>',
                        '<div class="rear">',
                            '<i class="icon" data-bind="css: { \'icon-private\': !Data().is_published(), \'none\': Data().is_published() }"></i>',
                            '<a class="icon" data-bind="visible: CanUpdateUserSpecific(), css: { \'icon-star-active\': IsStarred(), \'icon-star-inactive\': !IsStarred() }, click: SetStarred"></a>',
                            '<a class="icon icon-pencil action action-edit-description" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: ShowEditDescriptionPopup, attr: { \'data-tooltip-text\': Localization.Edit }"></a>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="card-body section-info-body" data-bind="text: GetObjectInfo()"></div>',
            '</div>'
        ].join('');
    };
    self.GetSectionAggregationTemplate = function () {
        return [
            '<div class="accordion-item section-aggregation" data-bind="visible: CanUseAggregation()">',
                '<div class="accordion-header open">',
                    '<i class="open-indicator icon icon-chevron-down"></i>',
                    '<i class="close-indicator icon icon-chevron-right"></i>',
                    '<span data-bind="text: Texts().AggregationTitle"></span>',
                    '<div class="accordion-toolbar">',
                        '<!-- ko if: HasAggregationChanged(false) -->',
                        '<a class="icon icon-undo action action-cancel" data-role="tooltip" data-tooltip-position="bottom" data-bind="click: CancelAggregation, attr: { \'data-tooltip-text\': Localization.Tooltip_UndoAllChanges }"></a>',
                        '<!-- /ko -->',
                        '<a class="icon icon-gear action action-options"',
                        ' data-role="tooltip" data-tooltip-position="bottom"',
                        ' data-bind="click: ShowAggregationOptions, attr: { \'data-tooltip-text\': Captions.Title_ChartOptions }, css: { disabled: !CanChangeAggregationOptions() }"></a>',
                    '</div>',
                '</div>',
                '<div class="accordion-body aggregation-body"></div>',
            '</div>'
        ].join('');
    };
    self.GetSectionDefaultDrilldownTemplate = function () {
        return [
            '<div class="card section-default-drilldown alwaysHide side-content-alignment">',
                '<div class="card-body">',
                    '<div class="form-row">', 
                        '<div class="form-col">',
                            '<label>' + Localization.DisplayDrilldownDefault + '</label>', 
                        '</div>',
                        '<div class="form-col form-col-body">',
                            '<select class="k-dropdown default-drilldown" id="DefaultDrilldown"></select>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetSectionExcelTemplate = function () {
        return [
            '<div class="card section-default-excel-template side-content-alignment">',
                '<div class="card-body">',
                    '<div class="form-row">',
                        '<div class="form-col">',
                            '<label>' + Localization.ExcelTemplate + '</label>',
                        '</div>',
                        '<div class="form-col form-col-body display-excel-template">',
                            '<select class="k-dropdown default-excel-template" id="DefaultExcelTemplate"></select>',
                        '</div>',
                    '</div>',
                    '<div class="form-row">',
                        '<div class="form-col template-warning-message" id="template-warning-message-display">',
                    '</div>',
                    '</div>',
                    '<div class="form-row">',
                        '<div class="form-col innowera-details">',
                        '</div>',
                    '</div>',
                '</div>',
                '<hr style="display:none;">',
            '</div>'
        ].join('');
    };
    self.GetSectionDisplayOptionsTemplate = function () {
        return [
            '<div class="card section-display-options side-content-alignment">',
                '<div class="card-body">',
                    '<div class="form-row">',
                        '<div class="form-col">',
                            '<label>',
                                '<input id="IsAngleDefault" name="IsAngleDefault" class="chk-angle-default" type="checkbox" data-bind="checked: Data().is_angle_default, click: IsAngleDefaultChanged, enable: CanUpdateAngleDefault()"/>',
                                '<span class="label" data-bind="text: Localization.DefaultDisplay"></span>',
                            '</label>',
                        '</div>',
                    '</div>',
                    '<!-- ko if: CanUpdateUserSpecific() -->',
                    '<div class="form-row">',
                        '<div class="form-col">',
                            '<label>',
                                '<input id="IsUserDefault" name="IsUserDefault" class="chk-user-default" type="checkbox" data-bind="checked: Data().user_specific.is_user_default, click: IsUserDefaultChanged"/>',
                                '<span class="label" data-bind="text: Localization.PersonalDefaultDisplay"></span>',
                            '</label>',
                        '</div>',
                    '</div>',
                    '<div class="form-row">',
                        '<div class="form-col">',
                            '<label>',
                                '<input id="ExecuteOnLogin" name="ExecuteOnLogin" class="chk-execute-login" type="checkbox" data-bind="checked: Data().user_specific.execute_on_login, click: ExecuteOnLoginChanged"/>',
                                '<span class="label" data-bind="text: Localization.ExecuteAtLogin"></span>',
                            '</label>',
                        '</div>',
                    '</div>',
                    '<!-- /ko -->',
                '</div>',
            '</div>',
        ].join('');
    };
}
AngleSidePanelView.extend(SidePanelView);