using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;
using System.Net;
using System.Web;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class JsonHelperTests : UnitTestBase
    {
        #region private variables

        private JsonErrorResult _jsonErrorResult;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingContext();
            base.Setup();
        }

        #endregion

        #region tests

        [TestCase(HttpStatusCode.OK, 200)]
        public void Can_Execute_JsonErrorResult(HttpStatusCode httpStatusCode, int expectedCode)
        {
            _jsonErrorResult = new JsonErrorResult(httpStatusCode);
            Assert.AreEqual(expectedCode, HttpContext.Current.Response.StatusCode);
        }

        #endregion

        #region private/protected functions

        #endregion
    }
}
