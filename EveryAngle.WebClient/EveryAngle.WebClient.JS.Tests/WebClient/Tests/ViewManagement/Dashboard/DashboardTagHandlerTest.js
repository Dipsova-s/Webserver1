/// <chutzpah_reference path="/../../Dependencies/KendoUICustom/kendo.tagtextbox.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemTagHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardTagHandler.js" />

describe("DashboardTagHandler", function () {
    var dashboardTagHandler;
    beforeEach(function () {
        var dashboardModel = new DashboardViewModel({});
        var unsavedModel = new DashboardViewModel({});
        dashboardTagHandler = new DashboardTagHandler(dashboardModel, unsavedModel);
    });

    describe(".CanUpdate", function () {
        var tests = [
            {
                title: 'should return true when user can edit',
                update: true,
                expected: true
            },
            {
                title: 'should return false when user cannot edit',
                update: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //arrange
                dashboardTagHandler.DashboardModel.Data().authorizations.update = test.update;

                //act
                var result = dashboardTagHandler.CanUpdate();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".Initial", function () {
        it("should initial", function () {
            spyOn(dashboardTagHandler, 'Render');
            dashboardTagHandler.Initial(jQuery('<div/>'));

            // assert
            expect(dashboardTagHandler.$Container.length).toEqual(1);
            expect(dashboardTagHandler.Render).toHaveBeenCalled();
        });
    });

    describe(".Render", function () {
        it("should create UI", function () {
            var ui = {
                value: $.noop,
                readonly: $.noop
            };
            dashboardTagHandler.UI = { destroy: $.noop };
            spyOn($.fn, 'kendoTagTextBox').and.returnValue({
                data: function () { return ui; }
            });
            spyOn(ui, 'value');
            spyOn(ui, 'readonly');
            spyOn(dashboardTagHandler, 'GetDataSource');
            spyOn(dashboardTagHandler, 'GetValue').and.returnValue(['my-value']);
            spyOn(dashboardTagHandler, 'CanUpdate').and.returnValue(true);
            dashboardTagHandler.Render($());

            // assert
            expect(dashboardTagHandler.UI).not.toEqual(null);
            expect(ui.value).toHaveBeenCalledWith(['my-value']);
            expect(ui.readonly).toHaveBeenCalledWith(false);
        });
    });

    describe(".GetDataSource", function () {
        it("should get datasource", function () {
            var result = dashboardTagHandler.GetDataSource();

            // assert
            expect(result instanceof kendo.data.DataSource).toEqual(true);
        });
    });

    describe(".SearchTags", function () {
        it("should search", function () {
            var option = {
                data: {
                    filter: {
                        filters: [
                            { value: 'my-filter' }
                        ]
                    }
                },
                success: $.noop
            };
            spyOn(option, 'success');
            spyOn(systemTagHandler, 'SearchTags').and.returnValue($.when());
            spyOn(systemTagHandler, 'GetData').and.returnValue(['my-tags']);
            dashboardTagHandler.SearchTags(option);

            // assert
            expect(systemTagHandler.SearchTags).toHaveBeenCalledWith('my-filter');
            expect(option.success).toHaveBeenCalledWith(['my-tags']);
        });
        it("should not search", function () {
            var option = {
                data: {},
                success: $.noop
            };
            spyOn(option, 'success');
            dashboardTagHandler.SearchTags(option);

            // assert
            expect(option.success).toHaveBeenCalledWith([]);
        });
    });

    describe(".GetValue", function () {
        it("should get value", function () {
            dashboardTagHandler.UnsavedModel.Data().assigned_tags = ['test'];
            var result = dashboardTagHandler.GetValue();

            // assert
            expect(result).toEqual(['test']);
        });
    });

    describe(".OnChange", function () {
        it("should save with delay", function (done) {
            var e = {
                sender: {
                    value: ko.observable(['test'])
                }
            };
            spyOn(dashboardTagHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            spyOn(dashboardTagHandler, 'Save');
            dashboardTagHandler.OnChange(e);

            // assert
            expect(dashboardTagHandler.Save).not.toHaveBeenCalled();
            setTimeout(function () {
                expect(dashboardTagHandler.Save).toHaveBeenCalled();
                done();
            }, 1100);
        });
    });

    describe(".Save", function () {
        beforeEach(function () {
            dashboardTagHandler.UI = { focus: $.noop };
            spyOn(dashboardTagHandler.UI, 'focus');
            spyOn(dashboardTagHandler, 'Render');
            spyOn($.fn, 'busyIndicator');
            spyOn($.fn, 'addClass');
            spyOn(toast, 'MakeSuccessTextFormatting');
            spyOn(dashboardTagHandler.DashboardModel, 'SetTags').and.returnValue($.when({ assigned_tags: ['test'] }));
        });
        it("should save", function () {
            spyOn(dashboardTagHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(false);
            dashboardTagHandler.Save(['test']);

            // assert
            expect(dashboardTagHandler.Render).toHaveBeenCalled();
            expect(dashboardTagHandler.UI.focus).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledTimes(2);
            expect($.fn.addClass).toHaveBeenCalledWith('k-loading-none');
            expect(dashboardTagHandler.DashboardModel.SetTags).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
            expect(dashboardTagHandler.UnsavedModel.Data().assigned_tags).toEqual(['test']);
        });
        it("should save adhoc", function () {
            spyOn(dashboardTagHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(true);
            dashboardTagHandler.Save(['test']);

            // assert
            expect(dashboardTagHandler.Render).toHaveBeenCalled();
            expect(dashboardTagHandler.UI.focus).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledTimes(0);
            expect($.fn.addClass).not.toHaveBeenCalled();
            expect(dashboardTagHandler.DashboardModel.SetTags).toHaveBeenCalled();
            expect(toast.MakeSuccessTextFormatting).not.toHaveBeenCalled();
            expect(dashboardTagHandler.UnsavedModel.Data().assigned_tags).toEqual(['test']);
        });
    });
});
