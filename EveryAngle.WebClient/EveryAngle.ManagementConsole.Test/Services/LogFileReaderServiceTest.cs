using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemLog;
using EveryAngle.WebClient.Service.ApplicationServices;
using Moq;
using NUnit.Framework;
using System.IO;

namespace EveryAngle.ManagementConsole.Test.Services
{
    [TestFixture(Category = "MC")]
    public class LogFileReaderServiceTest
    {
        private Mock<LogFileReaderService> _service;

        [SetUp]
        public void SetUp()
        {
            _service = new Mock<LogFileReaderService>();
        }

        [Test]
        public void Get_Should_ReturnData_When_Called()
        {
            _service.Setup(x => x.Download(It.IsAny<string>())).Returns(new FileViewModel() { FileBytes = new byte[0], FileName = "" });
            FileReaderResult result = _service.Object.Get("");
            Assert.NotNull(result);
            _service.Verify(x => x.Download(It.IsAny<string>()));
            Assert.AreEqual(true, result.Success);
        }

        [Test]
        public void Get_Should_Give_Exception_When_Called()
        {
            _service.Setup(x => x.Download(It.IsAny<string>()))
                    .Throws<IOException>();
            FileReaderResult result = _service.Object.Get("");
            Assert.NotNull(result);
            Assert.AreEqual(false, result.Success);
        }

        [Test]
        public void GetLogFileDetails_Should_ReturnData_When_Called()
        {
            _service
                .Setup(x => x.IsFileExists(It.IsAny<FileInfo>()))
                .Returns(true);
            _service
               .Setup(x => x.ReadAllText(It.IsAny<string>()))
               .Returns("This is a test contents");

            FileReaderResult result = _service.Object.GetLogFileDetails("test.log");
            Assert.NotNull(result);
            Assert.AreEqual("This is a test contents", result.StringContent);
            Assert.AreEqual(true, result.Success);
        }
        [Test]
        public void GetLogFileDetails_Should_Give_Exception_When_Called()
        {
            _service
                .Setup(x => x.IsFileExists(It.IsAny<FileInfo>()))
                .Returns(true);
            _service
               .Setup(x => x.ReadAllText(It.IsAny<string>()))
               .Throws<IOException>();
            FileReaderResult result = _service.Object.GetLogFileDetails("test.log");
            Assert.NotNull(result);
            Assert.AreEqual(false, result.Success);
        }
    }
}
