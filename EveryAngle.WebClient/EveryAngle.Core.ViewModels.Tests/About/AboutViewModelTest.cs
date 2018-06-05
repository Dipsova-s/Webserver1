using EveryAngle.Core.ViewModels.About;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class AboutViewModelTest : UnitTestBase
    {
        [TestCase]
        public void AboutViewModel_TEST()
        {
            //arrange
            AboutViewModel aboutViewModel = new AboutViewModel
                {
                    app_server_version = "version 1.0",
                    web_client_version = "version 0.0",
                    models = new List<AboutModel>()
                };

            //assert type
            Assert.AreEqual(aboutViewModel.app_server_version.GetType(), typeof(string));
            Assert.AreEqual(aboutViewModel.models.GetType(), typeof(List<AboutModel>));
            Assert.AreEqual(aboutViewModel.web_client_version.GetType(), typeof(string));

            //assert json serialize
            var aboutViewModelSerialize = JsonConvert.SerializeObject(aboutViewModel);
            Assert.IsTrue(aboutViewModelSerialize.Contains("app_server_version"));
            Assert.IsTrue(aboutViewModelSerialize.Contains("models"));
            Assert.IsTrue(aboutViewModelSerialize.Contains("web_client_version"));
        }

        [TestCase]
        public void AboutModel_TEST()
        {
            AboutModel aboutModel = new AboutModel 
                { 
                    model_id = "EA2_800",
                    version = "version 5.0",
                    status = "up",
                    modeldata_timestamp = 1497514623
                };

            //assert type
            Assert.AreEqual(aboutModel.model_id.GetType(), typeof(string));
            Assert.AreEqual(aboutModel.version.GetType(), typeof(string));
            Assert.AreEqual(aboutModel.status.GetType(), typeof(string));
            Assert.AreEqual(aboutModel.modeldata_timestamp.GetType(), typeof(int));

            //assert json serialize
            var aboutModelSerialize = JsonConvert.SerializeObject(aboutModel);
            Assert.IsTrue(aboutModelSerialize.Contains("model_id"));
            Assert.IsTrue(aboutModelSerialize.Contains("version"));
            Assert.IsTrue(aboutModelSerialize.Contains("status"));
            Assert.IsTrue(aboutModelSerialize.Contains("modeldata_timestamp"));
        }
    }
}
