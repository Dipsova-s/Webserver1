using EveryAngle.OData.DTO;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class FieldTests : UnitTestBase
    {
        #region private variables

        private Field _field;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _field = new Field { id = "field1" };
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_GetField()
        {
            Assert.AreEqual("field1", _field.field);
        }

        [TestCase]
        public void Can_SetField()
        {
            _field.field = "field1_new";

            Assert.AreEqual("field1_new", _field.field);
        }

        [TestCase]
        public void Can_CreateCompositeKey()
        {
            FieldCompositeKey compositeKey = _field.CreateCompositeKey();

            Assert.AreEqual(_field.id, compositeKey.BusinessId);
        }

        [TestCase]
        public void Can_UpdateUniqueXMLElementKey()
        {
            FieldCompositeKey compositeKey = _field.UpdateUniqueXMLElementKey("field1_unique");

            Assert.AreEqual(_field.id, compositeKey.BusinessId);
            Assert.AreEqual("field1_unique", compositeKey.UniqueXMLElementKey);
        }

        #endregion
    }
}
