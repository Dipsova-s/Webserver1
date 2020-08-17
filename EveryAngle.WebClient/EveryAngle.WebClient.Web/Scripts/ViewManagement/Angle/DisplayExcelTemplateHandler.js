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
    self.ShowWarningMessageTemplateDeleted = function (selectedExcelTemplate) {
        $("#template-warning-message-display").html('');
        var warningMessage = '';
        if (self.DropdownData.findObject('id', selectedExcelTemplate).isDeleted) {
            warningMessage += '<span>' + Captions.Label_Template_Not_Exist_Message + '</span>';
            $('div.display-excel-template .k-dropdown .k-dropdown-wrap').addClass('dropdown-border-warning');
            $("#template-warning-message-display").show();
        }
        else {
            $('div.display-excel-template .k-dropdown .k-dropdown-wrap').removeClass('dropdown-border-warning');
            $("#template-warning-message-display").hide();
        }

        $("#template-warning-message-display").html(warningMessage);
    };
    self.GetValue = function () {
        var template = self.DisplayHandler.GetDetails().excel_template;
        return typeof template === 'string' ? template : self.DefaultDatastoreTemplate;
    };

    self.Render = function () {
        var ddlExcelTemplatesData = self.GetDropdownData();
        var itemTemplate = self.GetItemTemplate();
        var selectedExcelTemplate = self.GetValue();

        self.ShowWarningMessageTemplateDeleted(selectedExcelTemplate);
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
    self.GetDropdownData = function () {
        var template = self.DisplayHandler.GetDetails().excel_template;
        var excelTemplates = self.DropdownData;
        if (typeof template === 'string' && !excelTemplates.hasObject('id', template)) {
            excelTemplates.push({
                id: template,
                name: template,
                is_innowera: false,
                icon_class: "none",
                isDeleted: true
            });
        }
        return excelTemplates;
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