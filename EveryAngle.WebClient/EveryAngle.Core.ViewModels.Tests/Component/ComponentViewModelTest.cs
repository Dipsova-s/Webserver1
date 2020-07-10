using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests.Component
{
    public class ComponentViewModelTest
    {
        #region IsDeletable
        [TestCase(ComponentServiceManagerType.ApplicationServer, false)]
        [TestCase(ComponentServiceManagerType.WebServer, true)]
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService, true)]
        [TestCase(ComponentServiceManagerType.DataDiscoveryService, true)]
        [TestCase(ComponentServiceManagerType.ExtractionService, true)]
        [TestCase(ComponentServiceManagerType.ModelAgentService, true)]
        [TestCase(ComponentServiceManagerType.ModelRepositoryService, true)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService, true)]
        [TestCase(ComponentServiceManagerType.Unknown, true)]
        public void ComponentViewModel_IsDeletable(ComponentServiceManagerType type, bool expected)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(expected, viewModel.IsDeletable);
        }
        #endregion

        #region IsDownloadMetadataEnabled 
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService, true, "/metadata", true)]
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService, false, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService, true, null, false)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService, true, "/metadata", true)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService, false, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService, true, null, false)]
        [TestCase(ComponentServiceManagerType.ApplicationServer, true, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.WebServer, true, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.ExtractionService, true, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.ModelAgentService, true, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.ModelRepositoryService, true, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.DataDiscoveryService, true, "/metadata", false)]
        [TestCase(ComponentServiceManagerType.Unknown, true, "/metadata", false)]
        public void ComponentViewModel_DownloadMetadata(ComponentServiceManagerType type, bool available, string metadataUri, bool expected)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            viewModel.Status = new RegistrationStatus { Available = available };
            viewModel.ModelServer = new ModelServerInfoViewModel { MetadataUri = metadataUri };
            Assert.AreEqual(expected, viewModel.IsDownloadMetadataEnabled);
        }
        #endregion

        #region IsInfoEnabled
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService, true)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService, true)]
        [TestCase(ComponentServiceManagerType.ExtractionService, true)]
        [TestCase(ComponentServiceManagerType.ApplicationServer, false)]
        [TestCase(ComponentServiceManagerType.WebServer, false)]
        [TestCase(ComponentServiceManagerType.ModelAgentService, false)]
        [TestCase(ComponentServiceManagerType.ModelRepositoryService, false)]
        [TestCase(ComponentServiceManagerType.DataDiscoveryService, false)]
        [TestCase(ComponentServiceManagerType.Unknown, false)]
        public void ComponentViewModel_IsInfoEnabled(ComponentServiceManagerType type, bool expected)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(expected, viewModel.IsInfoEnabled);
        }

        #endregion
    }
}