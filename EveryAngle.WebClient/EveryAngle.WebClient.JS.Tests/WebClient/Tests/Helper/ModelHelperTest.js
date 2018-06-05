describe("ModelHelper test", function () {

    describe("when create new instance", function () {
        it("should be defined", function () {
            expect(window.WC.ModelHelper).toBeDefined();
        });
    });

    describe("call DefaultDrillDownDisplayIsChanged", function () {

        it("when detail1 not have drilldown_display value and detail2 have drilldown_display value, should return true", function () {
            var displayDetails1 = {};
            var displayDetails2 = { drilldown_display: '124s6r4f1sd24fs68' };
            var result = window.WC.ModelHelper.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2);
            expect(result).toEqual(true);
        });

        it("when detail1 have drilldown_display value and detail2 not have drilldown_display value, should return true", function () {
            var displayDetails1 = { drilldown_display: '124s6r4f1sd24fs68' };
            var displayDetails2 = {};
            var result = window.WC.ModelHelper.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2);
            expect(result).toEqual(false);
        });

        it("when data not change should return false", function () {
            var displayDetails1 = { drilldown_display: '124s6r4f1sd24fs68' };
            var displayDetails2 = { drilldown_display: '124s6r4f1sd24fs68' };
            var result = window.WC.ModelHelper.DefaultDrillDownDisplayIsChanged(displayDetails1, displayDetails2);
            expect(result).toEqual(false);
        });
    });

});