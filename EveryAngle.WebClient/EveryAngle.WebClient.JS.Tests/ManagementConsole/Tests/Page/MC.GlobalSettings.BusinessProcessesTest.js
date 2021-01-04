/// <chutzpah_reference path="/../../Dependencies/page/MC.GlobalSettings.BusinessProcesses.js" />

describe("MC.GlobalSettings.BusinessProcesses", function () {
    var businessProcesses;
    beforeEach(function () {
        businessProcesses = MC.GlobalSettings.BusinessProcesses;
    });

    describe('AddBusinessProcessRowCallback', function () {
        var tpl;

        beforeEach(function () {
              tpl = $('<td class="gridColumnToolbar" data-field="id" role="gridcell"><a class="btnMove" title="Move"></a></td><td id="P2P" data-field="abbreviation" class="" role="gridcell"><input maxlength="50" type="text" name="id" class="required field_id"></td><td class="column-lang_en" data-field="lang_en" role="gridcell"><input type="text" class="required" maxlength="256" name="lang_en" value="Purchase to Pay"></td><td data-field="id" class="" role="gridcell" style="display: none;">P2P</td><td data-field="id" class="" role="gridcell" style="display: none;">P2P</td><td data-field="id" class="" role="gridcell" style="display: none;">P2P</td><td data-field="id" class="" role="gridcell" style="display: none;">P2P</td><td data-field="id" class="" role="gridcell" style="display: none;">P2P</td><td data-field="id" class="" role="gridcell" style="display: none;">P2P</td><td class="gridColumnNowrap column-lang_de" data-field="lang_de" role="gridcell"><input type="text" maxlength="256" name="lang_de" value="Einkauf"><input type="hidden" name="Uri" value="/businessprocesses/1"></td><td class="gridColumnNowrap column-lang_es" data-field="lang_es" role="gridcell"><input type="text" maxlength="256" name="lang_es" value="Aprovisionamiento"><input type="hidden" name="Uri" value="/businessprocesses/1"></td><td class="gridColumnNowrap column-lang_fr" data-field="lang_fr" role="gridcell"><input type="text" maxlength="256" name="lang_fr" value="Achats"><input type="hidden" name="Uri" value="/businessprocesses/1"></td><td class="gridColumnNowrap column-lang_nl" data-field="lang_nl" role="gridcell"><input type="text" maxlength="256" name="lang_nl" value="Purchase to Pay"><input type="hidden" name="Uri" value="/businessprocesses/1"></td><td class="columnBoolean" data-field="enabled" role="gridcell"><label><input type="checkbox" name="enabled_1608702046656" checked=""><span class="label"></span></label></td><td class="gridColumnToolbar" data-field="system" role="gridcell"><input type="hidden" name="uri" value="/businessprocesses/1"><input type="hidden" name="uri" value="/businessprocesses/1"><a data-parameters="{&quot;uri&quot;:&quot;/businessprocesses/1&quot;, &quot;abbreviation&quot;:&quot;P2P&quot;}" data-delete-field-index="1" class="btn btnDelete disabled" data-callback="MC.GlobalSettings.BusinessProcesses.DeletionCheckMark">Delete</a></td>')
              tpl.appendTo('body');
        });

        it("should add the one row", function () {
            // prepare
            spyOn(businessProcesses, 'UseVirtualUI');
            spyOn(businessProcesses, 'BindBusinessProcessNewRowEvent');

            // call
            businessProcesses.AddBusinessProcessRowCallback(tpl);

            //assert
            expect($('input[type="checkbox"]').val()).toBe('on');
            expect($('input[type="text"]').length).toBe(6);
            expect($('.btnDelete').attr('class').split(' ')).not.toContain('disabled');

            expect(businessProcesses.UseVirtualUI).toHaveBeenCalled();
        });

        afterEach(function () {
            tpl.remove();
        });
    });

    describe('DeletionCheckMark', function () {
        var obj;

        beforeEach(function () {
            obj = $('<div data-parameters={uri:"businessProcesses/1", abbrebiation:"P2P"}>Delete</div>');
            obj.appendTo('body');
        });

        it("should mark the row to be deleted", function () {
            //prepare
            var isRemove = true;
            businessProcesses.DeleteList = [];

            // call
            businessProcesses.DeletionCheckMark(obj, isRemove);

            //expect
            expect(businessProcesses.DeleteList.length).toBe(1);
        }); 

        afterEach(function () {
            obj.remove();
        });
    });

});