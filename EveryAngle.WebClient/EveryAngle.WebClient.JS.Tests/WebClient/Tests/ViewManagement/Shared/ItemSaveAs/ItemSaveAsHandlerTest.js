/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsHandler.js" />

describe("ItemSaveAsHandler", function () {

    var itemSaveAsHandler;
    beforeEach(function () {
        itemSaveAsHandler = new ItemSaveAsHandler();
    });

    describe(".SetData", function () {
        it("should set data and append copy text", function () {
            // prepare
            var data = [
                { lang: 'en', text: 'my-name' }
            ];
            itemSaveAsHandler.SetData(data, true);
            var result = itemSaveAsHandler.GetData();

            // assert
            expect(result.multi_lang_name.length).toEqual(1);
            expect(result.multi_lang_name[0].lang).toEqual('en');
            expect(result.multi_lang_name[0].text).toEqual('my-name (copy)');
        });
        it("should only set data", function () {
            // prepare
            var data = [
                { lang: 'en', text: 'my-name' }
            ];
            itemSaveAsHandler.SetData(data, false);
            var result = itemSaveAsHandler.GetData();

            // assert
            expect(result.multi_lang_name.length).toEqual(1);
            expect(result.multi_lang_name[0].lang).toEqual('en');
            expect(result.multi_lang_name[0].text).toEqual('my-name');
        });
    });

    describe(".GetData", function () {
        it("should get data", function () {
            // prepare
            var repeat = function (length) {
                var text = '', i;
                for (i = 0; i < length; i++)
                    text += '0';
                return text;
            };
            var data = [
                { lang: 'en', text: repeat(300) },
                { lang: 'nl', text: repeat(100) }
            ];
            itemSaveAsHandler.SetData(data, false);
            var result = itemSaveAsHandler.GetData();

            // assert
            expect(result.multi_lang_name.length).toEqual(2);
            expect(result.multi_lang_name[0].text.length).toEqual(255);
            expect(result.multi_lang_name[1].text.length).toEqual(100);
        });
    });

    describe(".ShowPopup", function () {
        it("should show popup", function () {
            // prepare
            spyOn(popup, "Show");
            itemSaveAsHandler.ShowPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".GetPopupOptions", function () {
        it("should get options", function () {
            // prepare
            var result = itemSaveAsHandler.GetPopupOptions('my-title');

            // assert
            expect(result.title).toEqual('my-title');
            expect(result.scrollable).toEqual(false);
            expect(result.resizable).toEqual(false);
            expect(result.buttons.length).toEqual(2);
        });
    });

    describe(".ShowPopupCallback", function () {
        it("should execute callback", function () {
            // prepare
            spyOn(systemLanguageHandler, "LoadLanguages").and.returnValue($.when());
            spyOn(itemSaveAsHandler, "InitialUI");
            var e = {
                sender: {
                    wrapper: $(),
                    element: $()
                }
            };
            itemSaveAsHandler.ShowPopupCallback(e);

            // assert
            expect(itemSaveAsHandler.InitialUI).toHaveBeenCalled();
        });
    });

    describe(".ClosePopup", function () {
        it("should close popup", function () {
            // prepare
            spyOn(popup, "Close");
            itemSaveAsHandler.ClosePopup();

            // assert
            expect(popup.Close).toHaveBeenCalled();
        });
    });

    describe(".InitialLanguages", function () {
        it("should set default active", function () {
            // prepare
            var languageHandler = { settings: {} };
            spyOn(WC.HtmlHelper, "MultiSelect").and.returnValue(languageHandler);
            spyOn(itemSaveAsHandler, "SetDefaultActive");
            itemSaveAsHandler.InitialLanguages($());

            // assert
            expect(languageHandler.settings.__init).toEqual(true);
            expect(itemSaveAsHandler.SetDefaultActive).toHaveBeenCalled();
        });
    });

    describe(".LanguagesRender", function () {
        it("should set element", function () {
            // prepare
            var element = $('<div />');
            itemSaveAsHandler.LanguagesRender('value', { id: 'my-id' }, element);

            // assert
            expect(element.hasClass('item-label-light')).toEqual(true);
            expect(element.attr('data-id')).toEqual('my-id');
        });

        it("should not set element", function () {
            // prepare
            var element = $('<div />');
            itemSaveAsHandler.LanguagesRender('any', { id: 'my-id' }, element);

            // assert
            expect(element.hasClass('item-label-light')).toEqual(false);
            expect(element.attr('data-id')).toEqual('my-id');
        });
    });

    describe(".LanguagesChange", function () {
        var languageHandler;
        beforeEach(function () {
            languageHandler = { settings: { __init: true } };
            itemSaveAsHandler.SetData(
                [{ lang: 'en', text: 'my-name' }],
                [{ lang: 'en', text: 'my-description' }]
            );
            spyOn(itemSaveAsHandler, "SetActive");
            spyOn(itemSaveAsHandler, "SetDefaultActive");
            spyOn($.fn, "removeClass");
        });
        it("should not do anything", function () {
            // prepare
            languageHandler.settings.__init = false;
            itemSaveAsHandler.LanguagesChange.call(languageHandler, 'add', { id: 'nl' }, $());

            // assert
            expect(itemSaveAsHandler.SetActive).not.toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect(itemSaveAsHandler.SetDefaultActive).not.toHaveBeenCalled();
            expect(itemSaveAsHandler.GetData().multi_lang_name.length).toEqual(1);
        });
        it("should add language then set active and clear validation", function () {
            // prepare
            itemSaveAsHandler.LanguagesChange.call(languageHandler, 'add', { id: 'nl' }, $());

            // assert
            expect(itemSaveAsHandler.SetActive).toHaveBeenCalled();
            expect($.fn.removeClass).toHaveBeenCalled();
            expect(itemSaveAsHandler.SetDefaultActive).not.toHaveBeenCalled();
            expect(itemSaveAsHandler.GetData().multi_lang_name.length).toEqual(2);
        });

        it("should remove language on inactive item", function () {
            // prepare
            itemSaveAsHandler.LanguagesChange.call(languageHandler, 'delete', { id: 'en' }, $());

            // assert
            expect(itemSaveAsHandler.SetActive).not.toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect(itemSaveAsHandler.SetDefaultActive).not.toHaveBeenCalled();
            expect(itemSaveAsHandler.GetData().multi_lang_name.length).toEqual(0);
        });

        it("should remove language on active item", function () {
            // prepare
            itemSaveAsHandler.LanguagesChange.call(languageHandler, 'delete', { id: 'en' }, $('<div class="active" />'));

            // assert
            expect(itemSaveAsHandler.SetActive).not.toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect(itemSaveAsHandler.SetDefaultActive).toHaveBeenCalled();
            expect(itemSaveAsHandler.GetData().multi_lang_name.length).toEqual(0);
        });
    });

    describe(".InitialUI", function () {
        it("should initial UI", function () {
            // prepare
            spyOn(itemSaveAsHandler, 'InitialNames');
            spyOn(itemSaveAsHandler, 'InitialLanguages');
            spyOn(itemSaveAsHandler, 'InitialWarningText');
            itemSaveAsHandler.InitialUI($());

            // assert
            expect(itemSaveAsHandler.InitialNames).toHaveBeenCalled();
            expect(itemSaveAsHandler.InitialLanguages).toHaveBeenCalled();
            expect(itemSaveAsHandler.InitialWarningText).toHaveBeenCalled();
        });
    });

    describe(".InitialWarningText", function () {
        it("should initial if has warning text", function () {
            // prepare
            var container = $('<div><div class="row-warning"></div><div class="warning-text"></div></div>');
            spyOn(itemSaveAsHandler, 'GetWarningText').and.returnValue('my-warning');
            itemSaveAsHandler.InitialWarningText(container);

            // assert
            expect(container.find('.row-warning').hasClass('always-hide')).toEqual(false);
            expect(container.find('.warning-text').text()).toEqual('my-warning');
        });
        it("should initial if no warning text", function () {
            // prepare
            var container = $('<div><div class="row-warning"></div><div class="warning-text"></div></div>');
            spyOn(itemSaveAsHandler, 'GetWarningText').and.returnValue('');
            itemSaveAsHandler.InitialWarningText(container);

            // assert
            expect(container.find('.row-warning').hasClass('always-hide')).toEqual(true);
            expect(container.find('.warning-text').text()).toEqual('');
        });
    });

    describe(".InitialNames", function () {
        var container;
        beforeEach(function () {
            container = $('<div><input class="name"/></div>');
        });
        it("should initial UI and trigger events #1", function () {
            // prepare
            var input = container.find('.name');
            itemSaveAsHandler.InitialNames(container);
            input.trigger('keyup');
            input.trigger('change');

            // assert
            expect(input.hasClass('invalid')).toEqual(true);
        });
        it("should initial UI and trigger events #2", function () {
            // prepare
            var input = container.find('.name');
            input.val('value');
            itemSaveAsHandler.InitialNames(container);
            input.trigger('keyup');
            input.trigger('change');

            // assert
            expect(input.hasClass('invalid')).toEqual(false);
        });
    });

    describe(".SetDefaultActive", function () {
        beforeEach(function () {
            itemSaveAsHandler.SetData(
                [{ lang: 'en', text: 'my-name' }],
                [{ lang: 'en', text: 'my-description' }]
            );
            spyOn(itemSaveAsHandler, "SetActive");
            spyOn($.fn, "find").and.returnValue($());
        });
        it("should set default active, using a user setting", function () {
            // prepare
            spyOn(userSettingModel, "GetByName").and.returnValue('en');
            itemSaveAsHandler.SetDefaultActive();

            // assert
            expect($.fn.find).not.toHaveBeenCalled();
        });
        it("should set default active, finding the first item)", function () {
            // prepare
            spyOn(userSettingModel, "GetByName").and.returnValue('nl');
            itemSaveAsHandler.SetDefaultActive();

            // assert
            expect($.fn.find).toHaveBeenCalled();
        });
    });

    describe(".SetActive", function () {
        it("should set active", function () {
            // prepare
            spyOn($.fn, 'val');
            spyOn(WC.HtmlHelper, 'SetFocusInput');
            itemSaveAsHandler.SetActive('en');

            // assert
            expect($.fn.val).toHaveBeenCalled();
            expect(WC.HtmlHelper.SetFocusInput).toHaveBeenCalled();
        });
    });

    describe(".Validation", function () {
        it("should be invalid and set it as active", function () {
            // prepare
            var data = [
                { lang: 'en', text: 'my-name' },
                { lang: 'nl', text: '' }
            ];
            itemSaveAsHandler.SetData(data, false);
            spyOn(itemSaveAsHandler, 'SetActive');
            var result = itemSaveAsHandler.Validation();

            // assert
            expect(result).toEqual(false);
            expect(itemSaveAsHandler.SetActive).toHaveBeenCalled();
        });

        it("should be valid", function () {
            // prepare
            var data = [
                { lang: 'en', text: 'my-name' },
                { lang: 'nl', text: 'my-name-nl' }
            ];
            itemSaveAsHandler.SetData(data, false);
            spyOn(itemSaveAsHandler, 'SetActive');
            var result = itemSaveAsHandler.Validation();

            // assert
            expect(result).toEqual(true);
            expect(itemSaveAsHandler.SetActive).not.toHaveBeenCalled();
        });
    });

    describe(".GetLanguages", function () {
        it("should get langauges", function () {
            // prepare
            var data = [
                { lang: 'en', text: 'my-name' },
                { lang: 'nl', text: 'my-name-nl' },
                { lang: 'es', text: 'my-name-es' }
            ];
            var result = itemSaveAsHandler.GetLanguages(data, ['en', 'es']);

            // assert
            expect(result.length).toEqual(2);
        });
    });

    describe(".ShowProgressbar", function () {
        it("should show a progress bar", function () {
            // prepare
            spyOn($.fn, 'addClass');
            spyOn($.fn, 'busyIndicator');
            itemSaveAsHandler.ShowProgressbar();

            // assert
            expect($.fn.addClass).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalled();
        });
    });

    describe(".HideProgressbar", function () {
        it("should hide a progress bar", function () {
            // prepare
            spyOn($.fn, 'removeClass');
            spyOn($.fn, 'busyIndicator');
            itemSaveAsHandler.HideProgressbar();

            // assert
            expect($.fn.removeClass).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalled();
        });
    });
});