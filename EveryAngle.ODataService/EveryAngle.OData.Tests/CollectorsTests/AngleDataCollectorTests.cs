using System;
using EveryAngle.OData.Collector;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EveryAngle.OData.Tests.CollectorsTests
{
    [TestFixture(Category = "Collectors")]
    public class AngleDataCollectorTests : UnitTestBase
    {
        #region private variables

        private Angles _existingAngles;
        private IAngleDataCollector _testingCollector;
        private bool _getAnglesTimeout;
        private readonly Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _getAnglesTimeout = false;
            Initialize();

            // if get model angles with 0 specified return only total 500
            Angle angle = new Angle { uri = "models/1/angles/123" };
            _existingAngles = new Angles { header = new Header { total = 1 }, angles = new List<Angle> { angle } };
            _appServerProxy.Setup(x => x.GetAngles(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<User>())).Returns(_existingAngles);
            _appServerProxy.Setup(x => x.GetAngles(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<User>())).Returns(() => !_getAnglesTimeout ? _existingAngles : null);
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

        [TestCase(ModelType.Slave)]
        [TestCase(ModelType.Master)]
        public void Can_ExecuteCollector(ModelType executeModel)
        {
            Task<bool> collectTask = _testingCollector.Collect(executeModel);
            collectTask.Wait();

            Assert.IsTrue(collectTask.IsCompleted);
            Assert.IsTrue(collectTask.Result);
            Assert.IsTrue(EdmModelContainer.Metadata[executeModel].Angles.Any());
        }

        [Test]
        public void Stop_CollectAngles_OnNullResponse()
        {
            _getAnglesTimeout = true;
            Task<bool> collectTask = _testingCollector.Collect(ModelType.Master);
            collectTask.Wait();

            Assert.IsTrue(collectTask.IsCompleted);
            Assert.IsFalse(collectTask.IsFaulted);
            Assert.IsFalse(collectTask.Result);
            Assert.IsFalse(EdmModelContainer.Metadata[ModelType.Master].Angles.Any());
        }

        [Test]
        public void Stop_CollectAngles_OnException()
        {
            _appServerProxy
                .Setup(x => x.GetAngles(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<User>()))
                .Returns(() => throw new Exception("throw"));

            Task<bool> collectTask = _testingCollector.Collect(ModelType.Master);
            collectTask.Wait();

            Assert.IsTrue(collectTask.IsCompleted);
            Assert.IsFalse(collectTask.IsFaulted);
            Assert.IsFalse(collectTask.Result);
            Assert.IsFalse(EdmModelContainer.Metadata[ModelType.Master].Angles.Any());
        }

        #endregion
    }
}
