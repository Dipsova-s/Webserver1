/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />

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

    describe(".OnPopupResized", function () {
        it("should set popup position", function () {
            var e = {
                sender: { setOptions: $.noop }
            };
            spyOn(e.sender, "setOptions");
            spyOn(itemStateHandler, "GetPopupPosition").and.returnValue({ left: 10, top: 5 });
            itemStateHandler.OnPopupResized($(), e);

            expect(e.sender.setOptions).toHaveBeenCalledWith({ position: { left: 10, top: 5 } });
        });
    });

    describe(".GetPopupPosition", function () {
        var e;
        beforeEach(function () {
            e = {
                sender: { wrapper: $() }
            };
            spyOn($.fn, "outerWidth").and.returnValues(300, 50);
            spyOn($.fn, "outerHeight").and.returnValue(200);
        });
        it("should get popup position (no offset)", function () {
            spyOn($.fn, "offset").and.returnValue(null);
            var result = itemStateHandler.GetPopupPosition(e, $());

            expect(result).toEqual({ left: -250, top: 200 });
        });
        it("should get popup position", function () {
            spyOn($.fn, "offset").and.returnValue({ left: 600, top: 20 });
            var result = itemStateHandler.GetPopupPosition(e, $());

            expect(result).toEqual({ left: 350, top: 220 });
        });
    });
});