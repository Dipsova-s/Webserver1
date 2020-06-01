/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("ToastNotificationHandler", function () {
    
    beforeEach(function () {
        jQuery.fn.getKendoNotification = jQuery.noop;
    });

    describe("ToastNotificationManager", function () {
        var managerTest, toastSuccess;
        beforeEach(function () {
            toastSuccess = new ToastNotification(ToastNotification.AlertType);
            managerTest = new ToastNotificationManager(toastSuccess);
        });

        describe(".MakeSuccessTextFormatting", function () {

            it("'MakeSuccessText' should be called", function () {
                spyOn(managerTest, 'MakeSuccessText');
                managerTest.MakeSuccessTextFormatting('Item name', "'{0}' has been saved!");
                expect(managerTest.MakeSuccessText).toHaveBeenCalled();
            });
            
        });

        describe(".MakeSuccessText", function () {

            beforeEach(function () {
                jasmine.clock().install();
            });

            afterEach(function () {
                jasmine.clock().uninstall();
            });

            it("'instance.MakeAlertText' should be called", function () {
                spyOn(toastSuccess, 'MakeAlertText');
                managerTest.MakeSuccessText('Publish settings have been saved!');
                jasmine.clock().tick(501);
                expect(toastSuccess.MakeAlertText).toHaveBeenCalled();
            });

        });

    });

    describe("ToastNotificationConfigurations", function () {

        it("verify toast configs", function () {
            var configs = new ToastNotificationConfigurations();

            expect(configs.title).toEqual('');
            expect(configs.message).toEqual('');
            expect(configs.templateType).toEqual('alert');

            expect(configs.hideOnClick).toEqual(false);
            expect(configs.autoHideAfter).toEqual(0);
            expect(configs.stacking).toEqual('up');
            expect(configs.position.bottom).toEqual(20);
            expect(configs.position.right).toEqual(20);
            expect(configs.templates.length).toEqual(1);
            expect(configs.show).not.toBeUndefined();
            expect(configs.animation.open).not.toBeUndefined();
        });

    });

    describe("ToastNotification", function () {

        describe(".MakeAlertText", function () {

            it("instance shold be called 'show' function", function () {
                var instanceTest = jasmine.createSpyObj('instanceTest', ['show']);
                spyOn(jQuery.fn, 'getKendoNotification').and.callFake(function () {
                    return instanceTest;
                });
                var toastTest = new ToastNotification(ToastNotification.AlertType);
                toastTest.Configurations = new ToastNotificationConfigurations();
                toastTest.MakeAlertText(instanceTest);

                expect(instanceTest.show).toHaveBeenCalled();
            });

        });

    });

    describe("ToastNotificationUtility", function () {

        describe(".TruncateTextFormatting", function () {

            it("should truncate text if word more than 60 characters", function () {
                // 572 chars
                var word = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
                var message = '({0})';
                var fullMessage = ToastNotificationUtility.TruncateTextFormatting(word, message);

                expect(fullMessage).toEqual("(Lorem Ipsum is simply dummy text of the printing and type...)");
            });

        });

    });
    
});
