using EveryAngle.OData.Repository;

namespace EveryAngle.OData.Tests.MockData
{
    public class MockEdmModelContainer
    {
        public MockEdmModelContainer()
        {
            
        }

        public void InitializeNewTestData()
        {
            EdmModelContainer.Initialize();
        }
    }
}
