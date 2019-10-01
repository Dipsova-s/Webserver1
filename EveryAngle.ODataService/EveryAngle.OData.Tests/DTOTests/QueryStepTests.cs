using EveryAngle.OData.DTO;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.DTOTests
{
    [TestFixture(Category = "DTO")]
    public class QueryStepTests : UnitTestBase
    {
        #region tests

        [TestCase]
        public void Can_CreateQueryStep()
        {
            QueryStep queryStep = new QueryStep
            {
                field = "field1",
                @operator = "equal_to",
                step_type = "filter"
            };

            Assert.AreEqual("field1", queryStep.field);
            Assert.AreEqual("equal_to", queryStep.@operator);
            Assert.AreEqual("filter", queryStep.step_type);
            Assert.AreEqual(null, queryStep.valid);
            Assert.AreEqual(0, queryStep.aggregation_fields.Count);
            Assert.AreEqual(0, queryStep.grouping_fields.Count);
        }

        #endregion
    }
}
