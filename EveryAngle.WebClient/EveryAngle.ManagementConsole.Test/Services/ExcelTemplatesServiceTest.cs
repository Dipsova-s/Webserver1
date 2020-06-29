using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.WebClient.Service.ApiServices;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Test.Services
{
    [TestFixture(Category = "MC")]
    public class ExcelTemplatesServiceTest
    {
        private Mock<ExcelTemplatesService> _service;
        [SetUp]
        public void SetUp()
        {
            _service = new Mock<ExcelTemplatesService>();
        }
        [TestCase("EveryAngle-Blue.xlsx", "/system/files/EveryAngle-Blue.xlsx?fileType=ExcelTemplate", 67724, 1589431808)]
        public void Get_Should_ReturnData_When_Call(string expectedFileName, string expectedUri, int expectedSize, int expectedModified)
        {
            IEnumerable<FileTemplatesViewModel> returnData = new List<FileTemplatesViewModel>()
            {
                    new FileTemplatesViewModel(){File="EveryAngle-Blue.xlsx",Uri = "/system/files/EveryAngle-Blue.xlsx?fileType=ExcelTemplate",Size = 67724,Modified= 1589431808}
            };
            _service.Setup(x => x.GetItems<FileTemplatesViewModel>(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(returnData);
            IEnumerable<FileTemplatesViewModel> result = _service.Object.Get();
            foreach(FileTemplatesViewModel template in result.ToList())
            {
                Assert.AreEqual(expectedFileName, template.File);
                Assert.AreEqual(expectedUri, template.Uri);
                Assert.AreEqual(expectedSize, template.Size);
                Assert.AreEqual(expectedModified, template.Modified);
            }
        }
        [Test]
        public void Upload_Should_Be_Called(){
            _service.Setup(x => x.Upload(It.IsAny<string>(),It.IsAny<byte[]>(), It.IsAny<string>()));
            _service.Object.Upload(It.IsAny<byte[]>(), It.IsAny<string>());
            _service.Verify(m => m.Upload(It.IsAny<string>(),It.IsAny<byte[]>(), It.IsAny<string>()), Times.Once);
        }
    }
}
