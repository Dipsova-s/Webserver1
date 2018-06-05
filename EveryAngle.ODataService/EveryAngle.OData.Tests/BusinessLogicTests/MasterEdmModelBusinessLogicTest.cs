using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Utils;
using Microsoft.Data.Edm.Library;
using Moq;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.BusinessLogicTests
{
    [TestFixture(Category = "ModelMetaData")]
    public class MasterEdmModelBusinessLogicTest : UnitTestBase
    {
        #region private variables

        private MasterEdmModelBusinessLogic _testingBusinessLogic;
        private Angle _testingAngle = new Angle();

        #endregion

        #region construcrors

        public MasterEdmModelBusinessLogicTest()
        {

        }

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            Initialize();

            _testingBusinessLogic = new MasterEdmModelBusinessLogic(
                new Mock<IAppServerProxy>().Object,
                new Mock<IAngleDataCollector>().Object);

            _testingAngle = new Angle();
            _testingAngle.name = "validation_me";
            _testingAngle.id = "testing_angle_id";
            _testingAngle.uri = "models/1/angles/1233";
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
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(angleKey);

            // test and assertion
            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should be saved properly.", _testingAngle.id);
            Assert.IsTrue(_testingBusinessLogic.TryGetAngle(compositeKey, out gettingAngle), 
                "angle {0} should be getting properly.", _testingAngle.id);
            Assert.AreEqual(_testingAngle.name, gettingAngle.name, 
                "saved angle should be equal to angle's get");
        }

        [TestCase("angleKey_Can_UpdateAngleOnMetadata_Master", "updated_angle")]
        public void Can_UpdateAngleOnMetadata(string angleKey, string updateName)
        {
            // setup
            Angle updatingAngle;
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
            _testingAngle.uri = "models/1/angles/5678";
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(_testingAngle.uri.IdFromUri(), angleKey);

            // assertions
            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(compositeKey, _testingAngle), 
                "angle {0} should be saved properly.", _testingAngle.id);
            Assert.False(_testingBusinessLogic.TrySaveAngle(Extensions.GetAngleCompositeKey(angleKey), _testingAngle), 
                "angle {0} should not be saved twice.", _testingAngle.id);
        }

        #endregion
    }
}
