/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />

describe("ModelHelper test", function () {

    describe(".DefaultDrillDownDisplayIsChanged", function () {

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

    describe(".ExtendMultiLinguals", function () {

        it("should fill multi_lang_name and multi_lang_description by name and description when multi_lang_name and multi_lang_description are empty", function () {

            var data = {
                name: 'name',
                description: 'description'
            };

            spyOn(userSettingModel, 'GetByName').and.returnValue('en');

            window.WC.ModelHelper.ExtendMultiLinguals(data);

            expect(data.name).toBeDefined();
            expect(data.description).toBeDefined();
            expect(data.name).toEqual('name');
            expect(data.description).toEqual('description');

            expect(data.multi_lang_name).toBeDefined();
            expect(data.multi_lang_name.length).toBeGreaterThan(0);
            expect(data.multi_lang_name[0].lang).toEqual('en');
            expect(data.multi_lang_name[0].text).toEqual('name');

            expect(data.multi_lang_description).toBeDefined();
            expect(data.multi_lang_description.length).toBeGreaterThan(0);
            expect(data.multi_lang_description[0].lang).toEqual('en');
            expect(data.multi_lang_description[0].text).toEqual('description');
        });

    });

});