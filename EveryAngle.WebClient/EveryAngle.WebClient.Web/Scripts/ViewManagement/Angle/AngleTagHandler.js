function AngleTagHandler(angleHandler) {
    "use strict";

    var _self = {};
    _self.fnSaveTimeout = null;
    _self.saveTimeout = 1000;

    var self = this;
    self.$Container = jQuery();
    self.UI = null;
    self.AngleHandler = angleHandler;
    self.CanUpdate = function () {
        return self.AngleHandler.CanUpdate();
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
        return self.AngleHandler.Data().assigned_tags();
    };
    self.OnChange = function (e) {
        if (!self.AngleHandler.Validate()) {
            self.Cancel();
            return;
        }

        var tags = e.sender.value();
        var getValue = function (value) {
            return value.slice().sort().join(',');
        };
        clearTimeout(_self.fnSaveTimeout);
        if (getValue(tags) !== getValue(self.GetValue()))
            _self.fnSaveTimeout = setTimeout(jQuery.proxy(self.Save, self, tags), self.AngleHandler.IsAdhoc() || !e.sender._isDeselected ? 0 : _self.saveTimeout);
    };
    self.Save = function (tags) {
        self.$Container.busyIndicator(true);
        self.$Container.find('.k-loading-mask').addClass('k-loading-none');
        var data = {
            assigned_tags: tags
        };
        var callback = jQuery.proxy(self.AngleHandler.UpdateData, self.AngleHandler, data, true, self.OnChangeComplete, self.OnChangeFail);
        self.AngleHandler.ConfirmSave(null, callback, self.Cancel);
    };
    self.Cancel = function () {
        self.$Container.busyIndicator(false);
        self.AngleHandler.Data().assigned_tags(self.AngleHandler.GetRawData().assigned_tags);
        self.Render(self.$Container);
    };
    self.OnChangeComplete = function () {
        self.Render(self.$Container);
        self.UI.focus();
        self.$Container.busyIndicator(false);
        if (!self.AngleHandler.IsAdhoc()) {
            toast.MakeSuccessTextFormatting(self.AngleHandler.GetName(), Localization.Toast_SaveItem);
        }
    };
    self.OnChangeFail = function () {
        self.$Container.busyIndicator(false);
    };
}