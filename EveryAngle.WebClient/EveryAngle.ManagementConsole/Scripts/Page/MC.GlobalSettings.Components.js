(function (win, globalSettings) {

    function Components() {
        var self = this;

        self.InitialComponents = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#ComponentsGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.ComponentGridDataBound);
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
                '{0}?metadataName={1}&metadataUri={2}',
                obj.href,
                jsondata.MetadataName,
                jsondata.MetadataUri);

            $('<iframe/>')
                .on('load', function () {
                    // error will call this event
                    var data = JSON.parse($(this).contents().find('body').text());
                    var xhr = {
                        status: data.status,
                        responseText: data.message
                    };
                    var errorMessage = MC.ajax.getErrorMessage(xhr, null, null);
                    MC.ui.loading.show();
                    MC.ui.loading.setError(errorMessage);
                    $(this).remove();
                })
                .hide()
                .attr('src', url)
                .appendTo('body');

            MC.util.preventDefault(e);
        };

        self.ShowModelServerInfo = function (e, obj) {
            MC.util.modelServerInfo.showInfoPopup(e, obj);
        };

        self.ComponentGridDataBound = function (e) {
            MC.ui.btnGroup();
            MC.ui.localize();
            MC.ui.popup();
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Id);
            });

            for (var i = 0; i < e.sender.columns.length; i++) {
                e.sender.autoFitColumn(i);
            }
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        Components: new Components()
    });

})(window, MC.GlobalSettings);
