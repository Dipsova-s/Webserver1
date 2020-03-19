using EveryAngle.Core.ViewModels.Explorer;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemLog;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.Shared.Helpers;
using Moq;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class GlobalSettingsControllerTests : UnitTestBase
    {
        #region private variables

        private GlobalSettingsController _testingController;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();

            _testingController = new GlobalSettingsController(
                globalSettingService.Object,
                modelService.Object,
                userService.Object,
                webClientConfigService.Object,
                repositoryLogService.Object,
                logFileService.Object,
                logFileReaderService.Object,
                sessionHelper.Object
            );
        }

        #endregion

        #region tests

        // Case ArbitraryPathTraversal FullPath "C:\\Program Files\\Apache Software Foundation\\Tomcat 8.5\\conf\\tomcat-users.xml"
        [TestCase("QzpcUHJvZ3JhbSBGaWxlc1xBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvblxUb21jYXQgOC41XGNvbmZcdG9tY2F0LXVzZXJzLnhtbA==", "WebClient")]
        // Case ArbitraryPathTraversal FullPath "C:\\log\\..\\Program Files\\Apache Software Foundation\\Tomcat 8.5\\conf\\tomcat-users.xml"
        [TestCase("QzpcbG9nXC4uXFByb2dyYW0gRmlsZXNcQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb25cVG9tY2F0IDguNVxjb25mXHRvbWNhdC11c2Vycy54bWw=", "ManagementConsole")]
        // Case HasWrongFileExtension FullPath "C:\\log\\EveryAngle_WebClient_Request_Response_2018_8_2.xml"
        [TestCase("QzovbG9nL0V2ZXJ5QW5nbGVfV2ViQ2xpZW50X1JlcXVlc3RfUmVzcG9uc2VfMjAxOF84XzIueG1s", "WebClient")]
        public void GetSystemlogFile_ShouldThrowHttpException_WhenArbitraryPathTraversalAndHasWrongFileExtension(string encodeFullPath, string target)
        {
            // assert
            var exception = Assert.Throws<HttpException>(() =>
            {
                ConfigurationManager.AppSettings["LogFileFolder"] = "C:\\log";
                _testingController.GetSystemlogFile(encodeFullPath, target);
            });

            var result = JsonConvert.DeserializeObject<Result>(exception.Message);

            Assert.AreEqual("Forbidden", result.reason);
            Assert.AreEqual("Access to the requested path denied", result.message);
        }

        [Test]
        public void GetAuthenticationSystemSettingsAsJsonString_ShouldReturnCorrectJsonString_WhenItHasBeenUsed()
        {
            SystemSettingViewModel viewModel = new SystemSettingViewModel
            {
                DefaultAuthenticationProvider = "everyangle",
                trusted_webservers = new System.Collections.Generic.List<string>
                {
                    "192.168.1.1",  //NOSONAR
                    "127.0.0.1"     //NOSONAR
                }
            };

            string result = _testingController.GetAuthenticationSystemSettingsAsJsonString(sessionHelper.Object, viewModel);

            Assert.AreEqual("{\"trusted_webservers\":[\"192.168.1.1\",\"127.0.0.1\"],\"default_authentication_provider\":\"everyangle\"}", result);
        }

        [TestCase(SystemLogType.Repository)]
        [TestCase(SystemLogType.WebClient)]
        [TestCase(SystemLogType.ManagementConsole)]
        public void SystemLog_Should_RunClientOperationsWithLogViewer_When_LogTypeIs(SystemLogType logType)
        {
            sessionHelper.SetupGet(x => x.Models).Returns(new List<ModelViewModel>());
            string target = logType.ToString();
            PartialViewResult view = _testingController.SystemLog(target, string.Empty, string.Empty) as PartialViewResult;

            Assert.NotNull(view);
            if (logType == SystemLogType.Repository)
            {
                Assert.IsFalse(view.ViewBag.ServerOperation);
            }
            else
            {
                Assert.IsTrue(view.ViewBag.ServerOperation);
            }
            Assert.IsTrue(view.ViewBag.EnableLogViewer);
            Assert.IsTrue(view.ViewBag.SortEnabled);
        }

        [Test]
        public void ReadAllFolders_Should_ReturnFileFromRepositoryLogService_When_LogTypeIsRepository()
        {
            dynamic file = new RepositoryLogViewModel
            {
                size = 512,
                file = "test.log",
                modified = DateTime.Today.Ticks,
                uri = "test.log"
            };

            repositoryLogService.Setup(x => x.Get()).Returns(new List<FileModel>
            {
                new FileModel(file, string.Empty),
                new FileModel(file, string.Empty)
            });

            string target = SystemLogType.Repository.ToString();
            JsonResult result = _testingController.ReadAllFolders(null, target, string.Empty, string.Empty);

            dynamic data = (dynamic)result.Data;
            Assert.AreEqual(data.Data.Count, 2);
            Assert.AreEqual(data.Total, 2);
        }

        [TestCase(SystemLogType.AppServer)]
        [TestCase(SystemLogType.ModelServer)]
        [TestCase(SystemLogType.Repository)]
        public void GetSystemLogFile_Should_DownloadFileLogService_When_LogTypeIsInList(SystemLogType systemLogType)
        {
            string testFilePath = $"{AppDomain.CurrentDomain.SetupInformation.ApplicationBase}/Controllers/TestFiles/test.log";
            string fullPath = Base64Helper.Encode(testFilePath);
            string target = systemLogType.ToString();

            logFileService
                .Setup(x => x.Get(It.IsAny<string>()))
                .Returns(new FileViewModel { FileName = "test.log", FileBytes = new byte[0] });

            FileResult file = _testingController.GetSystemlogFile(fullPath, target);

            Assert.AreEqual(file.FileDownloadName, "test.log");
        }

        [TestCase("WebClient", ".log")]
        [TestCase("ManagementConsole", ".log")] 
        public void GetSystemlog_Should_Return_File_Contents_For_Log_File(string target, string fileExtension)
        {
            var filePath = "test" + fileExtension;
            logFileReaderService
                .Setup(x => x.CopyForLogFile(It.IsAny<string>(), It.IsAny<string>()));
            logFileReaderService
                .Setup(x => x.GetLogFileDetails(It.IsAny<string>()))
                .Returns(new FileReaderResult { ErrorMessage = "", StringContent = "Sample Data", Success = true });
            ContentResult objContentResult = _testingController.GetSystemlog(filePath, 0, 0, "", "", target);
            Assert.AreEqual(objContentResult.Content, "Sample Data");
        }

        [Test]
        public void Object_for_GlobalSettings_Should_Not_Be_Null()
        {
            GlobalSettingsController testController = new GlobalSettingsController(globalSettingService.Object, modelService.Object,
                userService.Object,
                webClientConfigService.Object,
                repositoryLogService.Object,
                logFileService.Object,
                logFileReaderService.Object);
            Assert.NotNull(testController);   
        }

        [Test]
        public void GetSystemLog_Should_Return_Throw_An_Exception()
        {
            logFileReaderService
                .Setup(x => x.CopyForLogFile(It.IsAny<string>(), It.IsAny<string>()));
            logFileReaderService
                .Setup(x => x.GetLogFileDetails(It.IsAny<string>()))
                .Returns(new FileReaderResult { ErrorMessage = "", StringContent = "", Success = false });
            var ex = Assert.Throws<HttpException>(() => _testingController.GetSystemlog("test.log", 0, 0, "", "", "ManagementConsole"));
            Assert.IsNotNullOrEmpty(ex.Message);
        }

        #endregion

        public class Result
        {
            public string reason { get; set; }
            public string message { get; set; }
        }
    }
}
