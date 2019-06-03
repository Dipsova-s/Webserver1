(function (win) {

    var consolidatedRole = {
        showPopup: function (consolidatedRoleUri, query) {
            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: consolidatedRoleUri,
                parameters: query,
                type: 'GET'
            })
            .done(function (response) {
                if ($(response).filter('.contentSectionInfoItem').length) {
                    $('#ConsoliDatedRolePopup .popupContent').html(response);
                }
                else {
                    $('#ConsoliDatedRolePopup .popupContent').html('<div class="contentSectionInfoItem">' + response + '</div>');
                }

                if ($('.btnCollapse').length === 0)
                    $('#ConsoliDatedRolePopup .popupToolbar').append('<a class="btn btnPrimary btnCollapse btnLeft" onclick="MC.util.consolidatedRole.collapseAll()" data-role="popup-close">' + Localization.MC_CollapseAll + '</a>');
                if ($('.btnExpand').length === 0)
                    $('#ConsoliDatedRolePopup .popupToolbar').append('<a class="btn btnPrimary btnExpand btnLeft" onclick="MC.util.consolidatedRole.expandAll()" data-role="popup-close">' + Localization.MC_ExpandAll + '</a>');

                MC.util.consolidatedRole.checkExpandCollapseVisible();
            })
            .always(function () {
                setTimeout(function () {
                    MC.ui.popup('requestEnd');
                }, 100);

                var win = jQuery('#ConsoliDatedRolePopup').data('kendoWindow');
                if (win) {
                    MC.util.disableMobileScroller(win);

                    if (!win.__scrollable_resize) {
                        win.bind('resize', function () {
                            var contentSectionElement = win.element.find('.contentSectionInfoItem');
                            if (contentSectionElement.length) {
                                var dropdownHeight = win.element.find('.k-dropdown.UserModelPrivileges').outerHeight() || 0;
                                contentSectionElement.height(win.element.outerHeight() - win.element.find('.popupToolbar').outerHeight() - dropdownHeight - 45);
                            }
                        });
                        win.__scrollable_resize = true;
                    }
                    win.trigger('resize');
                }
            });
        },
        checkExpandCollapseVisible: function () {
            var showexpandbutton = $("#ConsoliDatedRolePopup").find(".k-plus:visible").length + $("#ConsoliDatedRolePopup").find(".k-minus:visible").length;
            if (showexpandbutton === 0)
                $("#ConsoliDatedRolePopup .btnCollapse, #ConsoliDatedRolePopup .btnExpand").hide();
            else
                $("#ConsoliDatedRolePopup .btnCollapse, #ConsoliDatedRolePopup .btnExpand").show();
        },
        changeModelPrivilege: function (e) {

            $('#ConsoliDatedRolePopup .contentSectionInfoItem').addClass('hidden');
            if (e.sender.dataItem() === 'System privileges') {
                $('#system_privileges').removeClass('hidden');
            }
            else {
                $('#' + e.sender.dataItem()).removeClass('hidden');
            }

            MC.util.consolidatedRole.checkExpandCollapseVisible();
        },
        expandAll: function () {
            if ($('#ConsoliDatedRolePopup .k-plus:visible').length) {
                var treeview = $("#ConsoliDatedRolePopup .k-treeview:visible").data('kendoTreeView');
                if (treeview) treeview.expand('.k-item');
            }
        },
        collapseAll: function () {
            if ($('#ConsoliDatedRolePopup .k-minus:visible').length) {
                var treeview = $("#ConsoliDatedRolePopup .k-treeview:visible").data('kendoTreeView');
                if (treeview) treeview.collapse('.k-item');
            }
        }
    };

    win.MC.util.consolidatedRole = consolidatedRole;

})(window);