function DisplayExcelTemplateHandler(displayHandler) {
    "use strict";
    var self = this;

    self.DefaultDatastoreTemplate = null;
    self.AllTemplateFiles = [];
    self.DisplayHandler = displayHandler;

    self.Initial = function (target) {
        var datastoreTemplateSettings = defaultExcelDatastoreHandler.GetExcelTemplates();
        self.DefaultDatastoreTemplate = datastoreTemplateSettings.value;
        self.AllTemplateFiles = datastoreTemplateSettings.options;
        self.PrefixDefaultTemplate();
        self.Render($(target));
    };

    self.PrefixDefaultTemplate = function () {
        var defaultTemplate = self.AllTemplateFiles.findObject('id', self.DefaultDatastoreTemplate);
        defaultTemplate.name = kendo.format(Localization.Default_Placeholder, self.DefaultDatastoreTemplate);
    };

    self.GetValue = function (dataSource) {
        var template = self.DisplayHandler.GetDetails().excel_template;
        return dataSource.hasObject('id', template) ? template : self.DefaultDatastoreTemplate;
    };

    self.Render = function (container) {
        var ddlExcelTemplatesData = self.AllTemplateFiles;
        var selectedExcelTemplate = self.GetValue(ddlExcelTemplatesData);

        var element = container.find('select.default-excel-template:last');
        var ddlExcelTemplates = WC.HtmlHelper.DropdownList(element, ddlExcelTemplatesData, {
            dataTextField: 'name',
            dataValueField: 'id',
            change: self.SetData
        });
        ddlExcelTemplates.enable(self.DisplayHandler.CanUpdate());
        ddlExcelTemplates.value(selectedExcelTemplate);
    };

    self.SetData = function (e) {
        var details = self.DisplayHandler.GetDetails();
        var value = e.sender.value();
        //if default datastore template selected, dont save it to display_details
        if (value && value !== self.DefaultDatastoreTemplate) {
            details.excel_template = value;
        }
        else {
            delete details.excel_template;
        }
        self.DisplayHandler.SetDetails(details, true);
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(details);
        self.OnChanged();
    };

    self.OnChanged = jQuery.noop;
}