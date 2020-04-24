/// <reference path="/Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/SystemLanguageHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />

describe("ItemDescriptionHandler", function () {

    var itemDescriptionHandler;
    beforeEach(function () {
        itemDescriptionHandler = new ItemDescriptionHandler([], []);
    });

    describe(".Initial", function () {
        it("should set data", function () {
            // prepare
            spyOn(itemDescriptionHandler, 'SetData');
            itemDescriptionHandler.Initial('', [], []);

            // assert
            expect(itemDescriptionHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".ShowEditPopup", function () {
        it("should show popup", function () {
            // prepare
            spyOn(popup, "Show");
            itemDescriptionHandler.ShowEditPopup();

            // assert
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".GetEditPopupOptions", function () {
        it("should get options (readonly by default)", function () {
            // prepare
            var result = itemDescriptionHandler.GetEditPopupOptions('my-title');

            // assert
            expect(result.title).toEqual('my-title');
            expect(result.scrollable).toEqual(false);
            expect(result.buttons.length).toEqual(1);
            expect(result.buttons[0].className).toEqual('btn-save executing disabled');
        });

        it("should get options (set edit mode)", function () {
            // prepare
            itemDescriptionHandler.SetReadOnly(false);
            var result = itemDescriptionHandler.GetEditPopupOptions('my-title');

            // assert
            expect(result.title).toEqual('my-title');
            expect(result.scrollable).toEqual(false);
            expect(result.buttons.length).toEqual(1);
            expect(result.buttons[0].className).toEqual('btn-save executing');
        });
    });

    describe(".ShowEditPopupCallback", function () {
        it("should execute callback", function () {
            // prepare
            spyOn(systemLanguageHandler, "LoadLanguages").and.returnValue($.when());
            spyOn(itemDescriptionHandler, "InitialNames");
            spyOn(itemDescriptionHandler, "InitialDescriptions");
            spyOn(itemDescriptionHandler, "InitialLanguages");
            spyOn(itemDescriptionHandler, "ShowEditPopupResize");
            var e = {
                sender: {
                    wrapper: $(),
                    element: $()
                }
            };
            itemDescriptionHandler.ShowEditPopupCallback(e);

            // assert
            expect(itemDescriptionHandler.InitialNames).toHaveBeenCalled();
            expect(itemDescriptionHandler.InitialDescriptions).toHaveBeenCalled();
            expect(itemDescriptionHandler.InitialLanguages).toHaveBeenCalled();
            expect(itemDescriptionHandler.ShowEditPopupResize).toHaveBeenCalled();
        });
    });

    describe(".ShowEditPopupResize", function () {
        it("should not resize the description editor", function () {
            // prepare
            spyOn($.fn, "height");
            itemDescriptionHandler.ShowEditPopupResize();

            // assert
            expect($.fn.height).not.toHaveBeenCalled();
        });

        it("should resize the description editor", function () {
            // prepare
            spyOn($.fn, "height");
            spyOn(WC.HtmlHelper, "Editor").and.returnValue({
                wrapper: $()
            });
            itemDescriptionHandler.InitialDescriptions($());
            itemDescriptionHandler.ShowEditPopupResize();

            // assert
            expect($.fn.height).toHaveBeenCalled();
        });
    });

    describe(".InitialLanguages", function () {
        it("should set default active", function () {
            // prepare
            var languageHandler = { settings: {} };
            spyOn(WC.HtmlHelper, "MultiSelect").and.returnValue(languageHandler);
            spyOn(itemDescriptionHandler, "SetDefaultActive");
            itemDescriptionHandler.InitialLanguages($());

            // assert
            expect(languageHandler.settings.__init).toEqual(true);
            expect(itemDescriptionHandler.SetDefaultActive).toHaveBeenCalled();
        });
    });

    describe(".LanguagesRender", function () {
        it("should set element", function () {
            // prepare
            var element = $('<div />');
            itemDescriptionHandler.LanguagesRender('value', { id: 'my-id' }, element);

            // assert
            expect(element.hasClass('item-label-light')).toEqual(true);
            expect(element.attr('data-id')).toEqual('my-id');
        });

        it("should not set element", function () {
            // prepare
            var element = $('<div />');
            itemDescriptionHandler.LanguagesRender('any', { id: 'my-id' }, element);

            // assert
            expect(element.hasClass('item-label-light')).toEqual(false);
            expect(element.attr('data-id')).toEqual('my-id');
        });
    });

    describe(".LanguagesChange", function () {
        var languageHandler;
        beforeEach(function () {
            languageHandler = { settings: { __init: true } };
            itemDescriptionHandler.SetData('id',
                [{ lang: 'en', text: 'my-name' }],
                [{ lang: 'en', text: 'my-description' }]
            );
            spyOn(itemDescriptionHandler, "SetActive");
            spyOn(itemDescriptionHandler, "SetDefaultActive");
            spyOn($.fn, "removeClass");
        });
        it("should not do anything", function () {
            // prepare
            languageHandler.settings.__init = false;
            itemDescriptionHandler.LanguagesChange.call(languageHandler, 'add', { id: 'nl' }, $());

            // assert
            expect(itemDescriptionHandler.SetActive).not.toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect(itemDescriptionHandler.SetDefaultActive).not.toHaveBeenCalled();
            expect(itemDescriptionHandler.GetData().multi_lang_name.length).toEqual(1);
        });
        it("should add language then set active and clear validation", function () {
            // prepare
            itemDescriptionHandler.LanguagesChange.call(languageHandler, 'add', { id: 'nl' }, $());

            // assert
            expect(itemDescriptionHandler.SetActive).toHaveBeenCalled();
            expect($.fn.removeClass).toHaveBeenCalled();
            expect(itemDescriptionHandler.SetDefaultActive).not.toHaveBeenCalled();
            expect(itemDescriptionHandler.GetData().multi_lang_name.length).toEqual(2);
        });

        it("should remove language on inactive item", function () {
            // prepare
            itemDescriptionHandler.LanguagesChange.call(languageHandler, 'delete', { id: 'en' }, $());

            // assert
            expect(itemDescriptionHandler.SetActive).not.toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect(itemDescriptionHandler.SetDefaultActive).not.toHaveBeenCalled();
            expect(itemDescriptionHandler.GetData().multi_lang_name.length).toEqual(0);
        });

        it("should remove language on active item", function () {
            // prepare
            itemDescriptionHandler.LanguagesChange.call(languageHandler, 'delete', { id: 'en' }, $('<div class="active" />'));

            // assert
            expect(itemDescriptionHandler.SetActive).not.toHaveBeenCalled();
            expect($.fn.removeClass).not.toHaveBeenCalled();
            expect(itemDescriptionHandler.SetDefaultActive).toHaveBeenCalled();
            expect(itemDescriptionHandler.GetData().multi_lang_name.length).toEqual(0);
        });
    });

    describe(".InitialNames", function () {
        var container;
        beforeEach(function () {
            container = $('<div><input class="name"/></div>');
        });
        it("should set readonly mode", function () {
            // prepare
            itemDescriptionHandler.InitialNames(container);

            // assert
            expect(container.find('.name').prop('disabled')).toEqual(true);
        });

        it("should set edit mode", function () {
            // prepare
            itemDescriptionHandler.SetReadOnly(false);
            itemDescriptionHandler.InitialNames(container);

            // assert
            expect(container.find('.name').prop('disabled')).toEqual(false);
        });
    });

    describe(".InitialDescriptions", function () {
        var container;
        var editor;
        beforeEach(function () {
            container = $('<div><input class="description"/></div>');
            editor = {
                wrapper: $('<div />'),
                body: $('<div contenteditable="true" />').get(0)
            };
            spyOn(WC.HtmlHelper, 'Editor').and.returnValue(editor);
        });
        it("should set readonly mode", function () {
            // prepare
            itemDescriptionHandler.InitialDescriptions(container);

            // assert
            expect($(editor.body).hasClass('editor-body')).toEqual(true);
            expect($(editor.body).attr('contenteditable')).not.toBeDefined();
        });

        it("should set edit mode", function () {
            // prepare
            itemDescriptionHandler.SetReadOnly(false);
            itemDescriptionHandler.InitialDescriptions(container);

            // assert
            expect($(editor.body).hasClass('editor-body')).toEqual(true);
            expect($(editor.body).attr('contenteditable')).toBeDefined();
        });
    });

    describe(".InitialItemID", function () {
        var container;
        beforeEach(function () {
            $('<div class="form-row"><input class="item-id"/></div>').appendTo('body');
            container = $('.form-row');
        });

        afterEach(function () {
            container.remove();
        });

        it("should set the item id", function () {
            // prepare
            itemDescriptionHandler.CanEditId(true);
            itemDescriptionHandler.InitialItemID(container);

            // assert
            expect(container.find('.item-id').length).toEqual(1);
        });

        it("should set read only mode", function () {
            // prepare
            itemDescriptionHandler.CanEditId(true);
            itemDescriptionHandler.SetReadOnly(true);
            itemDescriptionHandler.InitialNames(container);

            // assert
            expect(container.find('.item-id').length).toEqual(1);
            expect(container.find('.item-id').prop('disabled')).toEqual(false);
        });
    });


    describe(".SetDefaultActive", function () {
        beforeEach(function () {
            itemDescriptionHandler.SetData('id',
                [{ lang: 'en', text: 'my-name' }],
                [{ lang: 'en', text: 'my-description' }]
            );
            spyOn(itemDescriptionHandler, "SetActive");
            spyOn($.fn, "find").and.returnValue($());
        });
        it("should set default active, using a user setting", function () {
            // prepare
            spyOn(userSettingModel, "GetByName").and.returnValue('en');
            itemDescriptionHandler.SetDefaultActive();

            // assert
            expect($.fn.find).not.toHaveBeenCalled();
        });
        it("should set default active, finding the first item)", function () {
            // prepare
            spyOn(userSettingModel, "GetByName").and.returnValue('nl');
            itemDescriptionHandler.SetDefaultActive();

            // assert
            expect($.fn.find).toHaveBeenCalled();
        });
    });

    describe(".SetActive", function () {
        it("should set active", function () {
            // prepare
            var editor = {
                wrapper: $('<div />'),
                body: $('<div />').get(0),
                value: $.noop
            };
            spyOn(editor, 'value');
            spyOn(WC.HtmlHelper, 'Editor').and.returnValue(editor);
            spyOn($.fn, 'val');
            spyOn(WC.HtmlHelper, 'SetFocusInput');
            itemDescriptionHandler.InitialDescriptions($());
            itemDescriptionHandler.SetActive('en');

            // assert
            expect($.fn.val).toHaveBeenCalled();
            expect(editor.value).toHaveBeenCalled();
            expect(WC.HtmlHelper.SetFocusInput).toHaveBeenCalled();
        });
    });

    describe(".Validation", function () {
        it("should be invalid and set it as active", function () {
            // prepare
            itemDescriptionHandler.SetData('',
                [
                    { lang: 'en', text: 'my-name' },
                    { lang: 'nl', text: '' }
                ],
                []
            );
            spyOn(itemDescriptionHandler, 'SetActive');
            spyOn(itemDescriptionHandler, 'ValidateItemID').and.returnValue(true);
            var result = itemDescriptionHandler.Validation();

            // assert
            expect(result).toEqual(false);
            expect(itemDescriptionHandler.SetActive).toHaveBeenCalled();
        });

        it("should be valid", function () {
            // prepare
            itemDescriptionHandler.SetData('',
                [
                    { lang: 'en', text: 'my-name' },
                    { lang: 'nl', text: 'my-name-nl' }
                ],
                []
            );
            spyOn(itemDescriptionHandler, 'SetActive');
            spyOn(itemDescriptionHandler, 'ValidateItemID').and.returnValue(true);
            var result = itemDescriptionHandler.Validation();

            // assert
            expect(result).toEqual(true);
            expect(itemDescriptionHandler.SetActive).not.toHaveBeenCalled();
        });
    });

    describe(".ValidateItemID", function () {
        it("id should not be valid", function () {
            // prepare
            itemDescriptionHandler.SetData('!@#!', [],[]);

            itemDescriptionHandler.CanEditId(true);
            var result = itemDescriptionHandler.ValidateItemID();

            // assert
            expect(result).toEqual(false);
        });

        it("id should be valid", function () {
            // prepare
            itemDescriptionHandler.SetData('xxx', [], []);

            itemDescriptionHandler.CanEditId(true);
            var result = itemDescriptionHandler.ValidateItemID();

            // assert
            expect(result).toEqual(true);
        });
    });


    describe(".SetData", function () {
        it("should set data", function () {
            // prepare
            itemDescriptionHandler.SetData('id',
                [
                    { lang: 'en', text: 'my-name' }
                ],
                [
                    { lang: 'nl', text: 'my-description' }
                ]
            );
            var result = itemDescriptionHandler.GetData();

            // assert
            expect(result.id).toEqual('id');
            expect(result.multi_lang_name.length).toEqual(2);
            expect(result.multi_lang_description.length).toEqual(2);
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
            itemDescriptionHandler.SetData('',
                [
                    { lang: 'en', text: repeat(300) },
                    { lang: 'nl', text: repeat(100) }
                ],
                []
            );
            var result = itemDescriptionHandler.GetData();

            // assert
            expect(result.multi_lang_name.length).toEqual(2);
            expect(result.multi_lang_name[0].text.length).toEqual(255);
            expect(result.multi_lang_name[1].text.length).toEqual(100);
            expect(result.multi_lang_description.length).toEqual(2);
        });
    });
});