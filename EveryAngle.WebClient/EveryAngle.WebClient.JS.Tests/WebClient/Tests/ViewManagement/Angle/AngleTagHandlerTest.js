/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemTagHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleTagHandler", function () {
    var angleTagHandler;
    beforeEach(function () {
        angleTagHandler = new AngleTagHandler(new AngleHandler());
    });

    describe(".CanUpdate", function () {
        var tests = [
            {
                title: 'should return true when user can edit the angle',
                update: true,
                expected: true
            },
            {
                title: 'should return false when user can edit the angle',
                update: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //arrange
                spyOn(angleTagHandler.AngleHandler, 'Data').and.returnValue({
                    authorizations: { update: test.update }
                });

                //act
                var result = angleTagHandler.CanUpdate();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".Initial", function () {
        it("should initial", function () {
            spyOn(angleTagHandler, 'Render');
            angleTagHandler.Initial($('<div/>'));

            // assert
            expect(angleTagHandler.$Container.length).toEqual(1);
            expect(angleTagHandler.Render).toHaveBeenCalled();
        });
    });

    describe(".Render", function () {
        it("should create UI", function () {
            var ui = {
                value: $.noop,
                readonly: $.noop
            };
            $.fn.kendoTagTextBox = $.noop;
            angleTagHandler.UI = { destroy: $.noop };
            spyOn($.fn, 'kendoTagTextBox').and.returnValue({
                data: function () { return ui; }
            });
            spyOn(ui, 'value');
            spyOn(ui, 'readonly');
            spyOn(angleTagHandler, 'GetDataSource');
            spyOn(angleTagHandler, 'GetValue').and.returnValue(['my-value']);
            spyOn(angleTagHandler, 'CanUpdate').and.returnValue(true);
            angleTagHandler.Render($());

            // assert
            expect(angleTagHandler.UI).not.toEqual(null);
            expect(ui.value).toHaveBeenCalledWith(['my-value']);
            expect(ui.readonly).toHaveBeenCalledWith(false);
        });
    });

    describe(".GetDataSource", function () {
        it("should get datasource", function () {
            var result = angleTagHandler.GetDataSource();

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
            angleTagHandler.SearchTags(option);

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
            angleTagHandler.SearchTags(option);

            // assert
            expect(option.success).toHaveBeenCalledWith([]);
        });
    });

    describe(".GetValue", function () {
        it("should get value", function () {
            angleTagHandler.AngleHandler.Data().assigned_tags(['test']);
            var result = angleTagHandler.GetValue();

            // assert
            expect(result).toEqual(['test']);
        });
    });

    describe(".OnChange", function () {
        var e;
        beforeEach(function () {
            e = {
                sender: {
                    value: ko.observable(['test'])
                }
            };
            spyOn(angleTagHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);
            spyOn(angleTagHandler, 'GetValue').and.returnValue([]);
            spyOn(angleTagHandler, 'Cancel');
            spyOn(angleTagHandler, 'Save');
        });
        it("should not pass validation", function () {
            spyOn(angleTagHandler.AngleHandler, 'Validate').and.returnValue(false);
            angleTagHandler.OnChange(e);

            // assert
            expect(angleTagHandler.Cancel).toHaveBeenCalled();
        });
        it("should save value with delay", function (done) {
            spyOn(angleTagHandler.AngleHandler, 'Validate').and.returnValue(true);
            angleTagHandler.OnChange(e);

            // assert
            expect(angleTagHandler.Cancel).not.toHaveBeenCalled();
            expect(angleTagHandler.Save).not.toHaveBeenCalled();
            setTimeout(function () {
                expect(angleTagHandler.Save).toHaveBeenCalled();
                done();
            }, 1100);
        });
    });

    describe(".Save", function () {
        it("should save", function () {
            spyOn($.fn, 'busyIndicator');
            spyOn($.fn, 'addClass');
            spyOn(angleTagHandler.AngleHandler, 'ConfirmSave');
            angleTagHandler.Save([]);

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalledWith(true);
            expect($.fn.addClass).toHaveBeenCalledWith('k-loading-none');
            expect(angleTagHandler.AngleHandler.ConfirmSave).toHaveBeenCalled();
        });
    });

    describe(".Cancel", function () {
        it("should cancel", function () {
            spyOn($.fn, 'busyIndicator');
            spyOn(angleTagHandler, 'Render');
            spyOn(angleTagHandler.AngleHandler, 'GetRawData').and.returnValue({ assigned_tags: ['test'] });
            angleTagHandler.Cancel();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
            expect(angleTagHandler.AngleHandler.Data().assigned_tags()).toEqual(['test']);
            expect(angleTagHandler.Render).toHaveBeenCalled();
        });
    });

    describe(".OnChangeComplete", function () {
        beforeEach(function () {
            angleTagHandler.UI = { focus: $.noop };
            spyOn(angleTagHandler.UI, 'focus');
            spyOn(angleTagHandler, 'Render');
            spyOn($.fn, 'busyIndicator');
            spyOn(toast, 'MakeSuccessTextFormatting');
        });
        it("should show toast when the angle is not an adhoc angle", function () {
            spyOn(angleTagHandler.AngleHandler, 'IsAdhoc').and.returnValue(false);

            // assert
            angleTagHandler.OnChangeComplete();
            expect(angleTagHandler.Render).toHaveBeenCalled();
            expect(angleTagHandler.UI.focus).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
            expect(toast.MakeSuccessTextFormatting).toHaveBeenCalled();
        });

        it("should not show toast when the angle is an adhoc angle", function () {
            spyOn(angleTagHandler.AngleHandler, 'IsAdhoc').and.returnValue(true);

            // assert
            angleTagHandler.OnChangeComplete();
            expect(angleTagHandler.Render).toHaveBeenCalled();
            expect(angleTagHandler.UI.focus).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
            expect(toast.MakeSuccessTextFormatting).not.toHaveBeenCalled();
        });
    });

    describe(".OnChangeFail", function () {
        it("should call functions by sequence", function () {
            spyOn($.fn, 'busyIndicator');
            angleTagHandler.OnChangeFail();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
        });
    });
});
