/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/displayqueryblockmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/ListHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />

describe("ListHandler", function () {
    var listHandler;
    beforeEach(function () {
        listHandler = new ListHandler();
    });

    describe(".GetGridScrollSettings", function () {
        it("should use default value if no scrollPosition argument", function () {
            var result = listHandler.GetGridScrollSettings();
            expect(result.left).toEqual(0);
            expect(result.top).toEqual(0);
        });

        it("should get scroll position from html element if scrollPosition is true", function () {
            var result = listHandler.GetGridScrollSettings(true);
            expect(result.left).toEqual(undefined);
            expect(result.top).toEqual(undefined);
        });

        it("should use scrollPosition if scrollPosition is object", function () {
            var result = listHandler.GetGridScrollSettings({ left: 5, top: 10 });
            expect(result.left).toEqual(5);
            expect(result.top).toEqual(10);
        });
    });

    describe(".GetGridScrollSettingsData", function () {
        it("should get scroll settings from html element", function () {
            $('<div id="AngleGrid" />').hide().data('scrollSettings', { left: 5, top: 5 }).appendTo('body');
            var result = listHandler.GetGridScrollSettingsData();
            expect(result.left).toEqual(5);
            expect(result.top).toEqual(5);
            $('#AngleGrid').remove();
        });
    });

    describe(".SetGridScrollSettingsData", function () {
        it("should set scroll settings from html element", function () {
            $('<div id="AngleGrid" />').hide().appendTo('body');
            listHandler.SetGridScrollSettingsData(true);
            var result = $('#AngleGrid').data('scrollSettings');
            expect(result).toEqual(true);
            $('#AngleGrid').remove();
        });
    });

    describe(".GetGridRowHeight", function () {
        it("should get 26 if no html element", function () {
            var result = listHandler.GetGridRowHeight($());
            expect(result).toEqual(26);
        });

        it("should get height of html element", function () {
            $('<div id="Test"><table class="k-grid-content"><tr><td style="height: 100px">&nbsp;</td></tr></table></div>').appendTo('body');
            var result = listHandler.GetGridRowHeight($('#Test'));
            expect(result).not.toEqual(26);
            $('#Test').remove();
        });
    });

    describe(".ConvertDataRow", function () {
        it("should correctly update data rows", function () {
            var fieldNames = ["ID", "ObjectType", "BottleneckType"];
            var rowData = ["80011670/4", "DeliveryNoteLine", "bt09DelayInProcessing"];
            listHandler.Models = {
                Display: {
                    Data: ko.observable({
                        fields: [{ field: "BottleneckType" }, { field: "ObjectType" }, { field: "ID" }]
                    })
                }
            };

            var actualFields = listHandler.Models.Display.Data().fields;
            var result = listHandler.ConvertDataRow(fieldNames, rowData);
            expect(result[actualFields[0].field.toLowerCase()]).toEqual(rowData[2]);
            expect(result[actualFields[1].field.toLowerCase()]).toEqual(rowData[1]);
            expect(result[actualFields[2].field.toLowerCase()]).toEqual(rowData[0]);
        });
    });

    describe(".GenerateMainContextMenu", function () {

        beforeEach(function () {
            spyOn(resultModel, 'IsSupportSapTransaction').and.callFake(function () {
                return true;
            });
        });

        it("should have Go to SAP menu", function () {
            var result = listHandler.GenerateMainContextMenu([]);

            // assert
            expect(result.gotosap).toBeDefined();
        });

        it("should not have Go to SAP menu", function () {
            resultModel.IsSupportSapTransaction.and.callFake(function () {
                return false;
            });
            var result = listHandler.GenerateMainContextMenu([]);

            // assert
            expect(result.gotosap).not.toBeDefined();
        });
    });
    describe(".GetGridOptions", function () {

        beforeEach(function () {
            spyOn(listHandler, 'GetGridDataSource').and.returnValue([]);
            spyOn(listHandler, 'GetGridHeight').and.returnValue(0);
            spyOn(listHandler, 'GetTemplate').and.returnValue([]);
            spyOn(listHandler, 'OnColumnResize');
            spyOn(listHandler, 'OnDataBinding');
            spyOn(listHandler, 'OnColumnReorder');
            spyOn(listHandler, 'OnDataBound');
            spyOn(listHandler, 'IsDeviceIpad').and.returnValue(true);
        });

        it("should return options with selectable as 'cell' for iPad", function () {

            var gridOptions = listHandler.GetGridOptions({});
            expect(gridOptions.selectable).toEqual("cell");
        });

        it("should return options with selectable as 'multiple cell' for other devices", function () {
            listHandler.IsDeviceIpad.and.callFake(function () {
                return false;
            });
            var gridOptions = listHandler.GetGridOptions({});
            expect(gridOptions.selectable).toEqual("multiple cell");
        });
    });

    describe(".OnContentCopy", function () {
        it("should call click function", function () {
            spyOn($.fn, 'click');
            listHandler.OnContentCopy();
            expect($.fn.click).toHaveBeenCalled();
        });
    });
    describe(".IsDeviceIpad", function () {
        it("should call test method", function () {
            spyOn(RegExp.prototype, 'test');
            listHandler.IsDeviceIpad();
            expect(RegExp.prototype.test).toHaveBeenCalled();
        });
    });
    describe(".GetContextMenuOptions", function () {
        it("should return options with event as 'click contextmenu'", function () {
            var contextMenuOptions = listHandler.GetContextMenuOptions();
            expect(contextMenuOptions.event).toEqual("click contextmenu");
        });
    });
    describe(".ResetLeftClickFirstCell", function () {
        it("should reset values of LeftClickFirstCell object", function () {
            listHandler.ResetLeftClickFirstCell();
            expect(listHandler.LeftClickFirstCell).toEqual(jasmine.objectContaining({
                RowId: -1
            }));
            expect(listHandler.LeftClickElement).toEqual({});
        });
    });
    describe(".TotalGridCountFinal", function () {
        it("should reset values of LeftClickFirstCell object", function () {
            var decrementedValue = listHandler.TotalGridCountFinal(5);
            expect(decrementedValue).toEqual(4);
        });
    });
    describe(".GetSelectedAreaData", function () {
        it("should return selected area data object", function () {
            var grid = {
                select: function () {
                    return $();
                },
                columns: { length: 5}
            };
            spyOn($.fn, 'index').and.returnValues(0, 6);
            var selectedData = listHandler.GetSelectedAreaData(grid, grid.select(), grid.select());
            expect(selectedData).toBeDefined();
            expect(Object.keys(selectedData).length).toEqual(5);
        });
    });
    describe(".IsIndexInSelectedArea", function () {
        it("should get true if click within selection", function () {
            spyOn(listHandler, 'GetSelectedAreaData').and.callFake(function () {
                return {
                    totalGridCount: 6,
                    dragStart: 0,
                    dragEnd: 6,
                    noOfColumns: 2,
                    noOfRows: 2
                };
            });
            var grid = {
                select: function () {
                    return {
                        first: function () {
                            return $();
                        },
                        last: function () {
                            return $();
                        }
                    }
                }
            };
            var isSelectionInside = listHandler.IsIndexInSelectedArea(0, grid);
            expect(isSelectionInside).toBeTruthy();
        });

        it("should get false if click outside selection", function () {
            spyOn(listHandler, 'GetSelectedAreaData').and.callFake(function () {
                return {
                    totalGridCount: 6,
                    dragStart: 0,
                    dragEnd: 6,
                    noOfColumns: 2,
                    noOfRows: 2
                };
            });
            var grid = {
                select: function () {
                    return {
                        first: function () {
                            return $();
                        },
                        last: function () {
                            return $();
                        }
                    }
                }
            };
            var isSelectionInside = listHandler.IsIndexInSelectedArea(3, grid);
            expect(isSelectionInside).toBeFalsy();
        });
    });
    describe(".OnContextMenuShow", function () {
        var grid;
        beforeEach(function () {
            grid = {
                select: function () {
                    return $();
                },
                columns: [{}, { field: ""}],
                dataSource: {
                   view: function () {
                        return $();
                    }
                },
                clearSelection: function () {
                    return ;
                }
            };
            spyOn(listHandler, 'GetGridObject').and.callFake(function () {
                return grid;
            });
            spyOn(listHandler, 'HideHeaderPopup');
            spyOn(listHandler, 'IsDeviceIpad').and.returnValue(false);
            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(true);
            spyOn(resultModel, 'IsSupportSapTransaction').and.returnValue(true);
            listHandler.Models.Display = {
                GetDisplayByFieldName: function () { return true; },
                Data: function () { return { fields: "" }; }
            };
            listHandler.Models.Angle = {
                Data: function () { return { model: "" }; }
            };
        });

        it("Context menu should appear on right click", function () {
            spyOn(listHandler, 'ContextMenuRenderPosition');
            spyOn($.fn, 'index').and.returnValues(0, 0);

            var rightClick = $.Event("contextmenu");
            rightClick.which = 3;
            listHandler.OnContextMenuShow(rightClick, $());
            expect(listHandler.ContextMenuRenderPosition).toHaveBeenCalled();
        });
        
        it("should select area between two cells", function () {
            spyOn(listHandler, 'GetSelectedAreaData').and.callFake(function () {
                return {
                    totalGridCount: 5,
                    dragStart: 0,
                    dragEnd: 6,
                    noOfColumns: 2,
                    noOfRows: 2
                };
            });
            var shiftClick = $.Event("click");
            shiftClick.shiftKey = true;
            shiftClick.which = 1;
            spyOn($.fn, 'addClass');
            listHandler.LeftClickFirstCell.RowId = 0;
            listHandler.LeftClickElement = $();
            listHandler.OnContextMenuShow(shiftClick, $());
            expect($.fn.addClass.calls.count()).toEqual(4);
        });
        it("should return false on left or control plus left click", function () {
            spyOn(listHandler, 'SetLeftClickFirstCell');
            spyOn(listHandler, 'HideContextMenu');
            var leftClick = $.Event("click");
            leftClick.which = 1;
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'index');
            listHandler.OnContextMenuShow(leftClick, $());
            expect($.fn.addClass).toHaveBeenCalled();
            expect(listHandler.SetLeftClickFirstCell).toHaveBeenCalled();
            expect(listHandler.HideContextMenu).toHaveBeenCalled();
        });
    });
    describe(".ContextMenuRenderPosition", function () {
        it("MenuOptions should only have copy options", function () {
            var column = { field: "" }, context = $();
            var menu = jasmine.createSpyObj('menu', ['width', 'height', 'offset', 'attr','css']);
            menu.offset = function () {
                return { left: 0, top: 0 };
            };
            spyOn(listHandler, 'RenderContextMenu');

            spyOn(listHandler, 'CreateContextMenu').and.callFake(function () {
                return {
                    items: {
                        drilldown: '',
                        copy: ''
                    }
                };
            });
            listHandler.ContextMenuRenderPosition(true, column, [], menu, context);
            expect(listHandler.MenuOptions.items.copy).toBeDefined();
            expect(Object.keys(listHandler.MenuOptions.items).length).toEqual(1);
        });
    });
    describe(".SetLeftClickFirstCell", function () {
        it("should set LeftClickFirstCell values", function () {
            var context = {
                parentElement: { rowIndex: 0 },
            };
            listHandler.SetLeftClickFirstCell(context);
            expect(listHandler.LeftClickFirstCell).toEqual(jasmine.objectContaining({
                RowId: 0,
            }));
            expect(listHandler.LeftClickElement).toEqual(jasmine.objectContaining(context));
        });
    });
    describe(".GetTemplateCellData", function () {
        it("should get template for angleurl link element", function () {
            var fieldData = "sampleData",fieldId = {
                id: "angleurl",
                fieldtype: "text"
            }
            var result = listHandler.GetTemplateCellData(fieldId, fieldData);
            expect(result).toEqual("#= window['" + listHandler.ModelId + "'].GetFormatValue('" + fieldId.id + "', data['" + fieldData + "']) #");
        });
    });
    describe(".GetFormatValue", function () {
        it("should get angle url angle tag", function () {
            var cellValue = "/sampleUrl", fieldId = "angleurl";
             
            var result = listHandler.GetFormatValue(fieldId, cellValue);
            expect(result).toEqual("<a class='angleUrlLink' href='" + cellValue + "'>" + cellValue + "</a>");
        });
        it("should get cellvalue as null", function () {
            var cellValue = null, fieldId = "angleurl";
            var result = listHandler.GetFormatValue(fieldId, cellValue);
            expect(result).toEqual('');
        });
    });
});

