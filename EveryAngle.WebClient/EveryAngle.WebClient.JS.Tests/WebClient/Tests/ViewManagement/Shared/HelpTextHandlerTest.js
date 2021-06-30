/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />

describe("HelpTextHandler", function () {
    var helpTextHandler;
    beforeEach(function () {
        helpTextHandler = new HelpTextHandler();
    });

    describe(".UpdateHelpTextLink", function () {
        var link;
        beforeEach(function () {
            link = $('<a href="my_id" />');
        });

        it("should not update link if it's not help text", function () {
            window.helptextPageUrl = '/helppage';
            spyOn(WC.Utility, 'IsAbsoluteUrl').and.returnValue(true);
            helpTextHandler.UpdateHelpTextLink(link, '/models/1');

            expect(link.attr('href')).not.toContain(window.helptextPageUrl);
            expect(link.attr('target')).not.toEqual('_blank');
        });

        it("should update link if it's help text", function () {
            window.helptextPageUrl = '/helppage';
            spyOn(WC.Utility, 'IsAbsoluteUrl').and.returnValue(false);
            helpTextHandler.UpdateHelpTextLink(link, '/models/1');

            expect(link.attr('href')).toContain(window.helptextPageUrl);
            expect(link.attr('target')).toEqual('_blank');
        });
    });
    describe(".UpdateHelpTextLinkImage", function () {
        it("Should call GetUrlParamater and GetModelById", function () {
            var testImage = {
                attr: function () {
                    return '';
                }
            }
            spyOn(helpTextHandler, 'ValidateHelpTextImageLink').and.returnValue(true);
            spyOn(helpTextHandler, 'GetUrlParamater').and.returnValue('');
            spyOn(modelsHandler, 'GetModelById').and.returnValue({ help_texts_image: '' });

            //Act
            helpTextHandler.UpdateHelpTextLinkImage(testImage);

            //Assert
            expect(helpTextHandler.GetUrlParamater).toHaveBeenCalledWith('', enumHandlers.HELPTEXTPARAMETER.MODELNAME);
            expect(helpTextHandler.GetUrlParamater).toHaveBeenCalledWith('', enumHandlers.HELPTEXTPARAMETER.IMAGENAME);
            expect(modelsHandler.GetModelById).toHaveBeenCalled();
        });
        it("Should not call GetUrlParamater and GetModelById", function () {
            var testImage = {
                attr: function () {
                    return '';
                }
            }
            spyOn(helpTextHandler, 'ValidateHelpTextImageLink').and.returnValue(false);
            spyOn(helpTextHandler, 'GetUrlParamater').and.returnValue('');
            spyOn(modelsHandler, 'GetModelById').and.returnValue({ help_texts_image: '' });
            //Act
            helpTextHandler.UpdateHelpTextLinkImage(testImage);

            //Assert
            expect(helpTextHandler.GetUrlParamater).not.toHaveBeenCalled();
            expect(helpTextHandler.GetUrlParamater).not.toHaveBeenCalled();
            expect(modelsHandler.GetModelById).not.toHaveBeenCalled();
        });
    });
    describe(".ValidateHelpTextImageLink", function () {
        it("Should return true when url like helptexts/HelpTextImages", function () {
            var result = helpTextHandler.ValidateHelpTextImageLink('helptexts/HelpTextImages?imageName=Aexample&modelName=EA2_800');
            expect(result).toEqual(true);
        });
        it("Should return false when url like model/1/image/Anote.png", function () {
            var result = helpTextHandler.ValidateHelpTextImageLink('model/1/image/Anote');
            expect(result).toEqual(false);
        });
    });
    describe(".GetUrlParamater", function () {
        it("Should return modelname", function () {
            var result = helpTextHandler.GetUrlParamater('helptexts/HelpTextImages?imageName=Aexample&modelName=EA2_800', 'modelName');
            expect(result).toEqual('EA2_800');
        });
        it("Should return imageName", function () {
            var result = helpTextHandler.GetUrlParamater('helptexts/HelpTextImages?imageName=Aexample&modelName=EA2_800', 'imageName');
            expect(result).toEqual('Aexample');
        });
        it("Should return Null", function () {
            var result = helpTextHandler.GetUrlParamater('helptexts/HelpTextImages?imageName=Aexample&modelName=EA2_800', 'TestParam');
            expect(result).toEqual('');
        });
    })
});