var gotosaphandler = new GoToSapHandler();

function GoToSapHandler() {
    "use strict";

    var self = this;
    var _self = {};

    self.SapTransactionFieldCache = {};
    self.DatarowsIsRunning = false;

    _self.SapTransactionObject = {};

    self.Models = {
        Angle: angleInfoModel,
        Display: displayModel,
        DisplayQueryBlock: displayQueryBlockModel,
        Result: resultModel
    };
    self.GenerateGoToSapMenu = function (grid) {
        self.DatarowsIsRunning = true;
        var row = grid.dataSource.view()[grid.select().parent('tr').index()]

        row[enumHandlers.GENERAL.ROWID] = '' + (row[enumHandlers.GENERAL.ROWID]);

        jQuery.when(self.GetObjectDetails(row))
            .done(function (data) {
                var uri = gotosaphandler.GetSapTransactionUri(data);
                _self.SapTransactionObject = data;
                var data = self.SapTransactionFieldCache[uri];
                if (!data) {
                    // load transaction
                    self.SapTransactionFieldCache[uri] = { busy: true };
                    var target = jQuery('li[name="gotosap"]');
                    target.children('ul').empty();
                    target.children('.btn-more').removeClass('icon-chevron-right').addClass('loader-spinner-inline');
                    gotosaphandler.GetSapTransaction(uri)
                        .always(function () {
                            self.GenerateSapSubMenu(self.SapTransactionFieldCache[uri]);
                            target.children('.btn-more').addClass('icon-chevron-right').removeClass('loader-spinner-inline');
                        });
                }
                else if (!data.busy) {
                    // use cache
                    self.GenerateSapSubMenu(self.SapTransactionFieldCache[uri]);
                }
                self.DatarowsIsRunning = false;
            });
    };
    self.GenerateSapSubMenu = function (data) {
        var menu = jQuery('li[name="gotosap"]');
        var ul = menu.children('ul');
        ul.empty().show();

        if (data && data.sap_transactions && data.sap_transactions.length) {
            jQuery.each(data.sap_transactions, function (i, transaction) {
                var item = {
                    id: 'sap',
                    name: transaction.id,
                    description: transaction.description
                };
                listHandler.AddContextMenuItem(ul, item);
            });
        }
        else {
            listHandler.AddEmptyContextMenuItem(ul, Localization.GoToSapNotAvailable);
        }
        listHandler.UpdateContextMenuPosition(menu);
        menu.children('i.btn-more').removeClass('loader-spinner-inline').addClass('icon-chevron-right');
    };
    self.GetObjectDetails = function (row) {
        var primaryData = listDrilldownHandler.GetPrimaryKeyData(row);
        var hasPkFields = primaryData.hasPkFields,
            isValidPkValue = primaryData.isValidPkValue,
            pkFields = primaryData.pkFields,
            pkData = primaryData.pkData,
            i;

        function getPageByRowId(grid, id) {
            var page = grid.dataSource.page();
            jQuery.each(grid.dataSource._ranges, function (k, v) {
                jQuery.each(v.data, function (k2, v2) {
                    if (v2[enumHandlers.GENERAL.ROWID] - 1 === id) {
                        page = (v.start / grid.dataSource.pageSize()) + 1;
                        return false;
                    }
                });
            });
            return page || 0;
        }

        if (hasPkFields) {
            if (!isValidPkValue) {
                return self.SetError({}, Localization.DrilldownErrorKeyNotValid.replace('{ObjectType}', unescape(pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE])));
            }
            else {
                return jQuery.when(pkData);
            }
        }
        else {
            var grid = jQuery('#AngleGrid').data(enumHandlers.KENDOUITYPE.GRID);
            var uri = directoryHandler.ResolveDirectoryUri(resultModel.Data().data_rows);
            var query = {};
            query['fields'] = pkFields.join(',');
            query[enumHandlers.PARAMETERS.OFFSET] = (getPageByRowId(grid, row[enumHandlers.GENERAL.ROWID] - 1) - 1) * grid.dataSource.pageSize();
            query[enumHandlers.PARAMETERS.LIMIT] = grid.dataSource.pageSize();

            return jQuery.when(GetDataFromWebService(uri, query))
                .then(function (data, status, xhr) {

                    if (data.fields.length !== pkFields.length) {
                        return self.SetError(xhr, Localization.DrilldownErrorNoIDField);
                    }
                    else if (!data.rows.length) {
                        return self.SetError(xhr, Localization.DrilldownErrorItemNotFound);
                    }
                    else {
                        var foundRow = false;
                        isValidPkValue = true;
                        jQuery.each(data.rows, function (k, v) {
                            if (v[enumHandlers.GENERAL.ROWID] === self.GetRowId(row)) {
                                i = 0;
                                jQuery.each(enumHandlers.PRIMARYFIELDS, function (k2, v2) {
                                    pkData[v2] = escape(data.rows[k].field_values[i]);
                                    if (pkData[v2] === '' || pkData[v2] === null) {
                                        isValidPkValue = false;
                                    }
                                    i++;
                                });
                                foundRow = true;
                                return false;
                            }
                        });
                        if (!foundRow) {
                            return self.SetError(xhr, Localization.DrilldownErrorItemNotFound);
                        }
                        else if (!isValidPkValue) {
                            return self.SetError(xhr, Localization.DrilldownErrorKeyNotValid.replace('{ObjectType}', unescape(pkData[enumHandlers.PRIMARYFIELDS.OBJECTTYPE])));
                        }
                        else {
                            return jQuery.when(pkData);
                        }
                    }
                });
        }
    };
    self.GetSapTransactionUri = function (data) {
        return kendo.format('{0}?object_type={1}', self.Models.Result.Data().sap_transactions, data.ObjectType);
    };
    self.GetSapTransactionDetailsUri = function (selectedTransaction, row) {
        return kendo.format('{0}?object_type={1}&object_id={2}&transaction_id={3}', self.Models.Result.Data().sap_transactions, _self.SapTransactionObject.ObjectType, _self.SapTransactionObject.ID, selectedTransaction);
    };
    self.GetSapTransaction = function (uri) {
        return GetDataFromWebService(uri)
            .done(function (data) {
                self.SapTransactionFieldCache[uri] = data;
            });
    };

    self.GetRowId = function (row) {
        return '' + (row[enumHandlers.GENERAL.ROWID] - 1);
    };
    self.SetError = function (xhr, message) {
        xhr.responseText = message;
        return jQuery.Deferred().reject(xhr, null, null).promise();
    };
};