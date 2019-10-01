using EveryAngle.OData.ViewModel.Metadata;
using EveryAngle.OData.ViewModel.Settings;
using NUnit.Framework;

namespace EveryAngle.OData.Tests.ViewModelTests
{
    public class MetadataMonitoringViewModelTest : UnitTestBase
    {
        #region private variables

        private ODataSettingsViewModel oDataSettingsViewModel;
        private ItemMonitoringViewModel angleItemMonitoringViewModel;
        private ItemMonitoringViewModel displayItemMonitoringViewModel;
        private ItemMonitoringViewModel fieldItemMonitoringViewModel;

        #endregion private variables

        [SetUp]
        public void Setup()
        {
            Initialize();
            oDataSettingsViewModel = new ODataSettingsViewModel();
            oDataSettingsViewModel.angles_query = "sort=name&dir=asc&fq=facetcat_bp:(P2P S2D)";
            oDataSettingsViewModel.enable_compression = true;
            oDataSettingsViewModel.host = "https://nl-webmb03.everyangle.org";
            oDataSettingsViewModel.max_angles = 500;
            oDataSettingsViewModel.metadata_resync_minutes = 3;
            oDataSettingsViewModel.model_id = "ea2_800";
            oDataSettingsViewModel.page_size = 30;
            oDataSettingsViewModel.password = "password";
            oDataSettingsViewModel.timeout = 1;
            oDataSettingsViewModel.user = "eauser";
            oDataSettingsViewModel.web_client_uri = "https://nl-webmb03.everyangle.org/testserver";

            angleItemMonitoringViewModel = new ItemMonitoringViewModel();
            displayItemMonitoringViewModel = new ItemMonitoringViewModel(5, 5, 0);
            fieldItemMonitoringViewModel = new ItemMonitoringViewModel(10, 10, 20);
        }

        [TearDown]
        public void TearDown()
        {
            // re-init to clear all mock data
            Initialize();
        }

        #region tests

        [TestCase]
        public void Should_Return_Correct_Properties()
        {
            MetadataMonitoringViewModel metadataMonitoringViewModel = new MetadataMonitoringViewModel(oDataSettingsViewModel, 0);
            Assert.AreEqual(0, metadataMonitoringViewModel.memory);
            Assert.AreEqual(oDataSettingsViewModel, metadataMonitoringViewModel.settings);
            Assert.AreEqual(true, metadataMonitoringViewModel.is_running);
            Assert.AreEqual(0, metadataMonitoringViewModel.angles.available);
            Assert.AreEqual(0, metadataMonitoringViewModel.displays.available);
            Assert.AreEqual(0, metadataMonitoringViewModel.fields.available);
        }

        [TestCase]
        public void Should_Return_Correct_Available_Properties()
        {
            MetadataMonitoringViewModel metadataMonitoringViewModel = new MetadataMonitoringViewModel(false, 10, oDataSettingsViewModel, angleItemMonitoringViewModel, displayItemMonitoringViewModel, fieldItemMonitoringViewModel);
            Assert.AreEqual(10, metadataMonitoringViewModel.memory);
            Assert.AreEqual(oDataSettingsViewModel, metadataMonitoringViewModel.settings);
            Assert.AreEqual(false, metadataMonitoringViewModel.is_running);

            Assert.AreEqual(0, metadataMonitoringViewModel.angles.available);
            Assert.AreEqual(0, metadataMonitoringViewModel.angles.unavailable);
            Assert.AreEqual(0, metadataMonitoringViewModel.angles.summary.t);

            Assert.AreEqual(5, metadataMonitoringViewModel.displays.summary.i);
            Assert.AreEqual(5, metadataMonitoringViewModel.displays.summary.u);
            Assert.AreEqual(0, metadataMonitoringViewModel.displays.summary.t);

            Assert.AreEqual(10, metadataMonitoringViewModel.fields.summary.i);
            Assert.AreEqual(10, metadataMonitoringViewModel.fields.summary.u);
            Assert.AreEqual(20, metadataMonitoringViewModel.fields.summary.t);

            metadataMonitoringViewModel.Init(oDataSettingsViewModel, 20);
            Assert.AreEqual(20, metadataMonitoringViewModel.memory);
            Assert.AreEqual(true, metadataMonitoringViewModel.is_running);

            metadataMonitoringViewModel.fields.Init(40, 20, 60);
            Assert.AreEqual(40, metadataMonitoringViewModel.fields.summary.i);
            Assert.AreEqual(20, metadataMonitoringViewModel.fields.summary.u);
            Assert.AreEqual(60, metadataMonitoringViewModel.fields.summary.t);

            metadataMonitoringViewModel.fields.Init(10, 20, 0);
            Assert.AreEqual(10, metadataMonitoringViewModel.fields.summary.i);
            Assert.AreEqual(20, metadataMonitoringViewModel.fields.summary.u);
            Assert.AreEqual(0, metadataMonitoringViewModel.fields.summary.t);
        }

        #endregion tests
    }
}