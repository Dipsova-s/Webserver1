using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Web.Controllers;
using EveryAngle.WebClient.Web.Controllers.Apis;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
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
            RequestManager manager = RequestManager.Initialize(string.Empty);
            manager.InitializeRequestClient(new RestClient());

            Assert.IsNotNull(manager.Client);
        }

        [Test]
        [ExpectedException(typeof(HttpException))]
        public void CanNot_Execute_When_ContentLengthExceeded()
        {
            RequestManager manager = RequestManager.Initialize(string.Empty);
            manager.InitializeRequestClient(new RestClient());

            JavaScriptSerializer serializer = new JavaScriptSerializer();
            string longText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            do
            {
                longText += longText;
            } while (longText.Length <= serializer.MaxJsonLength);

            manager.PostBinary(longText);
        }

        [Test]
        [ExpectedException(typeof(HttpException))]
        public void CanNot_Call_To_CSM_When_ThumbPrint_Is_Invalid()
        {
            RequestManager manager = RequestManager.Initialize("csm/componentservices");
        }
    }
}
