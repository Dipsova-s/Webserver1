function AngleBusinessProcessHandler(angleHandler) {
    "use strict";

    var self = this;
    self.$Container = jQuery();
    self.MultiSelect;
    self.AngleHandler = angleHandler;
    self.CanUpdate = function () {
        return self.AngleHandler.CanUpdate();
    };
    self.Initial = function (container) {
        self.$Container = container;
        self.Render(container);
    };
    self.Render = function (container) {
        var target = container.find('.business-processes-wrapper');
        self.MultiSelect = WC.HtmlHelper.MultiSelect(target, {
            header: Localization.BusinessProcesses,
            data: self.GetAll(),
            value: self.GetActive(),
            min: 1,
            readonly: !self.CanUpdate(),
            render: function (rendertype, bp, element) {
                if (rendertype === 'value') {
                    element.addClass(bp.css_class);
                    element.attr('data-tooltip-text', bp.fullname);
                    element.attr('data-tooltip-position', 'bottom');
                    element.attr('data-role', 'tooltip');
                }
                else {
                    element.children().addClass(bp.list_css_class);
                    if (!bp.is_allowed || bp.readOnly) {
                        element.addClass('disabled');
                    }
                    element.children().text('');
                    var span = kendo.format('<span>{0}</span>', bp.name);
                    element.append(span);
                    var parent = jQuery(element.parent());
                    if (!parent.hasClass('business-processes')) parent.addClass('business-processes');
                }
            },
            change: function (type, item) {
                // header
                if (!this.value().length)
                    this.element.find('.multiple-select-header').show();
                else
                    this.element.find('.multiple-select-header').hide();

                // add or remove
                if (type === 'add') {
                    if (self.AngleHandler.Data().assigned_labels().indexOf(item.id) === -1) {
                        self.AngleHandler.Data().assigned_labels().push(item.id);
                        self.OnChanged(self.AngleHandler.Data().assigned_labels());
                    }
                }
                else {
                    self.AngleHandler.Data().assigned_labels().splice(self.AngleHandler.Data().assigned_labels().indexOf(item.id), 1);
                    self.OnChanged(self.AngleHandler.Data().assigned_labels());
                }
            }
        });
        var buttonAdd = self.MultiSelect.element.find('.multiple-select-button');
        buttonAdd.attr({
            'data-role': 'tooltip',
            'data-tooltip-position': 'bottom',
            'data-tooltip-text': Localization.Add
        });
    };
    self.GetAll = function () {
        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.AngleHandler.Data().model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.General, modelPrivileges, self.AngleHandler.Data().is_published());
        var result = [];
        var bps = businessProcessesModel.General.Data();

        jQuery.each(bps, function (index, bp) {
            result.push({
                id: bp.id, name: bp.id, fullname: bp.name,
                list_css_class: kendo.format('business-process-multi-select BusinessProcessBadge {0} BusinessProcessBadgeItem{1}', bp.id, (index % businessProcessesModel.General.TotalBusinessProcesses)),
                css_class: kendo.format('business-process-multi-select {0} BusinessProcessBadgeItem{1}', bp.id, (index % businessProcessesModel.General.TotalBusinessProcesses)),
                is_allowed: bp.is_allowed,
                readOnly: bp.__readonly
            });
        });
        return result;
    };
    self.GetActive = function () {
        var activeBusinessProcesses = [];
        jQuery.each(self.AngleHandler.Data().assigned_labels(), function (index, label) {
            var businessProcessData = WC.Utility.ToArray(businessProcessesModel.General.Data()).findObject('id', label, false);
            if (businessProcessData && businessProcessData.is_allowed) {
                activeBusinessProcesses.push(label);
            }
        });
        return activeBusinessProcesses;
    };
    var saveLabels;
    self.OnChanged = function (labels) {
        clearTimeout(saveLabels);
        saveLabels = setTimeout(jQuery.proxy(self.Save, self, labels), 1000);
    };
    self.Save = function (labels) {
        self.$Container.busyIndicator(true);
        self.$Container.find('.k-loading-mask').addClass('k-loading-none');
        self.MultiSelect.hideList();
        var data = {
            assigned_labels: labels
        };

        var callback = jQuery.proxy(self.AngleHandler.UpdateData, self.AngleHandler, data, true, self.OnChangeComplete, self.OnChangeFail);
        self.AngleHandler.ConfirmSave(null, callback, self.Cancel);
    };
    self.Cancel = function () {
        self.$Container.busyIndicator(false);
        self.AngleHandler.Data().assigned_labels(self.AngleHandler.GetRawData().assigned_labels)
        self.Render(self.$Container);
    };
    self.OnChangeComplete = function () {
        self.$Container.busyIndicator(false);
        if (!self.AngleHandler.IsAdhoc()) {
            toast.MakeSuccessTextFormatting(self.AngleHandler.GetName(), Localization.Toast_SaveItem);
        }
    };
    self.OnChangeFail = function () {
        self.$Container.busyIndicator(false);
    };
    self.Validate = function () {
        var labels = self.MultiSelect.items();
        if (labels.length === 0) {
            popup.Alert(Localization.CannotSaveAngle_Title, Localization.ValidationForBusinessProcess);
            return false;
        }
        return true;
    };
}