/// <reference path="/Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ProgressBar.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleDownloadHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Search/AngleExportHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Search/importAngleHandler.js" />

describe("ImportAngleHandler", function () {

    var importAngleHandler;

    beforeEach(function () {
        importAngleHandler = new ImportAngleHandler();

        jQuery.fn.kendoUpload = jQuery.noop;
        spyOn(jQuery.fn, 'kendoUpload').and.callFake(function () {
            var element = $(this);
            element.data('kendoUpload', {});
            return element;
        });
    });

    describe(".GetUploadMessage", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "SuccessItems").and.callFake(function () { return { length: 2 }; });
            spyOn(importAngleHandler, "FailItems").and.callFake(function () { return { length: 3 }; });
        });

        it("should retrun correct message", function () {
            var message = importAngleHandler.GetUploadMessage();
            expect(message).toEqual('Upload successful 2 of 5');
        });

    });

    describe(".ShowImportAnglePopup", function () {

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

    describe(".ShowImportAnglePopupCallback", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "SetModelsDropdown").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "GetInternalUri").and.callFake(function () { return ''; });
        });

        it("success angle have been reset", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                return { length: 0 };
            });
            importAngleHandler.ShowImportAnglePopupCallback();
            expect(importAngleHandler.SuccessItems().length).toEqual(0);
        });

        it("fail angle have been reset", function () {
            spyOn(modelsHandler, "GetData").and.callFake(function () {
                return { length: 1 };
            });
            importAngleHandler.ShowImportAnglePopupCallback();
            expect(importAngleHandler.FailItems().length).toEqual(0);
        });

    });

    describe(".SetModelsDropdown ", function () {

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

    describe(".ChangeModelDropdown", function () {

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

    describe(".ShowCompleteUploadReport", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "CompleteUploadReportTemplate").and.callFake($.noop);
            spyOn(popup, "Show").and.callFake($.noop);
            spyOn(popup, "Close").and.callFake($.noop);
            spyOn(popup, "Destroy").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "ApplyKnockout").and.callFake(function () {
                return {
                    get: $.noop
                };
            });

            $('body').append('<input id="popupImportAngle" type="file"/>');
        });

        afterEach(function () {
            $('#popupImportAngle').remove();
        });

        it("show popup have been called", function () {
            importAngleHandler.ShowCompleteUploadReport();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".SetAngleForUpload", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "RemoveDenyLabel").and.callFake($.noop);
        });

        var modelUri = '/models/1';

        it("should set data to angle", function () {
            var angle = {
                id: 'id',
                any: 'any',
                display_definitions: [{
                    any: 'any',
                    id: '1234',
                    is_angle_default: true
                }]
            };
            importAngleHandler.SetAngleForUpload(angle, modelUri);
            expect(angle.id).not.toBeDefined();
            expect(angle.any).not.toBeDefined();
            expect(angle.is_published).toEqual(false);
            expect(angle.angle_default_display).toEqual('1234');
            expect(angle.display_definitions[0].id).toEqual('1234');
            expect(angle.display_definitions[0].any).not.toBeDefined();
        });

        it("not have default display, display should be null", function () {
            var angle = { display_definitions: [] };
            importAngleHandler.SetAngleForUpload(angle, modelUri);
            expect(angle.angle_default_display).not.toBeDefined();
        });
    });

    describe(".SetDashboardForUpload", function () {

        beforeEach(function () {
            spyOn(importAngleHandler, "RemoveDenyLabel").and.callFake($.noop);

            importAngleHandler.Angles = {
                'angle1': {
                    uri: '/models/1/angles/1',
                    displays: {
                        'angle1_display1': '/models/1/angles/1/displays/1'
                    }
                }
            };
        });

        it("should set data to dashboard", function () {
            var modelUri = '/models/1';
            var dashboard = {
                id: 'id',
                any: 'any',
                widget_definitions: [{
                    any: 'any',
                    id: 'valid_angle_display',
                    angle: 'angle1',
                    display: 'angle1_display1',
                    widget_details: JSON.stringify({ model: '/models/2' })
                }, {
                    id: 'valid_angle_but_display',
                    angle: 'angle1',
                    display: 'angle1_display2'
                }, {
                    id: 'invalid_angle_display',
                    angle: 'angle2',
                    display: 'angle2_display2',
                    widget_details: JSON.stringify({})
                }]
            };
            importAngleHandler.SetDashboardForUpload(dashboard, modelUri);

            // check dashboard
            expect(dashboard.id).not.toBeDefined();
            expect(dashboard.any).not.toBeDefined();
            expect(dashboard.is_published).toEqual(false);
            expect(dashboard.is_validated).toEqual(false);
            expect(dashboard.model).toEqual(modelUri);

            // check valid widget
            expect(dashboard.widget_definitions.length).toEqual(1);

            expect(dashboard.widget_definitions[0].any).not.toBeDefined();
            expect(dashboard.widget_definitions[0].angle).toEqual('/models/1/angles/1');
            expect(dashboard.widget_definitions[0].display).toEqual('/models/1/angles/1/displays/1');
            expect(dashboard.widget_definitions[0].widget_details).toContain(modelUri);
        });
    });

    describe(".RemoveDenyLabel", function () {

        var modelUri = '/models/1';

        beforeEach(function () {
            spyOn(userModel, "GetModelPrivilegeByUri").and.callFake(function () {
                return {
                    label_authorizations: {
                        O2C: "validate",
                        HCM: "validate",
                        IT: "deny"
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

    describe(".GetUploadAngleUri", function () {
        it("should return correct uri", function () {
            var modelUri = '/models/1';
            var uri = importAngleHandler.GetUploadAngleUri(modelUri);
            expect(uri).toEqual('/models/1/angles?redirect=no&accept_warnings=true&multilingual=yes');
        });
    });

    describe(".GetUploadDashboardUri", function () {
        it("should return correct uri", function () {
            var uri = importAngleHandler.GetUploadDashboardUri();
            expect(uri).toEqual('/dashboards?redirect=no&accept_warnings=true&multilingual=yes');
        });
    });

    describe(".UploadSuccess", function () {

        beforeEach(function () {
            importAngleHandler.UploadCount = 0;
            importAngleHandler.FailItems([]);
            ImportAngleHandler.ResultUploadSuccess = [];
            spyOn(importAngleHandler, "UploadAngle").and.callFake($.noop);
            spyOn(importAngleHandler, "UploadDashboard").and.callFake($.noop);
            spyOn(importAngleHandler, "UpdateProgressBar").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "DropdownList").and.returnValue({ value: $.noop });
        });

        it("type = angle, ResultUploadSuccess for angle have been added", function () {
            var e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.angle.json' }],
                response: {
                    Result: { type: AngleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD, angle: {} }
                }
            };
            importAngleHandler.UploadSuccess(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(0);
            expect(importAngleHandler.FailItems().length).toEqual(0);
            expect(importAngleHandler.ResultUploadSuccess.length).toEqual(1);
            expect(importAngleHandler.ResultUploadSuccess[0].type).toEqual('angle');
        });

        it("type = dashboard, ResultUploadSuccess for dashboard have been added", function () {
            var e = {
                files: [{ name: 'DASHBOARD_TEST.dashboard.json' }],
                response: {
                    Result: { type: AngleExportHandler.ANGLEEXPORTTYPE.DOWNLOAD, angles: [], dashboards: [] }
                }
            };
            importAngleHandler.UploadSuccess(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(0);
            expect(importAngleHandler.FailItems().length).toEqual(0);
            expect(importAngleHandler.ResultUploadSuccess.length).toEqual(1);
            expect(importAngleHandler.ResultUploadSuccess[0].type).toEqual('dashboard');
        });

        it("no Result, should set error message", function () {
            var e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.angle.json' }],
                response: {
                    ErrorMessage: 'invalid file'
                }
            };
            importAngleHandler.UploadSuccess(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(1);
            expect(importAngleHandler.FailItems().length).toEqual(1);
            expect(importAngleHandler.FailItems()[0].ErrorMessage).toEqual('invalid file');
            expect(importAngleHandler.UpdateProgressBar).toHaveBeenCalled();
        });

        it("no Result and no ErrorMessage, should set a default error message", function () {
            var e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.angle.json' }]
            };
            importAngleHandler.UploadSuccess(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(1);
            expect(importAngleHandler.FailItems().length).toEqual(1);
            expect(importAngleHandler.FailItems()[0].ErrorMessage).toEqual(Localization.UploadAngles_InvalideUploadedFile);
            expect(importAngleHandler.UploadAngle).not.toHaveBeenCalled();
            expect(importAngleHandler.UploadDashboard).not.toHaveBeenCalled();
            expect(importAngleHandler.UpdateProgressBar).toHaveBeenCalled();
        });
    });

    describe(".UpdateProgressBar", function () {

        var progressbarElement;
        beforeEach(function () {
            progressbarElement = $('<div id="ProgressText"/>').appendTo('body');
        });

        afterEach(function () {
            progressbarElement.remove();
        });

        var tests = [
            {
                name: 'test.json',
                expected: 'test.json'
            },
            {
                name: '111111111122222222223333333333444444444455555555556666666666777777777788888888889999999999.json',
                expected: '1111111111222222222233333333334444444...9999999999.json'
            }
        ];

        $.each(tests, function (index, test) {
            it("should set progress text (" + test.name + " -> " + test.expected + ")", function () {
                importAngleHandler.UpdateProgressBar(test.name);
                var progressText = progressbarElement.html();
                expect(progressText).toContain(test.expected);
            });
        });
    });

    describe(".CreateItem", function () {

        var file;
        beforeEach(function () {
            file = { Results: [] };
            spyOn(WC.Utility, 'GetDefaultMultiLangText').and.returnValue('name');
            spyOn(importAngleHandler, 'GetErrorMessage').and.returnValue('error');
        });

        it("should set failure result", function () {
            spyOn(window, 'CreateDataToWebService').and.callFake(function () {
                return $.Deferred().reject().promise();
            });
            importAngleHandler.CreateItem('uri', {}, file, 'test');

            // assert
            expect(file.Results.length).toEqual(1);
            expect(file.Results[0].error).toEqual('error');
        });

        it("should set success result", function () {
            spyOn(window, 'CreateDataToWebService').and.callFake(function () {
                return $.Deferred().resolve().promise();
            });
            importAngleHandler.CreateItem('uri', {}, file, 'test');

            //assert
            expect(file.Results.length).toEqual(1);
            expect(file.Results[0].error).not.toBeDefined();
        });
    });

    describe(".CreateAngle", function () {
        var file;
        beforeEach(function () {
            file = { Results: [] };
            spyOn(importAngleHandler, 'GetUploadAngleUri').and.returnValue('');
            spyOn(importAngleHandler, 'SetAngleForUpload').and.callFake($.noop);
            spyOn(importAngleHandler, 'CreateItem').and.callFake(function () {
                return $.Deferred().resolve().promise();
            });
            spyOn(importAngleHandler, 'CreateMappingAngle').and.callFake($.noop);
        });

        it("should call CreateMappingAngle", function () {
            importAngleHandler.CreateAngle({}, 'model_uri', file);

            //assert
            expect(importAngleHandler.CreateMappingAngle).toHaveBeenCalled();
        });
    });

    describe(".CreateMappingAngle", function () {
        var angles;
        beforeEach(function () {
            importAngleHandler.Angles = {};
            angles = {
                uri: '/angles/1',
                display_definitions: [
                    { id: 'display1', uri: '/angles/1/displays/1' },
                    { id: 'display2', uri: '/angles/1/displays/2' }
                ]
            };
        });

        it("should not map Angle if no source Id", function () {
            importAngleHandler.CreateMappingAngle(null, angles);

            //assert
            expect($.isEmptyObject(importAngleHandler.Angles)).toEqual(true);
        });

        it("should map Angle", function () {
            importAngleHandler.CreateMappingAngle('angle1', angles);

            //assert
            expect($.isEmptyObject(importAngleHandler.Angles)).toEqual(false);
            expect(importAngleHandler.Angles['angle1']).toBeDefined();
            expect(importAngleHandler.Angles['angle1'].uri).toEqual('/angles/1');
            expect(importAngleHandler.Angles['angle1'].displays['display1']).toEqual('/angles/1/displays/1');
            expect(importAngleHandler.Angles['angle1'].displays['display2']).toEqual('/angles/1/displays/2');
        });
    });

    describe(".CreateDashboard", function () {
        var dashboard;
        var file;
        beforeEach(function () {
            dashboard = {
                widget_definitions: [
                    {}, {}, {}
                ]
            };
            file = { Results: [] };
            spyOn(importAngleHandler, 'GetUploadDashboardUri').and.returnValue('');
            spyOn(importAngleHandler, 'SetDashboardForUpload').and.callFake($.noop);
            spyOn(WC.Utility, 'GetDefaultMultiLangText').and.returnValue('');
            spyOn(importAngleHandler, 'CreateItem').and.callFake($.noop);
        });

        it("should fail if number of widgets > maxNumberOfDashboard", function () {
            window.maxNumberOfDashboard = 2;
            importAngleHandler.CreateDashboard(dashboard, '', file);

            //assert
            expect(file.Results.length).toEqual(1);
            expect(file.Results[0].error).toBeDefined();
            expect(importAngleHandler.CreateItem).not.toHaveBeenCalled();
        });

        it("should success", function () {
            window.maxNumberOfDashboard = 5;
            importAngleHandler.CreateDashboard(dashboard, '', file);

            //assert
            expect(file.Results.length).toEqual(0);
            expect(importAngleHandler.CreateItem).toHaveBeenCalled();
        });
    });

    describe(".UploadItem", function () {
        var mockFile;
        var setupAndTeardown = function () {
            mockFile = { Name: 'pikachu.angle.json', ErrorMessage: '' };
            importAngleHandler.SuccessItems = [];
            importAngleHandler.FailItems = [];
            importAngleHandler.UploadCount = 0;
        };

        beforeEach(function () {
            setupAndTeardown();
            
            spyOn(importAngleHandler, 'UpdateProgressBar').and.callFake(jQuery.noop);
        });

        afterEach(function () {
            setupAndTeardown();
        });

        it("should upload success", function () {
            var handler = function () {
                return jQuery.Deferred().resolve().promise();
            };

            importAngleHandler.UploadItem(handler, null, null, mockFile);

            expect(importAngleHandler.SuccessItems.length).toEqual(1);
            expect(importAngleHandler.FailItems.length).toEqual(0);
            expect(importAngleHandler.UpdateProgressBar).toHaveBeenCalled();
            expect(importAngleHandler.UploadCount).toEqual(1);
        });

        it("should upload fail", function () {
            var errorMsg = 'throw an error from api';
            spyOn(importAngleHandler, 'GetErrorMessage').and.callFake(function () {
                return errorMsg;
            });

            var handler = function () {
                return jQuery.Deferred().reject().promise();
            };

            importAngleHandler.UploadItem(handler, null, null, mockFile);

            expect(importAngleHandler.SuccessItems.length).toEqual(0);
            expect(importAngleHandler.FailItems.length).toEqual(1);
            expect(importAngleHandler.UpdateProgressBar).toHaveBeenCalled();
            expect(importAngleHandler.UploadCount).toEqual(1);

            expect(mockFile.ErrorMessage).toEqual(errorMsg);
        });

    });

    describe(".UploadAngle", function () {
        var e;
        beforeEach(function () {
            importAngleHandler.UploadCount = 0;
            importAngleHandler.FailItems([]);
            importAngleHandler.SuccessItems([]);
            spyOn(importAngleHandler, "GetUploadAngleUri").and.returnValue('/models/1/angles');
            spyOn(importAngleHandler, "GetErrorMessage").and.returnValue('error');
            spyOn(importAngleHandler, "UpdateProgressBar").and.callFake($.noop);
            spyOn(WC.HtmlHelper, "DropdownList").and.returnValue({
                value: function () {
                    return '/models/1';
                }
            });

            e = {
                files: [{ name: 'ROBOT_ANGLE_GENERAL_TEST.angle.json' }],
                response: {
                    Result: { angle: {} }
                }
            };
        });

        it("when fail, should add file to FailItems", function () {
            spyOn(importAngleHandler, 'CreateAngle').and.callFake(function () {
                return $.Deferred().reject().promise();
            });
            var file = {};
            importAngleHandler.UploadAngle(e, '/models/1', file);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(1);
            expect(importAngleHandler.FailItems().length).toEqual(1);
            expect(importAngleHandler.FailItems()[0].ErrorMessage).toEqual('error');
            expect(importAngleHandler.SuccessItems().length).toEqual(0);
            expect(importAngleHandler.GetErrorMessage).toHaveBeenCalled();
            expect(importAngleHandler.UpdateProgressBar).toHaveBeenCalledTimes(2);
        });

        it("when success, should add file to SuccessItems", function () {
            spyOn(importAngleHandler, 'CreateAngle').and.callFake(function () {
                return $.Deferred().resolve().promise();
            });
            var file = {};
            importAngleHandler.UploadAngle(e, '/models/1', file);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(1);
            expect(importAngleHandler.FailItems().length).toEqual(0);
            expect(importAngleHandler.SuccessItems().length).toEqual(1);
            expect(importAngleHandler.GetErrorMessage).not.toHaveBeenCalled();
            expect(importAngleHandler.UpdateProgressBar).toHaveBeenCalledTimes(2);
        });
    });

    describe(".UploadDashboard", function () {

        it(".UploadItem should be called", function () {
            spyOn(importAngleHandler, 'UploadItem').and.callFake(function () {
                return jQuery.Deferred().resolve('success').promise();
            });
            spyOn(importAngleHandler, 'CreateDashboard').and.callFake(jQuery.noop);

            importAngleHandler.UploadDashboard(null, null, null);

            expect(importAngleHandler.UploadItem).toHaveBeenCalled();
        });

    });

    describe(".GetErrorMessage", function () {
        it("when cancelled, should return message", function () {
            var error = 'abort';
            var e;
            var errorMessage = importAngleHandler.GetErrorMessage(e, error);
            expect(errorMessage).toEqual('cancelled');
        });

        it("when have reponse text, should return response text", function () {
            var error = '';
            var e = {
                responseText: 'invalid file uploaded'
            };
            var errorMessage = importAngleHandler.GetErrorMessage(e, error);
            expect(errorMessage).toEqual('invalid file uploaded');
        });

        it("when have response json, should return error message", function () {
            var error = '';
            var e = {
                responseJSON: { message: 'invalid file extension' }
            };
            var errorMessage = importAngleHandler.GetErrorMessage(e, error);
            expect(errorMessage).toEqual('invalid file extension');
        });
    });

    describe(".GetDashboardAndAngleDeferred", function () {

        it("result should be correctly", function () {
            spyOn(WC.HtmlHelper, 'DropdownList').and.callFake(function () {
                return { value: jQuery.noop };
            });

            importAngleHandler.ResultUploadSuccess = [
                { type: 'dashboard', item: { files: [{ name: 'dashboard1.dashboard.json' }], response: { Result: {} } } },
                { type: 'angle', item: { files: [{ name: 'dashboard1.dashboard.angle1.angle.json' }], response: { Result: { angle: {} } } } },
                { type: 'angle', item: { files: [{ name: 'dashboard1.dashboard.angle2.angle.json' }], response: { Result: { angle: {} } } } }
            ];

            var result = importAngleHandler.GetDashboardAndAngleDeferred();

            expect(result.dashboardDeferred.length).toEqual(1);
            expect(result.angleDeferred.length).toEqual(2);
        });

    });

    describe(".UploadComplete", function () {
        beforeEach(function () {
            window.searchPageHandler = window.searchPageHandler || {
                BindSearchResultGrid: $.noop
            };
            window.errorHandlerModel = window.errorHandlerModel || {
                Enable: $.noop
            };
            spyOn(progressbarModel, "EndProgressBar").and.callFake($.noop);
            spyOn(importAngleHandler, "GetDashboardAndAngleDeferred").and.callFake(function () {
                return {};
            });
            spyOn(jQuery, 'whenAllSet').and.callFake(function () {
                return { always: $.noop };
            });
            spyOn(importAngleHandler, "ShowCompleteUploadReport").and.callFake($.noop);
            spyOn(searchModel, "ClearSelectedRow").and.callFake($.noop);
            spyOn(window.searchPageHandler, "BindSearchResultGrid").and.callFake($.noop);
            importAngleHandler.UploadCount = 0;
            importAngleHandler.NumberOfUploadedFile = 2;
        });

        it("ShowCompleteUploadReport have been called", function (done) {
            
            importAngleHandler.UploadComplete();

            // assert
            expect(importAngleHandler.GetDashboardAndAngleDeferred).toHaveBeenCalled();
            // delay 100ms before call these functions
            expect(searchModel.ClearSelectedRow).not.toHaveBeenCalled();
            expect(importAngleHandler.ShowCompleteUploadReport).not.toHaveBeenCalled();
            expect(searchPageHandler.BindSearchResultGrid).not.toHaveBeenCalled();

            // uploading completed
            importAngleHandler.UploadCount = 2;
            setTimeout(function () {
                expect(searchModel.ClearSelectedRow).toHaveBeenCalled();
                expect(importAngleHandler.ShowCompleteUploadReport).toHaveBeenCalled();
                expect(searchPageHandler.BindSearchResultGrid).toHaveBeenCalled();
                done();
            }, 700);
        });

    });

    describe(".CheckFileExtension", function () {
        beforeEach(function () {
            ImportAngleHandler.UploadCount = 0;
            ImportAngleHandler.FailItems = [];
        });

        it("Invalid extension files", function () {
            var e = {
                files: [
                    { name: 'test 1.txt', extension: '.txt' },
                    { name: 'test 2.png', extension: '.png' }
                ]
            };
            importAngleHandler.CheckFileExtension(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(2);
            expect(importAngleHandler.FailItems().length).toEqual(2);
            expect(importAngleHandler.FailItems()[0].ErrorMessage).toEqual(Localization.UploadAngles_InvalideExtension);
            expect(e.files.length).toEqual(0);
        });

        it("Valid extension files", function () {
            var e = {
                files: [
                    { name: 'test 1.json', extension: '.json' }
                ]
            };
            importAngleHandler.CheckFileExtension(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(0);
            expect(importAngleHandler.FailItems().length).toEqual(0);
            expect(e.files.length).toEqual(1);
        });

    });

    describe(".ValidUploadedFile", function () {
        beforeEach(function () {
            ImportAngleHandler.UploadCount = 0;
            ImportAngleHandler.FailItems = [];
        });

        it("Invalid uploaded only dashboard file", function () {
            var e = {
                files: [
                    { name: 'dashboard1.dashboard.json', extension: '.json' }
                ]
            };
            importAngleHandler.ValidUploadedFile(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(1);
            expect(importAngleHandler.FailItems().length).toEqual(1);
            expect(importAngleHandler.FailItems()[0].ErrorMessage).toEqual(Localization.UploadDashboard_InvalidReferencedAngles);
            expect(e.files.length).toEqual(0);
        });

        it("Invalid uploaded dashboard referenced wrong angle files", function () {
            var e = {
                files: [
                    { name: 'dashboard1.dashboard.json', extension: '.json' },
                    { name: 'dashboard.dashboard.angle1.angle.json', extension: '.json' }
                ]
            };
            importAngleHandler.ValidUploadedFile(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(1);
            expect(importAngleHandler.FailItems().length).toEqual(1);
            expect(importAngleHandler.FailItems()[0].ErrorMessage).toEqual(Localization.UploadDashboard_InvalidReferencedAngles);
            expect(e.files.length).toEqual(1);
        });

        it("Valid uploaded dashboard referenced correct angle files", function () {
            var e = {
                files: [
                    { name: 'dashboard1.dashboard.json', extension: '.json' },
                    { name: 'dashboard1.dashboard.angle1.angle.json', extension: '.json' }
                ]
            };
            importAngleHandler.ValidUploadedFile(e);

            // assert
            expect(importAngleHandler.UploadCount).toEqual(0);
            expect(importAngleHandler.FailItems().length).toEqual(0);
            expect(e.files.length).toEqual(2);
        });

    });

    describe(".SelectFileUpload", function () {
        beforeEach(function () {
            window.errorHandlerModel = window.errorHandlerModel || {
                Enable: $.noop
            };
            ImportAngleHandler.ResultUploadSuccess = [];

            spyOn(importAngleHandler, "UploadComplete").and.callFake($.noop);
            spyOn(progressbarModel, "ShowStartProgressBar").and.callFake($.noop);
            spyOn(progressbarModel, "SetProgressBarText").and.callFake($.noop);
            spyOn(progressbarModel, "CancelFunction").and.callFake($.noop);
            spyOn(WC.Ajax, "AbortAll").and.callFake($.noop);
        });

        it("no valid file, ShowStartProgressBar have not been called", function () {
            var e = {
                files: [
                    { name: 'test 1.txt', extension: '.txt' },
                    { name: 'test 2.png', extension: '.png' }
                ],
                preventDefault: $.noop
            };
            importAngleHandler.SelectFileUpload(e);

            // assert
            expect(importAngleHandler.ResultUploadSuccess.length).toEqual(0);
            expect(importAngleHandler.NumberOfUploadedFile).toEqual(2);
            expect(importAngleHandler.UploadCount).toEqual(2);
            expect(importAngleHandler.FailItems().length).toEqual(2);
            expect(importAngleHandler.UploadComplete).toHaveBeenCalled();
            expect(progressbarModel.ShowStartProgressBar).not.toHaveBeenCalled();
        });

        it("valid files, ShowStartProgressBar have been called", function () {
            var e = {
                files: [
                    { name: 'test 1.txt', extension: '.txt' },
                    { name: 'test 2.json', extension: '.json' },
                    { name: 'test 3.eapackage', extension: '.eapackage' }
                ]
            };
            importAngleHandler.SelectFileUpload(e);

            // assert
            expect(importAngleHandler.ResultUploadSuccess.length).toEqual(0);
            expect(importAngleHandler.NumberOfUploadedFile).toEqual(3);
            expect(importAngleHandler.UploadCount).toEqual(2);
            expect(importAngleHandler.FailItems().length).toEqual(2);
            expect(importAngleHandler.UploadComplete).not.toHaveBeenCalled();
            expect(progressbarModel.ShowStartProgressBar).toHaveBeenCalled();
        });

        it("when cancel, AbortAll have been called", function () {
            var e = {
                files: [
                    { extension: '.json' },
                    { extension: '.eapackage' }
                ]
            };
            importAngleHandler.SelectFileUpload(e);
            progressbarModel.CancelFunction();

            // assert
            expect(WC.Ajax.AbortAll).toHaveBeenCalled();
        });
    });

});
