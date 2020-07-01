/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/DirectoryHandler.js" />

describe("BusinessProcessesModel", function () {

    var businessProcessModel;

    beforeEach(function () {
        jQuery.localStorage('business_processes', [{ id: 'test' }]);
        businessProcessModel = new BusinessProcessesViewModel();
    });

    afterEach(function () {
        jQuery.localStorage.removeItem('business_processes');
    });

    describe("call InitialData", function () {

        beforeEach(function () {
            // clear all before test
            jQuery.localStorage.removeItem('business_processes');
            businessProcessModel = new BusinessProcessesViewModel();
        });

        it("should set data if have externalData", function () {
            businessProcessModel.InitialData([{ id: 'test' }]);
            expect(businessProcessModel.Data()[0].id).toEqual('test');
        });

        it("should set data if no externalData but have storage", function () {
            businessProcessModel.SetData([{ id: 'test2' }]);
            businessProcessModel.InitialData();
            expect(businessProcessModel.Data()[0].id).toEqual('test2');
        });

        it("should do nothing if no externalData and no storage", function () {
            businessProcessModel.InitialData();
            expect(businessProcessModel.Data()).toBeUndefined();
        });

    });

    describe("call ApplyHandler", function () {

        beforeEach(function () {
            $('<div id="BPTest" />').hide().appendTo('body');
        });

        afterEach(function () {
            $('#BPTest').remove();
        });

        it("should not apply knockout if no container", function () {

            spyOn(ko, 'applyBindings');
            businessProcessModel.ApplyHandler($());
            expect(ko.applyBindings).not.toHaveBeenCalled();

        });

        it("should call applyBindings if not apply", function () {

            spyOn(ko, 'applyBindings');
            businessProcessModel.ApplyHandler($('#BPTest'));
            expect(ko.applyBindings).toHaveBeenCalled();

        });

        it("should call call applyBindings if applied but difference Identity", function () {

            spyOn(ko, 'applyBindings');
            spyOn(ko, 'dataFor').and.callFake(function () { return {}; });
            businessProcessModel.ApplyHandler($('#BPTest'));
            expect(ko.applyBindings).toHaveBeenCalled();

        });

        it("should not call applyBindings if applied and same Identity", function () {

            spyOn(ko, 'applyBindings');
            spyOn(ko, 'dataFor').and.callFake(function () { return { Identity: 'bp' }; });
            businessProcessModel.ApplyHandler($('#BPTest'));
            expect(ko.applyBindings).not.toHaveBeenCalled();

        });

    });

    describe("call Load", function () {

        beforeEach(function () {
            businessProcessesModel.General.IsLoaded(true);

            var data = [{ id: 'P2P', name: 'Purchase to Pay', is_allowed: true }];
            businessProcessesModel.General.Data(data);
        });

        it("should not load new data if IsLoaded is true", function () {

            spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when(); });
            spyOn(businessProcessModel, 'SetData').and.callFake($.noop);

            businessProcessesModel.General.IsLoaded(true);

            businessProcessModel.Load();
            expect(window.GetDataFromWebService).not.toHaveBeenCalled();

        });

        it("should load new data if IsLoaded is false", function () {

            spyOn(window, 'GetDataFromWebService').and.callFake(function () { return $.when({ business_processes: [] }); });
            spyOn(directoryHandler, 'GetDirectoryUri').and.callFake(function () { return ''; });
            spyOn(businessProcessModel, 'SetData').and.callFake($.noop);

            businessProcessesModel.General.IsLoaded(false);

            businessProcessModel.Load();
            expect(window.GetDataFromWebService).toHaveBeenCalled();

        });

    });

    describe("call HasDataInStorage", function () {

        it("should be false if no jQuery.localStorage", function () {
            jQuery.__localStorage = jQuery.localStorage;
            delete jQuery.localStorage;

            var result = !!businessProcessModel.HasDataInStorage(businessProcessModel.DirectoryName);
            expect(result).toBe(false);

            jQuery.localStorage = jQuery.__localStorage;
            delete jQuery.__localStorage;
        });

        it("should be false no business_processes data", function () {
            jQuery.localStorage('business_processes', null);
            var result = !!businessProcessModel.HasDataInStorage(businessProcessModel.DirectoryName);
            expect(result).toBe(false);
        });

        it("should be true have business_processes data", function () {
            jQuery.localStorage('business_processes', [{ id: 'test' }]);
            var result = !!businessProcessModel.HasDataInStorage(businessProcessModel.DirectoryName);
            expect(result).toBe(true);
        });

    });

    describe("call CssClass", function () {

        beforeEach(function () {
            //arrang data
            businessProcessModel.Data([
                { id: 'P2P' },
                { id: 'S2D' }
            ]);

            //arrang active bp
            var currentActiveList = {};
            currentActiveList["P2P"] = true;
            businessProcessModel.CurrentActive(currentActiveList);
        });

        it("add class last", function () {
            var data = { id: 'P2P', name: 'Purchase to Pay', is_allowed: true };
            var classes = businessProcessModel.CssClass(data, 1);

            expect(classes).toContain('businessProcessesItem2');
            expect(classes).toContain('P2P');
            expect(classes).toContain('last');
        });

        it("add class disable if data is not allowed", function () {
            var data = { id: 'P2P', name: 'Purchase to Pay', is_allowed: false };
            var classes = businessProcessModel.CssClass(data, 1);

            expect(classes).toContain('businessProcessesItem2');
            expect(classes).toContain('P2P');
            expect(classes).toContain('last');
            expect(classes).toContain('disabled');
        });

        it("add class active if data is actived", function () {
            var data = { id: 'P2P', name: 'Purchase to Pay', is_allowed: true };
            var classes = businessProcessModel.CssClass(data, 2);

            expect(classes).toContain('businessProcessesItem3');
            expect(classes).toContain('P2P');
            expect(classes).toContain('active');
        });

        it("add class businessProcessesItem if data is not actived", function () {
            var data = { id: 'S2D', name: 'S 2 D', is_allowed: true };
            var classes = businessProcessModel.CssClass(data, 2);

            expect(classes).toContain('businessProcessesItem3');
            expect(classes).toContain('S2D');
        });

        it("add class readonly if data is readonly", function () {
            var data = { id: 'P2P', name: 'Purchase to Pay', __readonly: true };
            var classes = businessProcessModel.CssClass(data, 2);

            expect(classes).toContain('businessProcessesItem3');
            expect(classes).toContain('P2P');
            expect(classes).toContain('readonly');
        });
    });

    describe("call AfterRender", function () {

        it("can set active to false if is_allow is false", function () {

            var data = { id: 'IT', is_allowed: false, __readonly: false };
            businessProcessModel.AfterRender('elemente', data);

            expect(businessProcessModel.CurrentActive()["IT"]).toBe(false);

        });

        it("can set active to true if is_allow is true", function () {

            //arrang data
            businessProcessModel.Data([
                { id: 'P2P', is_allowed: true },
                { id: 'S2D', is_allowed: true },
                { id: 'IT', is_allowed: true }
            ]);

            var data = { id: 'IT', is_allowed: true, __readonly: false };

            //arrang active bp
            var currentActiveList = {};
            currentActiveList["IT"] = true;
            businessProcessModel.CurrentActive(currentActiveList);

            businessProcessModel.AfterRender('element', data);

            expect(businessProcessModel.CurrentActive()["IT"]).toBe(true);

        });
    });

    describe("call DoCallbackFunction", function () {

        window.fnTest = $.noop;

        it("should not call if not function", function () {

            spyOn(jQuery, 'isFunction').and.callFake(function () { return false; });
            spyOn(window, 'fnTest');
            businessProcessModel.DoCallbackFunction(window.fnTest);

            expect(window.fnTest).not.toHaveBeenCalled();
        });

        it("should call if is function", function () {

            spyOn(jQuery, 'isFunction').and.callFake(function () { return true; });
            spyOn(window, 'fnTest');
            businessProcessModel.DoCallbackFunction(window.fnTest);

            expect(window.fnTest).toHaveBeenCalled();
        });

    });

    describe("call HeaderClick", function () {

        it("should be false if single active", function () {
            businessProcessModel.ReadOnly(true);
            businessProcessModel.MultipleActive(false);

            expect(businessProcessModel.HeaderClick()).toBe(false);
        });

        it("can click to active bp if it is allowed", function () {

            //arrang data
            businessProcessModel.Data([
                { id: 'P2P', is_allowed: true },
                { id: 'IT', is_allowed: true },
                { id: 'S2D', is_allowed: false }
            ]);

            businessProcessModel.MultipleActive(true);
            businessProcessModel.HeaderClick();

            expect(businessProcessModel.CurrentActive()["P2P"]).toBe(true);
            expect(businessProcessModel.CurrentActive()["IT"]).toBe(true);
        });

    });

    describe("call MoreClick", function () {

        beforeEach(function () {
            //arrang active bp
            var currentActiveList = {};
            currentActiveList["P2P"] = true;
            currentActiveList["IT"] = true;
            currentActiveList["S2D"] = false;
            businessProcessModel.CurrentActive(currentActiveList);
        });

        it("should add class expand", function () {
            var data = { id: 'IT', __readonly: true, is_allowed: true };

            $("<div id='BusinessProcessesTest' class='businessProcesses'><div class='test'></div></div>")
                .hide()
                .appendTo('body');

            var event = {};
            event.currentTarget = $('#BusinessProcessesTest').children();

            businessProcessModel.MoreClick(data, event);

            expect($('#BusinessProcessesTest').hasClass('expand')).toBe(true);
        });

        it("should remove class expand if it already existed", function () {
            var data = { id: 'IT', __readonly: true, is_allowed: true };

            $("<div id='BusinessProcessesTest' class='businessProcesses expand'><div class='test'></div></div>")
                .hide()
                .appendTo('body');

            var event = {};
            event.currentTarget = $('#BusinessProcessesTest').children();

            businessProcessModel.MoreClick(data, event);

            expect($('#BusinessProcessesTest').hasClass('expand')).toBe(false);
        });

        afterEach(function () {
            $('#BusinessProcessesTest').remove();
        });
    });

    describe("call HideMoreEventClick", function () {

        it("should not call SetHideMoreEvent method if does not click on business process", function () {

            spyOn(businessProcessModel, 'SetHideMoreEvent');
            businessProcessModel.HideMoreEventClick({ target: $() });

            expect(businessProcessModel.SetHideMoreEvent).not.toHaveBeenCalled();

        });

        it("should call SetHideMoreEvent method if click on business process", function () {

            spyOn(businessProcessModel, 'SetHideMoreEvent');
            var element = $('<div class="businessProcesses"><div></div></div>');
            businessProcessModel.HideMoreEventClick({ target: element.children() });

            expect(businessProcessModel.SetHideMoreEvent).toHaveBeenCalled();

        });

    });

    describe("call SetActive", function () {
        var element;
        beforeEach(function () {
            //arrang active bp
            var currentActiveList = {};
            currentActiveList["P2P"] = true;
            currentActiveList["IT"] = true;
            currentActiveList["S2D"] = false;
            businessProcessModel.CurrentActive(currentActiveList);

            element = "<div class='businessProcesses'></div>";
        });

        it("cannot set active if it is readonly", function () {
            var data = { id: 'IT', __readonly: true, is_allowed: true };

            expect(businessProcessModel.SetActive(data, element)).toBe(false);
        });

        it("can set active if multiple active", function () {
            var data = { id: 'IT', __readonly: false, is_allowed: true };
            businessProcessModel.MultipleActive(true);
            businessProcessModel.SetActive(data, element);

            expect(businessProcessModel.CurrentActive()["IT"]).toBe(true);
        });

        it("another bp should be inactive if multiple active is false", function () {
            var data = { id: 'IT', __readonly: false, is_allowed: true };
            businessProcessModel.MultipleActive(false);
            businessProcessModel.SetActive(data, element);

            expect(businessProcessModel.CurrentActive()["IT"]).toBe(true);
            expect(businessProcessModel.CurrentActive()["P2P"]).toBe(false);
        });

        it("ignore bp which is not allowed", function () {
            var data = { id: 'S2D', __readonly: false, is_allowed: false };
            businessProcessModel.SetActive(data, element);

            //expect
            expect(businessProcessModel.CurrentActive()["S2D"]).toBe(false);
        });
    });

    describe("call CanSetActive", function () {

        it("should be 'true' if isAllowed and CanEmpty", function () {

            businessProcessModel.CanEmpty(true);
            spyOn(businessProcessModel, 'GetActive').and.callFake(function () { return []; });

            var result = businessProcessModel.CanSetActive(true, false);
            expect(result).toEqual(true);

        });

        it("should be 'true' if isAllowed and GetActive != 1", function () {

            businessProcessModel.CanEmpty(false);
            spyOn(businessProcessModel, 'GetActive').and.callFake(function () { return [{}, {}]; });

            var result = businessProcessModel.CanSetActive(true, false);
            expect(result).toEqual(true);

        });

        it("should be 'true' if isAllowed and not isActived", function () {

            businessProcessModel.CanEmpty(false);
            spyOn(businessProcessModel, 'GetActive').and.callFake(function () { return [{}]; });

            var result = businessProcessModel.CanSetActive(true, false);
            expect(result).toEqual(true);

        });

        it("should be 'false' if isAllowed and isActived", function () {

            businessProcessModel.CanEmpty(false);
            spyOn(businessProcessModel, 'GetActive').and.callFake(function () { return [{}]; });

            var result = businessProcessModel.CanSetActive(true, true);
            expect(result).toEqual(false);

        });

        it("should be 'false' if not isAllowed and not canSetActive", function () {

            businessProcessModel.CanEmpty(false);
            spyOn(businessProcessModel, 'GetActive').and.callFake(function () { return [{}]; });

            var result = businessProcessModel.CanSetActive(false, false);
            expect(result).toEqual(false);

        });

    });

    describe("call GetActive", function () {

        it("can get active bp", function () {
            //arrang active bp
            var currentActiveList = {};
            currentActiveList["P2P"] = true;
            currentActiveList["S2D"] = true;
            businessProcessModel.CurrentActive(currentActiveList);

            //arrang data
            businessProcessModel.Data([
                { id: 'P2P' },
                { id: 'S2D' },
                { id: 'GRP' }
            ]);

            //expect
            expect(businessProcessModel.GetActive()).toContain('P2P');
            expect(businessProcessModel.GetActive()).toContain('S2D');
        });

    });

    describe("call GetTitle", function () {

        var data;

        beforeEach(function () {
            //arrang data
            businessProcessModel.Data([
                { id: 'P2P' },
                { id: 'S2D' }
            ]);

            //arrang active bp
            var currentActiveList = {};
            currentActiveList["P2P"] = true;
            businessProcessModel.CurrentActive(currentActiveList);

            //arrang data to get title
            data = { id: 'P2P', name: 'Purchase to Pay' };

            //arrang caption
            window.Captions.Tooltip_BusinessProcess_Select = 'Tooltip_BusinessProcess_Select';
            window.Captions.Tooltip_BusinessProcess_Deselect = 'Tooltip_BusinessProcess_Deselect';
        });

        it("can get title", function () {
            expect(businessProcessModel.GetTitle(data)).toEqual('Purchase to Pay');
        });

        it("can get smart title if already selected", function () {
            //arrang smart title
            businessProcessModel.SmartTitle(true);

            //expect
            expect(businessProcessModel.GetTitle(data)).toEqual('Tooltip_BusinessProcess_Deselect Purchase to Pay');
        });

        it("can get smart title if not yet selected", function () {
            //arrang smart title
            businessProcessModel.SmartTitle(true);

            //arrang inactive bp
            data = { id: 'S2D', name: 'Supply to Demand' };

            //expect
            expect(businessProcessModel.GetTitle(data)).toEqual('Tooltip_BusinessProcess_Select Supply to Demand');
        });

        it("can get smart title if cannot empty", function () {
            //arrang smart title
            businessProcessModel.SmartTitle(true);
            businessProcessModel.CanEmpty(false);

            //expect
            expect(businessProcessModel.GetTitle(data)).toEqual('Purchase to Pay');
        });

        it("can get smart title if active BPs are more than one", function () {
            //arrang smart title
            businessProcessModel.SmartTitle(true);
            businessProcessModel.CanEmpty(false);

            //arrang active bps
            var currentActiveList = {};
            currentActiveList["P2P"] = true;
            currentActiveList["S2D"] = true;
            businessProcessModel.CurrentActive(currentActiveList);

            //expect
            expect(businessProcessModel.GetTitle(data)).toEqual('Tooltip_BusinessProcess_Deselect Purchase to Pay');
        });

    });

    describe("call BindName", function () {

        it("can bind abbreviation", function () {
            var data = { id: 'IT', abbreviation: 'IT', name: 'IT name' };
            expect(businessProcessModel.BindName(data)).toEqual('IT');
        });

        it("can bind name if length is 2", function () {
            var data = { id: 'IT', abbreviation: 'IT', name: 'IT name' };
            businessProcessModel.Mode(2);
            expect(businessProcessModel.BindName(data)).toEqual('IT<br />name');
        });

        it("can bind name if length more than 2", function () {
            var data = { id: 'IT', abbreviation: 'IT', name: 'IT long name' };
            businessProcessModel.Mode(2);
            expect(businessProcessModel.BindName(data)).toEqual('IT long<br />name');

            expect(businessProcessModel.BindName(data)).toEqual('IT long<br />name');
        });

        it("can bind name if legnth more than 2 and the word is too long", function () {
            var data = { id: 'IT', abbreviation: 'IT', name: 'IT 555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555 k' };
            businessProcessModel.Mode(2);

            expect(businessProcessModel.BindName(data)).toEqual('IT<br />555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555 k');
        });

        afterEach(function () {
            $('#eaTextMeasure').remove();
        });

    });

    describe("call UpdateLayout", function () {

        var container;

        beforeEach(function () {
            $('<div id="BPTestContainer"><div><span class="businessProcessesItem"><i>test1</i></span><span class="businessProcessesItem active"><i>test<br>2</i></span><span class="businessProcessesItem last"><i>test3</i></span><span class="businessProcessesItem businessProcessesItemMore"></div></div></div>').css('opacity', 0).appendTo('body');
            $('#BPTestContainer').width(100);
            container = $('#BPTestContainer').children().css('max-width', 100);
        });

        afterEach(function () {
            $('#BPTestContainer').remove();
        });

        it("should expandable if size is larger than the container", function () {

            businessProcessModel.UpdateLayout(container);

            expect(container.hasClass('expandable')).toEqual(true);
        });

        it("should not expandable if size is less that the container", function () {

            spyOn(businessProcessModel, 'GetMaxItemSize').and.callFake(function () { return 10; });

            container.hide();
            businessProcessModel.UpdateLayout(container);

            expect(container.hasClass('expandable')).toEqual(false);
        });

    });

    describe("call UpdateCheck", function () {
        it("should return false", function () {
            //arrange
            var data = { id: 'IT', __readonly: true, is_allowed: true };

            //expect
            expect(businessProcessModel.UpdateCheck(data)).toBe(false);
        });

        it("should return true", function () {
            //arrange
            var data = { id: 'IT', __readonly: false, is_allowed: true };
            var currentActiveList = {};
            currentActiveList["IT"] = true;
            spyOn(businessProcessModel, 'CurrentActive').and.callFake(function () { return currentActiveList; });

            //expect
            expect(businessProcessModel.UpdateCheck(data)).toBe(true);
        });

        it("should return true for multiple active true", function () {
            //arrange
            var data = { id: 'IT', __readonly: false, is_allowed: true };
            var currentActiveList = {};
            currentActiveList["IT"] = true;
            spyOn(businessProcessModel, 'CurrentActive').and.callFake(function () { return currentActiveList; });
            spyOn(businessProcessModel, 'MultipleActive').and.callFake(function () { return true; });

            //expect
            expect(businessProcessModel.UpdateCheck(data)).toBe(true);
        });
    });

});
