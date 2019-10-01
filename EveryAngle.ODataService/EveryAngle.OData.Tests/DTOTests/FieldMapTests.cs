using EveryAngle.OData.DTO;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class FieldMapTests : UnitTestBase
    {
        #region tests

        [TestCase(false, false, false, false, false, false, false)]
        [TestCase(true, false, false, false, false, false, true)]
        [TestCase(false, true, false, false, false, false, true)]
        [TestCase(false, false, true, false, false, false, true)]
        [TestCase(false, false, false, true, false, false, true)]
        [TestCase(false, false, false, false, true, false, true)]
        [TestCase(false, false, false, false, false, true, true)]
        public void Can_SetConversionNeeded(bool isDate, bool isDouble, bool isPeriod,
            bool isDecimal, bool isTime, bool isEnumerated, bool expected)
        {
            FieldMap fieldMap = new FieldMap
            {
                IsDate = isDate,
                IsDouble = isDouble,
                IsPeriod = isPeriod,
                IsDecimal = isDecimal,
                IsTime = isTime,
                IsEnumerated = isEnumerated
            };
            fieldMap.SetConversionNeeded();

            Assert.AreEqual(expected, fieldMap.NeedsConversion);
        }

        #endregion
    }
}
