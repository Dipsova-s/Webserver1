using EveryAngle.OData.DTO;
using EveryAngle.OData.Utils;
using Microsoft.Data.Edm;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.UtilsTests
{
    [TestFixture(Category = "Utilities")]
    public class EdmPrimitiveConvertTest : UnitTestBase
    {
        #region private variables

        private Field testingField = new Field();

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // do nothing
        }

        [TearDown]
        public void TearDown()
        {
            // re-init object
            testingField = new Field();
        }

        #endregion

        #region tests

        [TestCase("int", EdmPrimitiveTypeKind.Int64)]
        [TestCase("percentage", EdmPrimitiveTypeKind.Double)]
        [TestCase("double", EdmPrimitiveTypeKind.Double)]
        [TestCase("currency", EdmPrimitiveTypeKind.Decimal)]
        [TestCase("date", EdmPrimitiveTypeKind.DateTime)]
        [TestCase("datetime", EdmPrimitiveTypeKind.DateTime)]
        [TestCase("time", EdmPrimitiveTypeKind.Time)]
        [TestCase("duration", EdmPrimitiveTypeKind.DateTime)]
        [TestCase("period", EdmPrimitiveTypeKind.Int64)]
        [TestCase("boolean", EdmPrimitiveTypeKind.Boolean)]
        [TestCase(null, EdmPrimitiveTypeKind.String)]
        [TestCase("text", EdmPrimitiveTypeKind.String)]
        [TestCase("I_AM_UNKNOWN", EdmPrimitiveTypeKind.String)]
        public void Can_ConvertFieldTypeToPrimitiveFromField(string fieldType, EdmPrimitiveTypeKind expectedKind)
        {
            testingField.fieldtype = fieldType;
            EdmPrimitiveTypeKind? actualKind = EdmPrimitiveConvert.GetKind(testingField.fieldtype);
            Assert.AreEqual(expectedKind, actualKind.Value,
                string.Format("Converted edm primitive should be {0} instead of {1}", expectedKind, actualKind.Value));
        }

        #endregion
    }
}
