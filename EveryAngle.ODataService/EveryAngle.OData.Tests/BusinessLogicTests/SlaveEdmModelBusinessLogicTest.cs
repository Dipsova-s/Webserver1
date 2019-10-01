using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Utils;
using Microsoft.Data.Edm.Library;
using Moq;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.BusinessLogicTests
{
    [TestFixture(Category = "ModelMetaData")]
    public class SlaveEdmModelBusinessLogicTest : UnitTestBase
    {
        #region private variables

        private SlaveEdmModelBusinessLogic _testingBusinessLogic;

        private Angle _testingAngle = new Angle();

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            _testingBusinessLogic = new SlaveEdmModelBusinessLogic(
                new Mock<IAppServerProxy>().Object,
                new Mock<IAngleDataCollector>().Object);

            _testingAngle = new Angle();
            _testingAngle.name = "validation_me";
            _testingAngle.id = "testing_angle_id";
            _testingAngle.uri = "models/1/angles/1232";

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
        public void Can_GetEdmModel()
        {
            EdmModel edmModel = _testingBusinessLogic.GetEdmModel();
            Assert.IsNotNull(edmModel);
        }

        [TestCase("angleKey_Can_AddNewAngleToMetadata")]
        public void Can_AddNewAngleToMetadata(string angleKey)
        {
            // setup
            Angle gettingAngle;
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(_testingAngle.uri.IdFromUri(), angleKey);

            // test and assertion
            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should be saved properly.", _testingAngle.id);
            Assert.IsTrue(_testingBusinessLogic.TryGetAngle(compositeKey, out gettingAngle), 
                "angle {0} should be getting properly.", _testingAngle.id);
            Assert.AreEqual(_testingAngle.name, gettingAngle.name, 
                "saved angle should be equal to angle's get");
        }

        [TestCase("angleKey_Can_UpdateAngleOnMetadata_Slave", "updated_angle")]
        public void Can_UpdateAngleOnMetadata(string angleKey, string updateName)
        {
            // setup
            Angle updatingAngle;
            _testingAngle.uri = "models/1/angles/3333";
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(_testingAngle.uri.IdFromUri(), angleKey);

            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should be saved properly.", _testingAngle.id);
            Assert.IsTrue(_testingBusinessLogic.TryGetAngle(compositeKey, out updatingAngle), 
                "angle {0} should be getting properly.", _testingAngle.id);

            // update an angle
            // test and assertion
            Angle updatedAngle;
            updatingAngle.name = updateName;

            Assert.IsTrue(_testingBusinessLogic.TryUpdateAngle(compositeKey, updatingAngle, _testingAngle),
                "angle {0}:{1} should be updated properly.", updatingAngle.id, updatingAngle.name);
            Assert.IsTrue(_testingBusinessLogic.TryGetAngle(compositeKey, out updatedAngle),
                "angle {0} should be getting properly.", updatingAngle.id);
            Assert.AreEqual(updatedAngle.name, updateName,
                "angle {0} should be updated properly.", updatedAngle.id);
        }

        [TestCase("angleKey_Cannot_AddDuplicateAngle")]
        public void Cannot_AddDuplicateAngle(string angleKey)
        {
            // setup
            _testingAngle.uri = "models/1/angles/4444";

            // check and assertion
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(_testingAngle.uri.IdFromUri(), angleKey);

            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should be saved properly.", _testingAngle.id);
            Assert.False(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should not be saved twice.", _testingAngle.id);
        }

        [TestCase]
        public void Can_SwitchSlaveToMasterModel()
        {
            // setup
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(5678);

            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should be saved properly.", _testingAngle.id);

            // switch slave => master
            _testingBusinessLogic.SwitchSlaveToMasterModel();

            // assertion
            Angle masterAngle;
            Assert.IsFalse(_testingBusinessLogic.TryGetAngle(compositeKey, out masterAngle), 
                "Master Abstraction should work and create correctly");
        }

        [TestCase]
        public void Can_ExecuteSyncMetadata()
        {
            Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(true);

            SlaveEdmModelBusinessLogic slaveBusinessLogic = new SlaveEdmModelBusinessLogic(
                                                            _appServerProxy.Object,
                                                            new Mock<IAngleDataCollector>().Object);
            Assert.IsFalse(slaveBusinessLogic.SyncModelMetadata());
        }

        [TestCase]
        public void CanNot_ExecuteSyncMetadata_If_ASDown()
        {
            Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(false);

            // don't setup 'LoginBackgroundUser' so the session's token will be null.
            SlaveEdmModelBusinessLogic slaveBusinessLogic = new SlaveEdmModelBusinessLogic(
                                                            _appServerProxy.Object,
                                                            new Mock<IAngleDataCollector>().Object);
            Assert.IsFalse(slaveBusinessLogic.SyncModelMetadata());
            Assert.AreEqual(EdmModelStatus.Down, EdmModelContainer.Status);
        }

        #endregion
    }
}
