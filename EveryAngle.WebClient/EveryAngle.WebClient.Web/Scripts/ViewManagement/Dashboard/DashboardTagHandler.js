function DashboardTagHandler(unsavedModel, dashboardModel) {
    "use strict";

    var _self = {};
    _self.fnSaveTimeout = null;
    _self.saveTimeout = 1000;

    var self = this;
    self.$Container = jQuery();
    self.UI = null;
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
        if (self.UI)
            self.UI.destroy();
        var target = container.find('input.tags-input');
        self.UI = target.kendoTagTextBox({
            autoBind: false,
            autoClose: true,
            dataSource: self.GetDataSource(),
            placeholder: Localization.TagInputPlaceholder,
            messages: {
                deleteTag: Localization.Delete,
                suggestion: Localization.TagSuggestionHeader,
                noData: Localization.TagNoSuggestion,
                newTag: Localization.TagNew
            },
            change: self.OnChange
        }).data('kendoTagTextBox');
        self.UI.value(self.GetValue());
        self.UI.readonly(!self.CanUpdate());
    };
    self.GetDataSource = function () {
        return new kendo.data.DataSource({
            serverFiltering: true,
            sort: { field: 'name', dir: 'asc' },
            transport: {
                read: self.SearchTags
            }
        });
    };
    self.SearchTags = function (option) {
        if (option.data.filter && option.data.filter.filters.length) {
            systemTagHandler.SearchTags(option.data.filter.filters[0].value)
                .always(function () {
                    option.success(systemTagHandler.GetData());
                });
        }
        else {
            option.success([]);
        }
    };
    self.GetValue = function () {
        return self.UnsavedModel.Data().assigned_tags;
    };
    self.OnChange = function (e) {
        var tags = e.sender.value();
        var getValue = function (value) {
            return value.slice().sort().join(',');
        };

        clearTimeout(_self.fnSaveTimeout);
        if (getValue(tags) !== getValue(self.GetValue()))
            _self.fnSaveTimeout = setTimeout(jQuery.proxy(self.Save, self, tags), self.DashboardModel.IsTemporaryDashboard() || !e.sender._isDeselected ? 0 : _self.saveTimeout);
    };
    self.Save = function (tags) {
        if (self.DashboardModel.IsTemporaryDashboard()) {
            self.DashboardModel.SetTags(tags);
            self.UnsavedModel.Data().assigned_tags = tags;
            self.Render(self.$Container);
            self.UI.focus();
        }
        else {
            self.$Container.busyIndicator(true);
            self.$Container.find('.k-loading-mask').addClass('k-loading-none');
            self.DashboardModel.SetTags(tags)
                .done(function (data) {
                    self.UnsavedModel.Data().assigned_tags = data.assigned_tags;
                    toast.MakeSuccessTextFormatting(self.DashboardModel.Data().name(), Localization.Toast_SaveItem);
                    self.Render(self.$Container);
                    self.UI.focus();
                })
                .always(function () {
                    self.$Container.busyIndicator(false);
                });
        }
    };
}