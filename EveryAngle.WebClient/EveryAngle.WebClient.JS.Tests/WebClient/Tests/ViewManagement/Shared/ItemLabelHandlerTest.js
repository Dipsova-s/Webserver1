/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.Overlay.js" />
/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MultiSelect.js" />
/// <chutzpah_reference path="/../../Dependencies/Helper/HtmlHelper.MenuNavigatable.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelLabelCategoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("ItemLabelHandler", function () {
    var itemLabelHandler;
    beforeEach(function () {
        itemLabelHandler = new ItemLabelHandler();
    });

    describe(".constructor", function () {
        it("should define default values", function () {
            // assert
            expect(itemLabelHandler.$Container.length).toEqual(0);
            expect(itemLabelHandler.$BusinessProcess).toEqual(null);
            expect(itemLabelHandler.StateHandler instanceof ItemStateHandler).toEqual(true);
            expect(itemLabelHandler.Labels().length).toEqual(0);
            expect(itemLabelHandler.SaveTimeoutTimer).toEqual(null);
            expect(itemLabelHandler.SaveTimeout).toEqual(1000);
            expect(itemLabelHandler.LoadLabelTimer).toEqual(null);
            expect(itemLabelHandler.LoadLabelStatus).toEqual('none');
        });
    });

    describe(".CanUpdate", function () {
        it("should be false", function () {
            //act
            var result = itemLabelHandler.CanUpdate();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetModelUri", function () {
        it("should be null", function () {
            //act
            var result = itemLabelHandler.GetModelUri();

            // assert
            expect(result).toEqual(null);
        });
    });

    describe(".IsPublished", function () {
        it("should be false", function () {
            //act
            var result = itemLabelHandler.IsPublished();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".IsAdhoc", function () {
        it("should be false", function () {
            //act
            var result = itemLabelHandler.IsAdhoc();

            // assert
            expect(result).toEqual(false);
        });
    });

    describe(".GetAssignedLabels", function () {
        it("should get empty assigned labels", function () {
            //act
            var result = itemLabelHandler.GetAssignedLabels();

            // assert
            expect(result).toEqual([]);
        });
    });

    describe(".Initial", function () {
        it("should init", function () {
            //arrange
            spyOn(WC.HtmlHelper.Overlay, 'Create');
            spyOn(itemLabelHandler, 'InitialBusinesProcess');
            spyOn(itemLabelHandler, 'InitialLabels').and.returnValue($.when());
            spyOn(itemLabelHandler, 'Validate');

            //act
            itemLabelHandler.Initial($('<div/>'));

            // assert
            expect(itemLabelHandler.$Container.length).toEqual(1);
            expect(WC.HtmlHelper.Overlay.Create).toHaveBeenCalled();
            expect(itemLabelHandler.InitialBusinesProcess).toHaveBeenCalled();
            expect(itemLabelHandler.InitialLabels).toHaveBeenCalled();
            expect(itemLabelHandler.Validate).toHaveBeenCalled();
        });
    });

    describe(".OnChange", function () {
        beforeEach(function () {
            spyOn(itemLabelHandler, 'SetOverlay');
            spyOn(window, 'clearTimeout');
            spyOn(window, 'setTimeout');
            spyOn(itemLabelHandler, 'GetData');
            spyOn(itemLabelHandler, 'Save');
        });
        it("should not save", function () {
            //arrange
            spyOn(itemLabelHandler, 'Validate').and.returnValue(false);
            spyOn(itemLabelHandler, 'IsAdhoc').and.returnValue(true);

            //act
            itemLabelHandler.OnChange(['new-label1', 'new-label2']);

            // assert
            expect(window.clearTimeout).toHaveBeenCalled();
            expect(itemLabelHandler.SetOverlay).toHaveBeenCalled();
            expect(window.setTimeout).not.toHaveBeenCalled();
            expect(itemLabelHandler.Save).not.toHaveBeenCalled();
            expect(itemLabelHandler.SaveTimeoutTimer).toEqual(null);
        });
        it("should save for adhoc item", function () {
            //arrange
            spyOn(itemLabelHandler, 'Validate').and.returnValue(true);
            spyOn(itemLabelHandler, 'IsAdhoc').and.returnValue(true);

            //act
            itemLabelHandler.OnChange(['new-label1', 'new-label2']);

            // assert
            expect(window.clearTimeout).toHaveBeenCalled();
            expect(itemLabelHandler.SetOverlay).not.toHaveBeenCalled();
            expect(window.setTimeout).not.toHaveBeenCalled();
            expect(itemLabelHandler.Save).toHaveBeenCalled();
            expect(itemLabelHandler.SaveTimeoutTimer).toEqual(null);
        });
        it("should save for saved item", function () {
            //arrange
            spyOn(itemLabelHandler, 'Validate').and.returnValue(true);
            spyOn(itemLabelHandler, 'IsAdhoc').and.returnValue(false);

            //act
            itemLabelHandler.OnChange(['new-label1', 'new-label2']);

            // assert
            expect(window.clearTimeout).toHaveBeenCalled();
            expect(itemLabelHandler.SetOverlay).not.toHaveBeenCalled();
            expect(window.setTimeout).toHaveBeenCalled();
            expect(itemLabelHandler.Save).not.toHaveBeenCalled();
            expect(itemLabelHandler.SaveTimeoutTimer).not.toEqual(null);
        });
    });

    describe(".ShowProgressbar", function () {
        beforeEach(function () {
            itemLabelHandler.$BusinessProcess = {
                hideList: $.noop
            };
            spyOn(itemLabelHandler.$BusinessProcess, 'hideList');
            spyOn($.fn, 'busyIndicator');
        });
        it("should show progress bar", function () {
            //arrange
            spyOn(itemLabelHandler, 'IsAdhoc').and.returnValue(false);

            //act
            itemLabelHandler.ShowProgressbar();

            // assert
            expect(itemLabelHandler.$BusinessProcess.hideList).toHaveBeenCalled();
            expect($.fn.busyIndicator).toHaveBeenCalledWith(true);
        });
        it("should not show progress bar", function () {
            //arrange
            spyOn(itemLabelHandler, 'IsAdhoc').and.returnValue(true);

            //act
            itemLabelHandler.ShowProgressbar();

            // assert
            expect(itemLabelHandler.$BusinessProcess.hideList).not.toHaveBeenCalled();
            expect($.fn.busyIndicator).not.toHaveBeenCalled();
        });
    });

    describe(".HideProgressbar", function () {
        it("should hide progress bar", function () {
            //arrange
            spyOn($.fn, 'busyIndicator');

            //act
            itemLabelHandler.HideProgressbar();

            // assert
            expect($.fn.busyIndicator).toHaveBeenCalledWith(false);
        });
    });

    describe(".SetOverlay", function () {
        it("should set overlay", function () {
            //arrange
            spyOn(WC.HtmlHelper.Overlay, 'Update');

            //act
            itemLabelHandler.SetOverlay(true);

            // assert
            expect(WC.HtmlHelper.Overlay.Update).toHaveBeenCalled();
        });
    });

    describe(".GetData", function () {
        it("should get assigned labels", function () {
            // prepare
            spyOn($.fn, 'find').and.returnValue($('<div/><div/><div/>'));
            spyOn($.fn, 'data').and.returnValues(
                null,
                { value: ko.observableArray(['label1']) },
                { value: ko.observableArray(['label2', 'label3']) }
            );

            //act
            var result = itemLabelHandler.GetData();

            // assert
            expect(result).toEqual(['label1', 'label2', 'label3']);
        });
    });

    describe(".Cancel", function () {
        it("should cancel", function () {
            //arrange
            spyOn(itemLabelHandler, 'Initial');

            //act
            itemLabelHandler.Cancel();

            // assert
            expect(itemLabelHandler.Initial).toHaveBeenCalled();
        });
    });

    describe(".SaveFail", function () {
        it("should hide progress bar", function () {
            //arrange
            spyOn(itemLabelHandler, 'HideProgressbar');

            //act
            itemLabelHandler.SaveFail();

            // assert
            expect(itemLabelHandler.HideProgressbar).toHaveBeenCalled();
        });
    });

    describe(".Validate", function () {
        it("should be true", function () {
            //arrange
            spyOn(itemLabelHandler, 'ValidateBusinessProcess').and.returnValue(true);
            spyOn(itemLabelHandler, 'ValidateLabel').and.returnValue(true);

            //act
            var result = itemLabelHandler.Validate();

            // assert
            expect(result).toEqual(true);
        });
        it("should be false without popup", function () {
            //arrange
            spyOn(itemLabelHandler, 'ValidateBusinessProcess').and.returnValue(false);
            spyOn(itemLabelHandler, 'ValidateLabel').and.returnValue(true);
            spyOn(popup, 'Alert');

            //act
            var result = itemLabelHandler.Validate(false);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).not.toHaveBeenCalled();
        });
        it("should be false with popup", function () {
            //arrange
            spyOn(itemLabelHandler, 'ValidateBusinessProcess').and.returnValue(true);
            spyOn(itemLabelHandler, 'ValidateLabel').and.returnValue(false);
            spyOn(popup, 'Alert');
            spyOn($.fn, 'find').and.returnValues($('<div/>'), $('<div/>').text('error'));

            //act
            var result = itemLabelHandler.Validate(true);

            // assert
            expect(result).toEqual(false);
            expect(popup.Alert).toHaveBeenCalled();
        });
    });

    describe(".InitialBusinesProcess", function () {
        beforeEach(function () {
            $('<div class="section-labels"><div class="business-processes-selection"></div></div>').appendTo('body');
            itemLabelHandler.$Container = jQuery('.section-labels');
            spyOn(itemLabelHandler, 'GetAllBusinesProcesses').and.returnValue([
                { id: 'P2P', name: 'P2P' },
                { id: 'S2D', name: 'S2D' },
                { id: 'O2C', name: 'O2C' }
            ]);
            spyOn(itemLabelHandler, 'GetBusinesProcessValues').and.returnValue(['P2P']);
            spyOn(itemLabelHandler, 'CanUpdate').and.returnValue(true);
            spyOn(itemLabelHandler, 'SetBusinesProcessErrorMessage');
        });

        afterEach(function () {
            $('.section-labels').remove();
        });

        it("should create UI", function () {
            itemLabelHandler.InitialBusinesProcess();

            // assert
            var element = itemLabelHandler.$Container.find('.business-processes-selection');
            var ui = element.data('MultiSelect');
            expect(element.hasClass('multiple-select')).toEqual(true);
            expect(ui.value()).toEqual(['P2P']);
            expect(ui.settings.data).toEqual([
                { id: 'P2P', name: 'P2P' },
                { id: 'S2D', name: 'S2D' },
                { id: 'O2C', name: 'O2C' }
            ]);
            expect(ui.settings.min).toEqual(1);
            expect(ui.settings.readonly).toEqual(false);
        });
    });

    describe(".ValidateBusinessProcess", function () {
        it("should be false", function () {
            //arrange
            itemLabelHandler.$BusinessProcess = {
                value: ko.observableArray([])
            };
            spyOn(itemLabelHandler, 'SetBusinesProcessErrorMessage');

            //act
            var result = itemLabelHandler.ValidateBusinessProcess();

            // assert
            expect(result).toEqual(false);
            expect(itemLabelHandler.SetBusinesProcessErrorMessage).toHaveBeenCalledWith(Localization.ValidationForBusinessProcess);
        });
        it("should be true", function () {
            //arrange
            itemLabelHandler.$BusinessProcess = {
                value: ko.observableArray(['label'])
            };
            spyOn(itemLabelHandler, 'SetBusinesProcessErrorMessage');

            //act
            var result = itemLabelHandler.ValidateBusinessProcess();

            // assert
            expect(result).toEqual(true);
            expect(itemLabelHandler.SetBusinesProcessErrorMessage).toHaveBeenCalledWith('');
        });
    });

    describe(".SetBusinesProcessErrorMessage", function () {
        it("should set message", function () {
            //arrange
            var elements = $('<div class="business-processes-selection"/><div class="business-processes-selection-message"/>');
            itemLabelHandler.$BusinessProcess = {
                element: elements.filter('.business-processes-selection')
            };

            //act
            itemLabelHandler.SetBusinesProcessErrorMessage('my-error-message');

            // assert
            expect(elements.filter('.business-processes-selection-message').text()).toEqual('my-error-message');
        });
    });

    describe(".BusinesProcessRender", function () {
        it("should render selected item html", function () {
            //arrange
            var rendertype = 'value';
            var bp = {
                css_class: 'P2P',
                fullname: 'P to P'
            };
            var wrapper = $('<div><div><span>my-text</span></div></div>');
            var element = wrapper.children();

            //act
            itemLabelHandler.BusinesProcessRender(rendertype, bp, element);

            // assert
            expect(element.hasClass('P2P')).toEqual(true);
            expect(element.attr('data-tooltip-text')).toEqual('P to P');
            expect(element.attr('data-tooltip-position')).toEqual('bottom');
            expect(element.attr('data-role')).toEqual('tooltip');
        });
        it("should render available item html", function () {
            //arrange
            var rendertype = 'list';
            var bp = {
                css_class: 'P2P',
                list_css_class: 'list-P2P',
                name: 'P2P',
                fullname: 'P to P',
                is_allowed: true,
                readonly: true
            };
            var wrapper = $('<div><div><span>my-text</span></div></div>');
            var element = wrapper.children();

            //act
            itemLabelHandler.BusinesProcessRender(rendertype, bp, element);

            // assert
            expect(element.hasClass('disabled')).toEqual(true);
            expect(element.children().eq(0).text()).toEqual('');
            expect(element.children().eq(0).hasClass('list-P2P')).toEqual(true);
            expect(element.children().eq(1).text()).toEqual('P2P');
            expect(element.parent().hasClass('business-processes')).toEqual(true);
        });
    });

    describe(".GetAllBusinesProcesses", function () {
        beforeEach(function () {
            spyOn(itemLabelHandler, 'GetModelUri').and.returnValue('/models/1');
            spyOn(itemLabelHandler, 'IsPublished').and.returnValue(true);
            spyOn(businessProcessesModel.General, 'Data').and.returnValue(
                [{
                    "id": "P2P",
                    "enabled": true,
                    "system": true,
                    "name": "Purchase to Pay",
                    "abbreviation": "P2P",
                    "order": 1,
                    "is_allowed": true
                }, {
                    "id": "S2D",
                    "enabled": true,
                    "system": true,
                    "name": "Supply to Demand",
                    "abbreviation": "S2D",
                    "order": 2,
                    "is_allowed": true
                }, {
                    "id": "O2C",
                    "enabled": true,
                    "system": true,
                    "name": "Order to Cash",
                    "abbreviation": "O2C",
                    "order": 3,
                    "is_allowed": true
                }, {
                    "id": "F2R",
                    "enabled": true,
                    "system": true,
                    "name": "Finance to Report",
                    "abbreviation": "F2R",
                    "order": 4,
                    "is_allowed": true
                }, {
                    "id": "PM",
                    "enabled": true,
                    "system": true,
                    "name": "Plant Maintenance",
                    "abbreviation": "PM",
                    "order": 5,
                    "is_allowed": true
                }, {
                    "id": "HCM",
                    "enabled": true,
                    "system": true,
                    "name": "Human Capital Management",
                    "abbreviation": "HCM",
                    "order": 6,
                    "is_allowed": true
                }, {
                    "id": "GRC",
                    "enabled": true,
                    "system": true,
                    "name": "Governance, Risk and Compliance",
                    "abbreviation": "GRC",
                    "order": 7,
                    "is_allowed": true
                }, {
                    "id": "IT",
                    "enabled": true,
                    "system": true,
                    "name": "Information Technology",
                    "abbreviation": "IT",
                    "order": 8,
                    "is_allowed": true
                }]);
        });

        it("should return correct privileges when user have View & Deny privileges", function () {
            //arrange
            spyOn(privilegesViewModel, 'GetModelPrivilegesByUri').and.returnValue(
                [{
                    "roles": [{
                        "model_id": "EA2_800"
                    }],
                    "model": "/models/1",
                    "label_authorizations": {
                        "P2P": "validate",
                        "S2D": "validate",
                        "O2C": "validate",
                        "F2R": "validate",
                        "PM": "validate",
                        "HCM": "validate",
                        "GRC": "deny",
                        "IT": "view"
                    }
                }]);

            var expected = [
                { id: 'P2P', is_allowed: true, readonly: false },
                { id: 'S2D', is_allowed: true, readonly: false },
                { id: 'O2C', is_allowed: true, readonly: false },
                { id: 'F2R', is_allowed: true, readonly: false },
                { id: 'PM', is_allowed: true, readonly: false },
                { id: 'HCM', is_allowed: true, readonly: false },
                { id: 'GRC', is_allowed: false, readonly: false },
                { id: 'IT', is_allowed: true, readonly: true }
            ];

            //act
            var businessProcesses = itemLabelHandler.GetAllBusinesProcesses();

            $.each(businessProcesses, function (index, actualBp) {
                // assert
                var expectedBp = expected.findObject('id', actualBp.id);
                expect(actualBp.is_allowed).toEqual(expectedBp.is_allowed);
                expect(actualBp.readonly).toEqual(expectedBp.readonly);
            });
        });
    });

    describe(".GetBusinesProcessValues", function () {
        beforeEach(function () {
            spyOn(itemLabelHandler, 'GetAssignedLabels').and.returnValue(['P2P', 'IT', 'GRC']);
            spyOn(businessProcessesModel.General, 'Data').and.returnValue(
                [{
                    "id": "P2P",
                    "enabled": true,
                    "system": true,
                    "name": "Purchase to Pay",
                    "abbreviation": "P2P",
                    "order": 1,
                    "is_allowed": true
                }, {
                    "id": "S2D",
                    "enabled": true,
                    "system": true,
                    "name": "Supply to Demand",
                    "abbreviation": "S2D",
                    "order": 2,
                    "is_allowed": true
                }, {
                    "id": "O2C",
                    "enabled": true,
                    "system": true,
                    "name": "Order to Cash",
                    "abbreviation": "O2C",
                    "order": 3,
                    "is_allowed": true
                }, {
                    "id": "F2R",
                    "enabled": true,
                    "system": true,
                    "name": "Finance to Report",
                    "abbreviation": "F2R",
                    "order": 4,
                    "is_allowed": true
                }, {
                    "id": "PM",
                    "enabled": true,
                    "system": true,
                    "name": "Plant Maintenance",
                    "abbreviation": "PM",
                    "order": 5,
                    "is_allowed": true
                }, {
                    "id": "HCM",
                    "enabled": true,
                    "system": true,
                    "name": "Human Capital Management",
                    "abbreviation": "HCM",
                    "order": 6,
                    "is_allowed": true
                }, {
                    "id": "GRC",
                    "enabled": true,
                    "system": true,
                    "name": "Governance, Risk and Compliance",
                    "abbreviation": "GRC",
                    "order": 7,
                    "is_allowed": false
                }, {
                    "id": "IT",
                    "enabled": true,
                    "system": true,
                    "name": "Information Technology",
                    "abbreviation": "IT",
                    "order": 8,
                    "is_allowed": true
                }]);
        });

        it("should return correct assigend bps from the angle", function () {
            //act
            var result = itemLabelHandler.GetBusinesProcessValues();
            expect(result).toEqual(['P2P', 'IT']);
        });
    });

    describe(".InitialLabels", function () {
        it("should init", function () {
            // arrange
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(itemLabelHandler, 'LoadLabels').and.returnValue($.when());
            spyOn(itemLabelHandler.StateHandler, 'SetItemData');
            spyOn(itemLabelHandler.StateHandler, 'GetLabelsData').and.returnValue(['my-info']);

            // act
            itemLabelHandler.InitialLabels();

            // assert
            expect(itemLabelHandler.Labels()).toEqual(['my-info']);
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(itemLabelHandler.StateHandler.SetItemData).toHaveBeenCalled();
        });
    });

    describe(".LoadLabels", function () {
        it("should load labels", function (done) {
            // arrange
            spyOn(modelsHandler, 'GetModelByUri').and.returnValue({});
            spyOn($, 'whenAll').and.returnValue($.Deferred(function (d) {
                setTimeout(function () {
                    d.resolve();
                }, 300);
                return d.promise();
            }));

            // 1st call
            itemLabelHandler.LoadLabels();
            expect(itemLabelHandler.LoadLabelStatus).toEqual('loading');

            // 2nd call
            itemLabelHandler.LoadLabels();
            expect(itemLabelHandler.LoadLabelTimer).not.toEqual(null);

            // 3rd call
            setTimeout(function () {
                itemLabelHandler.LoadLabels();
                expect(itemLabelHandler.LoadLabelStatus).toEqual('loaded');
                done();
            }, 500);
        });
    });

    describe(".GetStateData", function () {
        it("should get state data", function () {
            // act
            var result = itemLabelHandler.GetStateData();

            // assert
            expect(result).toEqual({});
        });
    });

    describe(".ValidateLabel", function () {
        it("should validate", function () {
            // arrange
            spyOn(itemLabelHandler.StateHandler, 'CheckSavePublishSettings').and.returnValue(true);

            //act
            var result = itemLabelHandler.ValidateLabel();

            // assert
            expect(result).toEqual(true);
            expect(itemLabelHandler.StateHandler.CheckSavePublishSettings).toHaveBeenCalled();
        });
    });
});
