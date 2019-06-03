using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.ManagementConsole.Controllers;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Configuration;
using System.Web;

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
            _testingController = GetController();

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
            _testingController = GetController();
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

        #endregion

        public class Result
        {
            public string reason { get; set; }
            public string message { get; set; }
        }

        #region private

        private GlobalSettingsController GetController()
        {
            return new GlobalSettingsController(
                globalSettingService.Object,
                modelService.Object,
                userService.Object,
                webClientConfigService.Object
            );
        }

        #endregion
    }
}
