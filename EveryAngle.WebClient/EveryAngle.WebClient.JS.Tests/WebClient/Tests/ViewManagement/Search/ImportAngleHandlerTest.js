/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <reference path="/Dependencies/ViewManagement/Search/importAngleHandler.js" />

describe("ImportAngleHandler", function () {

    $.fn.kendoUpload = function () {
        var element = $(this);
        element.data('kendoUpload', {});
        return element;
    };

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(importAngleHandler).toBeDefined();
        });

    });

    describe("call GetUploadMessage", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "SuccessAngles").and.callFake(function () { return { length: 2 }; });
            spyOn(importAngleHandler, "FailAngles").and.callFake(function () { return { length: 3 }; });
        });

        it("should retrun correct message", function () {
            var message = importAngleHandler.GetUploadMessage();
            expect(message).toEqual('Upload successful 2 of 5');
        });

    });

    describe("call ShowImportAnglePopup", function () {

        beforeEach(function () {
            spyOn(popup, "Show").and.callFake(function () {
                return { wrapper: $(), center: $.noop };
            });
            spyOn(popup, "Destroy").and.callFake($.noop);
            spyOn(importAngleHandler, "UploadAngleTemplate").and.callFake(function () { return ''; });
            spyOn(importAngleHandler, "ShowImportAnglePopupCallback").and.callFake($.noop);
        });

        it("show popup should have been called", function () {
            importAngleHandler.ShowImportAnglePopup();
            expect(popup.Show).toHaveBeenCalled();
        });

    });

    describe("call ShowImportAnglePopupCallback", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "SetModelsDropdown").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "GetInternalUri").and.callFake(function () { return ''; });
        });

        it("success angle have been reset", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                return { length: 0 };
            });
            importAngleHandler.ShowImportAnglePopupCallback();
            expect(importAngleHandler.SuccessAngles().length).toEqual(0);
        });

        it("fail angle have been reset", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                return { length: 1 };
            });
            importAngleHandler.ShowImportAnglePopupCallback();
            expect(importAngleHandler.FailAngles().length).toEqual(0);
        });

    });

    describe("call SetModelsDropdown ", function () {

        beforeEach(function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                return {
                    setDataSource: $.noop,
                    enable: $.noop,
                    value: $.noop
                };
            });
        });

        it("not have model data, dropdown list show no model available", function () {
            spyOn(modelsHandler, "HasData").and.callFake(function () { return false; });

            var dropdownlist = importAngleHandler.SetModelsDropdown();
            expect(dropdownlist[0].short_name).toEqual(Localization.NoModelAvaliable);
        });

        it("have 1 model, dropdown list show the model", function () {
            spyOn(modelsHandler, "HasData").and.callFake(function () { return true; });
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                return [{ short_name: 'EA2_800', uri: '/models/1' }];
            });

            var dropdownlist = importAngleHandler.SetModelsDropdown();
            expect(dropdownlist[0].short_name).toEqual('EA2_800');
        });

        it("have more than 1 model, dropdown list show the models", function () {
            spyOn(modelsHandler, "HasData").and.callFake(function () { return true; });
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                return [{ short_name: 'EA2_800', uri: '/models/1' },
                        { short_name: 'EA3_800', uri: '/models/2' }];
            });

            var dropdownlist = importAngleHandler.SetModelsDropdown();
            expect(dropdownlist.length).toEqual(3);
            expect(dropdownlist[0].short_name).toEqual(Localization.PleaseSelect);
        });
    });

    describe("call ChangeModelDropdown", function () {

        beforeEach(function () {
            $('body').append('<input id="ImportAngle" type="file"/>');
            $('#ImportAngle').data('kendoUpload', {
                enable: $.noop
            });
        });

        afterEach(function () {
            $('#ImportAngle').remove();
        });

        it("model have been selected, enable should be true", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                return {
                    value: function () {
                        return '/models/1';
                    }
                };
            });
            var enable = importAngleHandler.ChangeModelDropdown();
            expect(enable).toEqual(true);
        });

        it("model is not selected, enable should be false", function () {
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                return {
                    value: function () {
                        return '';
                    }
                };
            });
            var enable = importAngleHandler.ChangeModelDropdown();
            expect(enable).toEqual(false);
        });
    });

    describe("call ShowCompleteUploadReport", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "CompleteUploadReportTemplate").and.callFake($.noop);
            spyOn(popup, "Show").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "ApplyKnockout").and.callFake(function () {
                return {
                    get: $.noop
                };
            });

            $('body').append('<input id="popupImportAngle" type="file"/>');
            $('#popupImportAngle').data('kendoWindow', {
                destroy: $.noop
            });
        });

        afterEach(function () {
            $('#popupImportAngle').remove();
        });

        it("show popup have been called", function () {
            importAngleHandler.ShowCompleteUploadReport();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe("call SetAngleForUpload", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "RemoveDenyLabel").and.callFake(function (val) { return val; });
        });

        var modelUri = '/models/1';

        it("should set data to angle", function () {
            var angle = {
                display_definitions: [{
                    id: '1234',
                    is_angle_default: true
                }]
            };
            angle = importAngleHandler.SetAngleForUpload(angle, modelUri);

            expect(angle.is_published).toEqual(false);
            expect(angle.angle_default_display).toEqual('1234');
        });

        it("not have default display, display should be null", function () {

            var angle = { definitions: [] };
            importAngleHandler.SetAngleForUpload(angle, modelUri);
            expect(angle.angle_default_display).not.toBeDefined();
        });
    });

    describe("call RemoveDenyLabel", function () {

        var modelUri = '/models/1';

        beforeEach(function () {
            spyOn(userModel, "GetModelPrivilegeByUri").and.callFake(function () {
                return {
                    label_authorizations: {
                        O2C: "validate",
                        HCM:"validate",
                        IT:"deny"
                    }
                };
            });
            spyOn(userSettingModel, "GetByName").and.callFake(function () { return ["S2D"]; });
        });

        it("not have assign label, should assign default business process", function () {
            var angle = {};
            importAngleHandler.RemoveDenyLabel(angle, modelUri);
            expect(angle.assigned_labels).toEqual(["S2D"]);
        });

        it("have assign label, should remove deny label", function () {
            var angle = { assigned_labels: ["O2C", "IT"] };
            importAngleHandler.RemoveDenyLabel(angle, modelUri);
            expect(angle.assigned_labels).toEqual(["O2C"]);
        });

        it("all assign label is removed by deny label, should assign default business process", function () {
            var angle = { assigned_labels: ["IT"] };
            importAngleHandler.RemoveDenyLabel(angle, modelUri);
            expect(angle.assigned_labels).toEqual(["S2D"]);
        });
    });

    describe("call GetUploadAngleUri", function () {

        it("should return correct uri", function () {
            var modelUri = '/models/1';
            var uri = importAngleHandler.GetUploadAngleUri(modelUri);
            expect(uri).toEqual('/models/1/angles?redirect=no&accept_warnings=true&multilingual=yes');
        });
    });

    describe("call UploadSuccess", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "UploadAngleToWebService").and.callFake($.noop);
            spyOn(progressbarModel, "SetProgressBarText").and.callFake($.noop);
        });

        it("have angle in response, UploadAngleToWebService have been called", function () {
            var e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.ANGLE' }],
                response: {
                    Result: { angle: {} }
                }
            };
            importAngleHandler.UploadSuccess(e);
            expect(importAngleHandler.UploadAngleToWebService).toHaveBeenCalled();
        });

        it("not have angle in response, should set error message", function () {
            var e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.ANGLE' }],
                response: {
                    ErrorMessage: 'invalid file'
                }
            };
            importAngleHandler.UploadSuccess(e);
            var failFile = importAngleHandler.FailAngles();
            expect(failFile[failFile.length - 1].ErrorMessage).toEqual('invalid file');
        });

        it("not have angle in response and not retrun response message, should set error message", function () {
            var e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.ANGLE' }]
            };
            importAngleHandler.UploadSuccess(e);
            var failFile = importAngleHandler.FailAngles();
            expect(failFile[failFile.length - 1].ErrorMessage).toEqual(Localization.UploadAngles_InvalideUploadedFile);
        });
    });

    describe("call UploadAngleToWebService", function () {
        var e;
        beforeEach(function () {
            spyOn(importAngleHandler, "GetUploadAngleUri").and.callFake(function (val) { return val; });
            spyOn(importAngleHandler, "SetAngleForUpload").and.callFake(function () { return {}; });
            spyOn(importAngleHandler, "GetErroMessage").and.callFake(function () { return ''; });
            spyOn(progressbarModel, "SetProgressBarText").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "DropdownList").and.callFake(function () {
                return {
                    value: function () {
                        return '/models/1';
                    }
                };
            });

            e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.ANGLE' }],
                response: {
                    Result: { angle: {} }
                }
            };
        });

        it("when fail, should add file to FailAngles", function () {
            spyOn(window, 'CreateDataToWebService').and.callFake(function () {
                var d = $.Deferred();
                d.reject({ responseText: '' });
                return d.promise();
            });
            var file = {};
            var failFile = importAngleHandler.FailAngles().length;
            importAngleHandler.UploadAngleToWebService(e, file);
            expect(importAngleHandler.FailAngles().length).toEqual(failFile + 1);
        });

        it("when success, should add file to SuccessAngles", function () {
            spyOn(window, 'CreateDataToWebService').and.callFake(function () {
                var d = $.Deferred();
                d.resolve({ responseText: '' });
                return d.promise();
            });
            var file = {};
            var successAngles = importAngleHandler.SuccessAngles().length;
            importAngleHandler.UploadAngleToWebService(e, file);
            expect(importAngleHandler.SuccessAngles().length).toEqual(successAngles + 1);
        });
    });

    describe("call GetErroMessage", function () {

        var e, error;

        it("when cancelled, should return message", function () {
            error = 'abort';
            var errorMessage = importAngleHandler.GetErroMessage(e, error);
            expect(errorMessage).toEqual('cancelled');
        });

        it("when have reponse text, should return response text", function () {
            error = '';
            e = {
                responseText: 'invalid file uploaded'
            };
            var errorMessage = importAngleHandler.GetErroMessage(e, error);
            expect(errorMessage).toEqual('invalid file uploaded');
        });

        it("when have response json, should return error message", function () {
            error = '';
            e = {
                responseJSON: { message: 'invalid file extension' }
            };
            var errorMessage = importAngleHandler.GetErroMessage(e, error);
            expect(errorMessage).toEqual('invalid file extension');
        });
    });

    describe("call UploadComplete", function () {
        var searchPageHandlerTemp;
        beforeEach(function () {
            searchPageHandlerTemp = window.searchPageHandler;
            window.errorHandlerModel = window.errorHandlerModel || {};
            window.errorHandlerModel.Enable = $.noop;
            spyOn(progressbarModel, "EndProgressBar").and.callFake($.noop);
            spyOn(importAngleHandler, "ShowCompleteUploadReport").and.callFake($.noop);
            spyOn(searchModel, "ClearSelectedRow").and.callFake($.noop);
            window.searchPageHandler = { BindSearchResultGrid: $.noop };
            spyOn(searchPageHandler, "BindSearchResultGrid").and.callFake($.noop);
            importAngleHandler.UploadCount = 1;
            importAngleHandler.NumberOfUploadedFile = 2;
            setTimeout(function () {
                importAngleHandler.UploadCount = 2;
            }, 300);
        });

        afterEach(function () {
            window.searchPageHandler = searchPageHandlerTemp;
        });

        it("ShowCompleteUploadReport have been called", function (done) {
            spyOn(importAngleHandler, "SuccessAngles").and.callFake(function () { return { length: 1 }; });
            importAngleHandler.UploadComplete();
            setTimeout(function () {
                expect(importAngleHandler.ShowCompleteUploadReport).toHaveBeenCalled();
                done();
            }, 1500);
        });

        it("when not have success angle, not refresh search page", function (done) {
            spyOn(importAngleHandler, "SuccessAngles").and.callFake(function () { return { length: 0 }; });
            importAngleHandler.UploadComplete();
            setTimeout(function () {
                expect(searchPageHandler.BindSearchResultGrid).not.toHaveBeenCalled();
                done();
            }, 1000);
        });

    });

    describe("call SelectFileUpload", function () {
        beforeEach(function () {
            window.errorHandlerModel = window.errorHandlerModel || {};
            window.errorHandlerModel.Enable = $.noop;
            spyOn(progressbarModel, "ShowStartProgressBar").and.callFake($.noop);
            spyOn(progressbarModel, "SetProgressBarText").and.callFake($.noop);
            spyOn(progressbarModel, "CancelFunction").and.callFake($.noop);
            spyOn(WC.Ajax, "AbortAll").and.callFake($.noop);
        });

        it("ShowStartProgressBar have been called", function () {
            importAngleHandler.SelectFileUpload();
            expect(progressbarModel.ShowStartProgressBar).toHaveBeenCalled();
        });

        it("NumberOfUploadedFile should be set", function () {
            var e = {
                files:
                    { length: 5 }
            };
            importAngleHandler.SelectFileUpload(e);
            expect(importAngleHandler.NumberOfUploadedFile).toEqual(5);
        });

        it("when cancel, AbortAll have been called", function () {
            importAngleHandler.SelectFileUpload();
            progressbarModel.CancelFunction();
            expect(WC.Ajax.AbortAll).toHaveBeenCalled();
        });
    });
});

