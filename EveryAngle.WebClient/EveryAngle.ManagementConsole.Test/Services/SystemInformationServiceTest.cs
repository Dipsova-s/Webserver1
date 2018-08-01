using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.SystemInformation;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Services.Test
{
    [TestFixture(Category = "MC")]
    public class SystemInformationServiceTest
    {
        private Mock<ISystemInformationService> service;


        [SetUp]
        public void Initialize()
        {
            service = new Mock<ISystemInformationService>();
            service
                .Setup(v => v.GetSystemInformation(It.Is<string>(s => s == "TestGetSystemInformation")))
                .Returns(new SystemInformationViewModel
                {
                    uri = "TestGetSystemInformation"
                })
                .Verifiable();
        }

        [Test]
        public void TestGetSystemInformation()
        {
            var systemInfo = service.Object.GetSystemInformation("TestGetSystemInformation");
            Assert.IsTrue(systemInfo.uri == "TestGetSystemInformation");
        }
    }
}
