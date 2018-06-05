using EveryAngle.OData.Tests.MockData;

namespace EveryAngle.OData.Tests
{
    public abstract class UnitTestBase
    {
        protected MockEdmModelContainer MockEdmModelContainer { get; set; }
        public UnitTestBase()
        {

        }

        public virtual void Initialize()
        {
            MockEdmModelContainer = new MockEdmModelContainer();
            MockEdmModelContainer.InitializeNewTestData();
        }
    }
}
