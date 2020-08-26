function DisplayDrilldownHandler(displayHandler) {
    "use strict";
    var self = this;

    self.DisplayHandler = displayHandler;
    self.DisplayOverviewHandler = new DisplayOverviewHandler(displayHandler.AngleHandler);
    self.Initial = function (target) {
        self.DisplayOverviewHandler.SetData(self.DisplayHandler.AngleHandler.Displays, self.DisplayHandler.Data().uri);
        self.Render(jQuery(target));
    };
    self.GetItemTemplate = function () {
        return [
            '<div class="displayNameContainer small">',
                '<div class="front">',
                    '<i class="icon #= data.DisplayTypeClassName + \' \' + data.ExtendDisplayTypeClassName #"></i>',
                '</div>',
                '<span class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true">#: data.Name #</span>',
                '<div class="rear">',
                    '<i class="icon #= data.PublicClassName #"></i>',
                    '<i class="icon #= data.FilterClassName #"></i>',
                    '<i class="icon #= data.ParameterizedClassName #"></i>',
                    '<i class="icon #= data.ValidClassName #"></i>',
                '</div>',
            '</div>'
        ].join('');
    };
    self.GetDataSource = function () {
        var displaysFromDropdown = ko.toJS(self.DisplayOverviewHandler.Displays());
        var emptydata = ko.toJS(displaysFromDropdown[0]);
        emptydata.DisplayTypeClassName = 'none';
        emptydata.ExtendDisplayTypeClassName = 'none';
        emptydata.FilterClassName = 'none';
        emptydata.PublicClassName = 'none';
        emptydata.ParameterizedClassName = 'none';
        emptydata.ValidClassName = 'none';
        emptydata.Name = Localization.None;
        emptydata.Uri = '';
        emptydata.Id = '';

        var ddlDrilldownData = [emptydata];
        jQuery.each(displaysFromDropdown, function (index, display) {
            if (display.IsNewAdhoc)
                return;

            var displayObject = self.DisplayHandler.AngleHandler.GetDisplay(display.Uri);
            if (!displayObject)
                return;

            if (display.DisplayType === enumHandlers.DISPLAYTYPE.CHART) {
                var displayDetails = displayObject.GetDetails();
                if (displayDetails.chart_type !== enumHandlers.CHARTTYPE.GAUGE.Code) {
                    ddlDrilldownData.push(display);
                }
            }
            else {
                ddlDrilldownData.push(display);
            }
        });
        return ddlDrilldownData;
    };
    self.GetValue = function (dataSource) {
        var display = self.DisplayHandler.GetDetails().drilldown_display;
        return dataSource.hasObject('Id', display) ? display : '';
    };
    self.Render = function (container) {
        var ddlDrilldownData = self.GetDataSource();
        var itemTemplate = self.GetItemTemplate();
        var selectedDrilldownDisplay = self.GetValue(ddlDrilldownData);
         
        var element = container.find('select.default-drilldown:last');
        var ddlDrilldown = WC.HtmlHelper.DropdownList(element, ddlDrilldownData, {
            dataTextField: 'Name',
            dataValueField: 'Id',
            valueTemplate: itemTemplate,
            template: itemTemplate,
            change: self.SetData
        });
        ddlDrilldown.enable(self.DisplayHandler.CanUpdate());
        ddlDrilldown.value(selectedDrilldownDisplay);

        container.removeClass("alwaysHide");
    };
    self.SetData = function (e) {
        var details = self.DisplayHandler.GetDetails();
        var value = e.sender.value();
        if (value) {
            details.drilldown_display = value;
        }
        else {
            delete details.drilldown_display;
        }
        self.DisplayHandler.SetDetails(details, true);
        self.DisplayHandler.QueryDefinitionHandler.AggregationOptions(details);
        self.OnChanged();
    };
    self.OnChanged = jQuery.noop;
}