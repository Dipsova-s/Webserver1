/// <chutzpah_reference path="/../../Dependencies/page/MC.Models.SuggestedFields.js" />
/// <chutzpah_reference path="/../../Dependencies/custom/MC.ui.popup.js" />

describe("MC.Models.SuggestedFields", function () {
    var suggestedfields;
    beforeEach(function () {
        suggestedfields = MC.Models.SuggestedFields;
    });
    describe(".ShowClassesChooser", function () {
        it("Should Call popup for single_object", function () {
            suggestedfields.ClassesChooserHandler = {};
            spyOn(MC.ui, 'popup');
            spyOn(window, 'setTimeout');
            var handler = {
                wrapper: {
                    addClass: function () { }
                },
                element: {
                    find: function () { return { addClass: function () { } } }
                }
            };
            spyOn($.fn, 'data').and.returnValue(handler);
            suggestedfields.ShowClassesChooser('<div class="contentSectionInfoItem">', 'single_object');
            expect(suggestedfields.ClassesChooserFor).toEqual("single_object");
            expect(suggestedfields.ClassesChooserHandler.MultipleSelection).toBeFalsy();
        });
        it("Should Call popup for other suggested field option", function () {
            MC.Models.SuggestedFields.ClassesChooserHandler = {};
            spyOn(MC.ui, 'popup');
            spyOn(window, 'setTimeout');
            var handler = {
                wrapper: {
                    addClass: function () { }
                },
                element: {
                    find: function () {
                        return { addClass: function () { }, removeClass: function () { } }
                    }
                }
            };
            spyOn($.fn, 'data').and.returnValue(handler);
            MC.Models.SuggestedFields.ShowClassesChooser('<div class="contentSectionInfoItem">', 'basic_list');
            expect(MC.Models.SuggestedFields.ClassesChooserFor).toEqual("basic_list");
            expect(MC.Models.SuggestedFields.ClassesChooserHandler.MultipleSelection).toBeTruthy();
        });
    });
    describe(".ShowHelpText", function () {
        var docElement;
        beforeEach(function () {
            docElement = $('<div id="popupClassesChooser"><div class="Description"><div class="helpTextContainer"></div></div></div>').appendTo('body');
        });
        afterEach(function () {
            docElement.remove();
        });
        var testCases = [
            { classChooser: MC.Models.SuggestedFields.SUGGEST_FOR.SINGLE_OBJECT, expected: Localization.MC_SingleObject_Instruction },
            { classChooser: MC.Models.SuggestedFields.SUGGEST_FOR.BASIC_LIST, expected: Localization.MC_BasicList_Instruction },
            { classChooser: MC.Models.SuggestedFields.SUGGEST_FOR.DEFAULT_TEMPLATE, expected: Localization.MC_Template_Instruction },
            { classChooser: MC.Models.SuggestedFields.SUGGEST_FOR.ALL_TEMPLATE, expected: Localization.MC_AllTemplate_Instruction },
            { classChooser: MC.Models.SuggestedFields.SUGGEST_FOR.CLEAR_ALL, expected: Localization.MC_ClearAll_Instruction }
        ];
        testCases.forEach(function (testCase) {
            it('Should update helptext description for ' + testCase.classChooser, function () {
                MC.Models.SuggestedFields.ClassesChooserFor = testCase.classChooser
                MC.Models.SuggestedFields.ShowHelpText();
                var content = $('.helpTextContainer').text();
                expect(content).toEqual($(testCase.expected).text());
            });
        });
    });
});