(function (win, models) {

    function Labels() {
        var self = this;
        self.SaveUri = '';
        self.ModelUri = '';
        self.GetLabelsUri = '';
        self.LabelsData = {};

        self.Initial = function (data) {

            self.SaveUri = '';
            self.ModelUri = '';
            self.GetLabelsUri = '';
            self.LabelsData = {};

            jQuery.extend(self, data || {});

            setTimeout(function () {

                self.InitialLabelsGrid();

                var grid = jQuery('#Grid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.AllLabelsGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);
        };

        self.AllLabelsGridDataBound = function (e) {
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });
        };

        self.InitialLabelsGrid = function () {
            var grid = jQuery('#Grid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.LabelsGridDataBound);
            }
        };

        self.LabelsGridDataBound = function () {
            setTimeout(function () {
                MC.form.page.resetInitialData();
            }, 1);
        };

        self.ToggleActiveModel = function (obj) {
            var chk = $(obj).parents('tr:first').find('input:checkbox:not([name="activeForModel"])');
            chk.prop('disabled', !obj.checked);
            if (!obj.checked) {
                chk.prop('checked', false);
            }
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};
            data.modelUri = self.ModelUri;

            var labels = [];
            $('#Grid tbody tr').each(function (k, v) {
                if (jQuery('[name="contains_businessprocesses"]', v).val() !== 'true') {
                    labels.push({
                        id: jQuery('[name="categoryId"]', v).text(),
                        uri: jQuery('[name="categoryUri"]', v).val(),
                        name: jQuery('[name="categoryName"]', v).val(),
                        contains_businessprocesses: jQuery('[name="contains_businessprocesses"]', v).val(),
                        used_for_authorization: jQuery('[name="used_for_authorization"]', v).is(':checked'),
                        is_required: jQuery('[name="is_required"]', v).is(':checked'),
                        activeForModel: jQuery('[name="activeForModel"]', v).is(':checked')
                    });
                }
            });

            data.labels = labels;

            return data;
        };

        self.SaveLabelCategories = function () {
            var data = self.GetData();

            MC.ajax.request({
                url: self.SaveUri,
                parameters: {
                    labelCategoryData: JSON.stringify(data.labels),
                    modelUri: data.modelUri
                },
                type: 'POST',
                ajaxSuccess: function () {
                    MC.ajax.reloadMainContent();
                }
            });
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Labels: new Labels()
    });

})(window, MC.Models);
