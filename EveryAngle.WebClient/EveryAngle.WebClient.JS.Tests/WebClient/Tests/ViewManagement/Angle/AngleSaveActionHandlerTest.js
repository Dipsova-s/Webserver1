/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveAs/ItemSaveAsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveAsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/DisplaySaveAsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemDownloadHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />

describe("AngleSaveActionHandler", function () {
    var angleSaveActionHandler;
    beforeEach(function () {
        var angleHandler = new AngleHandler({ is_template: false });
        var stateHandler = {
            SetTemplateStatus: $.noop
        };
        angleSaveActionHandler = new AngleSaveActionHandler(angleHandler, stateHandler);
    });

    describe(".Initial", function () {
        it('should initial', function () {
            spyOn(angleSaveActionHandler, 'ApplyHandler');
            angleSaveActionHandler.Initial();

            // assert
            expect(angleSaveActionHandler.SaveActions.Primary).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.All).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.Angle).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.Display).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.AngleAs).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.DisplayAs).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.SetTemplate).toBeDefined();
            expect(angleSaveActionHandler.SaveActions.SetAngle).toBeDefined();
            expect(angleSaveActionHandler.ApplyHandler).toHaveBeenCalled();
        });
    });
    describe(".VisibleSaveAll", function () {
        var tests = [
            {
                title: 'should be true (isAdhoc=false, saveAngle=true, saveDisplay=false)',
                isAdhoc: false,
                saveAngle: true,
                saveDisplay: false,
                expected: true
            },
            {
                title: 'should be true (isAdhoc=false, saveAngle=false, saveDisplay=true)',
                isAdhoc: false,
                saveAngle: false,
                saveDisplay: true,
                expected: true
            },
            {
                title: 'should be false (isAdhoc=false, saveAngle=false, saveDisplay=false)',
                isAdhoc: false,
                saveAngle: false,
                saveDisplay: false,
                expected: false
            },
            {
                title: 'should be false (isAdhoc=true, saveAngle=false, saveDisplay=false)',
                isAdhoc: true,
                saveAngle: true,
                saveDisplay: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(test.isAdhoc);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanCreateOrUpdate').and.returnValue(test.saveAngle);
                spyOn(Array.prototype, 'hasObject').and.returnValue(test.saveDisplay);

                var actual = angleSaveActionHandler.VisibleSaveAll();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSaveAll", function () {
        var tests = [
            {
                title: 'should be true (saveAngle=true, dataAngle=true, saveDisplay=true, dataDisplay=false)',
                saveAngle: true,
                dataAngle: true,
                saveDisplay: true,
                dataDisplay: false,
                notFistTimeLoad: true,
                expected: true
            },
            {
                title: 'should be false (saveAngle=true, dataAngle=true, saveDisplay=true, dataDisplay=false) on angle execution',
                saveAngle: true,
                dataAngle: true,
                saveDisplay: true,
                dataDisplay: false,
                notFistTimeLoad: false,
                expected: false
            },
            {
                title: 'should be true (saveAngle=true, dataAngle=false, saveDisplay=true, dataDisplay=true)',
                saveAngle: true,
                dataAngle: false,
                saveDisplay: true,
                dataDisplay: true,
                notFistTimeLoad: true,
                expected: true
            },
            {
                title: 'should be false (saveAngle=false, dataAngle=false, saveDisplay=false, dataDisplay=false)',
                saveAngle: false,
                dataAngle: false,
                saveDisplay: false,
                dataDisplay: false,
                notFistTimeLoad: true,
                expected: false
            }
        ];
        beforeAll(function () {
            createMockHandler(window, 'anglePageHandler', {
                SaveAllCalledOnce: false
            });
        });
        $.each(tests, function (index, test) {
            it(test.title, function () {
                anglePageHandler.SaveAllCalledOnce = test.notFistTimeLoad;
                spyOn(angleSaveActionHandler.AngleHandler, 'CanCreateOrUpdate').and.returnValue(test.saveAngle);
                spyOn(angleSaveActionHandler.AngleHandler, 'GetCreateOrUpdateData').and.returnValue(test.dataAngle);
                angleSaveActionHandler.AngleHandler.Displays = [
                    {
                        CanCreateOrUpdate: function () { return test.saveDisplay; },
                        GetCreateOrUpdateData: function () { return test.dataDisplay; }
                    }
                ];

                var actual = angleSaveActionHandler.EnableSaveAll();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SaveAll", function () {
        it('should call confirm save', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'ConfirmSave');
            angleSaveActionHandler.SaveAll();

            // assert
            expect(angleSaveActionHandler.AngleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });
    describe(".ForceSaveAll", function () {
        beforeEach(function () {
            spyOn(angleSaveActionHandler, 'IsRedirect');
            spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                Data: ko.observable({ id: $.noop })
            });
            spyOn(angleSaveActionHandler.AngleHandler, 'SaveAll').and.returnValue($.when());
            spyOn(angleSaveActionHandler, 'SaveAllDone');
        });
        it('should not save', function () {
            spyOn(angleSaveActionHandler, 'ValidateSaveAll').and.returnValue(false);
            angleSaveActionHandler.ForceSaveAll();

            // assert
            expect(angleSaveActionHandler.AngleHandler.SaveAll).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.SaveAllDone).not.toHaveBeenCalled();
        });
        it('should save', function () {
            spyOn(angleSaveActionHandler, 'ValidateSaveAll').and.returnValue(true);
            angleSaveActionHandler.ForceSaveAll();

            // assert
            expect(angleSaveActionHandler.AngleHandler.SaveAll).toHaveBeenCalled();
            expect(angleSaveActionHandler.SaveAllDone).toHaveBeenCalled();
        });
    });
    describe(".IsRedirect", function () {
        it('should able to redirect (adhoc Angle)', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);
            spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                IsAdhoc: ko.observable(false)
            });
            var result = angleSaveActionHandler.IsRedirect();

            // assert
            expect(result).toEqual(true);
        });
        it('should able to redirect (adhoc Display)', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                IsAdhoc: ko.observable(true)
            });
            var result = angleSaveActionHandler.IsRedirect();

            // assert
            expect(result).toEqual(true);
        });
        it('should not able to redirect', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                IsAdhoc: ko.observable(false)
            });
            var result = angleSaveActionHandler.IsRedirect();

            // assert
            expect(result).toEqual(false);
        });
    });
    describe(".ValidateSaveAll", function () {
        it('should be valid', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveAll').and.returnValue(true);
            spyOn(angleSaveActionHandler.AngleHandler, 'Validate').and.returnValue(true);
            spyOn(angleSaveActionHandler.AngleHandler, 'ForceInitial');
            spyOn(angleSaveActionHandler, 'ExecuteAngle');
            var result = angleSaveActionHandler.ValidateSaveAll(true);

            // assert
            expect(result).toEqual(true);
            expect(angleSaveActionHandler.AngleHandler.ForceInitial).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).not.toHaveBeenCalled();
        });
        it('should not be valid (EnableSaveAll=false)', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveAll').and.returnValue(false);
            spyOn(angleSaveActionHandler.AngleHandler, 'Validate').and.returnValue(true);
            spyOn(angleSaveActionHandler.AngleHandler, 'ForceInitial');
            spyOn(angleSaveActionHandler, 'ExecuteAngle');
            var result = angleSaveActionHandler.ValidateSaveAll(true);

            // assert
            expect(result).toEqual(false);
            expect(angleSaveActionHandler.AngleHandler.ForceInitial).toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).toHaveBeenCalled();
        });
        it('should not be valid (Validate=false)', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveAll').and.returnValue(true);
            spyOn(angleSaveActionHandler.AngleHandler, 'Validate').and.returnValue(false);
            spyOn(angleSaveActionHandler.AngleHandler, 'ForceInitial');
            spyOn(angleSaveActionHandler, 'ExecuteAngle');
            var result = angleSaveActionHandler.ValidateSaveAll(true);

            // assert
            expect(result).toEqual(false);
            expect(angleSaveActionHandler.AngleHandler.ForceInitial).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).not.toHaveBeenCalled();
        });
    });
    describe(".SaveAllDone", function () {
        it('should redirect', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'ForceInitial');
            spyOn(angleSaveActionHandler, 'ExecuteAngle');
            spyOn(angleSaveActionHandler, 'Redirect');
            angleSaveActionHandler.SaveAllDone(true, 'id', true);

            // assert
            expect(angleSaveActionHandler.Redirect).toHaveBeenCalled();
            expect(angleSaveActionHandler.AngleHandler.ForceInitial).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).not.toHaveBeenCalled();
        });
        it('should execute Angle', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'ForceInitial');
            spyOn(angleSaveActionHandler, 'ExecuteAngle');
            spyOn(angleSaveActionHandler, 'Redirect');
            angleSaveActionHandler.SaveAllDone(false, 'id', true);

            // assert
            expect(angleSaveActionHandler.Redirect).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.AngleHandler.ForceInitial).toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).toHaveBeenCalled();
        });
    });

    describe(".VisibleCreateAngle", function () {
        var tests = [
            {
                title: 'should be true (isAdhoc=true, canCreate=true)',
                isAdhoc: true,
                canCreate: true,
                expected: true
            },
            {
                title: 'should be false (isAdhoc=false, canCreate=true)',
                isAdhoc: false,
                canCreate: true,
                expected: false
            },
            {
                title: 'should be false (isAdhoc=true, canCreate=false)',
                isAdhoc: false,
                canCreate: true,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(test.isAdhoc);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanCreate').and.returnValue(test.canCreate);

                var actual = angleSaveActionHandler.VisibleCreateAngle();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableCreateAngle", function () {
        it("should be true", function () {
            var actual = angleSaveActionHandler.EnableCreateAngle();
            expect(actual).toEqual(true);
        });
    });
    describe(".CreateAngle", function () {
        it('should not create', function () {
            spyOn(angleSaveActionHandler, 'EnableCreateAngle').and.returnValue(false);
            spyOn(angleSaveActionHandler, 'ForceSaveAll');
            angleSaveActionHandler.CreateAngle();

            // assert
            expect(angleSaveActionHandler.ForceSaveAll).not.toHaveBeenCalled();
        });
        it('should create', function () {
            spyOn(angleSaveActionHandler, 'EnableCreateAngle').and.returnValue(true);
            spyOn(angleSaveActionHandler, 'ForceSaveAll');
            angleSaveActionHandler.CreateAngle();

            // assert
            expect(angleSaveActionHandler.ForceSaveAll).toHaveBeenCalledWith(false, true);
        });
    });

    describe(".VisibleSaveDisplay", function () {
        var tests = [
            {
                title: 'should be true (isAdhoc=false, canSave=true)',
                isAdhoc: false,
                canSave: true,
                expected: true
            },
            {
                title: 'should be false (isAdhoc=true, canSave=true)',
                isAdhoc: true,
                canSave: true,
                expected: false
            },
            {
                title: 'should be false (isAdhoc=false, canSave=false)',
                isAdhoc: false,
                canSave: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(test.isAdhoc);
                spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                    CanCreateOrUpdate: function () { return test.canSave; }
                });

                var actual = angleSaveActionHandler.VisibleSaveDisplay();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSaveDisplay", function () {
        var tests = [
            {
                title: 'should be true (canSave=true, hasData=true)',
                canSave: true,
                hasData: true,
                expected: true
            },
            {
                title: 'should be false (canSave=false, hasData=true)',
                canSave: false,
                hasData: true,
                expected: false
            },
            {
                title: 'should be false (canSave=true, hasData=false)',
                canSave: true,
                hasData: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                    CanCreateOrUpdate: function () { return test.canSave; },
                    GetCreateOrUpdateData: function () { return test.hasData; }
                });

                var actual = angleSaveActionHandler.EnableSaveDisplay();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SaveDisplay", function () {
        var displayHandler;
        beforeEach(function () {
            displayHandler = {
                ConfirmSave: $.noop,
                ValidateExternalId: $.noop
            };
            spyOn(displayHandler, 'ConfirmSave');
            spyOn(displayHandler, 'ValidateExternalId').and.returnValue(true);
            spyOn(angleSaveActionHandler, 'HideSaveOptionsMenu');
            spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue(displayHandler);
        });
        it('should not save', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveDisplay').and.returnValue(false);
            angleSaveActionHandler.SaveDisplay();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).not.toHaveBeenCalled();
            expect(displayHandler.ConfirmSave).not.toHaveBeenCalled();
        });
        it('should save', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveDisplay').and.returnValue(true);
            angleSaveActionHandler.SaveDisplay();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).toHaveBeenCalled();
            expect(displayHandler.ConfirmSave).toHaveBeenCalled();
        });
    });
    describe(".ForceSaveDisplay", function () {
        it('should save', function () {
            spyOn(angleSaveActionHandler, 'IsRedirect');
            spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                Data: ko.observable({ id: $.noop })
            });
            spyOn(angleSaveActionHandler.AngleHandler, 'SaveDefaultDisplay').and.returnValue($.when());
            spyOn(angleSaveActionHandler.AngleHandler, 'SaveDisplay').and.returnValue($.when());
            spyOn(angleSaveActionHandler, 'SaveDisplayDone');
            angleSaveActionHandler.ForceSaveDisplay()
                .then(function () {
                    expect(angleSaveActionHandler.AngleHandler.SaveDisplay).toHaveBeenCalled();
                    expect(angleSaveActionHandler.SaveDisplayDone).toHaveBeenCalled();
                });

            // assert
            expect(angleSaveActionHandler.AngleHandler.SaveDefaultDisplay).toHaveBeenCalled();
        });
    });
    describe(".SaveDisplayDone", function () {
        beforeEach(function () {
            anglePageHandler.RenderDisplayTabs = $.noop;
            spyOn(angleSaveActionHandler, 'ExecuteAngle');
            spyOn(angleSaveActionHandler, 'Redirect');
            spyOn(anglePageHandler, 'RenderDisplayTabs');
        });
        it('should redirect', function () {
            angleSaveActionHandler.SaveDisplayDone(true, 'id');

            // assert
            expect(angleSaveActionHandler.Redirect).toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).not.toHaveBeenCalled();
        });
        it('should execute Angle', function () {

            angleSaveActionHandler.SaveDisplayDone(false, 'id');

            // assert
            expect(anglePageHandler.RenderDisplayTabs).toHaveBeenCalled();
            expect(angleSaveActionHandler.Redirect).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.ExecuteAngle).not.toHaveBeenCalled();
        });
    });

    describe(".VisibleSaveAngleAs", function () {
        var tests = [
            {
                title: 'should be true (isAdhoc=false, canCreate=true)',
                isAdhoc: false,
                canCreate: true,
                expected: true
            },
            {
                title: 'should be false (isAdhoc=true, canCreate=true)',
                isAdhoc: true,
                canCreate: true,
                expected: false
            },
            {
                title: 'should be false (isAdhoc=false, canCreate=false)',
                isAdhoc: false,
                canCreate: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler.AngleHandler, 'IsAdhoc').and.returnValue(test.isAdhoc);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanCreate').and.returnValue(test.canCreate);

                var actual = angleSaveActionHandler.VisibleSaveAngleAs();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSaveAngleAs", function () {
        var tests = [
            {
                title: 'should be true (filter=true, jump=true)',
                filter: true,
                jump: true,
                expected: true
            },
            {
                title: 'should be false (filter=false, jump=true)',
                filter: false,
                jump: true,
                expected: false
            },
            {
                title: 'should be false (filter=true, jump=false)',
                filter: true,
                jump: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler.AngleHandler, 'CanUseFilter').and.returnValue(test.filter);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanUseJump').and.returnValue(test.jump);

                var actual = angleSaveActionHandler.EnableSaveAngleAs();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SaveAngleAs", function () {
        var saveAsHandler;
        beforeEach(function () {
            saveAsHandler = {
                ItemSaveAsHandler: {},
                ShowPopup: $.noop
            };
            spyOn(angleSaveActionHandler, 'HideSaveOptionsMenu');
            spyOn(saveAsHandler, 'ShowPopup');
            spyOn(window, 'AngleSaveAsHandler').and.returnValue(saveAsHandler);
        });
        it('should not save as', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveAngleAs').and.returnValue(false);
            angleSaveActionHandler.SaveAngleAs();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).not.toHaveBeenCalled();
            expect(saveAsHandler.ShowPopup).not.toHaveBeenCalled();
        });
        it('should save as', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveAngleAs').and.returnValue(true);
            angleSaveActionHandler.SaveAngleAs();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).toHaveBeenCalled();
            expect(saveAsHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".VisibleSaveDisplayAs", function () {
        var tests = [
            {
                title: 'should be true (canCreate=true)',
                canCreate: true,
                expected: true
            },
            {
                title: 'should be false (canCreate=false)',
                canCreate: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                    CanCreate: ko.observable(test.canCreate)
                });

                var actual = angleSaveActionHandler.VisibleSaveDisplayAs();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSaveDisplayAs", function () {
        var tests = [
            {
                title: 'should be true (filter=true, jump=true)',
                filter: true,
                jump: true,
                expected: true
            },
            {
                title: 'should be false (filter=false, jump=true)',
                filter: false,
                jump: true,
                expected: false
            },
            {
                title: 'should be false (filter=true, jump=false)',
                filter: true,
                jump: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler, 'GetDisplayHandler').and.returnValue({
                    CanUseFilter: ko.observable(test.filter),
                    CanUseJump: ko.observable(test.jump)
                });
                spyOn(angleSaveActionHandler.AngleHandler, 'CanUseFilter').and.returnValue(test.filter);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanUseJump').and.returnValue(test.jump);

                var actual = angleSaveActionHandler.EnableSaveDisplayAs();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SaveDisplayAs", function () {
        var saveAsHandler;
        beforeEach(function () {
            saveAsHandler = {
                ItemSaveAsHandler: {},
                ShowPopup: $.noop
            };
            spyOn(angleSaveActionHandler, 'HideSaveOptionsMenu');
            spyOn(saveAsHandler, 'ShowPopup');
            spyOn(window, 'DisplaySaveAsHandler').and.returnValue(saveAsHandler);
        });
        it('should not save as', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveDisplayAs').and.returnValue(false);
            angleSaveActionHandler.SaveDisplayAs();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).not.toHaveBeenCalled();
            expect(saveAsHandler.ShowPopup).not.toHaveBeenCalled();
        });
        it('should save as', function () {
            spyOn(angleSaveActionHandler, 'EnableSaveDisplayAs').and.returnValue(true);
            angleSaveActionHandler.SaveDisplayAs();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).toHaveBeenCalled();
            expect(saveAsHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".VisibleSetTemplate", function () {
        var tests = [
            {
                title: 'should be true (template=false, authorization=true)',
                template: false,
                authorization: true,
                expected: true
            },
            {
                title: 'should be false (template=true, authorization=true)',
                template: true,
                authorization: true,
                expected: false
            },
            {
                title: 'should be false (template=false, authorization=false)',
                template: false,
                authorization: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                angleSaveActionHandler.AngleHandler.Data().is_template(test.template);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanCreateTemplateAngle').and.returnValue(test.authorization);

                var actual = angleSaveActionHandler.VisibleSetTemplate();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".VisibleSetAngle", function () {
        var tests = [
            {
                title: 'should be true (template=true, authorization=true)',
                template: true,
                authorization: true,
                expected: true
            },
            {
                title: 'should be false (template=false, authorization=true)',
                template: false,
                authorization: true,
                expected: false
            },
            {
                title: 'should be false (template=true, authorization=false)',
                template: true,
                authorization: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                angleSaveActionHandler.AngleHandler.Data().is_template(test.template);
                spyOn(angleSaveActionHandler.AngleHandler, 'CanCreateTemplateAngle').and.returnValue(test.authorization);

                var actual = angleSaveActionHandler.VisibleSetAngle();
                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".EnableSetTemplate", function () {
        var tests = [
            {
                title: 'should return true when user can mark template',
                cansettemplate: true,
                expected: true
            },
            {
                title: 'should return false when user can mark template',
                cansettemplate: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                spyOn(angleSaveActionHandler.AngleHandler, 'CanSetTemplate').and.returnValue(test.cansettemplate);
                var actual = angleSaveActionHandler.EnableSetTemplate();

                expect(actual).toEqual(test.expected);
            });
        });
    });
    describe(".SetTemplate", function () {
        it('should not call set template function', function () {
            spyOn(angleSaveActionHandler, 'EnableSetTemplate').and.returnValue(false);
            spyOn(angleSaveActionHandler, 'HideSaveOptionsMenu');
            spyOn(angleSaveActionHandler.AngleHandler, 'ConfirmSave');
            angleSaveActionHandler.SetTemplate();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).not.toHaveBeenCalled();
            expect(angleSaveActionHandler.AngleHandler.ConfirmSave).not.toHaveBeenCalled();
        });

        it('should call set template function', function () {
            spyOn(angleSaveActionHandler, 'EnableSetTemplate').and.returnValue(true);
            spyOn(angleSaveActionHandler, 'HideSaveOptionsMenu');
            spyOn(angleSaveActionHandler.AngleHandler, 'ConfirmSave');
            angleSaveActionHandler.SetTemplate();

            // assert
            expect(angleSaveActionHandler.HideSaveOptionsMenu).toHaveBeenCalled();
            expect(angleSaveActionHandler.AngleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });
    describe(".ForceSetTemplate", function () {
        it('should save all and set template', function () {
            spyOn(angleSaveActionHandler.AngleHandler, 'SaveAll').and.returnValue($.when());
            spyOn(angleSaveActionHandler.StateHandler, 'SetTemplateStatus');
            angleSaveActionHandler.ForceSetTemplate();

            // assert
            expect(angleSaveActionHandler.AngleHandler.SaveAll).toHaveBeenCalled();
            expect(angleSaveActionHandler.StateHandler.SetTemplateStatus).toHaveBeenCalled();
        });
    });
    describe(".DisableSaveDisplay", function () {

        it('should disable Display and SaveAll buttons', function () {
            anglePageHandler.RenderDisplayTabs = $.noop;
            angleSaveActionHandler.DisableSaveDisplay();
            // assert
            expect(angleSaveActionHandler.SaveActions.All._enable()).toEqual(false);
            expect(angleSaveActionHandler.SaveActions.Angle._enable()).toEqual(true);
            expect(angleSaveActionHandler.SaveActions.AngleAs._enable()).toEqual(true);

        });
    });
});
