function DisplayExcelTemplateHandler(displayHandler) {
    "use strict";
    var self = this;
    self.Container = $();

    self.DefaultDatastoreTemplate = null;
    self.DropdownData = [];
    self.DisplayHandler = displayHandler;

    self.Initial = function (target) {
        self.Container = $(target);
        self.DefaultDatastoreTemplate = defaultExcelDatastoreHandler.GetDefaultTemplate();
        self.DropdownData = excelTemplateFilesHandler.GetDropdownData();
        self.AddDefaultTemplate();
        self.Render();
    };

    self.AddDefaultTemplate = function () {
        var defaultTemplate = kendo.format(Localization.Default_Placeholder, self.DefaultDatastoreTemplate);

        var fileData = self.DropdownData.findObject('id', self.DefaultDatastoreTemplate);
        self.DropdownData.push({
            id: defaultTemplate,
            name: defaultTemplate,
            is_innowera: fileData.is_innowera,
            innowera_details: fileData.innowera_details,
            icon_class: fileData.icon_class
        });

        self.DefaultDatastoreTemplate = defaultTemplate;
    };

    self.ShowInnoweraDetails = function (fileData) {
        var element = self.Container.find('div.innowera-details');
        element.html('');
        if (!fileData.is_innowera) {
            return;
        }
        var processes = fileData.innowera_details.map(function (process) {
            var text = process.sap_process_name + "/" + process.display_name;
            return '<span data-role="tooltip" data-tooltip-text=\"' + text + '\">' + text + '</span><br\>';
        });
        element.html(processes);
    }

    self.GetItemTemplate = function () {
        return [
            '<div class="displayNameContainer small">',
            '<div class="front">',
            '<i class="icon #= data.icon_class #"></i>',
            '</div>',
            '<span class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true">#: data.name #</span>',
            '</div>'
        ].join('');
    };

    self.GetValue = function (dataSource) {
        var template = self.DisplayHandler.GetDetails().excel_template;
        return dataSource.hasObject('id', template) ? template : self.DefaultDatastoreTemplate;
    };

    self.Render = function () {
        var ddlExcelTemplatesData = self.DropdownData;
        var itemTemplate = self.GetItemTemplate();
        var selectedExcelTemplate = self.GetValue(ddlExcelTemplatesData);

        var element = self.Container.find('select.default-excel-template:last');
        var ddlExcelTemplates = WC.HtmlHelper.DropdownList(element, ddlExcelTemplatesData, {
            dataTextField: 'name',
            dataValueField: 'id',
            valueTemplate: itemTemplate,
            template: itemTemplate,
            change: self.SetData
        });
        ddlExcelTemplates.enable(self.DisplayHandler.CanUpdate());
        ddlExcelTemplates.value(selectedExcelTemplate);
        self.ShowInnoweraDetails(ddlExcelTemplates.dataItem());
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
        self.ShowInnoweraDetails(e.sender.dataItem());
        self.DisplayHandler.SetDetails(details, true);
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(details);
        self.OnChanged();
    };

    self.OnChanged = jQuery.noop;
}