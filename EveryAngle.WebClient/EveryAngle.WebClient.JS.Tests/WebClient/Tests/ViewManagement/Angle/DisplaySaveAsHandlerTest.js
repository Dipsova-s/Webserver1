/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplaySaveAsHandler.js" />

describe("DisplaySaveAsHandler", function () {

    var displaySaveAsHandler;
    beforeEach(function () {
        createMockHandler(window, 'DisplayHandler', function () {
            this.CreateNew = $.noop;
            this.GetName = $.noop;
        });
        var angleHandler = {
            Data: ko.observable({
                multi_lang_name: [
                    { lang: 'en', text: 'name-en' },
                    { lang: 'nl', text: '' }
                ],
            }),
            IsAdhoc: $.noop,
            CloneData: $.noop,
            GetName: $.noop,
            CreateNew: $.noop,
            CanCreate: $.noop,
            GetDisplay: $.noop,
            AddDisplay: $.noop,
            Validate: $.noop,
            GetRawData: $.noop
        };
        var displayHandler = {
            Data: ko.observable({
                multi_lang_name: []
            }),
            IsAdhoc: $.noop,
            CloneData: $.noop,
            GetValidationResult: $.noop,
            CreateNew: $.noop,
            GetName: $.noop,
            GetRawData: $.noop,
            ForceInitial: $.noop,
            GetData: $.noop,
            SetUserDefault: $.noop,
            SetAngleDefault: $.noop
        };
        displaySaveAsHandler = new DisplaySaveAsHandler(angleHandler, displayHandler);
    });

    afterEach(function () {
        restoreMockHandlers();
    });

    describe(".Initial", function () {
        it("should initial", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'SetData');
            displaySaveAsHandler.Initial();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".ShowPopup", function () {
        it("should show popup", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ShowPopup');
            displaySaveAsHandler.ShowPopup();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".GetPopupOptions", function () {
        it("should get popup options", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, '__GetPopupOptions').and.returnValue({});
            var result = displaySaveAsHandler.GetPopupOptions();

            // assert
            expect(result.html).toContain('angle-name');
        });
    });

    describe(".InitialUI", function () {
        it("should initial UI", function () {
            // prepare
            spyOn(displaySaveAsHandler, 'InitialNewAngleOption');
            spyOn(displaySaveAsHandler, 'InitialAngleNames');
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, '__InitialUI');
            displaySaveAsHandler.InitialUI($());

            // assert
            expect(displaySaveAsHandler.InitialNewAngleOption).toHaveBeenCalled();
            expect(displaySaveAsHandler.InitialAngleNames).toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.__InitialUI).toHaveBeenCalled();
        });
    });

    describe(".InitialNewAngleOption", function () {
        beforeEach(function () {
            container = $('<div><input class="chk-new-angle" type="checkbox"/><div class="row-new-angle"></div><div class="info-text"></div></div>');
        });
        it("should not initial (no authorization)", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'CanCreate').and.returnValue(false);
            spyOn($.fn, 'trigger');
            displaySaveAsHandler.InitialNewAngleOption(container);

            // assert
            expect($.fn.trigger).not.toHaveBeenCalled();
        });
        it("should initial UI for saved Angle", function () {
            // prepare
            var input = container.find('.chk-new-angle');
            var row = container.find('.row-new-angle');
            var info = container.find('.info-text');
            spyOn(displaySaveAsHandler.AngleHandler, 'CanCreate').and.returnValue(true);
            spyOn(displaySaveAsHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            displaySaveAsHandler.InitialNewAngleOption(container);
            input.prop('checked', false);
            input.trigger('change');

            // assert
            expect(input.prop('disabled')).toEqual(false);
            expect(input.prop('checked')).toEqual(false);
            expect(displaySaveAsHandler.NewAngle).toEqual(false);
            expect(row.hasClass('always-hide')).toEqual(true);
            expect(info.hasClass('always-hide')).toEqual(true);
        });
        it("should initial UI for adhoc Angle", function () {
            // prepare
            var input = container.find('.chk-new-angle');
            var row = container.find('.row-new-angle');
            var info = container.find('.info-text');
            spyOn(displaySaveAsHandler.AngleHandler, 'CanCreate').and.returnValue(true);
            spyOn(displaySaveAsHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);
            displaySaveAsHandler.InitialNewAngleOption(container);
            input.prop('checked', true);
            input.trigger('change');

            // assert
            expect(input.prop('disabled')).toEqual(true);
            expect(input.prop('checked')).toEqual(true);
            expect(displaySaveAsHandler.NewAngle).toEqual(true);
            expect(row.hasClass('always-hide')).toEqual(false);
            expect(info.hasClass('always-hide')).toEqual(false);
        });
    });

    describe(".InitialAngleNames", function () {
        var container;
        beforeEach(function () {
            container = $('<div><input class="angle-name"/></div>');
        });
        it("should initial UI and trigger events #1", function () {
            // prepare
            var input = container.find('.angle-name');
            displaySaveAsHandler.InitialAngleNames(container);
            input.trigger('keyup');
            input.trigger('change');

            // assert
            expect(input.hasClass('invalid')).toEqual(true);
        });
        it("should initial UI and trigger events #2", function () {
            // prepare
            var input = container.find('.angle-name');
            input.val('value');
            displaySaveAsHandler.InitialAngleNames(container);
            input.trigger('keyup');
            input.trigger('change');

            // assert
            expect(input.hasClass('invalid')).toEqual(false);
        });
    });

    describe(".GetWarningText", function () {
        it("should get a warning text", function () {
            // prepare
            spyOn(displaySaveAsHandler.DisplayHandler, "GetValidationResult").and.returnValue({ Valid: false });
            var result = displaySaveAsHandler.GetWarningText();

            // assert
            expect(result).toEqual(Localization.Info_SaveAsDisplayWarning);
        });
        it("should not get a warning text", function () {
            // prepare
            spyOn(displaySaveAsHandler.DisplayHandler, "GetValidationResult").and.returnValue({ Valid: true });
            var result = displaySaveAsHandler.GetWarningText();

            // assert
            expect(result).toEqual('');
        });
    });

    describe(".SetActive", function () {
        it("should set active language", function () {
            // prepare
            spyOn($.fn, 'val');
            spyOn($.fn, 'trigger');
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, '__SetActive');
            displaySaveAsHandler.SetActive($());

            // assert
            expect($.fn.val).toHaveBeenCalled();
            expect($.fn.trigger).toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.__SetActive).toHaveBeenCalled();
        });
    });

    describe(".Validation", function () {
        it("should use the base validation (valid = true, new angle = false)", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, '__Validation').and.returnValue(true);
            displaySaveAsHandler.NewAngle = false;
            spyOn(displaySaveAsHandler, 'SetActive');
            var result = displaySaveAsHandler.Validation();

            // assert
            expect(result).toEqual(true);
            expect(displaySaveAsHandler.ItemSaveAsHandler.__Validation).toHaveBeenCalled();
            expect(displaySaveAsHandler.SetActive).not.toHaveBeenCalled();
        });
        it("should use the base validation (valid = false, new angle = true)", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, '__Validation').and.returnValue(false);
            displaySaveAsHandler.NewAngle = true;
            spyOn(displaySaveAsHandler, 'SetActive');
            var result = displaySaveAsHandler.Validation();

            // assert
            expect(result).toEqual(false);
            expect(displaySaveAsHandler.ItemSaveAsHandler.__Validation).toHaveBeenCalled();
            expect(displaySaveAsHandler.SetActive).not.toHaveBeenCalled();
        });
        it("should validate on Angle names", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, '__Validation').and.returnValue(true);
            displaySaveAsHandler.NewAngle = true;
            spyOn(displaySaveAsHandler, 'GetAngleData').and.returnValue({
                multi_lang_name: [
                    { lang: 'en' },
                    { lang: 'nl' }
                ]
            });
            spyOn(displaySaveAsHandler, 'SetActive');
            spyOn($.fn, 'removeClass');
            var result = displaySaveAsHandler.Validation();

            // assert
            expect(result).toEqual(false);
            expect($.fn.removeClass).toHaveBeenCalled();
            expect(displaySaveAsHandler.SetActive).toHaveBeenCalled();
        });
    });

    describe(".GetAngleData", function () {
        it("should get data", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, "GetData").and.returnValue({
                multi_lang_name: [
                    { lang: 'en' },
                    { lang: 'nl' }
                ]
            });
            var result = displaySaveAsHandler.GetAngleData();

            // assert
            expect(result.multi_lang_name.length).toEqual(2);
            expect(result.multi_lang_name[0].text).toEqual('name-en (copy)');
            expect(result.multi_lang_name[1].text).toEqual('');
        });
    });

    describe(".GetSaveData", function () {
        it("should get data", function () {
            // prepare
            spyOn(displaySaveAsHandler.DisplayHandler, "CloneData").and.returnValue({});
            spyOn(displaySaveAsHandler.DisplayHandler, "GetData").and.returnValue({user_specific:true});
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, "GetData").and.returnValue({
                multi_lang_name: []
            });
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, "GetLanguages").and.returnValue('my-description');
            var result = displaySaveAsHandler.GetSaveData();

            // assert
            expect(result.multi_lang_description).toEqual('my-description');
        });
    });

    describe(".GetSaveAngleData", function () {
        it("should get Angle data", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, "CloneData").and.returnValue({});
            spyOn(displaySaveAsHandler, "GetAngleData").and.returnValue({
                multi_lang_name: []
            });
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, "GetLanguages").and.returnValue('my-description');
            var data = {
                id: 'display1',
                multi_lang_name: []
            };
            var result = displaySaveAsHandler.GetSaveAngleData(data);

            // assert
            expect(result.multi_lang_description).toEqual('my-description');
            expect(result.angle_default_display).toEqual('display1');
            expect(result.display_definitions.length).toEqual(1);
        });
    });

    describe(".GetAngleDefaultDisplay", function () {
        it("should not get the Angle Default Display if there is not any", function () {
            //prepare
            var display1 =
            {
                id: 'display1',
                is_angle_default: false 
            };
            var display2 = {
                id: 'display2',
                is_angle_default: false 
            };
            displaySaveAsHandler.AngleHandler.Displays = [{ GetRawData: function () { return display1 } }, { GetRawData: function () { return display2 } }];
            var result = displaySaveAsHandler.GetAngleDefaultDisplay();

            //assert
            expect(result).toEqual('');
        });
        it("should get the Angle Default Display", function () {
            //prepare
            var display1 =
            {
                id: 'display1',
                is_angle_default: true 
            };
            var display2 = {
                id: 'display2',
                is_angle_default: false 
            };
            displaySaveAsHandler.AngleHandler.Displays = [{ GetRawData: function () { return display1 }, Data: display1 }, { GetRawData: function () { return display2 } }];

            var result = displaySaveAsHandler.GetAngleDefaultDisplay();

            //assert
            expect(result.Data.id).toEqual('display1');
        });
    });

    describe(".SetAngleDefaultDisplay", function () {
        it("should not revert if no changes", function () {
            //prepare
            spyOn(displaySaveAsHandler.DisplayHandler, 'SetAngleDefault').and.returnValue({});
            displaySaveAsHandler.SetAngleDefaultDisplay(false);

            //assert
            expect(displaySaveAsHandler.DisplayHandler.SetAngleDefault).not.toHaveBeenCalled();
        });

        it("should revert if changes", function () {
            //prepare
            var display =
            {
                id: 'display',
                is_angle_default:  true 
            };
            var mockData =
            {
                GetRawData: function () {
                    return display
                },
                Data: function () {
                    return {
                        is_angle_default:  function() { }
                    }
                },
                SetAngleDefault: function () {
                    return;
                }
            };
            spyOn(mockData, 'SetAngleDefault').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetAngleDefaultDisplay').and.returnValue(mockData);
            displaySaveAsHandler.SetAngleDefaultDisplay(true);

            //assert
            expect(mockData.SetAngleDefault).toHaveBeenCalled();
        });
    });

    describe(".GetPersonalDefaultDisplay", function () {
        it("should not get the Personal Default Display if there is not any", function () {
            //prepare
            var display1 =
            {
                id: 'display1',
                user_specific: { is_user_default: false }
            };
            var display2 = {
                id: 'display2',
                user_specific: { is_user_default: false }
            };
            displaySaveAsHandler.AngleHandler.Displays = [{ GetRawData: function () { return display1 }}, { GetRawData: function () { return display2 } }];

            var result = displaySaveAsHandler.GetPersonalDefaultDisplay();

            //assert
            expect(result).toEqual('');
        });
        it("should get the Personal Default Display", function () {
            //prepare
            var display1 =
            {
                id: 'display1',
                user_specific: { is_user_default: true }
            };
            var display2 = {
                id: 'display2',
                user_specific: { is_user_default: false }
            };
            displaySaveAsHandler.AngleHandler.Displays = [{ GetRawData: function () { return display1 }, Data: display1 }, { GetRawData: function () { return display2 } }];

            var result = displaySaveAsHandler.GetPersonalDefaultDisplay();

            //assert
            expect(result.Data.id).toEqual('display1');
        });
    });

    describe(".SetPersonalDefaultDisplay", function () {
        it("should not revert if no changes", function () {
            //prepare
            spyOn(displaySaveAsHandler.DisplayHandler, 'SetUserDefault').and.returnValue({});
            displaySaveAsHandler.SetPersonalDefaultDisplay(false);

            //assert
            expect(displaySaveAsHandler.DisplayHandler.SetUserDefault).not.toHaveBeenCalled();
        });
        it("should revert the personal default to orignal", function () {
            //prepare
            var display =
            {
                id: 'display',
                user_specific: { is_user_default: true }
            };
            var mockData =
            {
                GetRawData: function ()
                {
                    return display
                },
                Data: function () {
                    return {
                        user_specific: {
                                is_user_default:  function () { }
                        }
                    }
                },
                SetUserDefault: function () {
                    return;
                }
            };

            spyOn(mockData, 'SetUserDefault').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetPersonalDefaultDisplay').and.returnValue(mockData);
            displaySaveAsHandler.SetPersonalDefaultDisplay(true);

            //assert
            expect(mockData.SetUserDefault).toHaveBeenCalled();
        });
    });

    describe(".Save", function () {
        it("should save Display from a current handler", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'Validate').and.returnValue(true);
            spyOn(displaySaveAsHandler, 'GetSaveData').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetSaveAngleData').and.returnValue({});
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ShowProgressbar');
            spyOn(displaySaveAsHandler.DisplayHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(displaySaveAsHandler.DisplayHandler, 'CreateNew');
            spyOn(displaySaveAsHandler.AngleHandler, 'CreateNew');
            displaySaveAsHandler.NewAngle = false;
            displaySaveAsHandler.Save();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displaySaveAsHandler.DisplayHandler.CreateNew).toHaveBeenCalled();
            expect(displaySaveAsHandler.AngleHandler.CreateNew).not.toHaveBeenCalled();
        });
        it("should save Display from a new handler", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'Validate').and.returnValue(true);
            spyOn(displaySaveAsHandler, 'GetSaveData').and.returnValue({});
            spyOn(displaySaveAsHandler, 'SetAngleDefaultDisplay').and.returnValue({});
            spyOn(displaySaveAsHandler, 'SetPersonalDefaultDisplay').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetPersonalDefaultDisplay').and.returnValue({});
            spyOn(displaySaveAsHandler.DisplayHandler, 'Data').and.returnValue(
                {
                    is_angle_default: function () { return true; },
                    user_specific: { is_user_default: function () { return true; }}
                });
            spyOn(displaySaveAsHandler.DisplayHandler, 'GetRawData').and.returnValue(
                {
                    user_specific: { is_user_default: true }, is_angle_default: true
                });
            spyOn(displaySaveAsHandler, 'GetSaveAngleData').and.returnValue({});
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ShowProgressbar');
            spyOn(displaySaveAsHandler.DisplayHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(displaySaveAsHandler.DisplayHandler, 'CreateNew');
            spyOn(displaySaveAsHandler.AngleHandler, 'CreateNew');
            displaySaveAsHandler.NewAngle = false;
            displaySaveAsHandler.Save();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displaySaveAsHandler.DisplayHandler.CreateNew).not.toHaveBeenCalled();
            expect(displaySaveAsHandler.AngleHandler.CreateNew).not.toHaveBeenCalled();
        });
        it("should save Display from a new handler and revert the orignal display", function () {
            // prepare
            var mockData = {
                fields: [
                    {
                        field: 'field1',
                        multi_lang_alias: []
                    },
                    {
                        field: 'field2',
                        multi_lang_alias: []
                    },
                    {
                        field: 'field3',
                        multi_lang_alias: []
                    }
                ],
                user_specific:
                {
                    is_user_default: true
                },
                is_angle_default: true
            }
            spyOn(displaySaveAsHandler.AngleHandler, 'Validate').and.returnValue(true);
            spyOn(displaySaveAsHandler, 'GetSaveData').and.returnValue({});
            spyOn(displaySaveAsHandler, 'SetAngleDefaultDisplay').and.returnValue({});
            spyOn(displaySaveAsHandler, 'SetPersonalDefaultDisplay').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetPersonalDefaultDisplay').and.returnValue({});
            spyOn(displaySaveAsHandler.DisplayHandler, 'ForceInitial').and.returnValue({});
            spyOn(displaySaveAsHandler.DisplayHandler, 'Data').and.returnValue(
                {
                    fields: [
                        {
                            field: 'field1',
                            multi_lang_alias: []
                        },
                        {
                            field: 'field2',
                            multi_lang_alias: []
                        }
                    ],
                    is_angle_default: function () { return true; },
                    user_specific: { is_user_default: function () { return true; } }
                });
            spyOn(displaySaveAsHandler.DisplayHandler, 'GetRawData').and.returnValue(mockData);
            spyOn(displaySaveAsHandler, 'GetSaveAngleData').and.returnValue({});
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ShowProgressbar');
            spyOn(displaySaveAsHandler.DisplayHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(displaySaveAsHandler.DisplayHandler, 'CreateNew');
            spyOn(displaySaveAsHandler.AngleHandler, 'CreateNew');
            displaySaveAsHandler.NewAngle = false;
            displaySaveAsHandler.DisplayHandler.ForceInitial(mockData)
            displaySaveAsHandler.Save();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displaySaveAsHandler.DisplayHandler.CreateNew).not.toHaveBeenCalled();
            expect(displaySaveAsHandler.AngleHandler.CreateNew).not.toHaveBeenCalled();
            expect(displaySaveAsHandler.AngleHandler.CreateNew).not.toHaveBeenCalled();
            expect(displaySaveAsHandler.DisplayHandler.ForceInitial).toHaveBeenCalled();
        });
        it("should save Angle", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'Validate').and.returnValue(true);
            spyOn(displaySaveAsHandler, 'GetSaveData').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetSaveAngleData').and.returnValue({});
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ShowProgressbar');
            spyOn(displaySaveAsHandler.AngleHandler, 'CreateNew');
            displaySaveAsHandler.NewAngle = true;
            displaySaveAsHandler.Save();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ShowProgressbar).toHaveBeenCalled();
            expect(displaySaveAsHandler.AngleHandler.CreateNew).toHaveBeenCalled();
        });
        it("should not save Angle when the Angle is invalid", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'Validate').and.returnValue(false);
            spyOn(displaySaveAsHandler, 'GetSaveData').and.returnValue({});
            spyOn(displaySaveAsHandler, 'GetSaveAngleData').and.returnValue({});
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ShowProgressbar');
            spyOn(displaySaveAsHandler.AngleHandler, 'CreateNew');
            displaySaveAsHandler.NewAngle = true;
            displaySaveAsHandler.Save();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ShowProgressbar).not.toHaveBeenCalled();
            expect(displaySaveAsHandler.AngleHandler.CreateNew).not.toHaveBeenCalled();
        });
    });

    describe(".SaveDone", function () {
        beforeEach(function () {
            spyOn(displaySaveAsHandler.AngleHandler, 'AddDisplay');
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ClosePopup');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'Redirect');
        });
        it("should add Display, show a notification and redirect", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'GetDisplay').and.returnValue({});
            displaySaveAsHandler.SaveDone({});

            // assert
            expect(displaySaveAsHandler.AngleHandler.AddDisplay).not.toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.ClosePopup).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.Redirect).toHaveBeenCalled();
        });
        it("should not add Display but show a notification and redirect", function () {
            // prepare
            spyOn(displaySaveAsHandler.AngleHandler, 'GetDisplay').and.returnValue(null);
            displaySaveAsHandler.SaveDone({});

            // assert
            expect(displaySaveAsHandler.AngleHandler.AddDisplay).toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.ClosePopup).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.Redirect).toHaveBeenCalled();
        });
    });

    describe(".SaveAngleDone", function () {
        it("should show a notification and redirect", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'ClosePopup');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'Redirect');
            displaySaveAsHandler.SaveAngleDone('');

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.ClosePopup).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(displaySaveAsHandler.ItemSaveAsHandler.Redirect).toHaveBeenCalled();
        });
    });

    describe(".SaveFail", function () {
        it("should hide a progress bar", function () {
            // prepare
            spyOn(displaySaveAsHandler.ItemSaveAsHandler, 'HideProgressbar');
            displaySaveAsHandler.SaveFail();

            // assert
            expect(displaySaveAsHandler.ItemSaveAsHandler.HideProgressbar).toHaveBeenCalled();
        });
    });
});