using EveryAngle.OData.DTO;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class DisplayTests : UnitTestBase
    {
        #region private variables

        private Display _display;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _display = new Display { uri = "/models/1/angles/2/displays/3" };
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_GetAngleUri()
        {
            Assert.AreEqual("/models/1/angles/2", _display.angle_uri);
        }

        #endregion
    }
}
