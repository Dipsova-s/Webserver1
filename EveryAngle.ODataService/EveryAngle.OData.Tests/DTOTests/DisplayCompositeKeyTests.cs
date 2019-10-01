using EveryAngle.OData.DTO;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class DisplayCompositeKeyTests : UnitTestBase
    {
        #region private variables

        private DisplayCompositeKey _displayCompositeKey;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _displayCompositeKey = new DisplayCompositeKey { InternalId = 1, Uri = "models/1/angles/1/displays/1" };
        }

        #endregion

        #region tests

        [TestCase(1, "models/1/angles/1/displays/1", true)]
        [TestCase(1, "models/1/angles/2/displays/2", true)]
        [TestCase(2, "models/1/angles/1/displays/1", true)]
        [TestCase(2, "models/1/angles/2/displays/2", false)]
        public void Can_Compare(int internalId, string uri, bool expected)
        {
            DisplayCompositeKey compositeKey = new DisplayCompositeKey { InternalId = internalId, Uri = uri };
            bool result = _displayCompositeKey.Equals(compositeKey);
            Assert.AreEqual(expected, result);
        }

        [TestCase]
        public void Can_CompareWithNULL()
        {
            bool result = _displayCompositeKey.Equals(null);
            Assert.AreEqual(false, result);
        }

        [TestCase]
        public void Can_GetHashCode()
        {
            int result = _displayCompositeKey.GetHashCode();
            Assert.AreEqual(1, result);
        }

        #endregion
    }
}
