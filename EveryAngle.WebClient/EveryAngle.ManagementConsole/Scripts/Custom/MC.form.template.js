(function (win) {

    var template = {
        init: function () {
            MC.addAjaxDoneFunction(this.autoTemplate);
        },
        autoTemplate: function (obj) {
            var ui = jQuery(obj || '[data-role="auto-template"]')
            ui.each(function () {
                var element = jQuery(this);
                if (element.data('auto-template'))
                    return;

                element.data('auto-template', true).on('click', function () {
                    var settings = jQuery.extend({ template: null, grid: null, 'custom-fields': null, callback: null }, jQuery(this).data());
                    jQuery(this).data(settings);

                    if (!settings.template || !settings.grid)
                        return;

                    // add template
                    MC.form.template.addRow(this);

                    return false;
                });
            });
        },
        addRow: function (obj) {
            obj = jQuery(obj);
            if (obj.hasClass('disabled'))
                return false;

            var objData = obj.data();
            var grid = jQuery(objData.grid);
            var customFields = objData['custom-fields'] || objData['customFields'] || {};
            var tpl = jQuery(objData.template);
            var isRaw = tpl.is('textarea');
            var target = grid.find('tbody');
            var callback = objData.callback;

            tpl = isRaw ? jQuery(tpl.val()) : tpl.clone();
            var cells = tpl.find('td');

            if (target.find('tr:visible').length && !target.find('tr:last').hasClass('k-alt')) {
                tpl.addClass('k-alt');
            }

            jQuery.each(customFields, function (key, template) {
                if (key == 'last')
                    key = cells.length - 1;
                cells.eq(key).html(template);
            });

            // clean up action buttons if clone from other row
            if (!isRaw) {
                tpl.addClass('newRow');
                tpl.find('.btnEdit').remove();
                var btnDelete = tpl.find('.btnDelete')
                    .off('click')
                    .removeAttr('onclick')
                    .click(function () {
                        MC.form.template.remove(this);
                        return false;
                    });
                btnDelete.parent('td').addClass('gridColumnToolbar');
            }

            // make input radio and checkbox unique
            cells.each(function () {
                var groupControl = jQuery(this).find('input:radio,input:checkbox');
                if (groupControl.length) {
                    var name = groupControl.attr('name');
                    groupControl.attr('name', name + '_' + jQuery.now());
                }
            });

            // append row
            target.append(tpl);

            var lastRow = target.find('tr:last');
            var inputs = MC.form.template.getRowInputs(lastRow);

            // clear input values
            inputs.val('');

            // keep default values, this will use for check changes
            lastRow.data('defaultValue', MC.form.template.getRowValues(lastRow));

            // set focus the first input
            MC.form.template.focusControl(grid, inputs.first());

            // call callback function
            MC.util.getController(callback)(lastRow);
        },
        focusControl: function (grid, firstInput) {
            if (!Modernizr.touch) {
                firstInput.focus();
            }
            else {
                var isSelect = firstInput.is('select');
                if (!isSelect) {
                    firstInput.focus();
                }
                else {
                    // scroll to the last row if it's <select>
                    var gridContent = grid.find('.k-grid-content');
                    var mbScroller = gridContent.data('kendoMobileScroller');
                    if (mbScroller) {
                        mbScroller.scrollTo(0, Math.min(0, gridContent.height() - gridContent.find('table').height()));
                    }
                    else {
                        gridContent.scrollTop(gridContent.find('table').height());
                    }
                }
            }
        },
        getRemoveMessage: function (obj) {
            var reference = jQuery(obj).parents('tr:first').children('td').eq(jQuery(obj).data('delete-field-index') || 0);
            var referenceForm = reference.find('input:visible,select,textarea');
            var referenceText = MC.util.encodeHtml(jQuery.trim(referenceForm.length ? (referenceForm.is('select') ? referenceForm.find('option:selected').text() : referenceForm.val()) : reference.text()));
            var confirmMessage = jQuery(obj).data('delete-template') || Localization.MC_DeleteTemplate;
            confirmMessage = confirmMessage.replace('{reference}', "\'" + referenceText + "\'");
            return confirmMessage;
        },
        getRowInputs: function (row) {
            return row.find('input:visible:not(:radio,:checkbox),select:visible,textarea:visible');
        },
        getRowValues: function (row) {
            return MC.form.template.getRowInputs(row).map(function () { return this.value; }).get().join('');
        },
        remove: function (obj) {
            obj = jQuery(obj);
            var row = obj.parents('tr:first');
            var defaultValue = row.data('defaultValue');
            var values = MC.form.template.getRowValues(row);
            var onClick = function () {
                var isRemoved = false;
                var grid = row.parents('.k-grid:first').data('kendoGrid');
                if (grid) {
                    var dataItem = grid.dataSource.getByUid(row.data('uid'));
                    if (dataItem && dataItem.__mode) {
                        grid.dataSource.remove(dataItem);
                        isRemoved = true;
                    }
                }

                if (!isRemoved) {
                    var tbody = row.parent('tbody');
                    row.remove();
                    MC.util.resetGridRows(tbody.find('tr'));
                }

                var callback = obj.data('callback');
                MC.util.getController(callback)(obj);
            };

            if (values === defaultValue)
                onClick();
            else
                MC.util.showPopupConfirmation(MC.form.template.getRemoveMessage(obj), onClick);
        },
        markAsRemove: function (obj) {
            obj = jQuery(obj);
            if (!obj.hasClass('disabled')) {
                obj.attr('onclick', 'MC.form.template.unmaskAsRemove(this)');

                var parent = obj.parents('tr:first');
                parent.addClass('rowMaskAsRemove');

                var callback = obj.data('callback');
                MC.util.getController(callback)(obj, true);
            }
        },
        unmaskAsRemove: function (obj) {
            obj = jQuery(obj);
            if (!obj.hasClass('disabled')) {
                obj.attr('onclick', 'MC.form.template.markAsRemove(this)');

                var parent = obj.parents('tr:first');
                parent.removeClass('rowMaskAsRemove');

                var callback = obj.data('callback');
                MC.util.getController(callback)(obj, false);
            }
        }
    };

    win.MC.form.template = template;
    win.MC.form.template.init();

})(window);
