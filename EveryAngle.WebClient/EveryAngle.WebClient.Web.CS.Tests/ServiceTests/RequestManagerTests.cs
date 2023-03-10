using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using RestSharp;
using System.Web;
using System.Web.Script.Serialization;

namespace EveryAngle.WebClient.Web.CSTests.ServiceTests
{
    [TestFixture]
    public class RequestManagerTests : UnitTestBase
    {
        [TestFixtureSetUp]
        public void Initialize()
        {

        }

        [Test]
        public void Can_Initialize_RequestManager()
        {
            RequestManager manager = RequestManager.Initialize("url");
            manager.InitializeRequestClient(new RestClient());

            Assert.IsNotNull(manager.Client);
        }

        [Test]
        [ExpectedException(typeof(HttpException))]
        public void Cannot_Execute_When_NoUrl()
        {
            RequestManager.Initialize(string.Empty);
        }

        [Test]
        [ExpectedException(typeof(HttpException))]
        public void Cannot_Execute_When_ContentLengthExceeded()
        {
            RequestManager manager = RequestManager.Initialize("url");
            manager.InitializeRequestClient(new RestClient());

            JavaScriptSerializer serializer = new JavaScriptSerializer { MaxJsonLength = 100 };
            string longText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            do
            {
                longText += longText;
            } while (longText.Length <= serializer.MaxJsonLength);

            manager.PostBinary(longText);
        }

        [Test]
        [ExpectedException(typeof(HttpException))]
        public void Cannot_Call_To_CSM_When_ThumbPrint_Is_Invalid()
        {
            RequestManager.Initialize("csm/componentservices");
        }

        [TestCase("csm/componentservices", true)]
        [TestCase("csm/componentservices/xxxxxx", true)]
        [TestCase("/csm/componentservices", true)]
        [TestCase("/csm/componentservices/xxxxxx", true)]
        [TestCase("models/1", false)]
        public void Can_Check_IsCSMUri(string uri, bool expected)
        {
            bool result = RequestManager.IsCSMUri(uri);
            Assert.AreEqual(expected, result);
        }


        [TestCase("1/download", true)]
        [TestCase("items_export/1/file", true)]
        [TestCase("file", false)]
        [TestCase("download", false)]
        public void Can_Check_IsDownloadUri(string requestUri, bool isDownloadUri)
        {
            RequestManager manager = RequestManager.Initialize(requestUri);
            Assert.AreEqual(isDownloadUri, manager.IsDownloadUri());
        }
    }
}
