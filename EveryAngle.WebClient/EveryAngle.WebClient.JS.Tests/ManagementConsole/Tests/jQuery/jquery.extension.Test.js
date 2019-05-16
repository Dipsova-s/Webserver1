/// <reference path="/Dependencies/jquery/jquery.extension.js" />

describe("$.extension", function () {

    beforeEach(function () {
        
    });

    describe(".kendoMultiSelectExtension", function () {

        beforeEach(function () {
            jQuery('<select class="kendoMultiSelectComponent"></select>').appendTo('body');
        });

        it("should set readonly class element for default value(s)", function () {
            var componentContext = jQuery('.kendoMultiSelectComponent').kendoMultiSelectExtension({
                dataSource: [
                    { Id: '1', Value: 'EA2_800:EA2_800_ALL', Tooltip: '' },
                    { Id: '2', Value: 'EA2_800:EA2_800_POWER', Tooltip: '' },
                    { Id: '3', Value: 'EA2_800:EA2_800_VIEWER', Tooltip: '' }
                ],
                value: [
                    { Id: '1', Value: 'EA2_800:EA2_800_ALL' }
                ],
                isReadonlyDefaultValues: true
            });
            
            expect(componentContext.context).not.toBe(null);
            expect(componentContext.kendo).not.toBe(null);

            var multiSelectButtons = componentContext.context.siblings('.k-multiselect-wrap').find('.k-button');

            expect(multiSelectButtons.length).toEqual(1);
            expect(multiSelectButtons.hasClass('readonly')).toBe(true);
        });

    });
    

});