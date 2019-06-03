;(function (win, models) {

    function Languages() {
        var self = this;
        self.SaveUri = '';
        self.ModelUri = '';
        self.ActiveLanguages = [];

        self.Initial = function (data) {
            self.SaveUri = '';
            self.ModelUri = '';
            self.ActiveLanguages = [];

            jQuery.extend(self, data || {});

            setTimeout(function () {
                self.InitialLanguagesGrid();

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.InitialLanguagesGrid = function () {
            var grid = jQuery('#ActiveLanguagesGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.LanguagesGridDataBound);
                grid.dataSource.read();
            }
        };

        self.LanguagesGridDataBound = function () {
            setTimeout(function () {
                MC.form.page.resetInitialData();
            }, 1);
        };

        self.IsContainLanguage = function (id) {
            return jQuery.inArray(id, self.ActiveLanguages) !== -1;
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};
            data.modelUri = self.ModelUri;
            data.activeLanguages = {
                "active_languages": $('#ActiveLanguagesGrid input:checked[value="True"]').map(function () { return this.name; }).get()
            };

            return data;
        };

        self.SaveActiveLanguages = function () {
            var data = self.GetData();

            MC.ajax.request({
                url: self.SaveUri,
                parameters: { modelUri: data.modelUri, 'activeLanguages': JSON.stringify(data.activeLanguages) },
                type: "PUT",
                ajaxSuccess: function () {
                    MC.ajax.reloadMainContent();
                }
            });
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Languages: new Languages()
    });

})(window, MC.Models);
