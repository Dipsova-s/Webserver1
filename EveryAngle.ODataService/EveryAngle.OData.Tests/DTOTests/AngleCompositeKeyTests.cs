using EveryAngle.OData.DTO;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class AngleCompositeKeyTests : UnitTestBase
    {
        #region private variables

        private AngleCompositeKey _angleCompositeKey;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _angleCompositeKey = new AngleCompositeKey { InternalId = 1, Uri = "models/1/angles/1" };
        }

        #endregion

        #region tests

        [TestCase(1, "models/1/angles/1", true)]
        [TestCase(1, "models/1/angles/2", true)]
        [TestCase(2, "models/1/angles/1", true)]
        [TestCase(2, "models/1/angles/2", false)]
        public void Can_Compare(int internalId, string uri, bool expected)
        {
            AngleCompositeKey compositeKey = new AngleCompositeKey { InternalId = internalId, Uri = uri };
            bool result = _angleCompositeKey.Equals(compositeKey);
            Assert.AreEqual(expected, result);
        }

        [TestCase]
        public void Can_CompareWithNULL()
        {
            bool result = _angleCompositeKey.Equals(null);
            Assert.AreEqual(false, result);
        }

        [TestCase]
        public void Can_GetHashCode()
        {
            int result = _angleCompositeKey.GetHashCode();
            Assert.AreEqual(1, result);
        }

        #endregion
    }
}
