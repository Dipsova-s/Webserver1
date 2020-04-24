function DashboardExecutionHandler() {
    "use strict";

    var _self = {};
    _self.$modelPopup = jQuery();

    var self = this;
    self.ModelUri = null;
    self.Items = [];

    self.Execute = function (items) {
        self.SetValidItems(items);

        if (!self.Validate())
            return;

        self.EnsureModelUri();
        if (self.Items.length !== items.length)
            self.CreateWithWarning();
        else
            self.Create();
    };
    self.SetValidItems = function (items) {
        self.Items = jQuery.grep(items, function (item) {
            return item.type === enumHandlers.ITEMTYPE.ANGLE && !item.is_template && item.displays.length;
        });
    };
    self.Validate = function () {
        // reach the maximum
        if (self.Items.length > window.maxNumberOfDashboard) {
            popup.Alert(Localization.Warning_Title, kendo.format(Localization.Info_ReachMaximumOfDashboard, window.maxNumberOfDashboard));
            return false;
        }

        // show alert if not valid item
        if (!self.Items.length) {
            popup.Alert(Localization.Warning_Title, Localization.Info_OnlyAnglesAreAllowedToCreateADashboard);
            return false;
        }

        // check model
        if (!self.IsValidModel()) {
            self.ShowModelPopup();
            return false;
        }

        return true;
    };
    self.EnsureModelUri = function () {
        if (!self.ModelUri)
            self.ModelUri = self.Items[0].model;
    };
    self.CreateWithWarning = function () {
        var win = popup.Confirm(Localization.Info_SelectItemsContainTemplatesOrAngles, self.Create);
        var options = {
            title: Localization.Warning_Title
        };
        win.setOptions(options);
        win.element.find(".notificationIcon").attr("class", "notificationIcon alert");
    };
    self.Create = function () {
        progressbarModel.ShowStartProgressBar(Localization.ProgressBar_PreparingData, false);
        self.LoadItems()
            .then(self.CreateData)
            .done(self.Redirect);
    };
    self.LoadItems = function () {
        var deferred = [];
        var items = [];
        var loadItem = function (uri) {
            var params = {};
            params[enumHandlers.PARAMETERS.CACHING] = false;
            return GetDataFromWebService(uri, params)
                .done(function (response) {
                    items.push(response);
                });
        };

        jQuery.each(self.Items, function (_index, item) {
            deferred.pushDeferred(loadItem, [item.uri]);
        });

        return jQuery.whenAll(deferred)
            .then(function () {
                return jQuery.when(items);
            });
    };
    self.CreateData = function (itemDetails) {
        var data = dashboardModel.GetInitialTemporaryData();
        var defaultLanguage = userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES).toLowerCase();
        jQuery.each(self.Items, function (_index, item) {
            var itemDetail = itemDetails.findObject('uri', item.uri);
            if (!itemDetail)
                return;

            dashboardModel.MapAngle(itemDetail);
            dashboardModel.Angles.push(itemDetail);

            var display = WC.Utility.IfNothing(self.GetDefaultDisplay(itemDetail), {});
            data.widget_definitions.push({
                angle: itemDetail[DashboardViewModel.KeyName],
                display: display[DashboardViewModel.KeyName] || null,
                widget_details: JSON.stringify({}),
                widget_type: 'angle_display',

                // required fields but do not use for now
                multi_lang_name: [{
                    lang: defaultLanguage,
                    text: ' '
                }],
                multi_lang_description: [{
                    lang: defaultLanguage,
                    text: ''
                }]
            });
        });
        data.layout = JSON.stringify(dashboardModel.GetDefaultLayoutConfig(data.widget_definitions.length));
        data.assigned_labels = dashboardModel.GetBusinessProcesses();
        data.model = self.ModelUri;

        // awake dashboard model
        dashboardModel.SetData(data);

        // get name
        return dashboardModel.GetDefaultDashboardName()
            .then(function (name) {
                data.multi_lang_name[0].text = name;
                return dashboardModel.SaveTemporaryDashboard(data);
            });
    };
    self.GetDefaultDisplay = function (item) {
        /*
        M4-9739: Show chart display by default
        1. Use the personal default display when this is a chart display
        2. Use the default display when this is a chart display
        3. Use the first public chart display available
        4. Use the first chart display available
        5. Standard procedure for selecting display:
        5.1. User default display
        5.2. Angle default display
        */

        if (!item || !item.display_definitions.length)
            return null;

        // find all charts
        var chartDisplays = item.display_definitions.findObjects('display_type', enumHandlers.DISPLAYTYPE.CHART);

        // no chart Display - use the standard procedure
        if (!chartDisplays.length)
            return WC.Utility.GetDefaultDisplay(item.display_definitions);

        // use the personal default display
        var defaultDisplays = jQuery.grep(chartDisplays, function (value) {
            return value.user_specific && value.user_specific.is_user_default;
        });
        if (defaultDisplays.length)
            return defaultDisplays[0];

        // 1. use the default display
        // 2. use the first public chart
        // 3. use the first chart
        return chartDisplays.findObject('is_angle_default', true)
            || chartDisplays.findObject('is_public', true)
            || chartDisplays[0];
    };
    self.Redirect = function (data) {
        var executionInfo = dashboardModel.GetDashboardExecutionParameters();
        if (executionInfo.query_steps.length) {
            progressbarModel.EndProgressBar();
            self.ShowExecutionParameterPopup(dashboardModel.Data(), executionInfo);
        }
        else {
            progressbarModel.SetProgressBarText(null, null, Localization.ProgressBar_Redirecting);
            var params = {};
            params[enumHandlers.DASHBOARDPARAMETER.NEW] = true;
            WC.Utility.RedirectUrl(WC.Utility.GetDashboardPageUri(data.uri, params));
        }
    };
    self.ShowExecutionParameterPopup = jQuery.noop;

    // model selection
    self.Models = [];
    self.IsValidModel = function () {
        return self.ModelUri || self.GetValidModels().length === 1;
    };
    self.GetValidModels = function () {
        return jQuery.map(self.Items, function (item) {
            return item.model;
        }).distinct();
    };
    self.ShowModelPopup = function () {
        var options = self.GetModelPopupOptions();
        popup.Show(options);
    };
    self.CloseModelPopup = function () {
        popup.Close('#PopupModelSelection');
    };
    self.GetModelPopupOptions = function () {
        return {
            element: '#PopupModelSelection',
            title: Localization.ExecuteAsDashboard,
            html: self.GetTemplate(),
            className: 'model-selection-popup',
            actions: ['Close'],
            buttons: [
                {
                    text: Localization.Ok,
                    position: 'right',
                    isPrimary: true,
                    className: 'btn-submit disabled',
                    click: self.SetModel
                }
            ],
            width: 280,
            minHeight: 50,
            resizable: false,
            scrollable: false,
            open: self.ShowModelPopupCallback,
            close: popup.Destroy
        };
    };
    self.ShowModelPopupCallback = function (e) {
        _self.$modelPopup = e.sender.wrapper;
        _self.$modelPopup.busyIndicator(true);
        modelsHandler.LoadModelsInfo()
            .always(function () {
                self.CreateModelDropdown();
                _self.$modelPopup.busyIndicator(false);
            });
    };
    self.GetTemplate = function () {
        return [
            '<div class="form-row">',
                '<div class="form-col form-col-header">' + Localization.Model + '</div>',
                '<div class="form-col form-col-body"><div class="model-dropdown"></div></div>',
            '</div>'
        ].join('');
    };
    self.CreateModelDropdown = function () {
        var data = self.GetModelDataSource();
        _self.modelDropdown = WC.HtmlHelper.DropdownList(_self.$modelPopup.find('.model-dropdown'), data, {
            dataTextField: 'name',
            dataValueField: 'uri',
            change: self.DropdownModelChange
        });
    };
    self.GetModelDataSource = function () {
        var models = [{ name: Localization.PleaseSelect, uri: '' }];
        jQuery.each(self.Models, function (index, model) {
            var data = modelsHandler.GetModelById(model.id);
            var name = data.short_name + (data.available ? '' : Localization.ModelLabel_Down);
            models.push({ name: name, uri: data.uri });
        });
        return models;
    };
    self.DropdownModelChange = function (e) {
        self.ModelUri = e.sender.value();

        var button = _self.$modelPopup.find('.btn-submit');
        if (self.ModelUri)
            button.removeClass('disabled');
        else
            button.addClass('disabled');
    };
    self.SetModel = function () {
        if (self.ModelUri) {
            self.CloseModelPopup();
            self.Execute(self.Items);
        }
    };
}