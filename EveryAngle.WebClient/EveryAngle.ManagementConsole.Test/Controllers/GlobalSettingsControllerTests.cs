using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Explorer;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemInformation;
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
                systemSettingsService.Object,
                stsLogService.Object,
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
        [TestCase(SystemLogType.AppServer)]
        [TestCase(SystemLogType.ModelServer)]
        [TestCase(SystemLogType.STS)]
        public void SystemLog_Should_RunClientOperationsWithLogViewer_When_LogTypeIs(SystemLogType logType)
        {
            sessionHelper.SetupGet(x => x.Models).Returns(new List<ModelViewModel>());
            string target = logType.ToString();
            PartialViewResult view = _testingController.SystemLog(target, string.Empty, string.Empty) as PartialViewResult;

            Assert.NotNull(view);
            if (logType == SystemLogType.Repository || logType == SystemLogType.STS)
            {
                Assert.IsFalse(view.ViewBag.ServerOperation);
            }
            else if (logType == SystemLogType.ModelServer)
            {
                Assert.IsFalse(view.ViewBag.SortEnabled);
            }
            else
            {
                Assert.IsTrue(view.ViewBag.ServerOperation);
                Assert.IsTrue(view.ViewBag.SortEnabled);
            }
            Assert.IsTrue(view.ViewBag.EnableLogViewer);
        }

        [Test]
        public void ReadAllFolders_Should_ReturnFileFromRepositoryLogService_When_LogTypeIsRepository()
        {
            dynamic file = new ComponentLogViewModel
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
            Assert.AreEqual(2, data.Data.Count);
            Assert.AreEqual(2, data.Total);
        }

        [TestCase(SystemLogType.AppServer)]
        [TestCase(SystemLogType.ModelServer)]
        [TestCase(SystemLogType.Repository)]
        [TestCase(SystemLogType.STS)]
        public void GetSystemLogFile_Should_DownloadFileLogService_When_LogTypeIsInList(SystemLogType systemLogType)
        {
            string testFilePath = $"{AppDomain.CurrentDomain.SetupInformation.ApplicationBase}/Controllers/TestFiles/test.log";
            string fullPath = Base64Helper.Encode(testFilePath);
            string target = systemLogType.ToString();

            logFileService
                .Setup(x => x.Get(It.IsAny<string>()))
                .Returns(new FileViewModel { FileName = "test.log", FileBytes = new byte[0] });

            FileResult file = _testingController.GetSystemlogFile(fullPath, target);

            Assert.AreEqual("test.log", file.FileDownloadName);
        }

        [TestCase("WebClient", "C:/log/EveryAngle_ApplicationServer_2023_01_25.log", true)]
        [TestCase("ManagementConsole", "C:/log/EveryAngle_ManagementConsole_General_2023_01_18#_1.log", true)]
        [TestCase("AppServer", "/system/logfiles/EveryAngle_ApplicationServer_2023_01_25.log", false)]
        [TestCase("ModelServer", "//models/1/agent/logfiles/RTMS/EveryAngle_RTMS_2023_01_23.log", false)]
        [TestCase("Repository", "/repository/logfiles/EveryAngle_Repository_20230123.log", false)]
        public void GetSystemlog_Should_Return_File_Contents_For_Log_File(string target, string fullPath, bool isOnClient)
        {
            sessionHelper.SetupGet(x => x.Models).Returns(new List<ModelViewModel>
            {
                new ModelViewModel
                {
                    id = "EA2_800",
                    Uri = new Uri("/models/1", UriKind.Relative),
                    Agent = new Uri("/models/1/agent", UriKind.Relative)
                }
            });
            logFileReaderService
                .Setup(x => x.CopyForLogFile(It.IsAny<string>(), It.IsAny<string>()));
            if (isOnClient)
            {
                logFileReaderService
                    .Setup(x => x.GetLogFileDetails(It.IsAny<string>()))
                    .Returns(new FileReaderResult { ErrorMessage = "", StringContent = "Sample Data", Success = true });
            }
            else
            {
                logFileReaderService
                    .Setup(x => x.Get(It.IsAny<string>()))
                    .Returns(new FileReaderResult { ErrorMessage = "", StringContent = "Sample Data", Success = true });
            }

            ContentResult objContentResult = _testingController.GetSystemlog(fullPath, 0, 0, "", "", target);
            Assert.AreEqual("Sample Data", objContentResult.Content);
        }

        [TestCase("WebClient", "C:/log/test.csl")]
        [TestCase("ManagementConsole", "C:/log/test.csl")]
        [ExpectedException("System.Web.HttpException")]
        public void GetSystemlog_Should_Throw_HttpException_For_CSL_File(string target, string fullPath)
        {
            logFileReaderService
                .Setup(x => x.CopyForLogFile(It.IsAny<string>(), It.IsAny<string>()));
            Mock<System.Web.Mvc.UrlHelper> mockUrl = new Mock<System.Web.Mvc.UrlHelper>();
            mockUrl.Setup(x => x.Action(It.IsAny<string>(), It.IsAny<string>())).Returns("");
            _testingController.Url = mockUrl.Object;
            logFileService
                .Setup(x => x.GetJsonFromCsl(It.IsAny<ExecuteParameters>()))
                .Returns(new ExecuteJsonResult());
            _testingController.GetSystemlog(fullPath, 0, 0, "", "", target);
        }

        [Test]
        public void Object_for_GlobalSettings_Should_Not_Be_Null()
        {
            GlobalSettingsController testController = new GlobalSettingsController(globalSettingService.Object, modelService.Object,
                userService.Object,
                webClientConfigService.Object,
                repositoryLogService.Object,
                logFileService.Object,
                logFileReaderService.Object,
                systemSettingsService.Object,
                stsLogService.Object);
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

        [Test]
        public void GetSystemSettings_Should_Set_ApprovalStateOptions_In_ViewBag()
        {
            var version = new VersionViewModel
            {
                Entries = new List<Entry> { new Entry
                    {
                    Name = "system_settings",
                    Uri = new Uri("http://dummy/")
                    }
                }
            };
            sessionHelper.SetupGet(x => x.Version)
                .Returns(version);
            sessionHelper.SetupGet(x => x.Info)
                .Returns(new SystemInformationViewModel
                {
                    features = new List<FeatureViewModel>()
                });
            globalSettingService
                .Setup(x => x.GetSystemSettings(It.IsAny<string>()))
                .Returns(new SystemSettingViewModel());

            var approvalStateOptions = new List<SystemSettingOption>
            {
                new SystemSettingOption{ Id = "enabled", Name = "enabled" },
                new SystemSettingOption{ Id = "disabled", Name = "disabled" }
            };
            systemSettingsService
                .Setup(x => x.BuildApprovalStateOptions())
                .Returns(approvalStateOptions);
            _testingController.GetSystemSettings();

            Assert.NotNull(_testingController.ViewBag.ApprovalStateOptions);
            var approvalOptions = (List<SystemSettingOption>)_testingController.ViewBag.ApprovalStateOptions;
            Assert.AreEqual(approvalStateOptions.Count, approvalOptions.Count);
            globalSettingService.Verify(x => x.GetSystemSettings(It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void RenderExportPackageForm_Should_Return_PartialView()
        {
            sessionHelper.SetupGet(x => x.Models).Returns(new List<ModelViewModel>
            {
                new ModelViewModel
                {
                    id = "EA2_800",
                    Uri = new Uri("/models/1", UriKind.Relative)
                }
            });

            var result = _testingController.RenderActivatePackageForm();

            // assert 
            Assert.That(result, Is.InstanceOf<PartialViewResult>());
        }
        #endregion

        public class Result
        {
            public string reason { get; set; }
            public string message { get; set; }
        }
    }
}
