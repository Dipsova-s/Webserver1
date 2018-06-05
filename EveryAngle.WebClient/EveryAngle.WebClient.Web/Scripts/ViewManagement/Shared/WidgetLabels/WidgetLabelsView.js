function WidgetLabelsView(handler) {
    "use strict";

    var self = this;

    self.TemplateMenu = function (index) {
        return [
            '<li data-bind="click: ActiveTab, css: { active: IsTabActived(' + index + ') }">',
                '<span data-bind="text: TabName(' + index + ')"></span>',
            '</li>'
        ].join('');
    };

    self.TemplatePanel = function (index) {
        return [
            '<div class="tabPanel" data-bind="style: { width: GetPanelWidth(' + index + ') }, css: { active: IsTabActived(' + index + '), disabled: !IsTabEnabled(' + index + ') }, foreach: { data: Data, as: \'category\' }">',
                '<!-- ko if: category.CategoryIndex == ' + index + ' -->',
                '<div class="labelCategoryContainer">',
                    '<h4 class="labelCategoryName" data-bind="text: category.CategoryName, css: { required: category.IsRequired }"></h4>',
                    '<a class="btnAddLabel" data-bind="click: category.ShowLabelsList">' + Localization.AngleDetailPublishTabAddLabel + '</a>',
                    '<ul class="labelsList currentLabelsList" data-bind="foreach: { data: category.Labels, as: \'label\' }">',
                        '<!-- ko if: label.IsSelected -->',
                        '<li data-bind="attr: { \'class\': label.PrivilegeStatus }">',
                            '<span class="labelName" data-bind="text: label.LabelName"></span>',
                            '<a class="btnDeleteLabel" data-bind="click: label.DeleteLabel"></a>',
                        '</li>',
                        '<!-- \/ko -->',
                    '</ul>',
                '</div>',
                '<!-- \/ko -->',
            '</div>'
        ].join('');
    };

    self.TemplateAvailableLabelsList = function () {
        return [
            '<!-- ko stopBinding: true -->',
            '<div class="availableLabelsListContainer">',
                '<!-- ko if: $root.IsLabelsAvailable(Labels) -->',
                '<ul class="labelsList availableLabelsList" data-bind="foreach: { data: Labels, as: \'label\' }">',
                    '<!-- ko ifnot: label.IsSelected -->',
                    '<li data-bind="click: label.AddLabel">',
                        '<span class="labelName" data-bind="text: label.LabelName"></span>',
                    '</li>',
                    '<!-- \/ko -->',
                '</ul>',
                '<!-- \/ko -->',
                '<!-- ko ifnot: $root.IsLabelsAvailable(Labels) -->',
                '<ul class="availableLabelsList no">',
                    '<li><span class="labelName">Not available</span></li>',
                '</ul>',
                '<!-- \/ko -->',
            '</div>',
            '<!-- \/ko -->'
        ].join('');
    };

    self.Template = function () {
        return [
            '<div id="AvailableLabelsPopup"></div>',
            '<!-- ko stopBinding: true -->',
            '<div class="tab widgetLabelsWrapper">',
                '<ul class="tabMenu">',
                    self.TemplateMenu(handler.LABELTYPE.PRIVILEGE),
                    self.TemplateMenu(handler.LABELTYPE.SEARCH),
                '</ul>',
                '<div class="remark" data-bind="text: Captions.Remark"></div>',
                '<div class="tabPanelContainer">',
                    self.TemplatePanel(handler.LABELTYPE.PRIVILEGE),
                    self.TemplatePanel(handler.LABELTYPE.SEARCH),
                '</div>',
            '</div>',
            '<!-- \/ko -->'
        ].join('');
    };
}
