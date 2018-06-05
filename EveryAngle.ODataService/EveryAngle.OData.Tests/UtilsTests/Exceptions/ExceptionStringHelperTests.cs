using EveryAngle.OData.Utils.Exceptions;
using NUnit.Framework;
using System.Net;

namespace EveryAngle.OData.Tests.UtilsTests.Exceptions
{
    [TestFixture(Category = "Utilities")]
    public class ExceptionStringHelperTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {

        }

        [TearDown]
        public void TearDown()
        {

        }

        #endregion

        #region tests

        [TestCase("InternalServerError", HttpStatusCode.InternalServerError)]
        [TestCase("MethodNotAllowed", HttpStatusCode.MethodNotAllowed)]
        [TestCase("UnsupportedMediaType", HttpStatusCode.UnsupportedMediaType)]
        [TestCase("BadRequest", HttpStatusCode.BadRequest)]
        [TestCase("Forbidden", HttpStatusCode.Forbidden)]
        [TestCase("NotFound", HttpStatusCode.NotFound)]
        [TestCase("UnprocessableEntity", (HttpStatusCode)422)]
        [TestCase("UNKNOW REASON", HttpStatusCode.InternalServerError)]
        public void Can_VerifiedReasonMessageAsHttpStatusCode(string reasonMesssage, HttpStatusCode expectedStatusCode)
        {
            Assert.AreEqual(reasonMesssage.AsHttpStatusCode(), expectedStatusCode);
        }

        [TestCase(Description = "ExceptionStringHelper: Use to verified if new support was added but unit test is not provided, failed.")]
        public void Verified_Support_Count()
        {
            Assert.AreEqual(7, ExceptionStringHelper.SupportCount);
        }

        #endregion
    }
}
