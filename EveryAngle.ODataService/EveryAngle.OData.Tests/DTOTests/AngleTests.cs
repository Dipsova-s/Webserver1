using EveryAngle.OData.DTO;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class AngleTests : UnitTestBase
    {
        #region private variables

        private Angle _angle;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _angle = new Angle();

            // unavailable display
            Display display3 = new Display { id = "display3" };
            display3.SetAsUnavailable();

            // set displays
            List<Display> displays = new List<Display>
            {
                new Display { id = "display1" },
                new Display { id = "display2" },
                display3
            };

            _angle.SetDisplays(displays);
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_SetDisplays()
        {
            Assert.AreEqual(3, _angle.display_definitions.Count);
        }

        [TestCase]
        public void Can_GetAvailableDisplays()
        {
            Assert.AreEqual(2, _angle.AvailableDisplays.Count);
        }

        #endregion
    }
}
