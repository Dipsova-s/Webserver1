using EveryAngle.Core.ViewModels.Model;
using EveryAngle.WebClient.Service.ApiServices;
using Moq;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Services
{
    [TestFixture(Category = "MC")]
    public class LogFileServiceTest
    {
        private Mock<LogFileService> _service;

        [SetUp]
        public void SetUp()
        {
            _service = new Mock<LogFileService>();
        }

        [Test]
        public void Get_Should_ReturnData_When_Call()
        {
            _service
                .Setup(x => x.Download(It.IsAny<string>()))
                .Returns(new FileViewModel
                {
                    FileName = "test.log"
                });

            string uri = "";
            FileViewModel result = _service.Object.Get(uri);

            Assert.NotNull(result);
            Assert.AreEqual(result.FileName, "test.log");
        }
    }
}
