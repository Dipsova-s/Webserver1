using EveryAngle.OData.IntegrationTests.Base.TestCategory;
using NUnit.Framework;
using Simple.OData.Client;
using System.Net;

namespace EveryAngle.OData.IntegrationTests.Tests.Setup
{
    [TestFixture]
    public class UserTest : SetupSuite
    {

        #region Tests

        [Test, Order(1)]
        public void ItShouldReturnForbiddenWhenUserHaveNoRight()
        {
            Context.OdataUser = new Models.User("EAViewer", "P@ssw0rd");
            WebRequestException ex = Assert.ThrowsAsync<WebRequestException>(() => ODataClient.GetMetadataAsStringAsync());
            Assert.That(ex.Code, Is.EqualTo(HttpStatusCode.Forbidden));
        }

        [Test, Order(2)]
        public void ItShouldPossibleToGetMetaDataWhenUserHaveRight()
        {
            SetUpODataUser();
            string content = ODataClient.GetMetadataAsStringAsync().GetAwaiter().GetResult();
            Assert.IsTrue(!string.IsNullOrEmpty(content));
        }

        #endregion

    }
}