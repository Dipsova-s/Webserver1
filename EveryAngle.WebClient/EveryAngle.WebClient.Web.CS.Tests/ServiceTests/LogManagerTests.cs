using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.WebClient.Web.CS.Tests.ServiceTests
{
    [TestFixture]
    public class LogManagerTests : UnitTestBase
    {
        [TestCase("{\"username\":\"eaadmin\",\"oldpassword\":\"********\"}", "{\"username\":\"eaadmin\",\"oldpassword\":\"SpecialCharsTest!@#$%^&*()_+\"}")]
        [TestCase("{\"username\":\"eaadmin\",\"newpassword\":\"********\"}", "{\"username\":\"eaadmin\",\"newpassword\":\"LetterWithNumericTest1234567890\"}")]
        [TestCase("{\"username\":\"eaadmin\",\"oldpassword\":\"********\",\"newpassword\":\"********\"}", "{\"username\":\"eaadmin\",\"oldpassword\":\"VeryVeryLonggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg\",\"newpassword\":\"VeryVeryLonggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg\"}")]
        public void Can_Anonymize_Password_Fields(string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging("password/changepassword", body, Method.PUT);
            Assert.AreEqual(expectedResult, actualResult);
        }
    }
}
