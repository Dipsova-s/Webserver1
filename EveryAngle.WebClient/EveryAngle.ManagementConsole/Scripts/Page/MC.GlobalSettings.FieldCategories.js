(function (win, globalSettings) {

    function FieldCategories() {
        var self = this;
        self.DeleteList = [];
        self.SaveUri = '';

        self.Initial = function (data) {
            self.DeleteList = [];
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#FieldCategoryGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.GridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.DeletionCheckMark = function (obj, isRemove) {
            var data = $(obj).data('parameters');
            var row = { 'uri': data.uri, 'short_name': data.short_name };
            var index = self.DeleteList.indexOfObject('uri', data.uri);

            if (isRemove) {
                if (index === -1) {
                    self.DeleteList.push(row);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteList.splice(index, 1);
                }
            }
        };

        self.GridDataBound = function (e) {
            MC.ui.btnGroup();

            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });

            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('input[value="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);

            MC.form.page.resetInitialData();
        };

        self.HandlerEnterKey = function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                return false;
            }
        };

        self.ShowPreview = function (event) {
            var input = event.target || event.srcElement || event.sender.element[0],
                preview = jQuery(input).parents('td:first').children('img'),
                defaultImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            if (!input.value || (jQuery.validator && !jQuery(input).valid())) {
                if (window.FileReader) jQuery(preview).attr('src', defaultImage);
                else preview[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = '';

                var errorMessages = jQuery('#errorContainer').html();
                jQuery(input).replaceWith(jQuery(input).clone(true));
                jQuery('#errorContainer').html(errorMessages);

                event.preventDefault();
                return false;
            }

            jQuery(input).next('span').html('Update icon');

            MC.util.previewImage(input, preview, defaultImage);
        };

        self.AddNewIconToHiddenField = function (row) {
            var editIndex = $('#FieldCategoryGrid table').find('tbody').find('tr').length - 1;

            var tr = $('#FieldCategoryGrid table').find('tbody').find('tr')[editIndex];
            var uri = $('input[type=hidden]', tr).val();
            if ($('#updatedFields').val()) {
                $('#updatedFields').val($('#updatedFields').val() + '#,#' + editIndex + ":" + uri);
            }
            else {
                $('#updatedFields').val(editIndex + ":" + uri);
            }

            MC.ui.btnGroup(row.find('.gridColumnToolbar'));
        };

        self.RemoveNewIconFromHiddenField = function (obj) {
            var editIndex = $('#FieldCategoryGrid table').find('tbody').find('tr').index($(obj).parent().parent());
            var tr = $(obj).parents('tr:first').removeClass('editRow');
            var uri = $('input[type=hidden]', tr).val();

            var updatedItems = $('#updatedFields').val().split('#,#');
            var newValues = '';

            for (var index = 0; index < updatedItems.length; index++) {
                if (updatedItems[index] !== editIndex + ":" + uri && updatedItems[index] !== '#,#') {
                    newValues = newValues ? newValues + '#,#' + updatedItems[index] : updatedItems[index];
                }
            }

            $('#updatedFields').val(newValues);
        };

        self.EditCustomIcon = function (obj) {
            var tr = $(obj).parents('tr:first').addClass('editRow');
            var editIndex = tr.index();
            var id = $.trim($('td:eq(0)', tr).text());
            var uri = $('input[type=hidden]', tr).val();
            if ($('#updatedFields').val()) {
                $('#updatedFields').val($('#updatedFields').val() + '#,#' + editIndex + ":" + uri);
            }
            else {
                $('#updatedFields').val(editIndex + ":" + uri);
            }

            $('td:eq(0)', tr).data('defaultValue', id).html($('<input maxlength="50" type="text" name="editId" class="required" onkeypress="MC.GlobalSettings.FieldCategories.HandlerEnterKey(event)" />').val(id));

            var btnMain = $(obj).parents('td:first').find('.btn:first');
            if (btnMain.hasClass('btnEdit')) {
                btnMain.removeClass('btnEdit').addClass('btnCancel');
                btnMain.data('clickTarget', btnMain.next('.btnGroupInner').find('.btnCancel'));
            }
        };

        self.CancelCustomIcon = function (obj) {
            var tr = $(obj).parents('tr:first').removeClass('editRow');
            var editIndex = tr.index();
            var id = tr.children(':eq(0)').data('defaultValue');
            var uri = tr.find('[name="uri"]').val();

            var updatedItems = $('#updatedFields').val().split('#,#');
            var newValues = '';

            for (var index = 0; index < updatedItems.length; index++) {
                if (updatedItems[index] !== editIndex + ":" + uri && updatedItems[index] !== '#,#') {
                    newValues = newValues ? newValues + '#,#' + updatedItems[index] : updatedItems[index];
                }
            }

            $('#updatedFields').val(newValues);

            tr.children(':eq(0)').html(id);

            var previewImage;
            tr.find(':file').each(function (index, file) {
                previewImage = jQuery(file).parents('.k-upload:first').prev('img');
                previewImage.attr('src', previewImage.data('default'));

                jQuery(file).replaceWith(jQuery(file).clone(true));
            });

            var btnMain = $(obj).parents('td:first').find('.btn:first');
            if (btnMain.hasClass('btnCancel')) {
                btnMain.removeClass('btnCancel').addClass('btnEdit');
                btnMain.data('clickTarget', btnMain.next('.btnGroupInner').find('.btnEdit'));
            }
        };

        self.GetData = function () {
            // only use for check data is change or not
            MC.form.clean();

            var data = {};
            data.updateList = [];
            jQuery('#FieldCategoryGrid .k-grid-content tr').each(function (index, row) {
                row = jQuery(row);
                if (row.hasClass('editRow') || row.hasClass('newRow')) {
                    data.updateList.push({
                        id: row.children(':eq(0)').find('input').val(),
                        icon_small: row.children(':eq(1)').find('input').val(),
                        icon_large: row.children(':eq(2)').find('input').val()
                    });
                }
                else {
                    data.updateList.push({
                        id: row.children(':eq(0)').text(),
                        icon_small: row.children(':eq(1)').find('input').val(),
                        icon_large: row.children(':eq(2)').find('input').val()
                    });
                }
            });

            data.deleteList = self.DeleteList.slice();

            return data;
        };

        self.SaveCustomIcon = function () {
            if (!jQuery('#FieldForm').valid()) {
                $('#FieldForm .error:first').focus();
                return false;
            }

            MC.util.ajaxUpload('#FieldForm', {
                data: { deleteData: JSON.stringify(self.DeleteList) },
                successCallback: function (result) {
                    var data = result.parameters.Data;
                    if (data.removedData.length > 0 || !($.isEmptyObject(data.un_removeData))) {
                        var text = '';
                        if (data.removedData.length > 0) {
                            text += '<p>' + Localization.MC_RemovedIconsList + '</p>';
                            $.each(data.removedData, function (index, item) {
                                text += '<p>' + item + '</p>';
                            });
                        }
                        if (!$.isEmptyObject(data.un_removeData)) {
                            text += '<p>' + Localization.MC_UnRemovedIconsList + '</p>';
                            $.each(data.un_removeData, function (key, value) {
                                text += '<p>' + key + ', ' + value + '</p>';
                            });
                        }

                        MC.util.showPopupOK(Localization.MC_DeletedIconsTitle, text, "MC.ajax.reloadMainContent()");
                    }
                    else {
                        MC.ajax.reloadMainContent();
                    }
                },
                errorCallback: function () {
                    $(MC.ui.loading.loaderCloseButton).one('click.close', MC.ajax.reloadMainContent);
                }
            });
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        FieldCategories: new FieldCategories()
    });

})(window, MC.GlobalSettings);
