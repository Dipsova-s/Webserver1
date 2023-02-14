(function (win, globalSettings) {
    function EventLog() {
        var self = this;

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#EventLogGrid').data('kendoGrid');
                if (grid) {
                    MC.util.updateTimezoneColumnName('EventLogGrid', 'start_time', 'span');
                    MC.util.updateTimezoneColumnName('EventLogGrid', 'end_time', 'span');
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.EventGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);
        };

        self.EventGridDataBound = function (e) {
            MC.ui.localize();
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Name);
            });
        };

    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        EventLog: new EventLog()
    });

})(window, MC.GlobalSettings);
