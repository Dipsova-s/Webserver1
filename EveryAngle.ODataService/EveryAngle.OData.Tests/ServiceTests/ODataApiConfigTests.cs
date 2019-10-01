using EveryAngle.OData.App_Start;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Service.App_Start;
using Microsoft.Data.Edm.Library;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Web.Http;

namespace EveryAngle.OData.Tests.ServiceTests
{
    [TestFixture(Category = "Service")]
    public class ODataApiConfigTests : UnitTestBase
    {
        #region private variables
        Mock<IMasterEdmModelBusinessLogic> _masterEdmModelBusinessLogic;
        Mock<ISlaveEdmModelBusinessLogic> _slaveEdmModelBusinessLogic;
        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            Initialize();
            IoCConfig.Register(new HttpConfiguration());
            
            _masterEdmModelBusinessLogic = new Mock<IMasterEdmModelBusinessLogic>();
            _slaveEdmModelBusinessLogic = new Mock<ISlaveEdmModelBusinessLogic>();
            ODataApiConfig.Initial(_masterEdmModelBusinessLogic.Object, _slaveEdmModelBusinessLogic.Object);

            _masterEdmModelBusinessLogic.Setup(x => x.GetEdmModel()).Returns(new EdmModel());
            _slaveEdmModelBusinessLogic.Setup(x => x.IsAppServerAvailable(It.IsAny<bool>())).Returns(false);
            _slaveEdmModelBusinessLogic.Setup(x => x.GetEdmModel()).Returns(new EdmModel());
            _slaveEdmModelBusinessLogic.Setup(x => x.GetAngles()).Returns(new List<Angle>());
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests
        
        [TestCase(true, 1)]
        [TestCase(false, 0)]
        public void Can_SyncMetadataWithApiServiceEntry(bool sync, int expectedCalled)
        {
            _slaveEdmModelBusinessLogic.Setup(x => x.SyncModelMetadata()).Returns(sync);

            HttpConfiguration config = new HttpConfiguration();
            ODataApiConfig.Register(config);
            config.Routes.Clear();
            ODataApiConfig.SyncMetadataWithApiServiceEntry();

            _slaveEdmModelBusinessLogic.Verify(x => x.SwitchSlaveToMasterModel(), Times.Exactly(expectedCalled));
        }

        #endregion
    }
}
