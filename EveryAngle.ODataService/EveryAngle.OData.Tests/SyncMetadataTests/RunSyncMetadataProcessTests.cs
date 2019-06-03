using EveryAngle.OData.Collector;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using EveryAngle.OData.App_Start;
using EveryAngle.OData.Service.App_Start;
using System.Web.Http;

namespace EveryAngle.OData.Tests.SyncMetadataTests
{
    [TestFixture(Category = "SyncMetadata")]
    public class RunSyncMetadataProcessTests : UnitTestBase
    {
        #region private variables

        private Angles _existingAngles;
        private IAngleDataCollector _testingCollector;
        private readonly Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            Initialize();
            IoCConfig.Register(new HttpConfiguration());

            // if get model angles with 0 specified return only total 500
            Angle angle = new Angle { uri = "models/1/angles/123" };
            _existingAngles = new Angles { header = new Header { total = 1 }, angles = new List<Angle> { angle } };
            _appServerProxy.Setup(x => x.GetAngles(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<User>())).Returns(_existingAngles);
            _appServerProxy.Setup(x => x.GetAngles(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<User>())).Returns(_existingAngles);
            _testingCollector = new AngleDataCollector(_appServerProxy.Object);
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
        public void Can_ContinueWorking_When_MetadataSync_Failed()
        {
            Task collectTask = _testingCollector.Collect(ModelType.Master);
            collectTask.Wait();

            Assert.IsTrue(collectTask.IsCompleted);
            // verified that's that the Master has a data
            Assert.IsTrue(EdmModelContainer.Metadata[ModelType.Master].Angles.Any());
            // verified that's that the Slave have no data has a data
            Assert.IsTrue(EdmModelContainer.Metadata[ModelType.Slave].Angles.IsEmpty);

            ODataApiConfig.RunSyncMetadataProcess(false);

            // verified again, everything must be remains
            Assert.IsTrue(EdmModelContainer.Metadata[ModelType.Master].Angles.Any());
            Assert.IsTrue(EdmModelContainer.Metadata[ModelType.Slave].Angles.IsEmpty);
        }

        #endregion
    }
}
