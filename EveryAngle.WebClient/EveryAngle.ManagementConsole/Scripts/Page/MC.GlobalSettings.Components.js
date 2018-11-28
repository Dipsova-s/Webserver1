﻿(function (win, globalSettings) {

    function Components() {
        var self = this; 

        self.InitialComponents = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#ComponentsGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.GridDataBound);
                    grid.dataSource.read();
                }
            }, 1);
        };

        self.DeleteComponent = function (e, obj) {
            if (!$(obj).hasClass('disabled')) {
                var confirmMessage = MC.form.template.getRemoveMessage(obj);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    MC.ajax.request({
                        element: obj,
                        type: 'DELETE'
                    })
                        .done(function () {
                            MC.ajax.reloadMainContent();
                        });
                });
            }
            MC.util.preventDefault(e);
        };

        self.DownloadModelServerMetaData = function (e, obj) {
            var jsondata = jQuery.parseJSON(obj.dataset.parameters);
            var url = kendo.format(
                '{0}?modelId={1}&componentUri={2}',
                obj.href,
                jsondata.modelId,
                jsondata.componentUri);

            location.href = url;
            MC.util.preventDefault(e);
        };

        self.ShowModelServerInfo = function (e, obj) {
            var parameters = $(obj).data('parameters');
            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: $(obj).data('componentInfoUrl'),
                parameters: parameters
            })
            .done(function (data) {
                parameters.modelServerUri = data.modelServerUri;
                parameters.isCurrentInstance = data.isCurrentInstance;
                $(obj).data({
                    parameters: parameters
                });
                MC.util.modelServerInfo.showInfoPopup(e, $(obj));
            });
        };

        self.GetModelServerInfoTitle = function (type) {
            var grid = $('#ComponentsGrid').data('kendoGrid');
            var typeValues = grid.columns[0].values;
            return typeValues.findObject('value', type).text;
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        Components: new Components()
    });

})(window, MC.GlobalSettings);
