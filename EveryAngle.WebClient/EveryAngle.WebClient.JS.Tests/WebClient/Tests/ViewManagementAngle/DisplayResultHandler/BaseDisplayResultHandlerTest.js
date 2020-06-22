describe("BaseDisplayResultHandler", function () {
    var baseDisplayResultHandler;
    beforeEach(function () {
        baseDisplayResultHandler = new BaseDisplayResultHandler();
    });

    describe("constructor", function () {
        it('should define values and functions', function () {
            // assert
            expect(baseDisplayResultHandler.DisplayHandler).toEqual(null);
            expect(typeof baseDisplayResultHandler.Initial).toEqual('function');
            expect(typeof baseDisplayResultHandler.Render).toEqual('function');
            expect(typeof baseDisplayResultHandler.Drilldown).toEqual('function');
            expect(typeof baseDisplayResultHandler.CanSortField).toEqual('function');
            expect(typeof baseDisplayResultHandler.SortField).toEqual('function');
            expect(typeof baseDisplayResultHandler.InitialAggregationUI).toEqual('function');
            expect(typeof baseDisplayResultHandler.SetAggregationTexts).toEqual('function');
            expect(typeof baseDisplayResultHandler.GetAggregationFieldLimit).toEqual('function');
            expect(typeof baseDisplayResultHandler.CanChangeCountFieldState).toEqual('function');
            expect(typeof baseDisplayResultHandler.ValidateAggregation).toEqual('function');
            expect(typeof baseDisplayResultHandler.CanAddReferenceLine).toEqual('function');
            expect(typeof baseDisplayResultHandler.ShowAddReferenceLinePopup).toEqual('function'); 
        });
    });

    describe(".Initial", function () {
        it('should set DisplayHandler', function () {
            // prepare
            baseDisplayResultHandler.Initial('my-handler');

            // assert
            expect(baseDisplayResultHandler.DisplayHandler).toEqual('my-handler');
        });
    });
});
