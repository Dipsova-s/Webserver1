/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstateview.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemState/itemstatehandler.js" />

describe("ItemStateHandler", function () {

    var itemStateHandler;
    beforeEach(function () {
        itemStateHandler = new ItemStateHandler();
    });
    
    describe(".SetItemData", function () {
        
        it("should set data", function () {
            spyOn(itemStateHandler, 'GetLanguagesData').and.returnValue([]);
            var item = {
                model: "model",
                is_published: true,
                is_validated: true,
                is_template: true,
                allow_followups: true,
                allow_more_details: true,
                assigned_labels :["S2D"],
                uri: "uri",
                state: "state",
                multi_lang_name: ["en"],
                authorizations: 'authorizations',
                display_definitions: [],
                create: 'created'
            };
            
            itemStateHandler.SetItemData(item);
            
            var data = itemStateHandler.Data;
            expect(data.model).toEqual(item.model);
            expect(data.is_published()).toEqual(item.is_published);
            expect(data.is_validated()).toEqual(item.is_validated);
            expect(data.assigned_labels).toEqual(item.assigned_labels);
            expect(data.uri).toEqual(item.uri);
            expect(data.state).toEqual(item.state);
            expect(data.authorizations()).toEqual(item.authorizations);
            expect(data.created).toEqual(item.created);
        });

    });

    describe(".GetLanguagesData", function () {
        it("should return Languages from systemLanguageHandler when can get data", function () {
            spyOn(systemLanguageHandler, "GetDataBy").and.returnValue(null);

            var multi_lang = [{ lang: "en" }];
            var result = itemStateHandler.GetLanguagesData(multi_lang);
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual("en");
        });

        it("should return Languages from multilang name when cannot get data from systemLanguageHandler", function () {
            spyOn(systemLanguageHandler, "GetDataBy").and.returnValue({ name: 'nl' });
            var multi_lang = [{ lang: "en" }];
            var result = itemStateHandler.GetLanguagesData(multi_lang);
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual("nl");
        });
    });
});