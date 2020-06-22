using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Controllers;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AngleExportsControllerTests : UnitTestBase
    {
        #region private variables
        private AngleExportsController _testingController;
        private AngleExportsController _testingControllerWithoutMockingSession;
        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            _testingController = new AngleExportsController(
                excelTemplateService.Object,
                sessionHelper.Object);
            _testingControllerWithoutMockingSession = new AngleExportsController(
                excelTemplateService.Object);
            _testingController.ControllerContext = new ControllerContext(contextBase.Object, new RouteData(), _testingController);
        }

        #endregion
        #region tests
        [TestCase("FileViewModel", "EveryAngle-Blue.xlsx", "/system/files/EveryAngle-Blue.xlsx?fileType=ExcelTemplate", 67724, 1589431808)]
        public void Can_ReadExcelTemplates(string testResourceName, string expectedFileName, string expectedUri, int expectedSize, int expectedModified)
        {
            List<FileTemplatesViewModel> fileViewModel = GetMockViewModel<List<FileTemplatesViewModel>>(testResourceName);
            excelTemplateService.Setup(x => x.Get()).Returns(fileViewModel);
            JsonResult result = _testingControllerWithoutMockingSession.ReadExcelTemplates() as JsonResult;
            foreach (FileTemplatesViewModel item in ((Kendo.Mvc.UI.DataSourceResult)result.Data).Data)
            {
                Assert.AreEqual(expectedFileName, item.File);  
                Assert.AreEqual(expectedUri, item.Uri);  
                Assert.AreEqual(expectedSize, item.Size);  
                Assert.AreEqual(expectedModified, item.Modified);  
            }
        }
        [Test]
        public void Should_Return_Partial_View_for_RenderExcelTemplates()
        {
            var result = _testingControllerWithoutMockingSession.RenderExcelTemplates();
            Assert.True(((ViewResultBase)result).ViewName.Contains("ExcelTemplates"));
        }
        
        [Test]
        public void Should_Return_Partial_View_for_GetExcelTemplateGrid()
        {
            var result = _testingController.GetExcelTemplateGrid();
            Assert.True(((ViewResultBase)result).ViewName.Contains("ExcelTemplatesGrid"));
        }

        [Test]
        public void Should_Call_DeleteExcelTemplate()
        {
            excelTemplateService.Setup(x=>x.Delete(It.IsAny<string>()));
            _testingControllerWithoutMockingSession.DeleteExcelTemplate(It.IsAny<string>());
            excelTemplateService.Verify(m => m.Delete(It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void Should_Call_DownloadFile()
        {
            excelTemplateService.Setup(x => x.Download(It.IsAny<string>()))
                .Returns(new FileViewModel { FileName = "test.xlsx", FileBytes = new byte[0] });
            _testingControllerWithoutMockingSession.DownloadFile(It.IsAny<string>());
            excelTemplateService.Verify(m => m.Download(It.IsAny<string>()),Times.Once);
        }

        [Test]
        public void Should_Call_UploadExcelTemplates()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.FileName).Returns("TestFile.xlsx");
            file.Setup(x => x.ContentLength).Returns(10);
            file.Setup(x => x.InputStream).Returns(Stream.Null);
            _testingControllerWithoutMockingSession.UploadExcelTemplates(It.IsAny<FormCollection>(), file.Object);
            excelTemplateService.Verify(m => m.Upload(It.IsAny<byte[]>(), It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void UploadExcelTemplates_Should_Fail_When_File_Empty()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.FileName).Returns("Test File.xlsx");
            var returnValue = _testingControllerWithoutMockingSession.UploadExcelTemplates(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        [Test]
        public void UploadExcelTemplates_Should_Fail_When_File_Name_Invalid()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.ContentLength).Returns(10);
            file.Setup(x => x.FileName).Returns("Test File.xlsx");
            var returnValue = _testingControllerWithoutMockingSession.UploadExcelTemplates(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        [Test]
        public void Should_Fail_With_Exception_Thrown_For_Webclient_Service()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.ContentLength).Throws(new HttpException("Exception thrown") { Source = "EveryAngle.WebClient.Service" });
            excelTemplateService.Setup(x => x.Upload(It.IsAny<byte[]>(), It.IsAny<string>()));
            var returnValue = _testingController.UploadExcelTemplates(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        [Test]
        public void Should_Fail_With_Exception_Thrown_For_Other_Service()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.ContentLength).Throws(new HttpException("Exception thrown") { Source = "TestSource" });
            excelTemplateService.Setup(x => x.Upload(It.IsAny<byte[]>(), It.IsAny<string>()));
            var returnValue = _testingController.UploadExcelTemplates(It.IsAny<FormCollection>(), file.Object);
            Assert.IsNotNull(returnValue);
            Assert.IsTrue(((ContentResult)returnValue).Content.Contains("\"success\":false"));
        }

        #endregion
    }
}
