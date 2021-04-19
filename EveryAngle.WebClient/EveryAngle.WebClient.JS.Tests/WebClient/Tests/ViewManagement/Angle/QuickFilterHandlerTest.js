/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SidePanel/SidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ItemSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSaveActionHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleActionMenuHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleSidePanelHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleTemplateStateHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AngleStateView.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/AnglePageHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Angle/QuickFilterHandler.js" />

//describe("QuickFilterHandler", function () {      //This test issues will be fixed in M4-93080

//    var quickFilterHandler;

//    beforeEach(function () {
//        quickFilterHandler = new QuickFilterHandler();
//    });

//    describe(".AddFilter", function () {

//        it("should do nothing when cannot get model field from fieldId", function () {

//            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue(null);
//            spyOn(anglePageHandler.HandlerSidePanel, 'Open');
//            spyOn(anglePageHandler.HandlerDisplay.QueryDefinitionHandler, 'AddFilter');

//            var handler = {
//                Models: {
//                    Angle: {
//                        Data: $.noop
//                    }
//                }
//            };
//            spyOn(handler.Models.Angle, 'Data').and.returnValue({ model: 'model' });

//            quickFilterHandler.AddFilter({}, handler);

//            expect(anglePageHandler.HandlerSidePanel.Open).toHaveBeenCalledTimes(0);
//            expect(anglePageHandler.HandlerDisplay.QueryDefinitionHandler.AddFilter).toHaveBeenCalledTimes(0);

//        });

//        it("should add filter to side panel when can get model field from fieldId", function () {

//            spyOn(modelFieldsHandler, 'GetFieldById').and.returnValue({});
//            spyOn(anglePageHandler.HandlerSidePanel, 'Open');
//            spyOn(anglePageHandler.HandlerDisplay.QueryDefinitionHandler, 'AddFilter');

//            var handler = {
//                Models: {
//                    Angle: {
//                        Data: $.noop
//                    }
//                }
//            };
//            spyOn(handler.Models.Angle, 'Data').and.returnValue({ model: 'model' });

//            quickFilterHandler.AddFilter({}, handler);

//            expect(anglePageHandler.HandlerSidePanel.Open).toHaveBeenCalledWith(1);
//            expect(anglePageHandler.HandlerDisplay.QueryDefinitionHandler.AddFilter).toHaveBeenCalled();
//        });

//    });
//});