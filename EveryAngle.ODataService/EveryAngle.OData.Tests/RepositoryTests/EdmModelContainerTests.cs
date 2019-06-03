using EveryAngle.OData.DTO;
using EveryAngle.OData.Repository;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.RepositoryTests
{
    // EdmModelContainer mostly tests explicitly by business logic tests.
    [TestFixture(Category = "Repository")]
    public class EdmModelContainerTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            Initialize();
        }

        [TearDown]
        public void TearDown()
        {
            // re-init to clear all mock data
            Initialize();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_InitializeExplicitly_Via_Constructor()
        {
            IEdmModelMetadata emptyMetadata = new EdmModelMetadata();
            Assert.IsInstanceOf<IEdmModelMetadata>(emptyMetadata);
        }

        [TestCase]
        public void Can_CreateEdmModelMetadata()
        {
            IEdmModelMetadata master = EdmModelContainer.CreateEdmModelMetadata(ModelType.Master);
            IEdmModelMetadata slave = EdmModelContainer.CreateEdmModelMetadata(ModelType.Slave);
            IEdmModelMetadata none = EdmModelContainer.CreateEdmModelMetadata(ModelType.None);

            Assert.IsNotNull(master);
            Assert.IsTrue(master.IsMaster);
            Assert.AreEqual(ModelType.Master, master.ModelType);
            
            Assert.IsNotNull(slave);
            Assert.IsFalse(slave.IsMaster);
            Assert.AreEqual(ModelType.Slave, slave.ModelType);

            Assert.IsNotNull(none);
            Assert.IsFalse(none.IsMaster);
            Assert.AreEqual(ModelType.None, none.ModelType);
        }

        #endregion
    }
}
