/* 
    M4-10056: Implement 'Find' in angle result
    Implemented date: 21-11-2014
    Implemented by: Akkaradate (Date) Somwong
    Implemented for: control management of popup 'Find' GUI
    Parameters: 
    Call from: 1.anglePageHandler.ShowFindPopup
*/
function FindPopupHandler() {
    "use strict";

    /*  BOF: Properties */
    var self = this;
    self.StartRow = null;
    self.LastSearchQuery = {
        query: null,
        result: false
    };
    self.SearchResultsCache = {
        uri: null,
        data: {}
    };
    /*  EOF: Properties */




    /*  BOF: Methods */
    /*
        ShowPopup: used for initialization for open find popup
        Parameters: 
    */
    self.ShowPopup = function (option) {
        if (jQuery('#popupFindAngleResult').is(':visible')) {
            jQuery('#findText').focus();
            return;
        }

        requestHistoryModel.SaveLastExecute(self, self.ShowPopup, arguments);
        requestHistoryModel.ClearPopupBeforeExecute = true;
        // initial popup settings
        var popupName = 'FindAngleResult';
        var popupSettings = {
            title: Localization.Find, 
            element: '#popup' + popupName,
            html:findAngleResultHtmlTemplate(),
            className: 'popup' + popupName,
            resizable: false,
            actions: ["Close"],
            modal: false,
            center: false,
            position: {
                top: 40,
                left: (WC.Window.Width - 500) / 2
            },
            buttons: [
                {
                    text: Captions.Button_Cancel,
                    click: 'close',
                    position: 'right'
                },
                {
                    className: 'btnSubmit executing',
                    text: Localization.Ok,
                    click: function (e, obj) {
                        if (popup.CanButtonExecute(obj)) {
                            self.SearchResult(jQuery(obj));
                        }
                    },
                    isPrimary: true,
                    position: 'right'
                }
            ],
            open: function (e) {
                jQuery(document).off('keypress.findText').on('keypress.findText', function (evt) {
                    var code = evt.keyCode || evt.which;
                    if (code === 13) {
                        e.sender.wrapper.find('.btnSubmit').trigger('click');
                    }
                });
                self.ShowPopupCallback(e);
            },
            close: function () {
                jQuery(document).off('keypress.findText');
            }
        };

        popup.Show(popupSettings);
    };
    self.ShowPopupCallback = function (e) {
        jQuery('#findText').focus();
        // Binding ko => for localization text
        WC.HtmlHelper.ApplyKnockout(Localization, jQuery('#findPopupArea'));

        /* BOF: Generate datas for field dropdown list */
        var datas = self.GetSearchableColumns();
        if (!datas.length) {
            popup.Info(Localization.Info_NoFieldTypeTextInResult);
            e.sender.close();
            return;
        }
        self.BindingFieldDropdownList(datas);
        /* EOF: Generate datas for field dropdown list */

        if (self.SearchResultsCache.uri !== resultModel.Data().search) {
            self.SearchResultsCache.uri = resultModel.Data().search;
            self.SearchResultsCache.data = {};
        }

        e.sender.wrapper.find('.k-window-buttons .btn').removeClass('executing');
    };
    self.ClosePopup = function () {
        popup.Close('#popupFindAngleResult');
    };
    self.SearchResult = function (submitButton, isLoop) {
        jQuery('#findText').focus();

        var grid = jQuery('#AngleGrid').data(enumHandlers.KENDOUITYPE.GRID);
        var totals = grid.dataSource.total();
        var q = jQuery.trim(jQuery('#findText').val());
        if (!q) {
            return;
        }

        if (typeof isLoop === 'undefined') {
            isLoop = false;
        }

        var query = {};

        // q
        query[enumHandlers.FINDPARAMETER.Q] = q;

        // case-sensitive
        query[enumHandlers.FINDPARAMETER.CASESENSITIVE] = jQuery('#caseSensitive').is(':checked');

        // fields
        var fields = [];
        var fieldDropdownList = jQuery('#fieldDropdownList').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST);
        if (jQuery('#allTextFind').is(':checked')) {
            jQuery.each(fieldDropdownList.dataSource.data(), function (index, field) {
                fields.push(field.Value);
            });
        }
        else {
            var fieldDropdownList = jQuery('#fieldDropdownList').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST);
            fields.push(fieldDropdownList.value());
        }
        query[enumHandlers.FINDPARAMETER.FIELDS] = fields.join(',');

        // dir
        var dir = jQuery('#directionForward').is(':checked') ? enumHandlers.FINDPARAMETER.FORWARD : enumHandlers.FINDPARAMETER.BACKWARD;
        query[enumHandlers.FINDPARAMETER.DIRECTION] = dir;

        // scope
        var scopeType;
        if (jQuery('#originScope').is(':checked') || listHandler.SelectingRowId === null || isLoop) {
            self.StartRow = null;
            scopeType = 'origin';
        }
        else {
            scopeType = 'cursor';
        }
        jQuery('#originCursor').prop('checked', true);

        // start-row
        if (scopeType === 'origin') {
            if (dir === enumHandlers.FINDPARAMETER.FORWARD) {
                self.StartRow = 0;
            }
            else {
                self.StartRow = totals - 1;
            }
        }
        else {
            self.StartRow = listHandler.SelectingRowId - 1;
            if (dir === enumHandlers.FINDPARAMETER.FORWARD) {
                self.StartRow++;
                if (self.StartRow >= totals) {
                    self.StartRow = 0;
                }
            }
            else {
                self.StartRow--;
                if (self.StartRow < 0) {
                    self.StartRow = totals - 1;
                }
            }
        }
        query[enumHandlers.FINDPARAMETER.STARTROW] = self.StartRow;

        submitButton.addClass('executing');
        jQuery.when(self.SearchResultsCache.data[JSON.stringify(query)] || GetDataFromWebService(resultModel.Data().search, query))
            .fail(function () {
                submitButton.removeClass('executing');
            })
            .done(function (data) {
                grid.clearSelection();
                submitButton.removeClass('executing');

                self.SearchResultsCache.data[JSON.stringify(query)] = ko.toJS(data);

                delete query[enumHandlers.FINDPARAMETER.DIRECTION];
                delete query[enumHandlers.FINDPARAMETER.STARTROW];

                if (data.row_id === -1 || (listHandler.SelectingRowId === 1 && data.dir === enumHandlers.FINDPARAMETER.BACKWARD)) {
                    delete query[enumHandlers.FINDPARAMETER.STARTROW];
                    self.LastSearchQuery.query = null;
                    popup.Info(Localization.Info_SearchResultDoesNotExists);
                }
                else {
                    self.LastSearchQuery.result = true;
                    listHandler.SelectingRowId = data.row_id + 1;
                    self.StartRow = data.row_id;

                    var startViewItem = Math.ceil(grid.virtualScrollable.verticalScrollbar.scrollTop() / grid.virtualScrollable.itemHeight);
                    var endViewItem = Math.floor(startViewItem + (grid.content.height() / grid.virtualScrollable.itemHeight));
                    if (listHandler.SelectingRowId <= startViewItem || listHandler.SelectingRowId >= endViewItem) {
                        submitButton.addClass('executing');

                        grid.virtualScrollable.verticalScrollbar.scrollTop(Math.max(grid.virtualScrollable.itemHeight * data.row_id - 1, 0));

                        var page = Math.floor(data.row_id / grid.dataSource.pageSize()) + 1;
                        if (grid.dataSource.page() === page) {
                            grid.trigger('dataBound');
                            setTimeout(function () {
                                submitButton.removeClass('executing');
                            }, 500);
                        }
                        else {
                            var fnCheckSearchCompleted = setInterval(function () {
                                if (!grid.dataSource._requestInProgress) {
                                    if (!grid.element.find('[data-rowid="' + self.SelectingRowId + '"]').hasClass('k-row-selected')) {
                                        grid.trigger('dataBound');
                                    }
                                    setTimeout(function () {
                                        submitButton.removeClass('executing');
                                    }, 1000);
                                    clearInterval(fnCheckSearchCompleted);
                                }
                            }, 100);
                        }
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }

                self.LastSearchQuery.query = JSON.stringify(query);
            });
    };
    self.ClearSearchSetting = function () {
        self.StartRow = null;
    };
    self.GetSearchableColumns = function () {
        var modelUri = angleInfoModel.Data().model;
        var datas = [], field, source;
        var listGrid = jQuery('#AngleGrid').data(enumHandlers.KENDOUITYPE.GRID);
        for (var loop = 1; loop < listGrid.columns.length; loop++) {
            if (listGrid.columns[loop].valid) {
                field = modelFieldsHandler.GetFieldById(listGrid.columns[loop].field, modelUri);
                if (field && field.fieldtype === enumHandlers.FIELDTYPE.TEXT) {
                    if (field.source) {
                        source = modelFieldSourceHandler.GetFieldSourceByUri(field.source);
                    }
                    else {
                        source = null;
                    }
                    datas.push({ Text: (source ? userFriendlyNameHandler.GetFriendlyName(source, enumHandlers.FRIENDLYNAMEMODE.SHORTNAME) + ' - ' : '') + listGrid.columns[loop].title, Value: listGrid.columns[loop].field });
                }
            }
        }
        return datas;
    };
    self.BindingFieldDropdownList = function (datas) {
        WC.HtmlHelper.DropdownList('#fieldDropdownList', datas, {
            dataTextField: 'Text',
            dataValueField: 'Value',
            dataSource: datas,
            index: 0,
            enable: jQuery('#selectTextFind').is(':checked')
        });
    };
    self.ToggleFieldDropdownList = function (option) {
        if (typeof option === 'undefined' || typeof option.Status === 'undefined')
            return;

        jQuery('#fieldDropdownList').data(enumHandlers.KENDOUITYPE.DROPDOWNLIST).enable(option.Status);
    };
    /*  BOF: Methods */
}
