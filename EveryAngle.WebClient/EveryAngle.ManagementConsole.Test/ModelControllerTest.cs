using EveryAngle.Core.Interfaces.Services;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test
{
    [TestFixture(Category = "MC")]
    public class ModelControllerTest
    {
        readonly Mock<IModelService> modelService = new Mock<IModelService>();
        readonly Mock<ILabelService> labelService = new Mock<ILabelService>();
        readonly Mock<IUserService> userService = new Mock<IUserService>();
        readonly Mock<ISessionService> sessionService = new Mock<ISessionService>();
        readonly Mock<IGlobalSettingService> globalSettingService = new Mock<IGlobalSettingService>();
        readonly Mock<ISystemInformationService> systemInformationService = new Mock<ISystemInformationService>();
        ModelController modelController;

        [SetUp]
        public void Init()
        {
            modelController = new ModelController(modelService.Object, labelService.Object, globalSettingService.Object, systemInformationService.Object, sessionService.Object);
        }
    }
}
