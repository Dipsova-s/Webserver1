(function (win, models) {

    function AllModels() {
        var self = this;
        self.SideMenuUri = '';
        self.ReloadModelsUri = '';
        self.FindAmountOfAngleAndDashboardUri = '';

        self.Initial = function (data) {
            self.SideMenuUri = '';
            self.ReloadModelsUri = '';
            self.FindAmountOfAngleAndDashboardUri = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {

                var grid = jQuery('#Grid').data('kendoGrid');
                if (grid) {
                    grid.items().not('.k-no-data').each(function (index, item) {
                        item = $(item);
                        item.attr('id', 'row-' + item.children(':first').text());
                    });
                }

            }, 1);

        };

        self.DeleteModel = function (e, obj) {
            if (!jQuery(obj).hasClass('disabled')) {
                var reference = jQuery(obj).parents('tr:first').children('td').eq(jQuery(obj).data('delete-field-index') || 0);
                var deleteModel = reference.text();
                var deleteDescription = jQuery("#row-" + deleteModel + " > td:nth-child(2)").text();
                var logoutToThisPage = function () {
                    MC.ajax.reloadMainContent();
                };

                MC.ajax.request({
                    url: self.FindAmountOfAngleAndDashboardUri,
                    element: obj,
                    type: "GET"
                })
                .done(function (data) {
                    var confirmMessage = kendo.format(Localization.MC_DeleteModel, deleteModel, deleteDescription, data.AmountofAngle, data.AmountofDashboard, data.ConnectedUsers);
                    MC.util.showPopupConfirmation(confirmMessage, function () {
                        MC.ajax.request({
                            element: obj,
                            type: 'Delete'
                        })
                        .always(function () {
                            MC.storage.clean();
                            document.location.reload();
                        });
                    });
                });
            }
            MC.util.preventDefault(e);
        };

        self.UpdateSideMenu = function () {
            return MC.ajax.request({
                target: '#sideContent',
                url: self.SideMenuUri
            })
            .done(function () {
                $('a[data-url$="/Model/GetAllModels"]', '#sideMenu').trigger('click');
            });
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        AllModels: new AllModels()
    });

})(window, MC.Models);
