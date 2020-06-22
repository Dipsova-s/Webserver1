function DashboardBusinessProcessHandler(unsavedModel, dashboardModel) {
    "use strict";

    var _self = {};
    _self.fnSaveTimeout = null;
    _self.saveTimeout = null;

    var self = this;
    self.$Container = jQuery();
    self.MultiSelect = null;
    self.UnsavedModel = unsavedModel;
    self.DashboardModel = dashboardModel;

    self.CanUpdate = function () {
        return self.DashboardModel.Data().authorizations.update;
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
            render: self.OnRender,
            change: self.OnChange
        });
        var buttonAdd = self.MultiSelect.element.find('.multiple-select-button');
        buttonAdd.attr({
            'data-role': 'tooltip',
            'data-tooltip-position': 'bottom',
            'data-tooltip-text': Localization.Add
        });
    };
    self.GetAll = function () {
        var modelPrivileges = privilegesViewModel.GetModelPrivilegesByUri(self.DashboardModel.Data().model);
        businessProcessHandler.ManageBPAuthorization(businessProcessesModel.General, modelPrivileges, self.DashboardModel.Data().is_published());
        var result = [];
        var bps = businessProcessesModel.General.Data();

        jQuery.each(bps, function (index, bp) {
            result.push({
                id: bp.id, name: bp.id, fullname: bp.name,
                list_css_class: kendo.format('business-process-multi-select BusinessProcessBadge {0} BusinessProcessBadgeItem{1}', bp.id, (index % businessProcessesModel.General.TotalBusinessProcesses)),
                css_class: kendo.format('business-process-multi-select {0} BusinessProcessBadgeItem{1}', bp.id, index % businessProcessesModel.General.TotalBusinessProcesses),
                is_allowed: bp.is_allowed,
                readOnly: bp.__readonly
            });
        });
        return result;
    };
    self.GetActive = function () {
        var activeBusinessProcesses = [];
        jQuery.each(self.UnsavedModel.Data().assigned_labels, function (index, label) {
            var businessProcessData = WC.Utility.ToArray(businessProcessesModel.General.Data()).findObject('id', label, false);
            if (businessProcessData && businessProcessData.is_allowed) {
                activeBusinessProcesses.push(label);
            }
        });
        return activeBusinessProcesses;
    };
    self.OnRender = function (rendertype, bp, element) {
        if (rendertype === 'value') {
            element.addClass(bp.css_class);
            element.attr('data-tooltip-text', bp.fullname);
            element.attr('data-tooltip-position', 'bottom');
            element.attr('data-role', 'tooltip');
        }
        else {
            element.children().addClass(bp.list_css_class);
            if (!bp.is_allowed || bp.readOnly)
                element.addClass('disabled');
            element.children().text('');
            var span = kendo.format('<span>{0}</span>', bp.name);
            element.append(span);
            element.parent().addClass('business-processes');
        }
    };
    self.OnChange = function (type, item) {
        // header
        if (!this.value().length)
            this.element.find('.multiple-select-header').show();
        else
            this.element.find('.multiple-select-header').hide();

        // add or remove
        var assignedLabels = self.UnsavedModel.Data().assigned_labels;
        var index = assignedLabels.indexOf(item.id);
        if (type === 'add') {
            if (index === -1) {
                assignedLabels.push(item.id);
                self.Callback(assignedLabels);
            }
        }
        else {
            assignedLabels.splice(index, 1);
            self.Callback(assignedLabels);
        }
    };
    self.Callback = function (labels) {
        if (self.DashboardModel.IsTemporaryDashboard()) {
            self.DashboardModel.SetBusinessProcesses(labels);
            self.UnsavedModel.Data().assigned_labels = labels;
            return;
        }

        clearTimeout(_self.fnSaveTimeout);
        _self.fnSaveTimeout = setTimeout(jQuery.proxy(self.Save, self, labels), _self.saveTimeout);
    };
    self.Save = function (labels) {
        self.$Container.busyIndicator(true);
        self.$Container.find('.k-loading-mask').addClass('k-loading-none');
        self.MultiSelect.hideList();
        self.DashboardModel.SetBusinessProcesses(labels)
            .done(function (data) {
                self.UnsavedModel.Data().assigned_labels = data.assigned_labels;
                toast.MakeSuccessTextFormatting(self.DashboardModel.Data().name(), Localization.Toast_SaveItem);
            })
            .always(function () {
                self.$Container.busyIndicator(false);
            });
    };
}