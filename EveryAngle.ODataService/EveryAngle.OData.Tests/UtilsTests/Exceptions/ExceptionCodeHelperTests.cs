using EveryAngle.OData.Utils.Exceptions;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Net;

namespace EveryAngle.OData.Tests.UtilsTests.Exceptions
{
    [TestFixture(Category = "Utilities")]
    public class ExceptionCodeHelperTests : UnitTestBase
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

        [TestCase(typeof(Exception), HttpStatusCode.InternalServerError)]
        [TestCase(typeof(InvalidOperationException), HttpStatusCode.InternalServerError)]
        [TestCase(typeof(ArgumentNullException), HttpStatusCode.NotFound)]
        [TestCase(typeof(NotSupportedException), HttpStatusCode.MethodNotAllowed)]
        [TestCase(typeof(KeyNotFoundException), HttpStatusCode.UnsupportedMediaType)]
        [TestCase(typeof(ArgumentException), (HttpStatusCode)422)]
        [TestCase(typeof(WebException), (HttpStatusCode)422)]
        [TestCase(typeof(NullReferenceException), HttpStatusCode.InternalServerError)]
        public void Can_VerifiedExceptionAsHttpStatusCode(Type exceptionType, HttpStatusCode expectedStatusCode)
        {
            Exception exceptionObject = Activator.CreateInstance(exceptionType) as Exception;
            Assert.AreEqual(ExceptionCodeHelper.GetExceptionCode(exceptionObject), expectedStatusCode);
        }

        [TestCase(Description = "ExceptionCodeHelper: Use to verified if new support was added but unit test is not provided, failed.")]
        public void Verified_Support_Count()
        {
            Assert.AreEqual(7, ExceptionCodeHelper.SupportCount);
        }

        #endregion
    }
}
