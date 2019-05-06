using EveryAngle.WebClient.Web.Controllers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using Moq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System.Collections.Generic;
using System.IO;
using System.Web;

namespace EveryAngle.WebClient.Web.CS.Tests.ControllerTest
{
    [TestFixture]
    public class SearchControllerTests : UnitTestBase
    {
        private readonly SearchController _controller = new SearchController();

        [Test]
        public void Should_DetectAndDeleteDangerousScript_When_ImportAngleAsJSONPackageFile()
        {
            var file = new Mock<HttpPostedFileBase>();

            var stream = new FileStream(
                        $"{_testResourcesPath}//dangerous-package.json",
                        FileMode.Open);

            file.Setup(x => x.InputStream).Returns(stream);
            file.Setup(x => x.ContentLength).Returns((int)stream.Length);
            file.Setup(x => x.FileName).Returns(stream.Name);
 
            var result = _controller.ImportAngle(new List<HttpPostedFileBase> { file.Object });
            Assert.IsNotNull(JObject.Parse(result.Content)["ErrorMessage"].ToString());
        }

    }
}
