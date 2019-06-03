using EveryAngle.OData.Utils;
using NUnit.Framework;
using System;
using System.Net;
using System.Web.Http;

namespace EveryAngle.OData.Tests.UtilsTests.Exceptions
{
    [TestFixture(Category = "Utilities")]
    public class ExceptionReasonMessageHelperTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase(typeof(HttpResponseException), "Failed to create a normal response, see message for more info")]
        [TestCase(typeof(ArgumentException), "Unprocessable Entity")]
        [TestCase(typeof(WebException), "Bad requested")]
        [TestCase(typeof(NullReferenceException), null)]
        public void Can_VerifiedExceptionReasonMessage(Type exceptionType, string expectedReason)
        {
            Exception exceptionObject;
            if (exceptionType == typeof(HttpResponseException))
                exceptionObject = new HttpResponseException(HttpStatusCode.BadGateway);
            else
                exceptionObject = Activator.CreateInstance(exceptionType) as Exception;

            Assert.AreEqual(ExceptionReasonMessageHelper.GetReasonMessage(exceptionObject), expectedReason);
        }

        [TestCase(Description = "ExceptionReasonMessageHelper: Use to verified if new support was added but unit test is not provided, failed.")]
        public void Verified_Support_Count()
        {
            Assert.AreEqual(3, ExceptionReasonMessageHelper.SupportCount);
        }

        #endregion
    }
}
