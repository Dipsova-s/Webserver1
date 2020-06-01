/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepAggregationSortableHandler.js" />

describe('QueryStepAggregationSortableHandler', function () {
    var handler;

    beforeEach(function () {
        handler = new QueryDefinitionHandler();
        handler.Aggregation = { moveTo: $.noop };
        handler.GetAggregationRowFields = $.noop;
        handler.GetAggregationColumnFields = $.noop;
        handler.GetAggregationFieldsByArea = function () { return [{}]; };
    });

    describe('.GetPreviousItemCount', function () {
        beforeEach(function () {
            spyOn(handler, 'GetAggregationRowFields').and.returnValue([{}, {}]);
            spyOn(handler, 'GetAggregationColumnFields').and.returnValue([{}, {}, {}]);
        });

        it('should return 0 when area is [row]', function () {
            var itemArea = 'row';
            var result = handler.GetPreviousItemCount(itemArea);
            expect(result).toEqual(0);
        });

        it('should return total item in [row] section when area is [column]', function () {
            var itemArea = 'column';
            var result = handler.GetPreviousItemCount(itemArea);
            expect(result).toEqual(2);
        });

        it('should return total item in [row] and [column] section when area is [data]', function () {
            var itemArea = 'data';
            var result = handler.GetPreviousItemCount(itemArea);
            expect(result).toEqual(5);
        });
    });

    describe('.OnAggregationSortableChange', function () {

        var e = {
            action: '',
            oldIndex: 0,
            newIndex: 0,
            item: {
                get: $.noop,
                remove: $.noop,
                prevAll: function () { return [{}]; }
            }
        };

        it('should do nothing when action is [receive]', function () {
            e.action = 'receive';
            spyOn(handler.Aggregation, 'moveTo');

            handler.OnAggregationSortableChange(e);

            expect(handler.Aggregation.moveTo).toHaveBeenCalledTimes(0);
        });

        it('should move item inside section correctly', function () {
            e.action = 'sort';
            e.oldIndex = 3;
            e.newIndex = 0;

            spyOn(e.item, 'remove');
            spyOn(ko, 'dataFor').and.returnValue({ area: $.noop });
            spyOn(handler, 'GetPreviousItemCount').and.returnValue(2);
            spyOn(handler.Aggregation, 'moveTo');
            spyOn(handler, 'OpenAggregationAreaPanel');


            handler.OnAggregationSortableChange(e);
            expect(e.item.remove).toHaveBeenCalled();
            expect(handler.Aggregation.moveTo).toHaveBeenCalledWith(5, 2);
            expect(handler.OpenAggregationAreaPanel).toHaveBeenCalled();
        });

        it('should update count_index when move item in [data] section', function () {
            e.action = 'sort';
            e.oldIndex = 3;
            e.newIndex = 0;

            spyOn(e.item, 'remove');
            spyOn(ko, 'dataFor').and.returnValue({ area: function () { return 'data'; } });
            spyOn(handler, 'GetPreviousItemCount').and.returnValue(2);
            spyOn(handler.Aggregation, 'moveTo');
            spyOn(handler, 'UpdateCountField');
            spyOn(handler, 'OpenAggregationAreaPanel');

            handler.OnAggregationSortableChange(e);
            expect(e.item.remove).toHaveBeenCalled();
            expect(handler.Aggregation.moveTo).toHaveBeenCalledWith(5, 2);
            expect(handler.UpdateCountField).toHaveBeenCalled();
            expect(handler.OpenAggregationAreaPanel).toHaveBeenCalled();
        });

        it('should move item from [row] to [column] section correctly', function () {
            e.action = 'send';
            e.oldIndex = 2;
            e.newIndex = -1;

            spyOn(e.item, 'remove');
            spyOn(ko, 'dataFor').and.returnValue({ area: ko.observable('row') });
            spyOn(handler, 'GetPreviousItemCount').and.callFake(function (arg) {
                if (arg === 'row') {
                    return 0;
                } else if (arg === 'column') {
                    return 2;
                }
            });
            spyOn(handler.Aggregation, 'moveTo');
            spyOn(handler, 'OnAggregationChangeCallback');
            spyOn(handler, 'OpenAggregationAreaPanel');

            handler.OnAggregationSortableChange(e);
            expect(e.item.remove).toHaveBeenCalled();
            expect(handler.Aggregation.moveTo).toHaveBeenCalledWith(2, 2);
            expect(handler.OnAggregationChangeCallback).toHaveBeenCalled();
            expect(handler.OpenAggregationAreaPanel).toHaveBeenCalled();
        });

        it('should move item from [column] to [row] section correctly', function () {
            e.action = 'send';
            e.oldIndex = 2;
            e.newIndex = -1;

            spyOn(e.item, 'remove');
            spyOn(ko, 'dataFor').and.returnValue({ area: ko.observable('column') });
            spyOn(handler, 'GetPreviousItemCount').and.callFake(function (arg) {
                if (arg === 'row') {
                    return 0;
                } else if (arg === 'column') {
                    return 2;
                }
            });
            spyOn(handler.Aggregation, 'moveTo');
            spyOn(handler, 'OnAggregationChangeCallback');
            spyOn(handler, 'OpenAggregationAreaPanel');

            handler.OnAggregationSortableChange(e);
            expect(e.item.remove).toHaveBeenCalled();
            expect(handler.Aggregation.moveTo).toHaveBeenCalledWith(4, 1);
            expect(handler.OnAggregationChangeCallback).toHaveBeenCalled();
            expect(handler.OpenAggregationAreaPanel).toHaveBeenCalled();
        });
    });

    describe('.CreateDragDropSection', function () {

        var container = { find: $.noop };
        var element = {
            kendoSortable: $.noop,
            data: $.noop,
            length: 0
        };
        var sortable = {
            draggable: {
                options: {
                    axis: ''
                }
            }
        };

        beforeEach(function () {
            spyOn(container, 'find').and.returnValue(element);
            spyOn(element, 'kendoSortable');
        });

        it('should create kendoSortable', function () {
            element.length = 1;
            spyOn(element, 'data').and.returnValues(null, sortable);
            handler.CreateDragDropSection(container, 'selector', '');
            expect(element.kendoSortable).toHaveBeenCalled();
        });

        it('should not create kendoSortable when the element dose not exists', function () {
            element.length = 0;
            handler.CreateDragDropSection(container, 'selector', '');
            expect(element.kendoSortable).toHaveBeenCalledTimes(0);
        });

        it('should not create kendoSortable when kendoSortable was created on the element already', function () {
            element.length = 1;
            spyOn(element, 'data').and.returnValue(sortable);
            handler.CreateDragDropSection(container, 'selector', '');
            expect(element.kendoSortable).toHaveBeenCalledTimes(0);
        });
    });
});