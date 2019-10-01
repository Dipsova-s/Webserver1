using EveryAngle.OData.Settings;
using NUnit.Framework;
using System.Dynamic;
using System.IO;
using System.Reflection;

namespace EveryAngle.OData.Tests.Settings
{
    public class ODataSettingsTest : UnitTestBase
    {
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
            CleanUp();
        }

        private void CleanUp()
        {
            string configfile = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase), "settings.json").Substring(6);
            if (File.Exists(configfile))
                File.Delete(configfile);
        }

        #region tests

        [TestCase]
        public void Should_Create_A_New_Settings_File_When_Not_Exist()
        {
            CleanUp();
            //Assert default value
            Assert.AreEqual("http://localhost", ODataSettings.ViewModel.host);
            Assert.AreEqual(string.Empty, ODataSettings.ViewModel.user);
            Assert.AreEqual(string.Empty, ODataSettings.ViewModel.password);
            Assert.AreEqual("EA2_800", ODataSettings.ViewModel.model_id);
            Assert.AreEqual(string.Empty, ODataSettings.ViewModel.angles_query);
            Assert.AreEqual(30000, ODataSettings.ViewModel.timeout);
            Assert.AreEqual(500, ODataSettings.ViewModel.page_size);
            Assert.AreEqual(500, ODataSettings.ViewModel.max_angles);
            Assert.AreEqual(10, ODataSettings.ViewModel.metadata_resync_minutes);
            Assert.AreEqual(string.Empty, ODataSettings.ViewModel.web_client_uri);
            Assert.AreEqual(true, ODataSettings.ViewModel.enable_compression);
        }

        [TestCase]
        public void Should_Update_Data_Correctly()
        {
            dynamic setings = new ExpandoObject();
            setings.angles_query = "query";
            setings.host = "http://localhost:9080";
            setings.max_angles = 5;
            setings.metadata_resync_minutes = 10;
            setings.model_id = "EA2_800";
            setings.page_size = 30;
            setings.password = "password";
            setings.timeout = 1;
            setings.user = "user";
            setings.web_client_uri = "web_client_uri";
            setings.enable_compression = false;
            ODataSettings.Update(setings);

            //verify
            Assert.AreEqual(setings.host, ODataSettings.ViewModel.host);
            Assert.AreEqual(setings.user, ODataSettings.ViewModel.user);
            Assert.AreEqual(setings.password, ODataSettings.ViewModel.password);
            Assert.AreEqual(setings.model_id, ODataSettings.ViewModel.model_id);
            Assert.AreEqual(setings.angles_query, ODataSettings.ViewModel.angles_query);
            Assert.AreEqual(setings.timeout, ODataSettings.ViewModel.timeout);
            Assert.AreEqual(setings.page_size, ODataSettings.ViewModel.page_size);
            Assert.AreEqual(setings.max_angles, ODataSettings.ViewModel.max_angles);
            Assert.AreEqual(setings.metadata_resync_minutes, ODataSettings.ViewModel.metadata_resync_minutes);
            Assert.AreEqual(setings.web_client_uri, ODataSettings.ViewModel.web_client_uri);
            Assert.AreEqual(setings.enable_compression, ODataSettings.ViewModel.enable_compression);

            Assert.AreEqual(setings.host, ODataSettings.Settings.Host);
            Assert.AreEqual(setings.user, ODataSettings.Settings.User);
            Assert.AreEqual(setings.password, ODataSettings.Settings.Password);
            Assert.AreEqual(setings.model_id, ODataSettings.Settings.ModelId);
            Assert.AreEqual(setings.angles_query, ODataSettings.Settings.AnglesQuery);
            Assert.AreEqual(setings.timeout, ODataSettings.Settings.TimeOut);
            Assert.AreEqual(setings.page_size, ODataSettings.Settings.PageSize);
            Assert.AreEqual(setings.max_angles, ODataSettings.Settings.MaxAngles);
            Assert.AreEqual(setings.metadata_resync_minutes, ODataSettings.Settings.MetadataResyncMinutes);
            Assert.AreEqual(setings.web_client_uri, ODataSettings.Settings.WebClientUri);
            Assert.AreEqual(setings.enable_compression, ODataSettings.Settings.EnableCompression);
        }

        #endregion tests
    }
}