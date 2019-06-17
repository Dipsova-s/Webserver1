(function (win, models) {

    function TablesFields() {
        var self = this;
        self.SaveUri = '';
        self.TableUri = '';
        self.TableFieldsUri = '';
        self.DeleteList = [];
        self.SelectingRoles = [];
        self.AssignedRoles = [];
        self.PageTitle = '';

        self.InitialTable = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#Grid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);
        };

        self.InitialTableFields = function (data) {
            self.SaveUri = '';
            self.TableUri = '';
            self.TableFieldsUri = '';
            self.DeleteList = [];
            self.SelectingRoles = [];
            self.AssignedRoles = [];
            self.PageTitle = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {
                $("#breadcrumbList li").last().replaceWith('<li><a class="noLink" >' + self.PageTitle + '</a></li>');

                self.InitialAssignedTableGrid();

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.InitialAssignedTableGrid = function () {
            self.DeleteList = [];

            var grid = jQuery('#DownloadTableGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.AssignedTableGridDataBound);
                grid.trigger('dataBound');

                //var primaryFieldCount = 0;
                //jQuery.each(grid.dataSource.data(), function (index, data) {
                //    if (data.is_key_field) {
                //        data.sort_key = primaryFieldCount;
                //        primaryFieldCount++;
                //    }
                //    else {
                //        data.sort_key = 99;
                //    }
                //});
                //grid.wrapper
                //    .find('.k-header:not([data-field="is_key_field"],[data-field="uri"])')
                //    .addClass('k-header-sorter')
                //    .on('click', { grid: grid }, function (e) {
                //        var element = jQuery(this);
                //        var grid = e.data.grid;
                //        var sortField = element.data('field');
                //        var sortDir = element.find('.k-icon').hasClass('k-i-arrow-n') ? 'desc' : 'asc';

                //        grid.dataSource.sort([
                //            { field: 'sort_key', dir: 'asc' },
                //            { field: sortField, dir: sortDir }
                //        ]);
                //        grid.wrapper.find('.k-header .k-icon').remove();
                //        element.children('.k-link').append('<span class="k-icon k-i-arrow-' + (sortDir === 'asc' ? 'n' : 's') + '"></span>');
                //    });
            }
        };
        self.AssignedTableGridDataBound = function (e) {
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id).addClass(dataItems[index].is_mandatory ? 'disabled' : '');
            });

            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('input[value="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);
        };
        self.AssignedTableDeletionCheckMark = function (obj, isRemove) {
            var data = $(obj).data('parameters');

            var index = $.inArray(data.id, self.DeleteList);
            if (isRemove) {
                if (index === -1) {
                    self.DeleteList.push(data.id);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteList.splice(index, 1);
                }
            }
        };

        self.InitialAvailableTableGrid = function () {
            self.SelectingRoles = {};

            var grid = jQuery('#AvailableFieldsGrid').data('kendoGrid');
            if (grid) {
                if (!grid.__bind_databound) {
                    grid.__bind_databound = true;
                    grid.bind('dataBound', self.AvailableTableGridDataBound);
                }
                grid.trigger('dataBound');
            }
        };
        self.AvailableTableGridDataBound = function (e) {
            // set multiple selection events
            var availableGrid = e.sender;
            if (availableGrid) {
                if (!availableGrid._set_custom_handler) {
                    availableGrid._set_custom_handler = true;

                    availableGrid.content.on('dblclick', 'tr', function () {
                        var row = $(this),
                            item;

                        if (!row.hasClass('k-state-disabled')) {
                            item = availableGrid.dataSource.getByUid(row.data('uid'));
                            self.SelectingRoles = {};
                            self.SelectingRoles[item.name] = item;

                            $('#popupDownloadTableFields .btnAddRoles').trigger('click');
                        }
                    });

                    availableGrid.content.on('click', 'tr', function () {
                        var row = $(this),
                            uid = row.data('uid'),
                            item = availableGrid.dataSource.getByUid(uid);

                        if (!row.hasClass('k-state-disabled')) {
                            if (row.hasClass('k-state-selected')) {
                                delete self.SelectingRoles[item.name];
                                row.removeClass('k-state-selected');
                            }
                            else {
                                self.SelectingRoles[item.name] = item;
                                row.addClass('k-state-selected');
                            }
                        }
                    });
                }

                // set selected / disabled
                self.CheckAvailableTableGrid(availableGrid);
            }
        };
        self.CheckAvailableTableGrid = function (grid) {
            grid.content.find('tr').removeClass('k-state-selected k-state-disabled');

            $.each(grid.dataSource.data(), function (index, item) {
                if ($.inArray(item.name, self.AssignedRoles) !== -1) {
                    grid.tbody.find('tr[data-uid="' + item.uid + '"]').addClass('k-state-disabled');
                }
                else if (self.SelectingRoles[item.name]) {
                    grid.tbody.find('tr[data-uid="' + item.uid + '"]').addClass('k-state-selected');
                }
            });
        };
        self.ShowAvailableFields = function () {
            MC.ui.popup('setScrollable', {
                element: '#popupDownloadTableFields',
                onResize: function (win) {
                    var grid = win.element.find('.k-grid');
                    grid.height(win.element.find('.popupContent').height() - 45);
                    kendo.resize(grid, true);
                }
            });

            self.SelectingRoles = {};

            var assignRolesGrid = $('#DownloadTableGrid').data('kendoGrid'),
                availableGrid = $('#AvailableFieldsGrid').data('kendoGrid');

            if (!availableGrid) {
                MC.ui.popup('requestStart');

                MC.ajax.request({
                    element: '#btnAddFields',
                    target: '#AvailableFieldsGridContainer'
                })
                    .fail(function () {
                        $('#popupDownloadTableFields').data('kendoWindow').close();
                    })
                    .done(function () {
                        self.InitialAvailableTableGrid();

                        initShowAvailableGrid();
                    })
                    .always(function () {
                        setTimeout(function () {
                            MC.ui.popup('requestEnd');
                        }, 100);
                    });
            }
            else {
                initShowAvailableGrid();
            }

            function initShowAvailableGrid() {
                // set assigned roles
                self.AssignedRoles = [];
                if (assignRolesGrid) {
                    $.each(assignRolesGrid.items(), function (index, item) {
                        var fieldName = $.trim($(item).children(':first').text());
                        self.AssignedRoles.push(fieldName);
                    });
                }

                if (availableGrid) {
                    availableGrid.trigger('dataBound');
                }

                setTimeout(function () {
                    var win = $('#popupDownloadTableFields').data('kendoWindow');
                    win.trigger('resize');
                }, 100);
            }
        };
        self.AddFields = function () {
            var grid = $('#DownloadTableGrid tbody'), row;
            var countNewRole = 0;
            $.each(self.SelectingRoles, function () {

                if ($.inArray(this.name, self.AssignedRoles) === -1) {
                    countNewRole = countNewRole + 1;
                    self.AssignedRoles.push(this.name);
                    MC.form.template.addRow($('<div />', {
                        data: {
                            template: '#templateDownloadTableGrid',
                            grid: '#DownloadTableGrid'
                        }
                    }));

                    var isChecked = this.key_field === true ? 'checked="checked"' : '';

                    row = grid.children(':last');
                    row.children(':eq(0)').html(this.name);
                    row.children(':eq(1)').html(this.description);
                    row.children(':eq(2)').html('<label><input name="is_key_field" value="' + this.key_field + '" data-default="' + this.key_field + '" disabled="disabled"' + isChecked + ' type="checkbox"/><span class="label"></span></label>');
                    row.children(':eq(3)').html(this.datatype);
                    row.children(':eq(4)').html(this.size);
                    row.children(':eq(5)').html(this.domain);
                    row.children(':eq(6)').html(this.rolename);
                    row.children(':eq(7)').find('input').val(this.id);
                }
            });
            var existLabel = $("#DownloadTableGrid .k-pager-info").text().split(" ");
            if (existLabel.length === 6) {
                $("#DownloadTableGrid .k-pager-info").text($("#DownloadTableGrid .k-pager-info").text() + " ( " + countNewRole + " " + Localization.MC_ItemsAdded + " )");
            }
            else if (existLabel.length === 11) {
                existLabel[7] = parseInt(existLabel[7]) + countNewRole;
                $("#DownloadTableGrid .k-pager-info").text(existLabel.join(" "));
            }
            else {
                $("#DownloadTableGrid .k-pager-info").text($("#DownloadTableGrid .k-pager-info").text() + " ( " + countNewRole + " " + Localization.MC_ItemsAdded + " )");
            }
        };

        self.CheckDeltaDownload = function (obj) {
            if (obj.value !== "") {
                jQuery('#deltaDownload').prop("disabled", false);
            }
            else {
                $("#deltaDownload").attr("checked", false);
                jQuery('#deltaDownload').prop("disabled", true);
            }
        };

        self.RemoveNewItem = function (obj) {
            MC.form.template.remove(obj);

            var existLabel = $("#DownloadTableGrid .k-pager-info").text().split(" ");
            if (existLabel.length === 6) {
                existLabel[4] = parseInt(existLabel[4]) - 1;
                $("#DownloadTableGrid .k-pager-info").text(existLabel.join(" "));
            }
            else if (existLabel.length === 11) {
                existLabel[7] = parseInt(existLabel[7]) - 1;
                $("#DownloadTableGrid .k-pager-info").text(existLabel.join(" "));
            }
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};
            data.tableUri = self.TableUri;
            data.tableFieldsUri = self.TableFieldsUri;
            data.customCondition = encodeURIComponent(jQuery.trim(jQuery('#customCondition').val()));
            data.deltaCondition = encodeURIComponent(jQuery.trim(jQuery('#deltaCondition').val()));
            data.detaDownload = jQuery('#deltaDownload').prop('checked');
            data.downloadAllFields = jQuery('#downloadAllFields').prop('checked');
            data.fieldsData = self.GetUpdateFields();

            data.deleteList = self.DeleteList.slice();

            return data;
        };

        self.GetUpdateFields = function () {
            var datas = [];
            $('#DownloadTableGrid tr.newRow').each(function () {
                if (!$(this).hasClass('rowMaskAsRemove')) {
                    var id = $(this).find("td:eq(7) input").val();
                    var row = { 'fields': [{ 'id': id, 'is_enabled': true }] };
                    datas.push(row);
                }
            });
            $.each(self.DeleteList, function (index, item) {
                var row = { 'fields': [{ 'id': item, 'is_enabled': false }] };
                datas.push(row);
            });

            return datas.length === 0 ? "" : JSON.stringify(datas);
        };

        self.SaveFields = function () {
            MC.form.clean();

            if (!$('#formEditTable').valid()) {
                $('#formEditTable .error:first').focus();
                return false;
            }

            var data = self.GetData();
            MC.ajax
                .request({
                    url: self.SaveUri,
                    parameters: {
                        tableUri: data.tableUri,
                        tableFieldsUri: data.tableFieldsUri,
                        customCondition: data.customCondition,
                        deltaCondition: data.deltaCondition,
                        deltaDownload: data.detaDownload,
                        downloadAllFields: data.downloadAllFields,
                        fieldsData: data.fieldsData
                    },
                    type: "PUT"
                })
                .done(function (response) {
                    self.DeleteList = [];
                    if (response.removedData.length > 0 || !$.isEmptyObject(response.un_removeData)) {
                        var text = '';
                        if (response.removedData.length > 0) {
                            text += '<p>' + MC_RemovedFieldsList + '</p>';
                            $.each(response.removedData, function (index, item) {
                                text += '<p>' + item + '</p>';
                            });
                        }
                        if (!$.isEmptyObject(response.un_removeData)) {
                            text += '<p>' + MC_UnRemovedFieldsList + '</p>';
                            $.each(response.un_removeData, function (key, value) {
                                text += '<p>' + key + ', ' + value + '</p>';
                            });
                        }
                        MC.util.showPopupOK(Localization.MC_DeletedTableFieldsTitle, text, "MC.ajax.reloadMainContent()");
                    }

                    MC.ajax.reloadMainContent();
                })
                .fail(function () {
                    $('#loading .loadingClose').one('click.close', function () {
                        MC.ajax.reloadMainContent();
                    });
                });
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        TablesFields: new TablesFields()
    });

})(window, MC.Models);
