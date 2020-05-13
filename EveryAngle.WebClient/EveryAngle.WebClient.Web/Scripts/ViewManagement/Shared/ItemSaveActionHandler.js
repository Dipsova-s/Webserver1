function ItemSaveActionHandler() {
    "use strict";
    
    var self = this;
    self.$Container = jQuery();
    self.Template = [
        '<!-- ko stopBinding: true -->',
        '<div class="saving-wrapper" data-bind="if: SaveActions.Primary.Valid(), visible: SaveActions.Primary.Valid(), css: { savable : SaveActions.Primary.Enable() }">',
            '<a class="btn btn-small btn-secondary btn-main-saving" data-bind="click: SaveActions.Primary.Action, css: { \'btn-split\': SaveActions.Primary.Visible(), disabled: !SaveActions.Primary.Enable() }">',
                '<span data-bind="text: SaveActions.Primary.Label()"></span>',
            '</a>',
            '<a class="btn btn-small btn-secondary btn-saving-options"',
               ' data-role="tooltip" data-tooltip-position="bottom"',
               ' data-bind="attr: { \'data-tooltip-text\': Localization.MoreActions }, click: ToggleSaveOptions">',
               ' <i class="icon icon-chevron-down"></i>',
            '</a>',
            '<ul class="listview listview-popup saving-options">',
                '<!-- ko foreach: {data: Object.keys($root.SaveActions), as: \'key\'} -->',
                '<!-- ko if: key !== $root.Primary && $root.SaveActions[key].Visible() && $root.SaveActions.Primary.Label() !== $root.SaveActions[key].Label() -->',
                '<li data-bind="text: $root.SaveActions[key].Label, attr: { \'class\': \'listview-item \' + $root.SaveActions[key].ClassName }, css: { disabled: !$root.SaveActions[key].Enable() }, click: $root.SaveActions[key].Action"></li>',
                '<!-- /ko -->',
                '<!-- /ko -->',
            '</ul>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
    self.Primary = 'Primary';

    self.GetPrimarySaveAction = function () {
        var saveAction = null;
        jQuery.each(self.SaveActions, function (id, action) {
            if (id === self.Primary)
                return;

            if (action.Visible()) {
                saveAction = action;
                return false;
            }
        });
        return saveAction;
    };
    self.IsPrimarySaveValid = function () {
        var valid = false;
        jQuery.each(self.SaveActions, function (id, action) {
            if (id === self.Primary)
                return;

            if (action.Visible()) {
                valid = true;
                return false;
            }
        });
        return valid;
    };
    self.IsPrimarySaveEnable = function () {
        var action = self.GetPrimarySaveAction();
        return action ? action.Enable() : false;
    };
    self.VisibleToggleSaveOptions = function () {
        var count = 0;
        jQuery.each(self.SaveActions, function (id, action) {
            if (id === self.Primary)
                return;

            if (action.Visible()) {
                count++;
            }
        });
        return count > 1;
    };
    self.ToggleSaveOptions = function () {
        var element = self.$Container.find('.saving-options');
        element.children('.listview-item').removeClass('active');
        if (element.is(':visible'))
            element.hide();
        else
            element.show();
    };
    self.HideSaveOptionsMenu = function () {
        self.$Container.find('.saving-options').hide();
    };
    self.GetPrimarySaveLabel = function () {
        var action = self.GetPrimarySaveAction();
        return action ? action.Label() : '';
    };
    self.PrimarySaveAction = function () {
        var action = self.GetPrimarySaveAction();
        if (action)
            action.Action();
    };

    self.ApplyHandler = function (container) {
        self.$Container = jQuery(container);
        self.$Container.html(self.Template);
        WC.HtmlHelper.ApplyKnockout(self, self.$Container.find('.saving-wrapper'));
        WC.HtmlHelper.MenuNavigatable('.btn-saving-options', '.saving-options', '.listview-item');
    };
    self.AddAction = function (key, label, css, visible, enable, action) {
        self.SaveActions[key] = {
            Label: ko.observable(label),
            ClassName: css,
            _visible: visible,
            Visible: ko.observable(false),
            _enable: enable,
            Enable: ko.observable(false),
            Action: action
        };
    };
    self.UpdateActions = function () {
        jQuery.each(self.SaveActions, function (id, action) {
            if (id === self.Primary)
                return;

            action.Visible(action._visible());
            action.Enable(action._enable());
        });
    };

    // actions
    self.SaveActions = {};
    self.SaveActions[self.Primary] = {
        Valid: self.IsPrimarySaveValid,
        Enable: self.IsPrimarySaveEnable,
        Visible: self.VisibleToggleSaveOptions,
        Label: self.GetPrimarySaveLabel,
        Action: self.PrimarySaveAction
    };
}
