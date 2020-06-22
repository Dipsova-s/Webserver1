describe("DisplayListResultHandlerTest", function () {
    var displayListResultHandler;
    beforeEach(function () {
        var displayHandler = new DisplayHandler({ display_type: 'list' }, new AngleHandler());
        displayListResultHandler = new DisplayListResultHandler(displayHandler);
    });

    describe("constructor", function () {
        it('should set DisplayHandler', function () {
            // assert
            expect(displayListResultHandler.DisplayHandler instanceof DisplayHandler).toEqual(true);
        });
    });
});
